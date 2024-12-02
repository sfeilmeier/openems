package io.openems.edge.system.fenecon.industrial.m.statemachine;

import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.m.statemachine.StateMachine.State;

public class RunningHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var system = context.getParent();
		final var ess = context.ess;

		if (ess.hasFaults()//
				|| system.hasFaults() //
				|| (ess instanceof StartStoppable e && !e.isStarted())//
		) {
			return State.ERROR;
		}

		// If StartStopTarget is Start and Emergency Stop not triggered, start the ESS
		if (system.getStartStopTarget() == StartStop.STOP) {
			return State.GO_STOPPED;
		}

		return State.RUNNING;
	}
}
