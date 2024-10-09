package io.openems.edge.system.fenecon.industrial.l.jsonrpc;

import static io.openems.common.jsonrpc.serialization.JsonSerializerUtil.emptyObjectSerializer;

import io.openems.common.jsonrpc.serialization.JsonSerializer;
import io.openems.edge.common.jsonapi.EndpointRequestType;
import io.openems.edge.system.fenecon.industrial.l.jsonrpc.EmergencyStopAcknowledge.Request;
import io.openems.edge.system.fenecon.industrial.l.jsonrpc.EmergencyStopAcknowledge.Response;

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
public class EmergencyStopAcknowledge implements EndpointRequestType<Request, Response> {

	@Override
	public String getMethod() {
		return "emergencyStopAcknowledge";
	}

	@Override
	public JsonSerializer<Request> getRequestSerializer() {
		return Request.serializer();
	}

	@Override
	public JsonSerializer<Response> getResponseSerializer() {
		return Response.serializer();
	}

	public record Request() {

		/**
		 * Returns a {@link JsonSerializer} for a {@link GetApps.Response}.
		 * 
		 * @return the created {@link JsonSerializer}
		 */
		public static JsonSerializer<Request> serializer() {
			return emptyObjectSerializer(Request::new);
		}

	}

	public record Response() {

		/**
		 * Returns a {@link JsonSerializer} for a {@link GetApps.Response}.
		 * 
		 * @return the created {@link JsonSerializer}
		 */
		public static JsonSerializer<Response> serializer() {
			return emptyObjectSerializer(Response::new);
		}

	}

}
