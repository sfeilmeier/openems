package io.openems.edge.battery.enfasbms.statemachine;

import io.openems.edge.battery.enfasbms.enums.GlobalState;
import io.openems.edge.battery.enfasbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class UndefinedHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var battery = context.getParent();
		final var systemGlobalState = battery.getBatteryState();
		if (systemGlobalState == GlobalState.UNDEFINED//
				|| systemGlobalState == GlobalState.BMS_INITIALIZATION) {
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