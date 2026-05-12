package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class GoRunningHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var ess = context.ess;
		final var system = context.getParent();
		system._setAllEssFaultSystemStart(system.areAllEssInFailure());

		if (system.hasFaults()) {
			return State.GO_STOPPED;
		}

		if (ess instanceof StartStoppable e) {
			e.start();
			if (context.isStarted()) {
				return State.RUNNING;
			}
		}

		return State.GO_RUNNING;
	}

}
