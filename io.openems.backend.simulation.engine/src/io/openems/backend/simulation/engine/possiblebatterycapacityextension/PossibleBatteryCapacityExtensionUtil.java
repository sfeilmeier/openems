package io.openems.backend.simulation.engine.possiblebatterycapacityextension;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.SortedMap;
import java.util.concurrent.CompletableFuture;

import com.google.gson.JsonElement;

import io.openems.backend.common.edge.EdgeManager;
import io.openems.backend.common.metadata.Edge;
import io.openems.backend.common.metadata.Metadata;
import io.openems.backend.common.metadata.User;
import io.openems.backend.common.timedata.TimedataManager;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.jsonrpc.base.JsonrpcResponseSuccess;
import io.openems.common.session.Role;
import io.openems.common.timedata.Resolution;
import io.openems.common.types.ChannelAddress;
import io.openems.common.utils.JsonUtils;

public final class PossibleBatteryCapacityExtensionUtil {

	private static final int MAX_SIMULATION_STEPS = 5;
	private static final ChannelAddress CHANNEL_SUM_GRID_BUY_ACTIVE_ENERGY = new ChannelAddress("_sum",
			"GridBuyActiveEnergy");
	private static final ChannelAddress CHANNEL_SUM_GRID_SELL_ACTIVE_ENERGY = new ChannelAddress("_sum",
			"GridSellActiveEnergy");
	private static final ChannelAddress CHANNEL_NUMBER_OF_MODULES_PER_TOWER = new ChannelAddress("battery0",
			"NumberOfModulesPerTower");
	private static final ChannelAddress CHANNEL_NUMBER_OF_TOWERS = new ChannelAddress("battery0", "NumberOfTowers");

	private static final Set<ChannelAddress> ENERGY_CHANNELS = Set.of(//
			CHANNEL_SUM_GRID_BUY_ACTIVE_ENERGY, CHANNEL_SUM_GRID_SELL_ACTIVE_ENERGY);

	private PossibleBatteryCapacityExtensionUtil() {
	}

	/**
	 * Handles a {@link PossibleBatteryCapacityExtensionRequest}.
	 * 
	 * @param timedata    the timedata
	 * @param edgeId      the current edge id
	 * @param edgeManager the {@link EdgeManager}
	 * @param metadata    the metadata
	 * @param user        the user
	 * @param request     the {@link PossibleBatteryCapacityExtensionRequest}
	 * @return the JSON-RPC Success Response Future
	 * @throws OpenemsNamedException on error
	 */
	public static CompletableFuture<JsonrpcResponseSuccess> handleRequest(TimedataManager timedata, String edgeId,
			EdgeManager edgeManager, Metadata metadata, User user, PossibleBatteryCapacityExtensionRequest request)
			throws OpenemsNamedException {

		user.assertEdgeRoleIsAtLeast(PossibleBatteryCapacityExtensionRequest.METHOD, edgeId, Role.OWNER);

		var edge = metadata.getEdge(edgeId).orElseThrow(() -> new OpenemsException("Edge not available"));
		var result = calculateSimulationData(timedata, edge, request, edgeManager);

		return CompletableFuture.completedFuture(//
				new PossibleBatteryCapacityExtensionResponse(request.id, result) //
		);
	}

