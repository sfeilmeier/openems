package io.openems.backend.simulation.engine.possiblebatterycapacityextension;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.SortedMap;
import java.util.concurrent.CompletableFuture;

import com.google.gson.JsonElement;

import io.openems.backend.common.edgewebsocket.EdgeWebsocket;
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

	private static final int MAX_MODULES_TO_SIMULATE = 5;
	private static final ChannelAddress CHANNEL_SUM_GRID_BUY_ACTIVE_ENERGY = new ChannelAddress("_sum",
			"GridBuyActiveEnergy");
	private static final ChannelAddress CHANNEL_SUM_GRID_SELL_ACTIVE_ENERGY = new ChannelAddress("_sum",
			"GridSellActiveEnergy");
	private static final ChannelAddress CHANNEL_SUM_ESS_DC_DISCHARGE_ENERGY = new ChannelAddress("_sum",
			"EssDcDischargeEnergy");
	private static final ChannelAddress CHANNEL_SUM_ESS_DC_CHARGE_ENERGY = new ChannelAddress("_sum",
			"EssDcChargeEnergy");
	private static final ChannelAddress CHANNEL_NUMBER_OF_MODULES_PER_TOWER = new ChannelAddress("battery0",
			"NumberOfModulesPerTower");

	private static final Set<ChannelAddress> ENERGY_CHANNELS = Set.of(//
			CHANNEL_SUM_GRID_BUY_ACTIVE_ENERGY, CHANNEL_SUM_GRID_SELL_ACTIVE_ENERGY);

	private PossibleBatteryCapacityExtensionUtil() {
	}

	/**
	 * Handles a {@link PossibleBatteryCapacityExtensionRequest}.
	 * 
	 * @param timedata      the timedata
	 * @param edgeId        the current edge id
	 * @param edgeWebsocket the edge websocket
	 * @param metadata      the metadata
	 * @param user          the user
	 * @param request       the {@link PossibleBatteryCapacityExtensionRequest}
	 * @return the JSON-RPC Success Response Future
	 * @throws OpenemsNamedException on error
	 */
	public static CompletableFuture<JsonrpcResponseSuccess> handleRequest(TimedataManager timedata, String edgeId,
			EdgeWebsocket edgeWebsocket, Metadata metadata, User user, PossibleBatteryCapacityExtensionRequest request)
			throws OpenemsNamedException {

		user.assertEdgeRoleIsAtLeast(PossibleBatteryCapacityExtensionRequest.METHOD, edgeId, Role.OWNER);

		var edge = metadata.getEdge(edgeId).orElseThrow(() -> new OpenemsException("Edge not available"));
		var result = calculateSimulationData(timedata, edge, request, edgeWebsocket);

		return CompletableFuture.completedFuture(//
				new PossibleBatteryCapacityExtensionResponse(request.id, result) //
		);
	}

	protected static SimulationData calculateSimulationData(TimedataManager timedata, Edge edge,
			PossibleBatteryCapacityExtensionRequest request, EdgeWebsocket edgeWebsocket) throws OpenemsNamedException {

		final Product product = Product.getProduct(edge.getProducttype());

		if (product == null) {
			throw new OpenemsException("possible battery extension simulation not available");
		}

		var productDetails = product.getProductDetails();
		var numberOfModulesPerTower = JsonUtils
				.getAsOptionalInt(
						edgeWebsocket.getChannelValues(edge.getId(), Set.of(CHANNEL_NUMBER_OF_MODULES_PER_TOWER))
								.get(CHANNEL_NUMBER_OF_MODULES_PER_TOWER)) //
				.filter(t -> t >= productDetails.firstKey()) //
				.filter(t -> t < productDetails.lastKey()) //
				.orElseThrow(() -> new OpenemsException("possible battery extension simulation not available"));

		var dataPerModules = new ArrayList<DataPerModule>();
		var electricityPrice = request.getElectricityPrice();

		final var datapoints = timedata.queryHistoricEnergyPerPeriod(edge.getId(), request.getFromDate(),
				request.getToDate(), ENERGY_CHANNELS, new Resolution(1, ChronoUnit.DAYS));

		final var energyValues = timedata.queryHistoricEnergy(edge.getId(), request.getFromDate(), request.getToDate(),
				Set.of(CHANNEL_SUM_ESS_DC_CHARGE_ENERGY, CHANNEL_SUM_ESS_DC_DISCHARGE_ENERGY));

		// Add Current number of modules
		dataPerModules.add(calculateDataPerModule(datapoints, numberOfModulesPerTower, numberOfModulesPerTower,
				electricityPrice, product));

		int key = numberOfModulesPerTower;
		for (int i = 0; i < MAX_MODULES_TO_SIMULATE; i++) {
			var higherKey = productDetails.higherKey(key);

			if (higherKey == null || higherKey == key) {
				break;
			}
			key = higherKey;
			dataPerModules.add(
					calculateDataPerModule(datapoints, numberOfModulesPerTower, higherKey, electricityPrice, product));
		}

		var charge = JsonUtils.getAsOptionalInt(energyValues//
				.get(CHANNEL_SUM_ESS_DC_CHARGE_ENERGY)) //
				.orElse(0);
		var discharge = JsonUtils.getAsOptionalInt(energyValues//
				.get(CHANNEL_SUM_ESS_DC_DISCHARGE_ENERGY)) //
				.orElse(0);

		return new SimulationData(charge, discharge, dataPerModules);
	}

	protected static DataPerModule calculateDataPerModule(
			SortedMap<ZonedDateTime, SortedMap<ChannelAddress, JsonElement>> datapoints, int currentNumberOfModules,
			int maxNumberOfModules, double electricityPrice, Product product) throws OpenemsNamedException {

		var newGridBuy = PossibleBatteryCapacityExtensionUtil.calculateNewGridActivePower(datapoints,
				currentNumberOfModules, maxNumberOfModules, product) / 1000;

		var gridBuyCosts = Math.floor(newGridBuy * electricityPrice);
		var productDetails = product.getProductDetails().get(maxNumberOfModules);
		return new DataPerModule(maxNumberOfModules, newGridBuy, gridBuyCosts, productDetails.kWPeak(),
				productDetails.capacity());
	}

	protected static double calculateNewGridActivePower(
			SortedMap<ZonedDateTime, SortedMap<ChannelAddress, JsonElement>> gridActivePowerMap,
			int currentNumberOfModules, int maxNumberOfModules, Product product) throws OpenemsNamedException {

		int maxCapacityDifference = product.getProductDetails().get(maxNumberOfModules).capacity()
				- product.getProductDetails().get(currentNumberOfModules).capacity();

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

	public record SimulationData(int discharge, int charge, List<DataPerModule> dataPerModule) {
	}

	public record ProductData(int kWPeak, int capacity) {
	}
}
