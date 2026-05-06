package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.timedata.Timeout;
import io.openems.common.utils.EnumUtils;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class TestModeLampHandler extends StateHandler<State, Context> {

	protected static record TestModeLampState(TestModeLampSubState subState) {
	}

	protected TestModeLampState testModeLampState;

	private Timeout timeout = Timeout.ofSeconds(5);

	private enum TestModeLampSubState {
		ALL_ON, FLASHING, ALL_OFF, FINISHED
	}

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system._setInLampTestMode(true);
		this.testModeLampState = new TestModeLampState(TestModeLampSubState.ALL_ON);
		this.timeout.start(context.clock);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		// Handle the Sub-StateMachine
		var nextSubState = this.getNextSubState(context);

		if (nextSubState != this.testModeLampState.subState) {
			// Record State changes
			this.testModeLampState = new TestModeLampState(nextSubState);
		}

		if (nextSubState == TestModeLampSubState.FINISHED) {
			return State.TEST_MODE_IDLE;
		}

		return State.TEST_MODE_LAMP;
	}

	private TestModeLampSubState getNextSubState(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		return switch (this.testModeLampState.subState) {
		case ALL_ON -> {
			system.setOutput(context.outputSsiRunning, true);
			system.setOutput(context.outputSsiWarning, true);
			system.setOutput(context.outputSsiError, true);
			system.setOutput(context.outputSsiRunningFlashing, false);
			if (this.timeout.elapsed(context.clock)) {
				this.timeout.start(context.clock);
				yield TestModeLampSubState.FLASHING;
			}
			yield TestModeLampSubState.ALL_ON;
		}
		case FLASHING -> {
			system.setOutput(context.outputSsiRunning, true);
			system.setOutput(context.outputSsiWarning, true);
			system.setOutput(context.outputSsiError, true);
			system.setOutput(context.outputSsiRunningFlashing, true);
			if (this.timeout.elapsed(context.clock)) {
				this.timeout.start(context.clock);
				yield TestModeLampSubState.ALL_OFF;
			}
			yield TestModeLampSubState.FLASHING;
		}
		case ALL_OFF -> {
			system.setOutput(context.outputSsiRunning, false);
			system.setOutput(context.outputSsiWarning, false);
			system.setOutput(context.outputSsiError, false);
			system.setOutput(context.outputSsiRunningFlashing, false);
			if (this.timeout.elapsed(context.clock)) {
				yield TestModeLampSubState.FINISHED;
			}
			yield TestModeLampSubState.ALL_OFF;
		}
		case FINISHED -> TestModeLampSubState.FINISHED;
		};
	}

	@Override
	protected void onExit(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system.setTestRequestParams(null);
		system._setInLampTestMode(false);
	}

	@Override
	protected String debugLog() {
		return State.TEST_MODE_LAMP.asCamelCase() + "-" + EnumUtils.nameAsCamelCase(this.testModeLampState.subState);
	}
}
