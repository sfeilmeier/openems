package io.openems.backend.luox;

import java.net.MalformedURLException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Consumer;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ConfigurationPolicy;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.annotations.VisibleForTesting;

import io.openems.backend.common.edge.EdgeClient;
import io.openems.backend.common.edge.subscription.SubscriptionHandler;
import io.openems.backend.common.edge.subscription.SubscriptionHandlerFactory;
import io.openems.backend.common.edge.subscription.SubscriptionKey;
import io.openems.backend.common.edge.subscription.SubscriptionManager;
import io.openems.backend.common.jsonrpc.syncable.DynamicSyncableSubscriptionHandler;
import io.openems.backend.common.jsonrpc.syncable.SyncableSubscriptionKey;
import io.openems.backend.luox.api.LuoxBackendApi;
import io.openems.backend.metrics.prometheus.DebugExecutor;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.function.Disposable;
import io.openems.common.jsonrpc.request.RegisterLuoxContractRequest;
import io.openems.common.jsonrpc.syncable.SyncableEntry;
import io.openems.common.jsonrpc.syncable.SyncableKey;
import io.openems.common.jsonrpc.syncable.types.SyncableLuoxControlData;
import io.openems.common.logger.DebugLoggable;
import io.openems.common.utils.ArrayUtils;
import io.openems.common.utils.BehaviorSubject;
import io.openems.common.utils.FunctionUtils;
import io.openems.common.utils.ThrottledLoopExecutor;

@Designate(ocd = LuoxBackendApiConfig.class)
@Component(//
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE, //
		name = "Direct.LUOX" //
)
public class LuoxBackendApiImpl implements LuoxBackendApi, DebugLoggable {

	private static final String ID = "luox0";

	private final SubscriptionManager subscriptionManager;
	private final LuoxPowerMeasurementProvider measurementProvider;
	private final ThrottledLoopExecutor sendExecutor;
	private final LuoxHandlerFactory luoxHandlerFactory;
	private final LuoxTokenValidator luoxTokenValidator;

	private static class ContractEdgeData {
		private final BehaviorSubject<SyncableLuoxControlData> currentLimitation;
		private final UserContract contract;
		private String edgeId;

		public ContractEdgeData(//
				SyncableLuoxControlData initialLimitation, //
				UserContract contract, //
				String edgeId //
		) {
			this.currentLimitation = new BehaviorSubject<>(initialLimitation);
			this.contract = contract;
			this.edgeId = edgeId;
		}

		public void setEdgeId(String edgeId) {
			this.edgeId = edgeId;
		}

		@Override
		public String toString() {
			return "ContractEdgeData{"//
					+ "currentLimitation=" + this.currentLimitation//
					+ ", contract=" + this.contract//
					+ ", edgeId='" + this.edgeId + '\''//
					+ '}';
		}
	}

	private final ReadWriteLock updateLock = new ReentrantReadWriteLock();
	private final Map<UserContract, ContractEdgeData> feedLimitationByContract = new ConcurrentHashMap<>();
	private final Map</* edgeId */ String, ContractEdgeData> feedLimitationByEdgeId = new HashMap<>();

	private final DebugExecutor taskExecutor;

	@VisibleForTesting
	LuoxBackendApiImpl(//
			SubscriptionManager subscriptionManager, //
			LuoxPowerMeasurementProvider measurementProvider, //
			DebugExecutor taskExecutor, //
			LuoxTokenValidator luoxTokenValidator //
	) {
		this.subscriptionManager = subscriptionManager;
		this.measurementProvider = measurementProvider;
		this.sendExecutor = new ThrottledLoopExecutor("Luox-SendExecutor", FunctionUtils::doNothing);
		this.taskExecutor = taskExecutor;
		this.luoxTokenValidator = luoxTokenValidator;

		this.luoxHandlerFactory = new LuoxHandlerFactory();
		this.subscriptionManager.registerHandlerFactory(this.luoxHandlerFactory);
	}

