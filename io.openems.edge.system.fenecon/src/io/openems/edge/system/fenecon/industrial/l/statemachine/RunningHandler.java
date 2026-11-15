package io.openems.edge.system.fenecon.industrial.l.statemachine;

import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.l.statemachine.StateMachine.State;

public class RunningHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var system = context.getParent();
		final var ess = context.ess;

		if (ess.hasFaults() || system.hasFaults() || system.isInEmergencyStopState()) {
			return State.ERROR;
		}

		// If StartStopTarget is Start and Emergency Stop not triggered, start the ESS
		if (system.getStartStopTarget() == StartStop.STOP) {
			return State.GO_STOPPED;
		}

		return State.RUNNING;
	}

}
