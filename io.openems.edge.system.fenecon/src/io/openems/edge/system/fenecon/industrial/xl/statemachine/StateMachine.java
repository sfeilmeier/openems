package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import io.openems.common.types.OptionsEnum;
import io.openems.edge.common.statemachine.AbstractStateMachine;
import io.openems.edge.common.statemachine.StateHandler;

public class StateMachine extends AbstractStateMachine<StateMachine.State, Context> {

	public enum State implements io.openems.edge.common.statemachine.State<State>, OptionsEnum {
		UNDEFINED(-1), //

		GO_RUNNING(10), //
		RUNNING(11), //

		GO_STOPPED(20), //
		STOPPED(21), //

		WAIT_FOR_PRECONDITIONS(30), //

		TEST_MODE_IDLE(40), //
		TEST_MODE_LAMP(41), //
		TEST_MODE_ESS(42), //
		MANUAL_BATTERY_START(43), //
		;

		private final int value;

		private State(int value) {
			this.value = value;
		}

		@Override
		public int getValue() {
			return this.value;
		}

		@Override
		public String getName() {
			return this.name();
		}

		@Override
		public OptionsEnum getUndefined() {
			return UNDEFINED;
		}

		@Override
		public State[] getStates() {
			return State.values();
		}
	}

	public StateMachine(State initialState) {
		super(initialState);
	}

	@Override
	public StateHandler<State, Context> getStateHandler(State state) {
		return switch (state) {
		case UNDEFINED -> new UndefinedHandler();
		case GO_RUNNING -> new GoRunningHandler();
		case RUNNING -> new RunningHandler();
		case GO_STOPPED -> new GoStoppedHandler();
		case STOPPED -> new StoppedHandler();
		case WAIT_FOR_PRECONDITIONS -> new WaitForPreconditionsHandler();
		case TEST_MODE_IDLE -> new TestModeIdleHandler();
		case TEST_MODE_LAMP -> new TestModeLampHandler();
		case TEST_MODE_ESS -> new TestModeEssHandler();
		case MANUAL_BATTERY_START -> new ManualBatteryStartHandler();
		};
	}

}