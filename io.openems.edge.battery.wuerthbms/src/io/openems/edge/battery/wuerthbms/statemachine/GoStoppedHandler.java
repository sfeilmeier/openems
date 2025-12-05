package io.openems.edge.battery.wuerthbms.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.timedata.Timeout;
import io.openems.edge.battery.wuerthbms.enums.CommandStateRequest;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class GoStoppedHandler extends StateHandler<State, Context> {

	private final Timeout timeout = Timeout.of(Context.MAX_ALLOWED_STOP_TIME);

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		this.timeout.start(context.clock);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();

		if (battery.hasFaults()) {
			return State.ERROR;
		}
		if (this.timeout.elapsed(context.clock)) {
			battery._setTimeoutStopBattery(true);
			return State.ERROR;
		}

		if (context.checkCurrent()) {
			battery.setCommandStateRequest(CommandStateRequest.OPEN_CONTACTORS);
		}

		if (context.isStopped()) {
			return State.STOPPED;
		}
		return State.GO_STOPPED;
	}

}