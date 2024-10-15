package io.openems.edge.battery.enfasbms.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.battery.enfasbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class ErrorHandler extends StateHandler<State, Context> {

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();
		if (!battery.hasFaults() && context.isStopped()) {
			return State.STOPPED;
		}

		final var isCommunicationError = battery.getStringEventCommunicationError().orElse(false);
		if (isCommunicationError) {
			return State.RESET_BATTERY;
		}
		return State.ERROR;
	}

	@Override
	protected void onExit(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();
		battery._setTimeoutStartBattery(false);
		battery._setTimeoutStopBattery(false);
	}
}