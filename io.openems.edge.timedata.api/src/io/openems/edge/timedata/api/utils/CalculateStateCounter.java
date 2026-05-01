package io.openems.edge.timedata.api.utils;

import io.openems.common.types.ChannelAddress;
import io.openems.common.types.OpenemsType;
import io.openems.edge.common.channel.ChannelId;
import io.openems.edge.common.type.TypeUtils;
import io.openems.edge.timedata.api.TimedataProvider;

public class CalculateStateCounter {

	private static enum State {
		TIMEDATA_QUERY_NOT_STARTED, TIMEDATA_QUERY_IS_RUNNING, CALCULATE_STATE_COLLECTOR;
	}

	/**
	 * Keeps the current State.
	 */
	private State state = State.TIMEDATA_QUERY_NOT_STARTED;

	/**
	 * Keeps the target {@link ChannelId} of the time channel.
	 */
	private final ChannelId channelId;

	private final TimedataProvider timedataProvider;

	/**
	 * Last stored active counter value.
	 */
	private Integer lastStoredCounterValue;

	public CalculateStateCounter(TimedataProvider timedataProvider, ChannelId channelId) {
		this.timedataProvider = timedataProvider;
		this.channelId = channelId;
	}

	/**
	 * Updates the counter channel by incrementing its value if the condition is
	 * met.
	 * 
	 * <p>
	 * This method manages the lifecycle of the counter:
	 * <ul>
	 * 1. Initializing the value from historical Timedata if not already done.
	 * </ul>
	 * <ul>
	 * 2. Incrementing the counter in the {@link State#CALCULATE_STATE_COLLECTOR}
	 * state.
	 * </ul>
	 * </p>
	 *
	 * @param isActive true if the counter should be incremented in this cycle
	 */
	public void update(boolean isActive) {
		switch (this.state) {
		case TIMEDATA_QUERY_NOT_STARTED -> this.initializeCounterFromTimedata();
		case TIMEDATA_QUERY_IS_RUNNING -> {
			// Wait for result
		}
		case CALCULATE_STATE_COLLECTOR -> {
			if (isActive) {
				this.timedataProvider.channel(this.channelId).setNextValue(++this.lastStoredCounterValue);
			}
		}
		}
	}

	private void initializeCounterFromTimedata() {
		var timedata = this.timedataProvider.getTimedata();
		var componentId = this.timedataProvider.id();
		if (timedata == null || componentId == null) {
			// Wait for Timedata service to appear or Component to be activated
			this.state = State.TIMEDATA_QUERY_NOT_STARTED;

		} else {
			// Do not query Timedata twice
			this.state = State.TIMEDATA_QUERY_IS_RUNNING;

			timedata.getLatestValue(new ChannelAddress(this.timedataProvider.id(), this.channelId.id()))
					.thenAccept(activeTimeOpt -> {
						this.state = State.CALCULATE_STATE_COLLECTOR;
						if (activeTimeOpt.isPresent()) {
							try {
								this.lastStoredCounterValue = TypeUtils.getAsType(OpenemsType.INTEGER,
										activeTimeOpt.get());
							} catch (IllegalArgumentException e) {
								this.lastStoredCounterValue = 0;
							}
						} else {
							this.lastStoredCounterValue = 0;
						}
						this.timedataProvider.channel(this.channelId).setNextValue(this.lastStoredCounterValue);
					});
		}
	}

	/**
	 * Resets the counter value to zero.
	 *
	 * <p>
	 * The counter is reset by setting the next value of the associated channel
	 * (identified by {@code channelId}) to 0.
	 */
	public void resetCounter() {
		this.timedataProvider.channel(this.channelId).setNextValue(this.lastStoredCounterValue = 0);
	}

}
