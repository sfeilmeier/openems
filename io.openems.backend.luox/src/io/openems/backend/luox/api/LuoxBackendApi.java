package io.openems.backend.luox.api;

import java.time.Instant;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;

import io.openems.common.jsonrpc.request.RegisterLuoxContractRequest;

public interface LuoxBackendApi {

	record UserContract(String customerId, String contractId) {

		public UserContract {
			Objects.requireNonNull(customerId, "customerId must not be null");
			Objects.requireNonNull(contractId, "contractId must not be null");
		}

	}

	record FeedLimitation(int remainingFeed, Integer remainingFeedDno) {

	}

	record Measurements(Instant timestamp, int powerOnGrid, Integer powerOffGrid) {

		public Measurements {
			Objects.requireNonNull(timestamp, "timestamp must not be null");
		}

	}

	record FeedLimitationRequest(UserContract contract, FeedLimitation limitation) {

		public FeedLimitationRequest {
			Objects.requireNonNull(contract, "contract must not be null");
			Objects.requireNonNull(limitation, "limitation must not be null");
		}

	}

	/**
	 * limits the feed-in into the grid. This command MUST be valid only for 5
	 * minutes and then the plant MUST return to normal operation (100% feed-in).
	 * 
	 * @param limitationRequest the limitation request
	 * @return a future
	 */
	CompletableFuture<Void> sendFeedLimitation(FeedLimitationRequest limitationRequest);

	/**
	 * Get the status of the feed-in limitation for the given plant.
	 * 
	 * @param contract the user contract
	 * @return a future with the feed limitation
	 */
	CompletableFuture<FeedLimitation> fetchFeedLimitation(UserContract contract);

	/**
	 * Get the current power measurements (feed-in and production) of contract
	 * related plant.
	 *
	 * @param contract the user contract
	 * @return a future with the measurements
	 */
	CompletableFuture<Measurements> fetchMeasurements(UserContract contract);

	/**
	 * Registers a luox contract mapping to the requesting edge.
	 * 
	 * @param request the register luox contract request
	 * @param edgeId  the edge id
	 * @return a future
	 */
	CompletableFuture<Void> registerContract(RegisterLuoxContractRequest request, String edgeId);

}
