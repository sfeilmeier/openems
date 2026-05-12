package io.openems.edge.system.fenecon.industrial.xl.jsonrpc;

import io.openems.common.jsonrpc.serialization.EmptyObject;
import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.common.jsonrpc.serialization.JsonSerializer;

/**
 * Wraps a JSON-RPC Request to get reset system failure.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "resetSystemFailure",
 *   "params": {}
 * }
 * </pre>
 */
public class SystemFailureReset implements EndpointRequestType<EmptyObject, EmptyObject> {

	@Override
	public String getMethod() {
		return "resetSystemFailure";
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