package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class UndefinedHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var system = context.getParent();
		if (!system.isCouplingSwitchOffDefined()//
				|| !system.isStatusSysOffDefined()//
				|| !system.isSysServiceSwitchOnDefined()) {
			return State.UNDEFINED;
		}

		return switch (system.getStartStopTarget()) {
		// TODO All reference defined
		case UNDEFINED -> State.UNDEFINED;
		case START -> State.WAIT_FOR_PRECONDITIONS;
		case STOP -> State.GO_STOPPED;
		};
	}

}
