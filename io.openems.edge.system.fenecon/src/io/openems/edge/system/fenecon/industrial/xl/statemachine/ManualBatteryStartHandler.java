package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.utils.EnumUtils;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class ManualBatteryStartHandler extends StateHandler<State, Context> {

	protected static record ManualBatteryStartState(ManualBatterySubState subState) {
	}

	protected ManualBatteryStartState manualBatteryStartState;

	private enum ManualBatterySubState {
		START_ALL_BATTERIES, WAIT_FOR_EXIT
	}

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system._setInManualBatteryStartMode(true);
		this.manualBatteryStartState = new ManualBatteryStartState(ManualBatterySubState.START_ALL_BATTERIES);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		// Handle the Sub-StateMachine
		var nextSubState = this.getNextSubState(context);

		if (nextSubState != this.manualBatteryStartState.subState) {
			// Record State changes
			this.manualBatteryStartState = new ManualBatteryStartState(nextSubState);
		}

		return State.MANUAL_BATTERY_START;
	}

	private ManualBatterySubState getNextSubState(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		final var essCLuster = context.ess;
		final var clusters = system.getBatteryClusters();
		final var startStopableClusters = clusters.stream()//
				.filter(StartStoppable.class::isInstance) //
				.map(StartStoppable.class::cast) //
				.toList();
		return switch (this.manualBatteryStartState.subState) {
		case START_ALL_BATTERIES -> {
			if (startStopableClusters.stream().allMatch(StartStoppable::isStarted)) {
				yield ManualBatterySubState.WAIT_FOR_EXIT;
			}
			if (essCLuster instanceof StartStoppable e) {
				e.setStartStop(StartStop.UNDEFINED);
			}
			for (var c : startStopableClusters) {
				c.start();
			}
			yield ManualBatterySubState.START_ALL_BATTERIES;
		}
		case WAIT_FOR_EXIT -> ManualBatterySubState.WAIT_FOR_EXIT;
		};
	}

	@Override
	protected void onExit(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system.setTestRequestParams(null);
		system._setInManualBatteryStartMode(false);
	}

	@Override
	protected String debugLog() {
		return State.MANUAL_BATTERY_START.asCamelCase() + "-"
				+ EnumUtils.nameAsCamelCase(this.manualBatteryStartState.subState);
	}
}
