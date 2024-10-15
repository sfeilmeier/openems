package io.openems.edge.battery.enfasbms.statemachine;

import java.time.Duration;
import java.time.Instant;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.battery.enfasbms.enums.CommandStateRequest;
import io.openems.edge.battery.enfasbms.statemachine.StateMachine.State;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.StateHandler;

public class GoRunningHandler extends StateHandler<State, Context> {

	private Instant timeAtEntry = Instant.MIN;

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		this.timeAtEntry = Instant.now(context.clock);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();
		if (battery.hasFaults()) {
			return State.ERROR;
		}
		var isTimeout = Duration.between(this.timeAtEntry, Instant.now(context.clock)).getSeconds() > Context.TIMEOUT;
		if (isTimeout) {
			battery._setTimeoutStartBattery(true);
			return State.ERROR;
		}
		if (battery.getStartStopTarget() == StartStop.STOP) {
			return State.GO_STOPPED;
		}
		battery.setCommandStateRequest(CommandStateRequest.COMMAND_CLOSE_CONTACTORS);
		if (context.isStarted()) {
			return State.RUNNING;
		}
		return State.GO_RUNNING;
	}
}