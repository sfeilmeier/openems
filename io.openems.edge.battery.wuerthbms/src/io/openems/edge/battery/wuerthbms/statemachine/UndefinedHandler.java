package io.openems.edge.battery.wuerthbms.statemachine;

import io.openems.edge.battery.wuerthbms.enums.BmsState;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class UndefinedHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var battery = context.getParent();
		final var systemGlobalState = battery.getBatteryState();
		if (systemGlobalState == BmsState.UNDEFINED//
				|| systemGlobalState == BmsState.INITIALIZATION) {
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