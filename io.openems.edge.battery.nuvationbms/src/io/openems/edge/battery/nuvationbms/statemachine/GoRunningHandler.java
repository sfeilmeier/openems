package io.openems.edge.battery.nuvationbms.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.timedata.Timeout;
import io.openems.edge.battery.nuvationbms.NuvationSunSpecModel;
import io.openems.edge.battery.nuvationbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class GoRunningHandler extends StateHandler<State, Context> {

	private final Timeout timeout = Timeout.ofSeconds(Context.TIMEOUT);

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		this.timeout.start(context.clock);
	}

	@Override
	protected State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();
		if (battery.hasFaults()) {
			return State.ERROR;
		}
		if (this.timeout.elapsed(context.clock)) {
			battery._setTimeoutStartBattery(true);
			return State.ERROR;
		}
		// close the contactors
		battery.setBatteryOperation(NuvationSunSpecModel.S802BSetOperation.CONNECT);
		if (context.isStarted()) {
			return State.RUNNING;
		}

		return State.GO_RUNNING;
	}
}
