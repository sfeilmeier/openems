package io.openems.common.jsonrpc.request;

import com.google.gson.JsonObject;

import io.openems.common.exceptions.OpenemsError;
import io.openems.common.jsonrpc.base.JsonrpcRequest;
import io.openems.common.utils.JsonUtils;

/**
 * JSON-RPC Request for registering a luox contract mapping to the requesting
 * edge.
 *
 * <p>
 * Can be sent from EDGE -> BACKEND_EDGE or EDGE -> BACKEND.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "luox/registerContract",
 *   "params": {
 *     "accessToken": String,
 *     "contractId": String
 *   }
 * }
 * </pre>
 */
public class RegisterLuoxContractRequest extends JsonrpcRequest {

	public static final String METHOD = "luox/registerContract";

	/**
	 * Creates a {@link RegisterLuoxContractRequest} from a generic
	 * {@link JsonrpcRequest} by deserializing the payload.
	 *
	 * @param request the incoming JsonrpcRequest
	 * @return the parsed SyncableUnsubscribeRequest
	 * @throws OpenemsError.OpenemsNamedException if required params are missing or
	 *                                            the entry cannot be deserialized
	 */
	public static RegisterLuoxContractRequest from(JsonrpcRequest request) throws OpenemsError.OpenemsNamedException {
		final var p = request.getParams();
		return new RegisterLuoxContractRequest(//
				JsonUtils.getAsString(p, "accessToken"), //
				JsonUtils.getAsString(p, "contractId") //
		);
	}

	private final String accessToken;
	private final String contractId;

	public RegisterLuoxContractRequest(String accessToken, String contractId) {
		super(METHOD);
		this.accessToken = accessToken;
		this.contractId = contractId;
	}

	public String getAccessToken() {
		return this.accessToken;
	}

	public String getContractId() {
		return this.contractId;
	}

	@Override
	public JsonObject getParams() {
		return JsonUtils.buildJsonObject() //
				.addProperty("accessToken", this.accessToken) //
				.addProperty("contractId", this.contractId) //
				.build();
	}
}
