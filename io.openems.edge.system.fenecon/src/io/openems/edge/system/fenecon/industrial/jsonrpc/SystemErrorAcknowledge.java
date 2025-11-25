package io.openems.edge.system.fenecon.industrial.jsonrpc;

import io.openems.common.jsonrpc.serialization.EmptyObject;
import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.common.jsonrpc.serialization.JsonSerializer;

/**
 * Wraps a JSON-RPC Request to hard reset the all BMS devices.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "systemErrorAcknowledge",
 *   "params": {}
 * }
 * </pre>
 */
public class SystemErrorAcknowledge implements EndpointRequestType<EmptyObject, EmptyObject> {
	@Override
	public String getMethod() {
		return "systemErrorAcknowledge";
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
