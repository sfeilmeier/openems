package io.openems.edge.battery.enfasbms.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.timedata.Timeout;
import io.openems.edge.battery.enfasbms.enums.CommandStateRequest;
import io.openems.edge.battery.enfasbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class GoRunningHandler extends StateHandler<State, Context> {

	private final Timeout timeout = Timeout.ofSeconds(Context.TIMEOUT);

	@Override
	protected void onEntry(Context context) {
		this.timeout.start(context.clock);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();
		if (battery.hasFaults()) {
			return State.ERROR;
		}
		// Is max allowed start time passed ?
		if (this.timeout.elapsed(context.clock)) {
			battery._setTimeoutStartBattery(true);
			return State.ERROR;
		}
		battery.setCommandStateRequest(CommandStateRequest.COMMAND_CLOSE_CONTACTORS);
		if (context.isStarted()) {
			return State.RUNNING;
		}
		return State.GO_RUNNING;
	}

}