	protected static SimulationData calculateSimulationData(TimedataManager timedata, Edge edge,
			PossibleBatteryCapacityExtensionRequest request, EdgeManager edgeManager) throws OpenemsNamedException {

		final Product product = Product.getProduct(edge.getProducttype());

		if (product == null) {
			throw new OpenemsException("possible battery extension simulation not available");
		}

		var peakPower = product.getPeakPower();
		var capacityPerModule = product.getCapacityPerModule();

		var productTowerDetails = product.getProductTowerDetails();
		var channels = edgeManager.getChannelValues(edge.getId(),
				Set.of(CHANNEL_NUMBER_OF_MODULES_PER_TOWER, CHANNEL_NUMBER_OF_TOWERS));

		var numberOfTowers = JsonUtils.getAsOptionalInt(channels.get(CHANNEL_NUMBER_OF_TOWERS))
				.orElseThrow(() -> new OpenemsException("possible battery extension simulation not available"));

		var numberOfModulesPerTower = JsonUtils.getAsOptionalInt(channels.get(CHANNEL_NUMBER_OF_MODULES_PER_TOWER)) //
				.filter(t -> t >= product.getProductDetails().firstKey()) //
				.filter(t -> t < product.getProductDetails().lastKey()) //
				.orElseThrow(() -> new OpenemsException("possible battery extension simulation not available"));

		var totalNumberOfModules = numberOfModulesPerTower * numberOfTowers;
		var electricityPrice = request.getElectricityPrice();

		final var datapoints = timedata.queryHistoricEnergyPerPeriod(edge.getId(), request.getFromDate(),
				request.getToDate(), ENERGY_CHANNELS, new Resolution(1, ChronoUnit.DAYS));

		var dataPerModules = new ArrayList<DataPerModule>();
		// Add Current number of modules
		dataPerModules.add(calculateDataPerModule(datapoints, totalNumberOfModules, totalNumberOfModules,
				electricityPrice, product, numberOfTowers));

		int key = totalNumberOfModules;
		Integer currentNumberOfTowers = numberOfTowers;
		Integer currentNumberOfModules = totalNumberOfModules;

		for (int i = 0; i < MAX_SIMULATION_STEPS; i++) {

			if (product.getMaxNumberOfModulesPerTower(currentNumberOfTowers) == totalNumberOfModules) {
				if (productTowerDetails.higherKey(currentNumberOfTowers) == null) {
					// Skip if max number of towers reached
					break;
				}
				currentNumberOfTowers = productTowerDetails.higherKey(currentNumberOfTowers);
				currentNumberOfModules = productTowerDetails.get(currentNumberOfTowers).lastKey();

			} else {

				if (productTowerDetails.higherKey(currentNumberOfTowers) == null
						&& productTowerDetails.lastEntry().getValue().lastKey() == totalNumberOfModules) {
					// Skip if max number of towers reached
					break;
				}
				// if max modules of tower reached
				if (productTowerDetails.get(currentNumberOfTowers).higherKey(currentNumberOfModules) == null) {
					currentNumberOfTowers = currentNumberOfTowers + 1;
				}

				// If higher number of towers
				if (productTowerDetails.containsKey(currentNumberOfTowers)) {
					currentNumberOfModules = productTowerDetails.get(currentNumberOfTowers)
							.higherKey(currentNumberOfModules);
				}
			}

			// Skip if max number of modules reached
			if (currentNumberOfModules == null || currentNumberOfModules == key) {
				break;
			}

			key = currentNumberOfModules;
			dataPerModules.add(calculateDataPerModule(datapoints, totalNumberOfModules, currentNumberOfModules,
					electricityPrice, product, currentNumberOfTowers));
		}

		return new SimulationData(capacityPerModule, peakPower, dataPerModules);
	}

	protected static DataPerModule calculateDataPerModule(
			SortedMap<ZonedDateTime, SortedMap<ChannelAddress, JsonElement>> datapoints, int currentNumberOfModules,
			int maxNumberOfModules, double electricityPrice, Product product, int numberOfTowers)
			throws OpenemsNamedException {

		var newGridBuy = PossibleBatteryCapacityExtensionUtil.calculateNewGridActivePower(datapoints,
				currentNumberOfModules, maxNumberOfModules, product, numberOfTowers) / 1000;

		var gridBuyCosts = Math.floor(newGridBuy * electricityPrice);
		var productDetails = product.getProductDetails().get(maxNumberOfModules);
		return new DataPerModule(maxNumberOfModules, newGridBuy, gridBuyCosts, productDetails.kWPeak(),
				productDetails.capacity());
	}

	protected static double calculateNewGridActivePower(
			SortedMap<ZonedDateTime, SortedMap<ChannelAddress, JsonElement>> gridActivePowerMap,
			int currentNumberOfModules, int maxNumberOfModules, Product product, int numberOfTowers)
			throws OpenemsNamedException {

		var productDetails = product.getProductDetails();

		int maxCapacityDifference = productDetails.get(maxNumberOfModules).capacity()
				- productDetails.get(currentNumberOfModules).capacity();

		return gridActivePowerMap.entrySet().stream().mapToDouble(entry -> {
			double additionalBatteryCapacity = 0.0;
			double gridBuy = JsonUtils.getAsOptionalDouble(entry.getValue() //
					.get(CHANNEL_SUM_GRID_BUY_ACTIVE_ENERGY)) //
					.orElse(0.0);
			double gridSell = JsonUtils.getAsOptionalDouble(entry.getValue() //
					.get(CHANNEL_SUM_GRID_SELL_ACTIVE_ENERGY)) //
					.orElse(0.0);

			if (gridSell > 0.0) {
				additionalBatteryCapacity = Math.min(maxCapacityDifference, gridSell);
			}

			if (gridBuy > 0.0) {
				var diff = additionalBatteryCapacity - gridBuy;
				gridBuy = diff > 0 ? 0 : diff * -1;
			}

			return gridBuy;
		}).sum();
	}

	public record DataPerModule(int numberOfModules, double gridBuy, double gridBuyCosts, int kWPeak, int capacity) {
	}

	public record SimulationData(int capacityPerModule, int peakPower, List<DataPerModule> dataPerModule) {
	}

	public record ProductData(int kWPeak, int capacity) {
	}
}
