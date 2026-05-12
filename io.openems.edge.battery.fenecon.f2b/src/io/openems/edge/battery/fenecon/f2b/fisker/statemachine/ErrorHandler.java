package io.openems.edge.battery.fenecon.f2b.fisker.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.ControlRequest;
import io.openems.edge.battery.fenecon.f2b.fisker.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class ErrorHandler extends StateHandler<State, Context> {

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();
		battery.setControlRequest(ControlRequest.REQUEST_STANDBY);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();

		if (!battery.hasFaults()) {
			return State.GO_STOPPED;
		}

		return State.ERROR;
	}
}