	@Activate
	public LuoxBackendApiImpl(//
			@Reference SubscriptionManager subscriptionManager, //
			@Reference LuoxPowerMeasurementProvider measurementProvider, //
			LuoxBackendApiConfig config //
	) throws MalformedURLException {
		this(subscriptionManager, measurementProvider,
				// TODO do not cache virtual threads
				new DebugExecutor(ID,
						Executors.newFixedThreadPool(config.taskPoolSize(),
								Thread.ofVirtual().name("Luox.Task-%d").factory())),
				new LuoxTokenValidator(config.luoxIssuerUrl(), config.luoxCertsUrl()));
	}

	@Deactivate
	public void deactivate() {
		this.subscriptionManager.unregisterHandlerFactory(this.luoxHandlerFactory);
		this.sendExecutor.dispose();
		this.taskExecutor.shutdown();
	}

	@Override
	public CompletableFuture<Void> sendFeedLimitation(FeedLimitationRequest limitationRequest) {
		return this.taskExecutor.submit("sendFeedLimitation", () -> {
			final var limitationData = new SyncableLuoxControlData.Limitation(
					limitationRequest.limitation().remainingFeed(), limitationRequest.limitation().remainingFeedDno(),
					Instant.now());

			this.updateLock.readLock().lock();
			try {
				this.feedLimitationByContract.compute(limitationRequest.contract(), (userContract, subscription) -> {
					if (subscription == null) {
						return new ContractEdgeData(limitationData, limitationRequest.contract(), null);
					}
					subscription.currentLimitation.setValue(limitationData);
					return subscription;
				});
			} finally {
				this.updateLock.readLock().unlock();
			}
		});
	}

	@Override
	public CompletableFuture<FeedLimitation> fetchFeedLimitation(UserContract contract) {
		return this.taskExecutor.submit("fetchFeedLimitation", () -> {
			final var subscription = this.feedLimitationByContract.get(contract);
			if (subscription == null) {
				throw new IllegalStateException("No active feed limitation available");
			}
			final var active = subscription.currentLimitation.getValue();
			if (!(active instanceof SyncableLuoxControlData.Limitation a)) {
				throw new IllegalStateException("No active feed limitation available");
			}
			return new FeedLimitation(a.remainingFeed(), a.remainingFeedDno());
		});
	}

	@Override
	public CompletableFuture<Measurements> fetchMeasurements(UserContract contract) {
		return this.taskExecutor.submit("fetchMeasurements", () -> {
			final var data = this.feedLimitationByContract.get(contract);
			if (data == null) {
				throw new Exception("Measurements not available for " + contract);
			}
			final var edgeId = data.edgeId;
			if (edgeId == null) {
				throw new Exception("Measurements not available for " + data);
			}
			final var measurements = this.measurementProvider.getMeasurements(edgeId);
			if (measurements == null) {
				throw new Exception("Measurements not available for " + edgeId);
			}
			return measurements;
		});
	}

	@Override
	public CompletableFuture<Void> registerContract(RegisterLuoxContractRequest request, String edgeId) {
		return this.taskExecutor.submit("registerContract", () -> {
			final var token = this.luoxTokenValidator.validateAndGetToken(request.getAccessToken());

			final var customerId = token.getClaim("customer_id").asString();

			final var producerContractIds = token.getClaim("producer_contract_ids").asArray(String.class);
			final var consumerContractIds = token.getClaim("consumer_contract_ids").asArray(String.class);

			if (!(ArrayUtils.containsIgnoreNull(producerContractIds, request.getContractId())
					|| ArrayUtils.containsIgnoreNull(consumerContractIds, request.getContractId()))) {
				throw new OpenemsException("Contract is not part of token!");
			}

			final var contract = new UserContract(customerId, request.getContractId());

			this.updateLock.writeLock().lock();
			try {
				final var data = this.feedLimitationByContract.computeIfAbsent(contract,
						c -> new ContractEdgeData(new SyncableLuoxControlData.NoLimitation(), contract, edgeId));

				if (!Objects.equals(data.edgeId, edgeId)) {
					this.feedLimitationByEdgeId.remove(data.edgeId);

					data.setEdgeId(edgeId);
				}
				this.feedLimitationByEdgeId.put(edgeId, data);
			} finally {
				this.updateLock.writeLock().unlock();
			}
		});
	}

