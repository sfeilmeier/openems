package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class WaitForPreconditionsHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system._setStartBlockedByServiceSwitch(system.isSysServiceSwitchOn());
		system._setStartBlockedByFireAlarm(!system.isSysServiceSwitchOn() && system.isStatusSysOff());
		system._setStartBlockedByCouplingSwitch(system.isCouplingSwitchOff());
		system._setStartBlockedByEssFault(system.areAllEssInFailure());

		if (system.hasFaults() || system.getStartStopTarget() == StartStop.STOP) {
			return State.GO_STOPPED;
		}

		if (!system.arePreconditionsFulfilled()) {
			return State.WAIT_FOR_PRECONDITIONS;
		}

		return State.GO_RUNNING;
	}

}
