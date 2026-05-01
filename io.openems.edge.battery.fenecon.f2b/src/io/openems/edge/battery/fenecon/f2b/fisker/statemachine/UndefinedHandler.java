package io.openems.edge.battery.fenecon.f2b.fisker.statemachine;

import io.openems.edge.battery.fenecon.f2b.fisker.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class UndefinedHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		if (context.hasFaults()) {
			return State.ERROR;
		}

		if (context.isStarted()) {
			return State.RUNNING;
		}

		if (context.isStopped()) {
			return State.STOPPED;
		}

		return State.GO_STOPPED;
	}

}
