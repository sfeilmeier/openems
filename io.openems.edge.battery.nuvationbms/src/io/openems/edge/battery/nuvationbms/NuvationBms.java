package io.openems.edge.battery.nuvationbms;

import io.openems.common.channel.Level;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.nuvationbms.statemachine.StateMachine.State;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.StateChannel;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.startstop.StartStoppable;

public interface NuvationBms extends Battery, ModbusComponent, OpenemsComponent, StartStoppable {

	enum ChannelId implements io.openems.edge.common.channel.ChannelId {
		STATE_MACHINE(Doc.of(State.values()) //
				.text("Current State of State-Machine")), //
		RUN_FAILED(Doc.of(Level.WARNING) //
				.text("Running the Logic failed")),
		SOC_CALIBRATION_ACTIVE(Doc.of(Level.WARNING) //
				.text("Soc calibration happening or Soc Jump happened")),

		/**
		 * Stop battery timeout passed.
		 * 
		 * <p>
		 * This fault forces the EssGeneric into the GO_STOPPED state.
		 * </p>
		 */
		TIMEOUT_STOP_BATTERY(Doc.of(Level.FAULT) //
				.text("Stop battery timeout passed!")), //
		/**
		 * Start battery timeout passed.
		 * 
		 * <p>
		 * This fault forces the EssGeneric into the GO_STOPPED state.
		 * </p>
		 */
		TIMEOUT_START_BATTERY(Doc.of(Level.FAULT) //
				.text("Start battery timeout passed!")), //
		;

		private final Doc doc;

		ChannelId(Doc doc) {
			this.doc = doc;
		}

		@Override
		public Doc doc() {
			return this.doc;
		}
	}

	/**
	 * Gets the Channel for {@link ChannelId#TIMEOUT_START_BATTERY}.
	 * 
	 * @return the Channel
	 */
	default StateChannel getTimeoutStartBatteryChannel() {
		return this.channel(ChannelId.TIMEOUT_START_BATTERY);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#TIMEOUT_START_BATTERY}.
	 * 
	 * @return the Channel {@link Value}
	 */
	default Value<Boolean> getTimeoutStartBattery() {
		return this.getTimeoutStartBatteryChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#TIMEOUT_START_BATTERY} Channel.
	 * 
	 * @param value the next value
	 */
	default void _setTimeoutStartBattery(Boolean value) {
		this.getTimeoutStartBatteryChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#TIMEOUT_STOP_BATTERY}.
	 * 
	 * @return the Channel
	 */
	default StateChannel getTimeoutStopBatteryChannel() {
		return this.channel(ChannelId.TIMEOUT_STOP_BATTERY);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#TIMEOUT_STOP_BATTERY}.
	 * 
	 * @return the Channel {@link Value}
	 */
	default Value<Boolean> getTimeoutStopBattery() {
		return this.getTimeoutStopBatteryChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#TIMEOUT_STOP_BATTERY} Channel.
	 * 
	 * @param value the next value
	 */
	default void _setTimeoutStopBattery(Boolean value) {
		this.getTimeoutStopBatteryChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SOC_CALIBRATION_ACTIVE}.
	 *
	 * @return the Channel
	 */
	default StateChannel getSocCalibrationActiveChannel() {
		return this.channel(ChannelId.SOC_CALIBRATION_ACTIVE);
	}

	/**
	 * Gets the Soc Calibration Active value, see
	 * {@link ChannelId#SOC_CALIBRATION_ACTIVE}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Boolean> getSocCalibrationActive() {
		return this.getSocCalibrationActiveChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#SOC_CALIBRATION_ACTIVE} Channel.
	 *
	 * @param value the next value
	 */
	default void _setSocCalibrationActive(boolean value) {
		this.getSocCalibrationActiveChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#RUN_FAILED}.
	 *
	 * @return the Channel
	 */
	default Channel<Boolean> getRunFailedChannel() {
		return this.channel(ChannelId.RUN_FAILED);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#RUN_FAILED}
	 * Channel.
	 *
	 * @param value the next value
	 */
	default void _setRunFailed(boolean value) {
		this.getRunFailedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#STATE_MACHINE}.
	 *
	 * @return the Channel
	 */
	default Channel<State> getStateMachineChannel() {
		return this.channel(ChannelId.STATE_MACHINE);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#STATE_MACHINE}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<State> getStateMachine() {
		return this.getStateMachineChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#STATE_MACHINE}
	 * Channel.
	 *
	 * @param value the next value
	 */
	default void _setStateMachine(State value) {
		this.getStateMachineChannel().setNextValue(value);
	}
}
