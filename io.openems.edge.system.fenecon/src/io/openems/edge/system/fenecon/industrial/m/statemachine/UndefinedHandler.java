package io.openems.edge.system.fenecon.industrial.m.statemachine;

import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.m.statemachine.StateMachine.State;

public class UndefinedHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var system = context.getParent();
		final var ess = context.ess;

		if (ess.hasFaults() || system.hasFaults()) {
			return State.ERROR;
		}

		if (ess instanceof StartStoppable e && e.isStarted()) {
			return State.RUNNING;
		}

		if (ess instanceof StartStoppable e && e.isStopped()) {
			return State.STOPPED;
		}

		return State.GO_STOPPED;
	}
}
