package io.openems.edge.battery.fenecon.f2b.fisker;

import io.openems.common.jsonrpc.serialization.EmptyObject;
import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.common.jsonrpc.serialization.JsonSerializer;

/**
 * Wraps a JSON-RPC Request to get error reset request.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "hardwareResetRequest",
 *   "params": {}
 * }
 * </pre>
 */
public class HardwareResetRequest implements EndpointRequestType<EmptyObject, EmptyObject> {

	@Override
	public String getMethod() {
		return "hardwareResetRequest";
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
