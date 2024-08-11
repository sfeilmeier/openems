package io.openems.backend.simulation.engine.possiblebatterycapacityextension;

import java.util.List;
import java.util.UUID;

import com.google.gson.JsonObject;

import io.openems.backend.simulation.engine.possiblebatterycapacityextension.PossibleBatteryCapacityExtensionUtil.DataPerModule;
import io.openems.common.jsonrpc.base.JsonrpcResponseSuccess;
import io.openems.common.utils.JsonUtils;

/**
 * Represents a JSON-RPC Response for
 * {@link PossibleBatteryCapacityExtensionRequest}.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "result": {
 *   	"simulationData": [{
 *     		"numberOfModules": int, 
 *     		"gridBuy": double,
 *     		"gridBuyCosts": double,
 *     		"kwPeak": int,
 *     		"capacity": int
 *     	}]
 *   }
 * }
 * </pre>
 */
public class PossibleBatteryCapacityExtensionResponse extends JsonrpcResponseSuccess {

	private final List<DataPerModule> result;

	public PossibleBatteryCapacityExtensionResponse(UUID id, List<DataPerModule> result) {
		super(id);
		this.result = result;
	}

	@Override
	public JsonObject getResult() {
		return JsonUtils.buildJsonObject() //
				.add("simulationData",
						this.result.stream()
								.map(dataPerModule -> JsonUtils.buildJsonObject()
										.addProperty("numberOfModules", dataPerModule.numberOfModules())
										.addProperty("gridBuy", dataPerModule.gridBuy())
										.addProperty("gridBuyCosts", dataPerModule.gridBuyCosts())
										.addProperty("kWPeak", dataPerModule.kWPeak())
										.addProperty("capacity", dataPerModule.capacity()).build())
								.collect(JsonUtils.toJsonArray()))
				.build();
	}

}
