package io.openems.edge.battery.fenecon.f2b.fisker.statemachine;

import io.openems.edge.battery.fenecon.f2b.fisker.statemachine.StateMachine.State;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.StateHandler;

public class RunningHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var battery = context.getParent();
		if (context.hasFaults()) {
			return State.ERROR;
		}

		if (battery.getStartStopTarget() == StartStop.STOP) {
			return State.GO_STOPPED;
		}
		// Mark as started
		battery._setStartStop(StartStop.START);
		return State.RUNNING;
	}

}
