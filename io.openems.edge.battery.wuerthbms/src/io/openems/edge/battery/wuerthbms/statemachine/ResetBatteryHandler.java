package io.openems.edge.battery.wuerthbms.statemachine;

import java.time.Duration;
import java.time.Instant;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.timedata.Timeout;
import io.openems.common.utils.EnumUtils;
import io.openems.edge.battery.wuerthbms.WuerthBms;
import io.openems.edge.battery.wuerthbms.enums.CommandStateRequest;
import io.openems.edge.battery.wuerthbms.enums.BmsState;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class ResetBatteryHandler extends StateHandler<State, Context> {

	private static final int WAITING_AFTER_FIRST_OPERATION = 2500; // [ms], Waiting between operations ms
	private static final int WAITING_AFTER_SECOND_OPERATION = 5000; // [ms], Waiting between operations ms

	private final Timeout waitAfterFirstOperation = Timeout.of(Duration.ofMillis(WAITING_AFTER_FIRST_OPERATION));
	private final Timeout waitAfterSecondOperation = Timeout.of(Duration.ofMillis(WAITING_AFTER_SECOND_OPERATION));

	protected enum SubState {
		FIRST_OPERATION, //
		WAIT_1, //
		SECOND_OPERATION, //
		WAIT_2, //
		FINISHED
	}

	protected record ResetBatteryState(SubState subState, Instant lastChange) {
	}

	protected ResetBatteryState resetBatteryState;

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		this.resetBatteryState = new ResetBatteryState(SubState.FIRST_OPERATION, Instant.now(context.clock));
	}

	@Override
	protected State runAndGetNextState(Context context) throws OpenemsNamedException {

		var nextSubState = this.getNextSubState(context);

		var now = Instant.now(context.clock);

		if (nextSubState != this.resetBatteryState.subState) {
			// Record State changes
			this.resetBatteryState = new ResetBatteryState(nextSubState, now);
		}

		if (nextSubState == SubState.FINISHED) {
			// Sub-StateMachine finished
			return State.STOPPED;
		}

		return State.RESET_BATTERY;
	}

	private SubState getNextSubState(Context context) throws OpenemsNamedException {
		var battery = context.getParent();
		return switch (this.resetBatteryState.subState) {
		case FIRST_OPERATION -> {
			this.waitAfterFirstOperation.start(context.clock);
			yield this.handleFirstOperation(context);
		}
		case WAIT_1 -> {
			if (this.waitAfterFirstOperation.elapsed(context.clock)) {
				yield SubState.SECOND_OPERATION;
			}
			// Keep waiting
			yield SubState.WAIT_1;
		}
		case SECOND_OPERATION -> {
			this.waitAfterSecondOperation.start(context.clock);
			yield this.handleSecondOperation(context);
		}
		case WAIT_2 -> {
			if (this.waitAfterSecondOperation.elapsed(context.clock) //
					|| battery.getBatteryState() != BmsState.SAFE_STATE) {
				yield SubState.FINISHED;
			}
			// Keep waiting
			yield SubState.WAIT_2;
		}
		case FINISHED -> SubState.FINISHED;
		};
	}

	private SubState handleFirstOperation(Context context) throws OpenemsNamedException {
		var battery = context.getParent();
		this.callCommonSetMethods(battery);
		battery.setCommandReset1(43690);
		battery.setCommandReset2(21845);
		battery.setCommandAliveCounter(1);
		return SubState.WAIT_1;
	}

	private SubState handleSecondOperation(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();
		this.callCommonSetMethods(battery);
		battery.setCommandReset1(4906);
		battery.setCommandReset2(60629);
		battery.setCommandAliveCounter(2);
		return SubState.WAIT_2;
	}

	private void callCommonSetMethods(WuerthBms battery) throws OpenemsNamedException {
		battery.setCommandStateRequest(CommandStateRequest.COMMAND_DO_NOTHING);
		battery.setCommandActivateBalancing(0);
		battery.setCommandBalancingThreshold(0);
		battery.setCommandCustomCurrentChargeLimit(0);
		battery.setCommandCustomCurrentDischargeLimit(0);
	}

	@Override
	protected String debugLog() {
		return State.RESET_BATTERY.asCamelCase() + "-" + EnumUtils.nameAsCamelCase(this.resetBatteryState.subState);
	}
}
