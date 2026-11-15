package io.openems.edge.battery.enfasbms.statemachine;

import java.time.Instant;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.utils.EnumUtils;
import io.openems.edge.battery.enfasbms.EnfasBms;
import io.openems.edge.battery.enfasbms.enums.CommandStateRequest;
import io.openems.edge.battery.enfasbms.enums.GlobalState;
import io.openems.edge.battery.enfasbms.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class ResetBatteryHandler extends StateHandler<State, Context> {

	private static final int WAITING_AFTER_FIRST_OPERATION = 2500; // [ms], Waiting between operations ms
	private static final int WAITING_AFTER_SECOND_OPERATION = 5000; // [ms], Waiting between operations ms

	protected static enum SubState {
		FIRST_OPERATION, //
		WAIT_1, //
		SECOND_OPERATION, //
		WAIT_2, //
		FINISHED
	}

	protected static record ResetBatteryState(SubState subState, Instant lastChange) {
	}

	protected ResetBatteryState rBs;

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		this.rBs = new ResetBatteryState(SubState.FIRST_OPERATION, Instant.now(context.clock));
	}

	@Override
	protected State runAndGetNextState(Context context) throws OpenemsNamedException {

		var nextSubState = this.getNextSubState(context);

		var now = Instant.now(context.clock);

		if (nextSubState != this.rBs.subState) {
			// Record State changes
			this.rBs = new ResetBatteryState(nextSubState, now);
		}

		if (nextSubState == SubState.FINISHED) {
			// Sub-StateMachine finished
			return State.STOPPED;
		}

		return State.RESET_BATTERY;
	}

	private SubState getNextSubState(Context context) throws OpenemsNamedException {
		var battery = context.getParent();
		return switch (this.rBs.subState) {
		case FIRST_OPERATION -> this.handleFirstOperation(context);
		case WAIT_1 -> {
			var now = Instant.now(context.clock);
			if (this.rBs.lastChange.isBefore(now.minusMillis(WAITING_AFTER_FIRST_OPERATION))) {
				yield SubState.SECOND_OPERATION;
			}
			// Keep waiting
			yield SubState.WAIT_1;
		}
		case SECOND_OPERATION -> this.handleSecondOperation(context);
		case WAIT_2 -> {
			var now = Instant.now(context.clock);
			if (this.rBs.lastChange.isBefore(now.minusMillis(WAITING_AFTER_SECOND_OPERATION)) //
					|| (battery.getBatteryState() != GlobalState.BMS_SAFE_STATE)) {
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

	private void callCommonSetMethods(EnfasBms battery) throws OpenemsNamedException {
		battery.setCommandStateRequest(CommandStateRequest.COMMAND_DO_NOTHING);
		battery.setCommandActivateBalancing(0);
		battery.setCommandBalancingThreshold(0);
		battery.setCommandCustomCurrentChargeLimit(0);
		battery.setCommandCustomCurrentDischargeLimit(0);
	}

	@Override
	protected String debugLog() {
		return State.RESET_BATTERY.asCamelCase() + "-" + EnumUtils.nameAsCamelCase(this.rBs.subState);
	}

}
