package io.openems.edge.system.fenecon.industrial.m.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.m.statemachine.StateMachine.State;

public class GoRunningHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		final var ess = context.ess;
		if (ess.hasFaults() || system.hasFaults()) {
			return State.ERROR;
		}

		if (system.getStartStopTarget() == StartStop.STOP) {
			return State.GO_STOPPED;
		}

		if (ess instanceof StartStoppable e) {
			e.start();
			if (e.isStarted()) {
				return State.RUNNING;
			}
		}
		return State.GO_RUNNING;
	}

}
