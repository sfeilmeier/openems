package io.openems.backend.b2brest.servlet;

import static org.osgi.service.component.annotations.ReferenceCardinality.OPTIONAL;
import static org.osgi.service.component.annotations.ReferencePolicy.DYNAMIC;
import static org.osgi.service.component.annotations.ReferencePolicyOption.GREEDY;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.backend.authentication.api.AuthRestAuthenticationService;
import io.openems.backend.authentication.api.model.error.AuthenticationFailedException;
import io.openems.backend.b2brest.RestHandler;
import io.openems.backend.luox.api.LuoxBackendApi;
import io.openems.common.bridge.http.api.HttpMediaType;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.jsonrpc.serialization.JsonParseException;
import io.openems.common.jsonrpc.serialization.JsonSerializer;
import io.openems.common.jsonrpc.serialization.JsonSerializerUtil;
import io.openems.common.types.HttpStatus;
import io.openems.common.utils.JettyUtils;
import io.openems.common.utils.JsonUtils;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component(immediate = true, service = HttpServlet.class, //
		property = { //
				RestHandler.SERVLET_PATH + "=/luox/*", //
		} //
)
public class LuoxServlet extends HttpServlet {

	private static final Logger LOG = LoggerFactory.getLogger(LuoxServlet.class);
	private static final int DEFAULT_TIMEOUT_MS = 30_000;
	private static final int DEFAULT_TIMEOUT_CONTEXT_BUFFER_MS = DEFAULT_TIMEOUT_MS + 5_000;

	private static final String FEED_LIMITATION_ROUTE_CUSTOMER_ID = "customer_id";
	private static final String FEED_LIMITATION_ROUTE_CONTRACT_ID = "contract_id";
	private static final String FEED_LIMITATION_ROUTE = "/{%s}/{%s}/feed-limitation"
			.formatted(FEED_LIMITATION_ROUTE_CUSTOMER_ID, FEED_LIMITATION_ROUTE_CONTRACT_ID);
	private static final String MEASUREMENTS_ROUTE = "/{%s}/{%s}/measurements"
			.formatted(FEED_LIMITATION_ROUTE_CUSTOMER_ID, FEED_LIMITATION_ROUTE_CONTRACT_ID);

	private final transient PathRequestHandler putRequestHandler = new PathRequestHandler();
	private final transient PathRequestHandler getRequestHandler = new PathRequestHandler();

	@Reference(policy = DYNAMIC, policyOption = GREEDY, cardinality = OPTIONAL)
	private transient volatile LuoxBackendApi luoxApi;

	@Reference(target = "(name=luox)", policy = DYNAMIC, policyOption = GREEDY, cardinality = OPTIONAL)
	private transient volatile AuthRestAuthenticationService authenticationService;

	@Activate
	public LuoxServlet() {
		this.putRequestHandler.addRoute(FEED_LIMITATION_ROUTE, this::handleFeedLimitationPut);
		this.getRequestHandler.addRoute(FEED_LIMITATION_ROUTE, this::handleFeedLimitationGet);
		this.getRequestHandler.addRoute(MEASUREMENTS_ROUTE, this::handleMeasurementsGet);
	}

