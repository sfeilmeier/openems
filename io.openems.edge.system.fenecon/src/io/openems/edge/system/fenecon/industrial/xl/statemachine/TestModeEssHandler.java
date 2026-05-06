package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import java.util.LinkedList;
import java.util.Queue;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.timedata.Timeout;
import io.openems.common.utils.EnumUtils;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class TestModeEssHandler extends StateHandler<State, Context> {

	protected static record TestModeEssState(TestModeEssSubState subState) {
	}

	protected TestModeEssState testModeEssState;

	private Timeout timeout = Timeout.ofSeconds(5);
	private Timeout timeoutSubstate = Timeout.ofSeconds(300);

	private Queue<StartStoppable> essQueue = new LinkedList<>();

	private enum TestModeEssSubState {
		ESS_START, ESS_STOP, WAIT_5_SECOND, FINISHED
	}

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system._setInEssTestMode(true);
		this.testModeEssState = new TestModeEssState(TestModeEssSubState.ESS_START);
		final var startStoppableEss = system.getEsssList().stream() //
				.filter(StartStoppable.class::isInstance) //
				.map(StartStoppable.class::cast) //
				.toList();
		this.essQueue.addAll(startStoppableEss);
		this.timeoutSubstate.start(context.clock);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		// Handle the Sub-StateMachine
		var nextSubState = this.getNextSubState(context);

		if (nextSubState != this.testModeEssState.subState) {
			this.timeoutSubstate.start(context.clock);
			// Record State changes
			this.testModeEssState = new TestModeEssState(nextSubState);
		} else if (this.timeoutSubstate.elapsed(context.clock)) {
			var system = context.getParent();
			var ess = this.essQueue.peek();
			if (ess != null) {
				var essTestFailed = system.getEssTestFailedChannel();
				essTestFailed.channelDoc().text("ESS test Failed! " + ess.id());
			}
			return State.TEST_MODE_IDLE;
		}

		if (nextSubState == TestModeEssSubState.FINISHED) {
			return State.TEST_MODE_IDLE;
		}

		return State.TEST_MODE_ESS;
	}

	private TestModeEssSubState getNextSubState(Context context) throws OpenemsNamedException {
		if (this.essQueue.isEmpty()) {
			return TestModeEssSubState.FINISHED;
		}

		var ess = this.essQueue.peek();
		var essCLuster = context.ess;
		return switch (this.testModeEssState.subState) {
		case ESS_START -> {
			if (ess.isStarted()) {
				this.timeout.start(context.clock);
				yield TestModeEssSubState.WAIT_5_SECOND;
			}
			if (essCLuster instanceof StartStoppable e) {
				e.setStartStop(StartStop.UNDEFINED);
			}
			ess.start();
			yield TestModeEssSubState.ESS_START;
		}
		case WAIT_5_SECOND -> {
			if (this.timeout.elapsed(context.clock)) {
				yield TestModeEssSubState.ESS_STOP;
			}
			yield TestModeEssSubState.WAIT_5_SECOND;
		}
		case ESS_STOP -> {
			if (ess.isStopped()) {
				ess = this.essQueue.poll();
				yield TestModeEssSubState.ESS_START;
			}
			ess.stop();
			yield TestModeEssSubState.ESS_STOP;
		}
		case FINISHED -> TestModeEssSubState.FINISHED;
		};
	}

	@Override
	protected void onExit(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system._setInEssTestMode(false);
		system.setTestRequestParams(null);
	}

	@Override
	protected String debugLog() {
		return State.TEST_MODE_ESS.asCamelCase() + "-" + EnumUtils.nameAsCamelCase(this.testModeEssState.subState);
	}
}
