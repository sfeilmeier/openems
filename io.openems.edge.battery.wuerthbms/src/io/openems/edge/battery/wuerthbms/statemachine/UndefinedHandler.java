package io.openems.edge.battery.wuerthbms.statemachine;

import io.openems.edge.battery.wuerthbms.enums.SystemGlobalState;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class UndefinedHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var battery = context.getParent();
		final var systemGlobalState = battery.getSystemGlobalState();
		if (systemGlobalState == SystemGlobalState.UNDEFINED//
				|| systemGlobalState == SystemGlobalState.INITIALIZATION) {
			return State.UNDEFINED;
		}
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