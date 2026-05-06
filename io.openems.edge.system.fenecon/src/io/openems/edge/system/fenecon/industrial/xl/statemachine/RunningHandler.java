package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class RunningHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) {
		final var system = context.getParent();
		system._setAllEssFaultInOperation(system.areAllEssInFailure());
		system._setAtLeastOneEssInfo(system.isAtLeastOneEssInWarning());
		system._setAtLeastOneEssWarning(system.isAtLeastOneEssInFault() || system.isAtLeastOneEssNotStarted());

		if (system.getStartStopTarget() == StartStop.STOP || system.hasFaults()) {
			return State.GO_STOPPED;
		}

		system._setStartStop(StartStop.START);
		return State.RUNNING;
	}

	@Override
	protected void onExit(Context context) {
		final var system = context.getParent();
		system._setAtLeastOneEssInfo(false);
		system._setAtLeastOneEssWarning(false);
	}
}
