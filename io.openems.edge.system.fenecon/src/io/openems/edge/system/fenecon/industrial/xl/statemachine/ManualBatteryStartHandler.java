package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import java.util.List;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.utils.EnumUtils;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.jsonrpc.TestMode;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class ManualBatteryStartHandler extends StateHandler<State, Context> {

	protected static record ManualBatteryStartState(ManualBatterySubState subState) {
	}

	protected ManualBatteryStartState manualBatteryStartState;

	private enum ManualBatterySubState {
		START_ALL_BATTERIES, //
		WAIT_FOR_EXIT, //
		STOP_ALL_BATTERIES, //
	}

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system._setInManualBatteryStartMode(true);
		this.manualBatteryStartState = new ManualBatteryStartState(ManualBatterySubState.START_ALL_BATTERIES);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var clusters = context.getParent().getBatteryClusters();
		final var startStoppableClusters = clusters.stream()//
				.filter(StartStoppable.class::isInstance) //
				.map(StartStoppable.class::cast) //
				.toList();

		// Handle the Sub-StateMachine
		var nextSubState = this.getNextSubState(context, startStoppableClusters);

		if (nextSubState != this.manualBatteryStartState.subState) {
			this.manualBatteryStartState = new ManualBatteryStartState(nextSubState);
		}

		if (nextSubState == ManualBatterySubState.STOP_ALL_BATTERIES
				&& startStoppableClusters.stream().allMatch(StartStoppable::isStopped)) {
			return State.STOPPED;
		}

		return State.MANUAL_BATTERY_START;
	}

	private ManualBatterySubState getNextSubState(Context context, List<StartStoppable> startStoppableClusters)
			throws OpenemsNamedException {
		return switch (this.manualBatteryStartState.subState) {
		case START_ALL_BATTERIES -> {
			if (startStoppableClusters.stream().allMatch(StartStoppable::isStarted)) {
				yield ManualBatterySubState.WAIT_FOR_EXIT;
			}
			if (context.ess instanceof StartStoppable e) {
				e.setStartStop(StartStop.UNDEFINED);
			}
			for (var c : startStoppableClusters) {
				c.start();
			}
			yield ManualBatterySubState.START_ALL_BATTERIES;
		}
		case WAIT_FOR_EXIT -> {
			var request = context.getTestParams();
			yield request //
					.filter(r -> r.action() instanceof TestMode.TestAction.Exit) //
					.map(r -> ManualBatterySubState.STOP_ALL_BATTERIES) //
					.orElse(ManualBatterySubState.WAIT_FOR_EXIT);
		}
		case STOP_ALL_BATTERIES -> {
			for (var c : startStoppableClusters) {
				c.stop();
			}
			yield ManualBatterySubState.STOP_ALL_BATTERIES;
		}
		};
	}

	@Override
	protected void onExit(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system.setTestRequest(null);
		system._setInManualBatteryStartMode(false);
	}

	@Override
	protected String debugLog() {
		return State.MANUAL_BATTERY_START.asCamelCase() + "-"
				+ EnumUtils.nameAsCamelCase(this.manualBatteryStartState.subState);
	}

}
