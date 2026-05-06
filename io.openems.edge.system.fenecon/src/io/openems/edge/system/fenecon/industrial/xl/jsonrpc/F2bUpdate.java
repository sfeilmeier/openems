package io.openems.edge.system.fenecon.industrial.xl.jsonrpc;

import io.openems.common.jsonrpc.serialization.EmptyObject;
import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.common.jsonrpc.serialization.JsonSerializer;

/**
 * Wraps a JSON-RPC Request to update the f2b version.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "f2bUpdate",
 *   "params": {}
 * }
 * </pre>
 */
public class F2bUpdate implements EndpointRequestType<EmptyObject, EmptyObject> {

    @Override
    public String getMethod() {
        return "f2bUpdate";
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