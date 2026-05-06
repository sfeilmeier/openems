package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.xl.jsonrpc.TestMode.TestAction;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class TestModeIdleHandler extends StateHandler<State, Context> {

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system._setInIdleMode(true);
	}

	@Override
	public State runAndGetNextState(Context context) {
		return context.getTestParams()//
				.map(p -> switch (p.action()) {
				case TestAction.EssTest ess -> State.TEST_MODE_ESS;
				case TestAction.LampTest lamp -> State.TEST_MODE_LAMP;
				case TestAction.ManualBatteryStart batteryStart -> State.MANUAL_BATTERY_START;
				case TestAction.Exit exit -> State.GO_STOPPED;
				}).orElse(State.TEST_MODE_IDLE);
	}

	@Override
	protected void onExit(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system._setInIdleMode(false);
		system._setEssTestFailed(false);
	}
}
