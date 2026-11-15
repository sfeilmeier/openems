package io.openems.backend.simulation.engine.possiblebatterycapacityextension;

import java.time.ZoneId;
import java.time.ZonedDateTime;

import com.google.gson.JsonObject;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.jsonrpc.base.JsonrpcRequest;
import io.openems.common.utils.JsonUtils;

/**
 * Wraps a JSON-RPC Request from an authenticated User.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "possibleBatteryCapacityExtension",
 *   "params": {
 *   	"fromDate": ZonedDateTime
 *     	"toDate": ZonedDateTime,
 *     	"electricityPrice": Double,
 *   }
 * }
 * </pre>
 */
public class PossibleBatteryCapacityExtensionRequest extends JsonrpcRequest {

	public static final String METHOD = "possibleBatteryCapacityExtension";

	/**
	 * Creates a {@link JsonrpcRequest}.
	 * 
	 * @param r the request
	 * @return a {@link PossibleBatteryCapacityExtensionRequest}
	 * @throws OpenemsNamedException on error
	 */
	public static PossibleBatteryCapacityExtensionRequest from(JsonrpcRequest r) throws OpenemsNamedException {
		var p = r.getParams();
		var fromDate = JsonUtils.getAsZonedDateWithZeroTime(p, "fromDate", ZoneId.systemDefault());
		var toDate = JsonUtils.getAsZonedDateWithZeroTime(p, "toDate", ZoneId.systemDefault());
		var electricityPrice = JsonUtils.getAsDouble(p, "electricityPrice");
		return new PossibleBatteryCapacityExtensionRequest(fromDate, toDate, electricityPrice);
	}

	private final ZonedDateTime fromDate;
	private final ZonedDateTime toDate;
	private final double electricityPrice;

	public PossibleBatteryCapacityExtensionRequest(ZonedDateTime fromDate, ZonedDateTime toDate,
			double electricityPrice) {
		super(PossibleBatteryCapacityExtensionRequest.METHOD);
		this.toDate = toDate;
		this.fromDate = fromDate;
		this.electricityPrice = electricityPrice;
	}

	public ZonedDateTime getFromDate() {
		return this.fromDate;
	}

	public ZonedDateTime getToDate() {
		return this.toDate;
	}

	@Override
	public JsonObject getParams() {
		return new JsonObject();
	}

	public double getElectricityPrice() {
		return this.electricityPrice;
	}

}
