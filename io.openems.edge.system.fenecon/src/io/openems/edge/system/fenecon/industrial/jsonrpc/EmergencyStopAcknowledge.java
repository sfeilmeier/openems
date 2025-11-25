package io.openems.edge.system.fenecon.industrial.jsonrpc;

import io.openems.common.jsonrpc.serialization.EmptyObject;
import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.common.jsonrpc.serialization.JsonSerializer;

/**
 * Wraps a JSON-RPC Request to get emergency stop acknowledge.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "emergencyStopAcknowledge",
 *   "params": {}
 * }
 * </pre>
 */
public class EmergencyStopAcknowledge implements EndpointRequestType<EmptyObject, EmptyObject> {

    public static final String METHOD = "emergencyStopAcknowledge";

	@Override
	public String getMethod() {
		return "emergencyStopAcknowledge";
	}

	@Override
	public JsonSerializer<EmptyObject> getRequestSerializer() {
		return EmptyObject.serializer();
	}

	@Override
	public JsonSerializer<EmptyObject> getResponseSerializer() {
		return EmptyObject.serializer();
	}

}
