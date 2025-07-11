package io.openems.edge.system.fenecon.industrial.l.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.l.statemachine.StateMachine.State;

public class ErrorHandler extends StateHandler<State, Context> {

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system.stop();
	}

	@Override
	public State runAndGetNextState(Context context) {
		final var system = context.getParent();
		if (!system.hasFaults()) {
			return State.GO_STOPPED;
		}
		return State.ERROR;
	}

}
