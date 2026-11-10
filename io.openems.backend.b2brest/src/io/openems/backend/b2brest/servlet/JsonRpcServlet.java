package io.openems.backend.b2brest.servlet;

import static io.openems.common.utils.JettyUtils.parseJson;
import static io.openems.common.utils.JettyUtils.sendErrorResponse;
import static io.openems.common.utils.JettyUtils.sendOkResponse;
import static io.openems.common.utils.JsonUtils.getAsJsonObject;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.eclipse.jetty.server.Request;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonObject;

import io.openems.backend.authentication.api.AuthUserPasswordAuthenticationService;
import io.openems.backend.b2brest.RestHandler;
import io.openems.backend.common.jsonrpc.JsonRpcRequestHandler;
import io.openems.backend.common.metadata.Metadata;
import io.openems.backend.common.metadata.User;
import io.openems.common.exceptions.OpenemsError;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.jsonrpc.base.JsonrpcMessage;
import io.openems.common.jsonrpc.base.JsonrpcRequest;
import io.openems.common.jsonrpc.base.JsonrpcResponseSuccess;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component(immediate = true, service = HttpServlet.class, //
		property = { //
				RestHandler.SERVLET_PATH + "=/jsonrpc", //
		} //
)
public class JsonRpcServlet extends HttpServlet {

	private static final Logger LOG = LoggerFactory.getLogger(JsonRpcServlet.class);

	private final transient JsonRpcRequestHandler jsonRpcRequestHandler;
	private final transient Metadata metadata;
	private final transient AuthUserPasswordAuthenticationService authService;

	@Activate
	public JsonRpcServlet(//
			@Reference JsonRpcRequestHandler jsonRpcRequestHandler, //
			@Reference Metadata metadata, //
			@Reference AuthUserPasswordAuthenticationService authService //
	) {
		this.jsonRpcRequestHandler = jsonRpcRequestHandler;
		this.metadata = metadata;
		this.authService = authService;
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
		final var context = req.startAsync();
		this.authenticateUserWithPassword(req).whenComplete((user, authError) -> {
			if (authError != null) {
				resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				try {
					sendErrorResponse(resp, UUID.randomUUID(), OpenemsError.COMMON_AUTHENTICATION_FAILED.exception());
				} catch (IOException e) {
					LOG.error("Error sending response", e);
				}
				context.complete();
				return;
			}

			this.handleJsonRpc(user, req).whenComplete((success, throwable) -> {
				if (throwable != null) {
					resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
					try {
						sendErrorResponse(resp, UUID.randomUUID(),
								new OpenemsException("No response from JSON-RPC handler."));
					} catch (IOException e) {
						LOG.error("Error sending response", e);
					}
					context.complete();
					return;
				}

				if (success == null) {
					try {
						sendErrorResponse(resp, UUID.randomUUID(),
								new OpenemsException("No response from JSON-RPC handler."));
					} catch (IOException e) {
						LOG.error("Error sending response", e);
					}
					resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					context.complete();
					return;
				}

				try {
					sendOkResponse(resp, success.toJsonObject());
				} catch (IOException e) {
					LOG.error("Error sending response", e);
				}
				context.complete();
			});
		});
	}

	/**
	 * Authenticate a user.
	 *
	 * @param request the {@link Request}
	 * @return the {@link User}
	 */
	private CompletableFuture<User> authenticateUserWithPassword(HttpServletRequest request) {
		var authHeader = request.getHeader("Authorization");
		if (authHeader == null) {
			return CompletableFuture.failedFuture(OpenemsError.COMMON_AUTHENTICATION_FAILED.exception());
		}
		var parts = authHeader.split(" ");
		if (parts.length < 2 || !"Basic".equalsIgnoreCase(parts[0])) {
			return CompletableFuture.failedFuture(OpenemsError.COMMON_AUTHENTICATION_FAILED.exception());
		}
		try {
			var credentials = new String(Base64.getDecoder().decode(parts[1]), StandardCharsets.UTF_8);
			int p = credentials.indexOf(":");
			if (p != -1) {
				var username = credentials.substring(0, p).trim();
				var password = credentials.substring(p + 1).trim();
				return this.authService.authenticateWithPassword(username, password).thenCompose(result -> {
					return this.metadata.getUserByExternalId(result.userId());
				});
			}
			return CompletableFuture.failedFuture(OpenemsError.COMMON_AUTHENTICATION_FAILED.exception());
		} catch (Exception e) {
			return CompletableFuture.failedFuture(OpenemsError.COMMON_AUTHENTICATION_FAILED.exception());
		}
	}

	/**
	 * Handles an http request to 'jsonrpc' endpoint.
	 *
	 * @param user    the {@link User}
	 * @param request the {@link Request}
	 * @return a {@link CompletableFuture} with the {@link JsonrpcResponseSuccess}
	 */
	private CompletableFuture<? extends JsonrpcResponseSuccess> handleJsonRpc(//
			User user, HttpServletRequest request) {
		try {
			var json = parseJson(request);
			fillMissingProperties(json);

			var message = JsonrpcMessage.from(json);
			if (!(message instanceof JsonrpcRequest requestMessage)) {
				throw new OpenemsException("Only JSON-RPC Request is supported here.");
			}
			return this.jsonRpcRequestHandler.handleRequest("REST-JSONRPC", user, requestMessage);
		} catch (OpenemsError.OpenemsNamedException e) {
			return CompletableFuture.failedFuture(e);
		}
	}

	private static void fillMissingProperties(JsonObject json) throws OpenemsError.OpenemsNamedException {
		if (!json.has("jsonrpc")) {
			json.addProperty("jsonrpc", "2.0");
		}
		if (!json.has("id")) {
			json.addProperty("id", UUID.randomUUID().toString());
		}
		if (json.has("params")) {
			var params = getAsJsonObject(json, "params");
			if (params.has("payload")) {
				var payload = getAsJsonObject(params, "payload");
				if (!payload.has("jsonrpc")) {
					payload.addProperty("jsonrpc", "2.0");
				}
				if (!payload.has("id")) {
					payload.addProperty("id", UUID.randomUUID().toString());
				}
				params.add("payload", payload);
			}
			json.add("params", params);
		}
	}

}
