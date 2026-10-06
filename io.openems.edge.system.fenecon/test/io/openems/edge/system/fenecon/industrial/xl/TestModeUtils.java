package io.openems.edge.system.fenecon.industrial.xl;

import static io.openems.edge.common.test.DummyUser.DUMMY_INSTALLER;
import static org.junit.Assert.assertFalse;

import io.openems.common.jsonrpc.base.GenericJsonrpcRequest;
import io.openems.common.jsonrpc.base.JsonrpcRequest;
import io.openems.common.jsonrpc.base.JsonrpcResponse;
import io.openems.common.utils.JsonUtils;
import io.openems.edge.common.jsonapi.Call;
import io.openems.edge.common.jsonapi.ComponentJsonApi;
import io.openems.edge.common.jsonapi.EdgeKeys;
import io.openems.edge.common.jsonapi.JsonApiBuilder;
import io.openems.edge.system.fenecon.industrial.xl.jsonrpc.TestMode;

public class TestModeUtils {
	static Call<JsonrpcRequest, JsonrpcResponse> performJsonRpcCall(SystemFeneconIndustrialXl system,
			JsonApiBuilder builder, String actionTypeName) {
		var params = JsonUtils.buildJsonObject() //
				.add("action", JsonUtils.buildJsonObject()//
						.addProperty("type", actionTypeName)//
						.build())//
				.build();
		var request = new GenericJsonrpcRequest(new TestMode().getMethod(), params);
		var call = new Call<JsonrpcRequest, JsonrpcResponse>(request);
		call.put(EdgeKeys.USER_KEY, DUMMY_INSTALLER);

		if (system instanceof ComponentJsonApi jsonApi) {
			jsonApi.buildJsonApiRoutes(builder);
			assertFalse(builder.getEndpoints().isEmpty());
			builder.handle(call);
		}
		return call;
	}
}
