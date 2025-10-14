package io.openems.edge.system.fenecon.industrial.l.statemachine;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.timedata.Timeout;
import io.openems.common.utils.EnumUtils;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.l.statemachine.StateMachine.State;

public class BmsResetHandler extends StateHandler<State, Context> {
	protected ErrorState errorState;
	private final Timeout timeout = Timeout.ofSeconds(15);
	private final Logger log = LoggerFactory.getLogger(BmsResetHandler.class);

	private enum ErrorSubState {
		STOP_SYSTEM, SWITCH_ON, SWITCH_OFF, FINISHED
	}

	protected static record ErrorState(ErrorSubState subState) {
	}

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		this.errorState = new ErrorState(ErrorSubState.STOP_SYSTEM);
	}

	@Override
	public State runAndGetNextState(Context context) {
		// Handle the Sub-StateMachine
		try {
			var nextSubState = this.getNextSubState(context);
			if (nextSubState != this.errorState.subState) {
				// Record State changes
				this.errorState = new ErrorState(nextSubState);
			}
			if (nextSubState == ErrorSubState.FINISHED) {
				return State.GO_STOPPED;
			}
		} catch (Exception e) {
			context.logWarn(this.log, e.getMessage());
			return State.GO_STOPPED;
		}
		return State.BMS_RESET;
	}

	private ErrorSubState getNextSubState(Context context) throws Exception {
		final var system = context.getParent();
		final var ess = context.ess;
		return switch (this.errorState.subState) {
		case STOP_SYSTEM -> {
			if (ess instanceof StartStoppable e) {
				e.stop();
			}
			if (system.getStartedBatteries().isEmpty()) {
				this.timeout.start(context.clock);
				yield ErrorSubState.SWITCH_ON;
			}
			yield ErrorSubState.STOP_SYSTEM;
		}
		case SWITCH_ON -> {
			final var outputChannel = system.getWriteBmsHardResetChannel();
			if (outputChannel == null) {
				throw new OpenemsException("Digital Output Channel not specified!");
			}
			outputChannel.setNextWriteValue(true);
			if (this.timeout.elapsed(context.clock)) {
				yield ErrorSubState.SWITCH_OFF;
			}
			yield ErrorSubState.SWITCH_ON;
		}
		case SWITCH_OFF -> {
			final var outputChannel = system.getWriteBmsHardResetChannel();
			outputChannel.setNextWriteValue(false);
			yield ErrorSubState.FINISHED;
		}
		case FINISHED -> {
			yield ErrorSubState.FINISHED;
		}
		};
	}

	@Override
	protected String debugLog() {
		return State.BMS_RESET.asCamelCase() + "-" + EnumUtils.nameAsCamelCase(this.errorState.subState);
	}
}