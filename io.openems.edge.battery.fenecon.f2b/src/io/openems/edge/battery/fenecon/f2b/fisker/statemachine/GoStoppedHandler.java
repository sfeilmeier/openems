package io.openems.edge.battery.fenecon.f2b.fisker.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.ControlRequest;
import io.openems.edge.battery.fenecon.f2b.fisker.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class GoStoppedHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();
		if (context.hasFaults()) {
			return State.ERROR;
		}

		battery.setControlRequest(ControlRequest.REQUEST_OFF);
		if (context.isStopped()) {
			return State.STOPPED;
		}

		return State.GO_STOPPED;
	}

}
