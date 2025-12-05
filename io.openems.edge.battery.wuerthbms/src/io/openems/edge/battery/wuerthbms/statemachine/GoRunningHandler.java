package io.openems.edge.battery.wuerthbms.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.timedata.Timeout;
import io.openems.edge.battery.wuerthbms.enums.CommandStateRequest;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class GoRunningHandler extends StateHandler<State, Context> {

	private final Timeout timeout = Timeout.of(Context.MAX_ALLOWED_START_TIME);

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

		if (this.timeout.elapsed(context.clock)) {
			battery._setTimeoutStartBattery(true);
			return State.ERROR;
		}
		battery.setCommandStateRequest(CommandStateRequest.CLOSE_CONTACTORS);
		if (context.isStarted()) {
			return State.RUNNING;
		}
		return State.GO_RUNNING;
	}

}