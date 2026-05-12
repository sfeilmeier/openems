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
 *   "method": "errorResetRequest",
 *   "params": {}
 * }
 * </pre>
 */
public class ErrorResetRequest implements EndpointRequestType<EmptyObject, EmptyObject> {

	@Override
	public String getMethod() {
		return "errorResetRequest";
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
