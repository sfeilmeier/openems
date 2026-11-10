package io.openems.backend.b2brest.servlet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.time.Instant;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.openems.backend.authentication.api.AuthRestAuthenticationService;
import io.openems.backend.authentication.api.model.error.AuthenticationFailedException;
import io.openems.backend.luox.api.LuoxBackendApi;
import io.openems.common.bridge.http.api.HttpMediaType;
import io.openems.common.bridge.http.api.HttpMethod;
import io.openems.common.types.HttpStatus;
import io.openems.common.utils.JsonUtils;
import io.openems.common.utils.ReflectionUtils;
import jakarta.servlet.ServletException;

class LuoxServletTest {

	private LuoxServlet servlet;
	private LuoxBackendApi luoxApi;
	private AuthRestAuthenticationService auth;

	@BeforeEach
	void setUp() {
		this.servlet = new LuoxServlet();
		this.luoxApi = mock(LuoxBackendApi.class);
		this.auth = mock(AuthRestAuthenticationService.class);

		ReflectionUtils.setAttributeViaReflection(this.servlet, "luoxApi", this.luoxApi);
		ReflectionUtils.setAttributeViaReflection(this.servlet, "authenticationService", this.auth);
	}

	@Test
	void testFeedLimitationPutSuccess() throws ServletException, IOException {
		final var req = new DummyHttpServletRequest() //
				.setMethod(HttpMethod.PUT) //
				.setPathInfo("/1/2/feed-limitation") //
				.setBody("{ \"remaining_feed\": 67 }");
		final var resp = new DummyHttpServletResponse();

		this.servlet.service(req, resp);

		assertEquals(HttpStatus.OK.code(), resp.getStatus());
		verify(this.auth, times(1)).authenticate(anyMap(), eq(Set.of("write:control")));
		verify(this.luoxApi, times(1)).sendFeedLimitation(new LuoxBackendApi.FeedLimitationRequest(
				new LuoxBackendApi.UserContract("1", "2"), new LuoxBackendApi.FeedLimitation(67, null)));
	}

	@Test
	void testFeedLimitationPutErrorBadRequest() throws ServletException, IOException {
		when(this.auth.authenticate(anyMap(), eq(Set.of("write:control"))))
				.thenReturn(CompletableFuture.completedFuture(null));

		final var req = new DummyHttpServletRequest() //
				.setMethod(HttpMethod.PUT) //
				.setPathInfo("/1/2/feed-limitation") //
				.setBody("{ \"invalid\":UU() \"json\" }");
		final var resp = new DummyHttpServletResponse();

		this.servlet.service(req, resp);

		assertEquals(HttpStatus.BAD_REQUEST.code(), resp.getStatus());
		assertEquals(HttpMediaType.Application.JSON, resp.getContentType());
		assertEquals(JsonUtils.buildJsonObject()//
				.addProperty("detail", "Invalid json")//
				.build().toString(), resp.getBody());
	}

	@Test
	void testFeedLimitationGetSuccess() throws ServletException, IOException {
		final var feedLimitation = new LuoxBackendApi.FeedLimitation(19, null);

		when(this.luoxApi.fetchFeedLimitation(new LuoxBackendApi.UserContract("1", "2")))
				.thenReturn(CompletableFuture.completedFuture(feedLimitation));

		final var req = new DummyHttpServletRequest() //
				.setMethod(HttpMethod.GET) //
				.setPathInfo("/1/2/feed-limitation");
		final var resp = new DummyHttpServletResponse();

		this.servlet.service(req, resp);

		assertEquals(HttpStatus.OK.code(), resp.getStatus());
		assertEquals(HttpMediaType.Application.JSON, resp.getContentType());
		assertEquals(JsonUtils.buildJsonObject()//
				.addProperty("remaining_feed", feedLimitation.remainingFeed())//
				.build().toString(), resp.getBody());
		verify(this.auth, times(1)).authenticate(anyMap(), eq(Set.of("read:control")));
	}

	@Test
	void testFeedLimitationGetErrorInternal() throws ServletException, IOException {
		when(this.luoxApi.fetchFeedLimitation(new LuoxBackendApi.UserContract("1", "2")))
				.thenReturn(CompletableFuture.failedFuture(new RuntimeException("Internal error")));

		final var req = new DummyHttpServletRequest() //
				.setMethod(HttpMethod.GET) //
				.setPathInfo("/1/2/feed-limitation");
		final var resp = new DummyHttpServletResponse();

		this.servlet.service(req, resp);

		assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.code(), resp.getStatus());
		assertEquals(HttpMediaType.Application.JSON, resp.getContentType());
		assertEquals(JsonUtils.buildJsonObject()//
				.addProperty("detail", "Failed to get feed limitation")//
				.build().toString(), resp.getBody());
		verify(this.auth, times(1)).authenticate(anyMap(), eq(Set.of("read:control")));
	}

	@Test
	void testMeasurementsGetSuccess() throws ServletException, IOException {
		final var measurements = new LuoxBackendApi.Measurements(Instant.now(), 1234, 56);

		when(this.luoxApi.fetchMeasurements(new LuoxBackendApi.UserContract("1", "2")))
				.thenReturn(CompletableFuture.completedFuture(measurements));

		final var req = new DummyHttpServletRequest() //
				.setMethod(HttpMethod.GET) //
				.setPathInfo("/1/2/measurements");
		final var resp = new DummyHttpServletResponse();

		this.servlet.service(req, resp);

		assertEquals(HttpStatus.OK.code(), resp.getStatus());
		assertEquals(HttpMediaType.Application.JSON, resp.getContentType());
		assertEquals(JsonUtils.buildJsonObject()//
				.addProperty("timestamp", measurements.timestamp().toString())//
				.addProperty("power_on_grid", measurements.powerOnGrid())//
				.addPropertyIfNotNull("power_off_grid", measurements.powerOffGrid())//
				.build().toString(), resp.getBody());
		verify(this.auth, times(1)).authenticate(anyMap(), eq(Set.of("read:measurements")));
	}

	@Test
	void testMeasurementsGetErrorAuthenticationFailed() throws ServletException, IOException {
		when(this.auth.authenticate(anyMap(), eq(Set.of("read:measurements"))))
				.thenReturn(CompletableFuture.failedFuture(new AuthenticationFailedException("Authentication failed")));

		final var req = new DummyHttpServletRequest() //
				.setMethod(HttpMethod.GET) //
				.setPathInfo("/1/2/measurements");
		final var resp = new DummyHttpServletResponse();

		this.servlet.service(req, resp);

		assertEquals(HttpStatus.UNAUTHORIZED.code(), resp.getStatus());
		assertEquals(HttpMediaType.Application.JSON, resp.getContentType());
		assertEquals(JsonUtils.buildJsonObject()//
				.addProperty("detail", "Authentication failed")//
				.build().toString(), resp.getBody());
	}

}