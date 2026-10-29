package io.openems.backend.b2brest.servlet;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.Test;

public class PathRequestHandlerTest {

	@Test
	public void testDispatchesToMatchingRouteWithPathVariables() {
		var sut = new PathRequestHandler();
		var pathVariables = new AtomicReference<Map<String, String>>();

		sut.addRoute("/{customer_id}/{contract_id}/feed-limitation", (variables, req, resp) -> {
			pathVariables.set(variables);
		});

		var wasHandled = sut.handle("/111/222/feed-limitation", null, null);

		assertTrue(wasHandled);
		assertEquals(Map.of("customer_id", "111", "contract_id", "222"), pathVariables.get());
	}

	@Test
	public void testReturnsFalseForUnknownRoute() {
		var sut = new PathRequestHandler();
		var calls = new AtomicInteger();

		sut.addRoute("/{customer_id}/{contract_id}/feed-limitation", (variables, req, resp) -> {
			calls.incrementAndGet();
		});

		var wasHandled = sut.handle("/111/222/other-endpoint", null, null);

		assertFalse(wasHandled);
		assertEquals(0, calls.get());
	}

	@Test
	public void testRejectsEmptyPathVariableName() {
		var sut = new PathRequestHandler();

		assertThrows(IllegalArgumentException.class,
				() -> sut.addRoute("/{}/222/feed-limitation", (variables, req, resp) -> {
				}));
	}
}
