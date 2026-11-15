package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class StoppedHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var system = context.getParent();
		system._setServiceSwitchPressedOnStopped(system.isSysServiceSwitchOn());
		system._setShutdownActiveOnStopped(system.isStatusSysOff());
		system._setCouplingSwitchPressedOnStopped(system.isCouplingSwitchOff());

		if (!system.hasFaults() && system.getStartStopTarget() == StartStop.START) {
			return State.WAIT_FOR_PRECONDITIONS;
		}

		system._setStartStop(StartStop.STOP);
		return State.STOPPED;
	}

}
