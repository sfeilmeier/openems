package io.openems.backend.authentication.oauth2;

import static java.util.Collections.emptySet;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.JWTVerifier;

import io.openems.backend.authentication.api.model.error.AuthenticationFailedException;
import io.openems.backend.metrics.prometheus.DebugExecutor;
import io.openems.common.bridge.http.api.HttpAuthorization;
import io.openems.common.bridge.http.api.HttpHeader;

class OAuthRestClientAuthenticationServiceImplTest {

	@Test
	void authenticateMissingAuthorizationHeaderFailsFast() {
		final var sut = createSut(createVerifier());

		final var future = sut.authenticate(Map.of(), emptySet());
		final var exception = assertThrows(CompletionException.class, future::join);
		assertEquals(AuthenticationFailedException.class, exception.getCause().getClass());
		assertEquals("Missing or invalid Authorization header", exception.getCause().getMessage());
	}

	@Test
	void authenticateValidBearerTokenSucceeds() {
		final var sut = createSut(createVerifier());

		assertDoesNotThrow(
				() -> sut.authenticate(Map.of(HttpHeader.HEADER_AUTHORIZATION, HttpAuthorization.bearer("test-token")),
						emptySet()).join());
	}

	@Test
	void authenticateInvalidBearerTokenFails() {
		final var verifier = createFailingVerifier();
		final var sut = createSut(verifier);
		final Map<String, String> headers = new HashMap<>();
		headers.put(HttpHeader.HEADER_AUTHORIZATION, HttpAuthorization.bearer("invalid-token"));

		final var future = sut.authenticate(headers, emptySet());
		assertTrue(future.isCompletedExceptionally());
		assertThrows(CompletionException.class, future::join);
		verify(verifier).verify("invalid-token");
	}

	private static OAuthRestClientAuthenticationServiceImpl createSut(JWTVerifier verifier) {
		final var log = mock(Logger.class);
		return new OAuthRestClientAuthenticationServiceImpl(log, verifier,
				new DebugExecutor("", new DummyExecutorService()));
	}

	private static JWTVerifier createVerifier() {
		final var verifier = mock(JWTVerifier.class);
		when(verifier.verify("test-token")).thenReturn(null);
		return verifier;
	}

	private static JWTVerifier createFailingVerifier() {
		final var verifier = mock(JWTVerifier.class);
		when(verifier.verify("invalid-token")).thenThrow(new JWTVerificationException("Invalid token"));
		return verifier;
	}

	private static class DummyExecutorService implements ExecutorService {

		@Override
		public void shutdown() {
			throw new UnsupportedOperationException();
		}

		@Override
		public List<Runnable> shutdownNow() {
			throw new UnsupportedOperationException();
		}

		@Override
		public boolean isShutdown() {
			throw new UnsupportedOperationException();
		}

		@Override
		public boolean isTerminated() {
			throw new UnsupportedOperationException();
		}

		@Override
		public boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> Future<T> submit(Callable<T> task) {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> Future<T> submit(Runnable task, T result) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Future<?> submit(Runnable task) {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks) throws InterruptedException {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit)
				throws InterruptedException {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> T invokeAny(Collection<? extends Callable<T>> tasks)
				throws InterruptedException, ExecutionException {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> T invokeAny(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit)
				throws InterruptedException, ExecutionException, TimeoutException {
			throw new UnsupportedOperationException();
		}

		@Override
		public void execute(Runnable command) {
			command.run();
		}
	}

}
