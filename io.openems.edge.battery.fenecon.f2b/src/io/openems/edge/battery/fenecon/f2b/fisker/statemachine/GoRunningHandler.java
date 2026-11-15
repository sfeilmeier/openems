package io.openems.edge.battery.fenecon.f2b.fisker.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.timedata.Timeout;
import io.openems.common.utils.EnumUtils;
import io.openems.edge.battery.fenecon.f2b.fisker.BatteryFeneconF2bFisker;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.ControlRequest;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.GoRunningSubState;
import io.openems.edge.battery.fenecon.f2b.fisker.statemachine.StateMachine.State;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.StateHandler;

public class GoRunningHandler extends StateHandler<State, Context> {

	private static final int TIMEOUT = 300; // [s]
	private final Timeout timeout = Timeout.ofSeconds(TIMEOUT);

	protected static record GoRunningState(GoRunningSubState subState) {
	}

	protected GoRunningState goRunningState;

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		this.timeout.start(context.clock);
		this.goRunningState = new GoRunningState(GoRunningSubState.REQUEST_STANDBY);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();
		if (battery.getStartStopTarget() == StartStop.STOP) {
			return State.GO_STOPPED;
		}

		// Handle the Sub-StateMachine
		var nextSubState = this.getNextSubState(context);
		battery.channel(BatteryFeneconF2bFisker.ChannelId.GO_RUNNING_STATE_MACHINE).setNextValue(nextSubState);

		if (nextSubState != this.goRunningState.subState) {
			// Record State changes
			this.goRunningState = new GoRunningState(nextSubState);
		} else if (this.timeout.elapsed(context.clock)) {
			// Handle GoRunningHandler State-timeout
			battery._setTimeoutStartBattery(true);
			throw new OpenemsException("Timeout [" + TIMEOUT + "s] in GoRunning-" + this.goRunningState.subState);
		}

		if (nextSubState == GoRunningSubState.ERROR) {
			return State.ERROR;
		}

		if (nextSubState == GoRunningSubState.FINISHED) {
			return State.RUNNING;
		}

		return State.GO_RUNNING;
	}

	private GoRunningSubState getNextSubState(Context context) throws OpenemsNamedException {
		final var battery = context.getParent();
		return switch (this.goRunningState.subState) {
		case REQUEST_STANDBY -> {
			battery.setControlRequest(ControlRequest.REQUEST_STANDBY);
			if (context.isStandby() && battery.isHvContactorUnlocked()) {
				yield GoRunningSubState.REQUEST_HV_ON;
			}
			yield GoRunningSubState.REQUEST_STANDBY;
		}
		case REQUEST_HV_ON -> {
			battery.setControlRequest(ControlRequest.REQUEST_HV_ON);
			if (context.isStarted()) {
				yield GoRunningSubState.FINISHED;
			}
			yield GoRunningSubState.REQUEST_HV_ON;
		}
		case FINISHED -> GoRunningSubState.FINISHED;
		case ERROR, UNDEFINED -> GoRunningSubState.ERROR;
		};
	}

	@Override
	protected String debugLog() {
		return State.GO_RUNNING.asCamelCase() + "-" + EnumUtils.nameAsCamelCase(this.goRunningState.subState);
	}

}
