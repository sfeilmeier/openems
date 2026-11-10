package io.openems.backend.luox;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.gson.JsonPrimitive;

import io.openems.backend.common.edge.EdgeClient;
import io.openems.backend.common.jsonrpc.syncable.DynamicSyncableSubscriptionHandler;
import io.openems.backend.common.jsonrpc.syncable.SyncableSubscriptionKey;
import io.openems.backend.luox.api.LuoxBackendApi;
import io.openems.backend.metrics.prometheus.DebugExecutor;
import io.openems.common.function.ThrowingRunnable;
import io.openems.common.function.ThrowingSupplier;
import io.openems.common.jsonrpc.request.RegisterLuoxContractRequest;
import io.openems.common.jsonrpc.syncable.SyncableKey;
import io.openems.common.jsonrpc.syncable.types.SyncableLuoxControlData;
import io.openems.common.utils.JsonUtils;

class LuoxBackendApiImplTest {

	private static final String EDGE_ID = "edge0";
	private static final String CUSTOMER_ID = "my-valid-customer-id";
	private static final String CONTRACT_ID = "my-valid-contract-id";
	private static final LuoxBackendApi.UserContract USER_CONTRACT = new LuoxBackendApi.UserContract(CUSTOMER_ID,
			CONTRACT_ID);

	private LuoxBackendApiImpl sut;
	private TestableSubscriptionManagerImpl subscriptionManager;
	private LuoxPowerMeasurementProvider measurementProvider;
	private LuoxTokenValidator tokenValidator;

	@BeforeEach
	void setUp() {
		this.subscriptionManager = new TestableSubscriptionManagerImpl();
		this.measurementProvider = mock(LuoxPowerMeasurementProvider.class);
		this.tokenValidator = mock(LuoxTokenValidator.class);
		this.sut = new LuoxBackendApiImpl(//
				this.subscriptionManager, //
				this.measurementProvider, //
				new DummyDebugExecutor(), //
				this.tokenValidator //
		);
	}

	@Test
	@SuppressWarnings("unchecked")
	void testSubscriptionWithoutContractMapping() {
		final var edgeClient = mock(EdgeClient.class);
		final var subscription = this.subscriptionManager
				.subscribe(new SyncableSubscriptionKey(new SyncableKey.LuoxControl()), edgeClient);

		final var handler = (DynamicSyncableSubscriptionHandler<SyncableLuoxControlData>) subscription.clientHandler();

		assertInstanceOf(SyncableLuoxControlData.NoContractMapping.class, handler.getEntry().getValue().value());
	}

	@Test
	void testSubscriptionWithContractMapping() throws Exception {
		this.setupAndTestRegistration();
	}

	@Test
	void testLimitation() throws Exception {
		final var handler = this.setupAndTestRegistration();

		this.setupAndTestLimitation(handler, new LuoxBackendApi.FeedLimitation(35, null));
	}

	@Test
	void testGetMeasurements() throws Exception {
		this.setupAndTestRegistration();

		final var expectedMeasurements = new LuoxBackendApi.Measurements(Instant.now(), 55, null);
		when(this.measurementProvider.getMeasurements(EDGE_ID)).thenReturn(expectedMeasurements);

		final var result = this.sut.fetchMeasurements(USER_CONTRACT).get();
		assertEquals(expectedMeasurements, result);
	}

	@Test
	void testGetLimitation() throws Exception {
		final var handler = this.setupAndTestRegistration();

		final var expectedLimitation = new LuoxBackendApi.FeedLimitation(35, null);
		this.setupAndTestLimitation(handler, expectedLimitation);

		final var limitation = this.sut.fetchFeedLimitation(USER_CONTRACT).get();
		assertEquals(expectedLimitation, limitation);
	}

	private void setupAndTestLimitation(//
			DynamicSyncableSubscriptionHandler<SyncableLuoxControlData> handler, //
			LuoxBackendApi.FeedLimitation expectedLimitation //
	) throws InterruptedException, ExecutionException {
		this.sut.sendFeedLimitation(new LuoxBackendApi.FeedLimitationRequest(USER_CONTRACT, expectedLimitation)).get();

		final var value = handler.getEntry().getValue().value();
		assertInstanceOf(SyncableLuoxControlData.Limitation.class, value);
		final var limitation = (SyncableLuoxControlData.Limitation) value;
		assertEquals(expectedLimitation.remainingFeed(), limitation.remainingFeed());
		assertEquals(expectedLimitation.remainingFeedDno(), limitation.remainingFeedDno());
	}

	@SuppressWarnings("unchecked")
	private DynamicSyncableSubscriptionHandler<SyncableLuoxControlData> setupAndTestRegistration()
			throws InterruptedException, ExecutionException {
		final var token = "my-valid-token";
		final var decodedToken = mock(DecodedJWT.class);
		when(decodedToken.getClaim("customer_id")).thenReturn(new JsonClaim(new JsonPrimitive(CUSTOMER_ID)));
		when(decodedToken.getClaim("producer_contract_ids")).thenReturn(new JsonClaim(JsonUtils.buildJsonArray() //
				.add(CONTRACT_ID) //
				.build()));
		when(decodedToken.getClaim("consumer_contract_ids")).thenReturn(new JsonClaim(JsonUtils.buildJsonArray() //
				.build()));
		when(this.tokenValidator.validateAndGetToken(token)).thenReturn(decodedToken);

		this.sut.registerContract(new RegisterLuoxContractRequest(token, CONTRACT_ID), EDGE_ID).get();

		final var edgeClient = mock(EdgeClient.class);
		when(edgeClient.getEdgeId()).thenReturn(EDGE_ID);
		final var subscription = this.subscriptionManager
				.subscribe(new SyncableSubscriptionKey(new SyncableKey.LuoxControl()), edgeClient);

		final var handler = (DynamicSyncableSubscriptionHandler<SyncableLuoxControlData>) subscription.clientHandler();
		assertInstanceOf(SyncableLuoxControlData.NoLimitation.class, handler.getEntry().getValue().value());

		return handler;
	}

	private static class TestableSubscriptionManagerImpl
			extends io.openems.backend.common.edge.subscription.SubscriptionManagerImpl {
		private final ConcurrentLinkedDeque<Future<?>> futures = new ConcurrentLinkedDeque<>();

		@Override
		protected void scheduleStoreRemove(SubscriptionStore store) {
			this.futures.add(this.removeStoreExecutor.submit(() -> this.removeStoreIfPossible(store)));
		}

		protected void waitForAllAsyncTasks() throws ExecutionException, InterruptedException, TimeoutException {
			while (!this.futures.isEmpty()) {
				var future = this.futures.pop();
				future.get(10, TimeUnit.SECONDS);
			}
		}
	}

	private static class DummyDebugExecutor extends DebugExecutor {

		public DummyDebugExecutor() {
			super("", null);
		}

		@Override
		public <T, E extends Exception> CompletableFuture<T> submit(String id, ThrowingSupplier<T, E> command) {
			try {
				return CompletableFuture.completedFuture(command.get());
			} catch (Exception e) {
				return CompletableFuture.failedFuture(e);
			}
		}

		@Override
		public <E extends Exception> CompletableFuture<Void> submit(String id, ThrowingRunnable<E> command) {
			try {
				command.run();
				return CompletableFuture.completedFuture(null);
			} catch (Exception e) {
				return CompletableFuture.failedFuture(e);
			}
		}
	}

}