	private class LuoxHandlerFactory implements SubscriptionHandlerFactory {

		@Override
		public boolean isHandling(SubscriptionKey key) {
			return key instanceof SyncableSubscriptionKey(SyncableKey<?> syncableKey)
					&& syncableKey instanceof SyncableKey.LuoxControl;
		}

		@Override
		public SubscriptionHandler createGlobalHandler(SubscriptionKey key, SubscriptionManager subscriptionManager) {
			// Can be created if we want some things to happen when at least one edge
			// subscribes to luox.
			return null;
		}

		@Override
		public ClientHandlerFactory createClientHandlerFactory(//
				SubscriptionKey key, //
				SubscriptionHandler globalHandler, //
				SubscriptionManager subscriptionManager //
		) {
			final var syncableKey = (SyncableKey.LuoxControl) ((SyncableSubscriptionKey) key).syncableKey();
			return client -> new LuoxClientHandler(syncableKey, client, LuoxBackendApiImpl.this);
		}
	}

	private static class LuoxClientHandler extends DynamicSyncableSubscriptionHandler<SyncableLuoxControlData> {

		private final Logger log = LoggerFactory.getLogger(LuoxClientHandler.class);

		private final EdgeClient client;
		private final LuoxBackendApiImpl service;
		private Disposable subscription;

		protected LuoxClientHandler(//
				SyncableKey.LuoxControl key, //
				EdgeClient client, //
				LuoxBackendApiImpl service //
		) {
			super(key, service.sendExecutor, List.of(client));
			this.client = client;
			this.service = service;
		}

		@Override
		public void subscribe() {
			this.subscription = this.subscribeEdge();
		}

		private Disposable subscribeEdge() {
			this.log.info("Subscribing client {} from luox control", this.client.getEdgeIdString());
			this.service.updateLock.readLock().lock();
			try {
				final var edgeLimitation = this.service.feedLimitationByEdgeId.get(this.client.getEdgeId());
				if (edgeLimitation == null) {
					this.onNewData(new SyncableLuoxControlData.NoContractMapping());
					return FunctionUtils::doNothing;
				}

				final Consumer<SyncableLuoxControlData> listener = d -> {
					if (!Objects.equals(edgeLimitation.edgeId, this.client.getEdgeId())) {
						this.unsubscribe();
						this.onNewData(new SyncableLuoxControlData.NoContractMapping());
						return;
					}
					this.onNewData(d);
				};
				edgeLimitation.currentLimitation.subscribe(listener);
				return () -> edgeLimitation.currentLimitation.unsubscribe(listener);
			} finally {
				this.service.updateLock.readLock().unlock();
			}

		}

		private void onNewData(SyncableLuoxControlData data) {
			this.value.setValue(new SyncableEntry<>(this.key, data, Instant.now()));
		}

		@Override
		public void unsubscribe() {
			this.log.info("Unsubscribing client {} from luox control", this.client.getEdgeIdString());
			if (this.subscription != null) {
				this.subscription.dispose();
				this.subscription = null;
			}
		}

		@Override
		public String toString() {
			return "LuoxClientHandler{" + "client=" + this.client.getEdgeIdString() + '}';
		}
	}

	@Override
	public String debugLog() {
		return "[LUOX] byContract=" + this.feedLimitationByContract + ", byEdgeId=" + this.feedLimitationByEdgeId;
	}

}