	@Override
	protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		if (!this.putRequestHandler.handle(req.getPathInfo(), req, resp)) {
			resp.sendError(HttpServletResponse.SC_NOT_FOUND);
		}
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		if (!this.getRequestHandler.handle(req.getPathInfo(), req, resp)) {
			resp.sendError(HttpServletResponse.SC_NOT_FOUND);
		}
	}

	private static Map<String, String> getAllHeadersFrom(HttpServletRequest request) {
		Map<String, String> headers = new LinkedHashMap<>();
		for (String headerName : Collections.list(request.getHeaderNames())) {
			headers.put(headerName, request.getHeader(headerName));
		}
		return headers;
	}

	private void handleFeedLimitationPut(//
			Map<String, String> pathVariables, //
			HttpServletRequest req, //
			HttpServletResponse resp //
	) {
		final var customerId = pathVariables.get(FEED_LIMITATION_ROUTE_CUSTOMER_ID);
		final var contractId = pathVariables.get(FEED_LIMITATION_ROUTE_CONTRACT_ID);

		FeedLimitationRequest request;
		try {
			request = FeedLimitationRequest.serializer().deserialize(JettyUtils.parseJson(req));
		} catch (JsonParseException e) {
			handleError(resp, HttpStatus.BAD_REQUEST, e);
			return;
		} catch (OpenemsException | RuntimeException e) {
			handleError(resp, HttpStatus.BAD_REQUEST, e, "Invalid json");
			return;
		}
		LOG.info("Received feed limitation update for customer_id={}, contract_id={}, request={}", customerId,
				contractId, request);

		final var luoxApi = this.luoxApi;
		if (luoxApi == null) {
			resp.setStatus(HttpStatus.SERVICE_UNAVAILABLE.code());
			return;
		}

		final var authenticationService = this.authenticationService;
		if (authenticationService == null) {
			resp.setStatus(HttpStatus.SERVICE_UNAVAILABLE.code());
			return;
		}

		final var context = req.startAsync();
		context.setTimeout(DEFAULT_TIMEOUT_CONTEXT_BUFFER_MS);
		authenticationService.authenticate(getAllHeadersFrom(req), Set.of("write:control")) //
				.handle((unused, authenticationError) -> {
					if (authenticationError != null) {
						handleAuthenticationError(resp, authenticationError);
						context.complete();
						return CompletableFuture.completedFuture(null);
					}
					try {
						return luoxApi.sendFeedLimitation(new LuoxBackendApi.FeedLimitationRequest(
								new LuoxBackendApi.UserContract(customerId, contractId), request.toApiFeedLimitation()))
								.whenComplete((unused2, throwable) -> {
									if (throwable != null) {
										handleError(resp, HttpStatus.INTERNAL_SERVER_ERROR, throwable,
												"Unable to set feed limitation");
										context.complete();
										return;
									}

									resp.setStatus(HttpServletResponse.SC_OK);
									context.complete();
								});
					} catch (RuntimeException e) {
						handleError(resp, HttpStatus.INTERNAL_SERVER_ERROR, e, "Unable to set feed limitation");
						context.complete();
						return CompletableFuture.completedFuture(null);
					}
				}) //
				.thenCompose(t -> t) //
				.orTimeout(DEFAULT_TIMEOUT_MS, TimeUnit.MILLISECONDS) //
				.exceptionally(throwable -> {
					if (throwable instanceof TimeoutException) {
						handleError(resp, HttpStatus.GATEWAY_TIMEOUT, throwable, "Timeout");
						context.complete();
					}
					return null;
				});
	}

	private void handleFeedLimitationGet(//
			Map<String, String> pathVariables, //
			HttpServletRequest req, //
			HttpServletResponse resp //
	) {
		final var customerId = pathVariables.get(FEED_LIMITATION_ROUTE_CUSTOMER_ID);
		final var contractId = pathVariables.get(FEED_LIMITATION_ROUTE_CONTRACT_ID);

		final var luoxApi = this.luoxApi;
		if (luoxApi == null) {
			resp.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
			return;
		}

		final var authenticationService = this.authenticationService;
		if (authenticationService == null) {
			resp.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
			return;
		}

		final var context = req.startAsync();
		context.setTimeout(DEFAULT_TIMEOUT_CONTEXT_BUFFER_MS);
		authenticationService.authenticate(getAllHeadersFrom(req), Set.of("read:control")) //
				.handle((unused, authenticationError) -> {
					if (authenticationError != null) {
						handleAuthenticationError(resp, authenticationError);
						context.complete();
						return CompletableFuture.completedFuture(null);
					}

					try {
						return luoxApi.fetchFeedLimitation(new LuoxBackendApi.UserContract(customerId, contractId)) //
								.whenComplete((feedLimitation, throwable) -> {
									if (throwable != null) {
										handleError(resp, HttpStatus.INTERNAL_SERVER_ERROR, throwable,
												"Failed to get feed limitation");
										context.complete();
										return;
									}

									try {
										resp.setStatus(HttpServletResponse.SC_OK);
										resp.setContentType(HttpMediaType.Application.JSON);
										resp.getWriter()
												.write(FeedLimitationRequest.serializer().serialize(
														FeedLimitationRequest.fromApiFeedLimitation(feedLimitation))
														.toString());
									} catch (IOException e) {
										throw new RuntimeException(e);
									} finally {
										context.complete();
									}
								});
					} catch (RuntimeException e) {
						handleError(resp, HttpStatus.INTERNAL_SERVER_ERROR, e, "Failed to get feed limitation");
						context.complete();
						return CompletableFuture.completedFuture(null);
					}
				})//
				.thenCompose(t -> t) //
				.orTimeout(DEFAULT_TIMEOUT_MS, TimeUnit.MILLISECONDS) //
				.exceptionally(throwable -> {
					if (throwable instanceof TimeoutException) {
						handleError(resp, HttpStatus.GATEWAY_TIMEOUT, throwable, "Timeout");
						context.complete();
					}
					return null;
				});
	}

	private void handleMeasurementsGet(//
			Map<String, String> pathVariables, //
			HttpServletRequest req, //
			HttpServletResponse resp //
	) {

		final var customerId = pathVariables.get(FEED_LIMITATION_ROUTE_CUSTOMER_ID);
		final var contractId = pathVariables.get(FEED_LIMITATION_ROUTE_CONTRACT_ID);

		final var luoxApi = this.luoxApi;
		if (luoxApi == null) {
			resp.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
			return;
		}

		final var authenticationService = this.authenticationService;
		if (authenticationService == null) {
			resp.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
			return;
		}

		final var context = req.startAsync();
		context.setTimeout(DEFAULT_TIMEOUT_CONTEXT_BUFFER_MS);
		authenticationService.authenticate(getAllHeadersFrom(req), Set.of("read:measurements")) //
				.handle((unused, authenticationError) -> {
					if (authenticationError != null) {
						handleAuthenticationError(resp, authenticationError);
						context.complete();
						return CompletableFuture.completedFuture(null);
					}

					try {
						return luoxApi.fetchMeasurements(new LuoxBackendApi.UserContract(customerId, contractId)) //
								.whenComplete((measurements, throwable) -> {
									if (throwable != null) {
										handleError(resp, HttpStatus.INTERNAL_SERVER_ERROR, throwable,
												"Unable to get measurements");
										context.complete();
										return;
									}

									try {
										resp.setStatus(HttpServletResponse.SC_OK);
										resp.setContentType(HttpMediaType.Application.JSON);
										resp.getWriter().write(Measurements.serializer()
												.serialize(Measurements.fromApiMeasurements(measurements)).toString());
									} catch (IOException e) {
										throw new RuntimeException(e);
									} finally {
										context.complete();
									}
								});
					} catch (RuntimeException e) {
						handleError(resp, HttpStatus.INTERNAL_SERVER_ERROR, e, "Unable to get measurements");
						context.complete();
						return CompletableFuture.completedFuture(null);
					}
				}) //
				.thenCompose(t -> t) //
				.orTimeout(DEFAULT_TIMEOUT_MS, TimeUnit.MILLISECONDS) //
				.exceptionally(throwable -> {
					if (throwable instanceof TimeoutException) {
						handleError(resp, HttpStatus.GATEWAY_TIMEOUT, throwable, "Timeout");
						context.complete();
					}
					return null;
				});
	}

	private static void handleError(HttpServletResponse resp, HttpStatus httpStatus, Throwable throwable) {
		handleError(resp, httpStatus, throwable, null);
	}

	private static void handleError(HttpServletResponse resp, HttpStatus httpStatus, Throwable throwable,
			String message) {
		if (throwable instanceof CompletionException) {
			handleError(resp, httpStatus, throwable.getCause(), message);
			return;
		}
		if (httpStatus.equals(HttpStatus.INTERNAL_SERVER_ERROR)) {
			LOG.error(message, throwable);
		}
		resp.setStatus(httpStatus.code());
		resp.setContentType(HttpMediaType.Application.JSON);
		try {
			resp.getWriter().write(JsonUtils.buildJsonObject()//
					.addProperty("detail", message != null ? message : throwable.getMessage())//
					.build().toString());
		} catch (IOException ex) {
			LOG.error("Error writing response", ex);
		}
	}

	private static void handleAuthenticationError(HttpServletResponse resp, Throwable authenticationError) {
		if (authenticationError instanceof AuthenticationFailedException
				|| (authenticationError instanceof CompletionException ce
						&& ce.getCause() instanceof AuthenticationFailedException)) {
			handleError(resp, HttpStatus.UNAUTHORIZED, authenticationError);
		} else {
			handleError(resp, HttpStatus.INTERNAL_SERVER_ERROR, authenticationError, "Authentication failed");
		}
	}

	public record FeedLimitationRequest(int remainingFeed, Integer remainingFeedDno) {

		/**
		 * Returns a {@link JsonSerializer} for a {@link FeedLimitationRequest}.
		 *
		 * @return the created {@link JsonSerializer}
		 */
		public static JsonSerializer<FeedLimitationRequest> serializer() {
			return JsonSerializerUtil.jsonObjectSerializer(FeedLimitationRequest.class, json -> {
				return new FeedLimitationRequest(//
						json.getInt("remaining_feed"), //
						json.getOptionalInt("remaining_feed_dno").orElse(null) //
				);
			}, obj -> {
				return JsonUtils.buildJsonObject() //
						.addProperty("remaining_feed", obj.remainingFeed()) //
						.addPropertyIfNotNull("remaining_feed_dno", obj.remainingFeedDno()) //
						.build();
			});
		}

		private LuoxBackendApi.FeedLimitation toApiFeedLimitation() {
			return new LuoxBackendApi.FeedLimitation(this.remainingFeed, this.remainingFeedDno);
		}

		private static FeedLimitationRequest fromApiFeedLimitation(LuoxBackendApi.FeedLimitation apiFeedLimitation) {
			return new FeedLimitationRequest(apiFeedLimitation.remainingFeed(), apiFeedLimitation.remainingFeedDno());
		}

	}

	public record Measurements(Instant timestamp, int powerOnGrid, Integer powerOffGrid) {

		/**
		 * Returns a {@link JsonSerializer} for a {@link Measurements}.
		 *
		 * @return the created {@link JsonSerializer}
		 */
		public static JsonSerializer<Measurements> serializer() {
			return JsonSerializerUtil.jsonObjectSerializer(Measurements.class, json -> {
				return new Measurements(//
						json.getInstant("timestamp"), //
						json.getInt("power_on_grid"), //
						json.getOptionalInt("power_off_grid").orElse(null) //
				);
			}, obj -> {
				return JsonUtils.buildJsonObject() //
						.addProperty("timestamp", obj.timestamp()) //
						.addProperty("power_on_grid", obj.powerOnGrid()) //
						.addPropertyIfNotNull("power_off_grid", obj.powerOffGrid()) //
						.build();
			});
		}

		private static Measurements fromApiMeasurements(LuoxBackendApi.Measurements apiMeasurements) {
			return new Measurements(apiMeasurements.timestamp(), apiMeasurements.powerOnGrid(),
					apiMeasurements.powerOffGrid());
		}

	}

}
