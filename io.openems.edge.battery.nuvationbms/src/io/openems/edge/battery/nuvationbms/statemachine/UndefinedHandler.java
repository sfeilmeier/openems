package io.openems.edge.battery.nuvationbms.statemachine;

import io.openems.edge.battery.nuvationbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class UndefinedHandler extends StateHandler<State, Context> {

	@Override
	protected State runAndGetNextState(Context context) {
		final var battery = context.getParent();
		return switch (battery.getStartStopTarget()) {
		case UNDEFINED -> State.UNDEFINED;
		case START -> {
			if (battery.hasFaults()) {
				yield State.ERROR;
			}
			yield State.GO_RUNNING;
		}
		case STOP -> State.GO_STOPPED;
		};
	}

}
