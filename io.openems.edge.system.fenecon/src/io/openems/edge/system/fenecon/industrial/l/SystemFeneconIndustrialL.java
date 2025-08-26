package io.openems.edge.system.fenecon.industrial.l;

import static io.openems.common.channel.PersistencePriority.HIGH;

import org.osgi.service.event.EventHandler;

import io.openems.common.channel.AccessMode;
import io.openems.common.channel.Level;
import io.openems.common.channel.Unit;
import io.openems.common.types.OpenemsType;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.common.channel.BooleanReadChannel;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.EnumWriteChannel;
import io.openems.edge.common.channel.IntegerReadChannel;
import io.openems.edge.common.channel.IntegerWriteChannel;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.system.fenecon.industrial.l.envicool.BmsModeControl;
import io.openems.edge.system.fenecon.industrial.l.envicool.RuntimeControlMode;
import io.openems.edge.system.fenecon.industrial.l.statemachine.StateMachine.State;

public interface SystemFeneconIndustrialL extends ModbusComponent, OpenemsComponent, StartStoppable, EventHandler {

	public enum ChannelId implements io.openems.edge.common.channel.ChannelId {
		STATE_MACHINE(Doc.of(State.values()) //
				.text("Current State of State-Machine")), //
		RUN_FAILED(Doc.of(Level.FAULT) //
				.text("Running the Logic failed")), //
		/*
		 * Envicool CoolingUnit.
		 */
		PUMP_RUNNING_STATE(Doc.of(OpenemsType.BOOLEAN) //
				.accessMode(AccessMode.READ_ONLY) //
				.persistencePriority(HIGH)), //
		COMPRESSOR_1_RUNNING_STATE(Doc.of(OpenemsType.BOOLEAN) //
				.accessMode(AccessMode.READ_ONLY) //
				.persistencePriority(HIGH)), //
		COMPRESSOR_2_RUNNING_STATE(Doc.of(OpenemsType.BOOLEAN) //
				.accessMode(AccessMode.READ_ONLY) //
				.persistencePriority(HIGH)), //
		WATER_OUTLET_TEMP(Doc.of(OpenemsType.INTEGER) //
				.accessMode(AccessMode.READ_ONLY) //
				.unit(Unit.DEGREE_CELSIUS)), //
		WATER_INLET_TEMP(Doc.of(OpenemsType.INTEGER) //
				.accessMode(AccessMode.READ_ONLY) //
				.unit(Unit.DEGREE_CELSIUS)), //
		WATER_OUTLET_PRESSURE(Doc.of(OpenemsType.DOUBLE) //
				.accessMode(AccessMode.READ_ONLY) //
				.unit(Unit.MILLIBAR)), //
		WATER_INLET_PRESSURE(Doc.of(OpenemsType.DOUBLE) //
				.accessMode(AccessMode.READ_ONLY) //
				.unit(Unit.MILLIBAR)), //
		HEATER_RUNNING_STATE(Doc.of(OpenemsType.BOOLEAN) //
				.accessMode(AccessMode.READ_ONLY) //
				.persistencePriority(HIGH)), //
		SET_WATER_OUTLET_PRESSURE(Doc.of(OpenemsType.DOUBLE) //
				.accessMode(AccessMode.READ_WRITE) //
				.unit(Unit.MILLIBAR)),
		SET_WATER_INLET_PRESSURE(Doc.of(OpenemsType.DOUBLE) //
				.accessMode(AccessMode.READ_WRITE) //
				.unit(Unit.MILLIBAR)),
		COMPRESSOR_1_SYSTEM_WARNING(Doc.of(Level.WARNING) //
				.accessMode(AccessMode.READ_ONLY)), //
		COMPRESSOR_1_GENERAL_ALARM(Doc.of(Level.WARNING) //
				.accessMode(AccessMode.READ_ONLY)), //
		SYSTEM_WATER_SHORTAGE_ALARM(Doc.of(Level.WARNING) //
				.accessMode(AccessMode.READ_ONLY)), //
		COMPRESSOR_1_CONDENSING_PRESSURE_TOO_HIGH_ALARM(Doc.of(Level.WARNING) //
				.accessMode(AccessMode.READ_ONLY)), //
		COMPRESSOR_2_CONDENSING_PRESSURE_TOO_HIGH_ALARM(Doc.of(Level.WARNING) //
				.accessMode(AccessMode.READ_ONLY)), //
		WATER_OUTLET_PRESSURE_HIGH_ALARM(Doc.of(Level.WARNING) //
				.accessMode(AccessMode.READ_ONLY)), //
		WATER_INLET_PRESSURE_WARNING(Doc.of(Level.WARNING) //
				.accessMode(AccessMode.READ_ONLY)), //
		POWER_FAILURE_WARNING(Doc.of(Level.WARNING) //
				.accessMode(AccessMode.READ_ONLY)), //
		COMPRESSOR_2_SYSTEM_WARNING(Doc.of(Level.WARNING) //
				.accessMode(AccessMode.READ_ONLY)), //
		COMPRESSOR_2_GENERAL_ALARM(Doc.of(Level.WARNING) //
				.accessMode(AccessMode.READ_ONLY)), //
		SET_COOLING_POINT(Doc.of(OpenemsType.INTEGER) //
				.accessMode(AccessMode.READ_WRITE) //
				.unit(Unit.DEGREE_CELSIUS)), //
		SET_MONITOR_SWITCH(Doc.of(OpenemsType.BOOLEAN) //
				.accessMode(AccessMode.READ_WRITE)), //
		SET_PUMP_MANUAL_DEMAND_ENABLE(Doc.of(OpenemsType.BOOLEAN) //
				.accessMode(AccessMode.READ_WRITE)), //
		SET_RUNTIME_CONTROL_MODE(Doc.of(RuntimeControlMode.values()) //
				.accessMode(AccessMode.READ_WRITE)),
		SET_ELECTRIC_HEATING_WORKING(Doc.of(OpenemsType.BOOLEAN) //
				.accessMode(AccessMode.READ_WRITE)), //
		SET_HEATING_POINT(Doc.of(OpenemsType.INTEGER) //
				.accessMode(AccessMode.READ_WRITE) //
				.unit(Unit.DEGREE_CELSIUS)),
		SET_PUMP_ROTATING_SPEED(Doc.of(OpenemsType.INTEGER) //
				.accessMode(AccessMode.READ_WRITE) //
				.unit(Unit.NONE)), //
		SET_BMS_MODE_CONTROL(Doc.of(BmsModeControl.values()) //
				.accessMode(AccessMode.READ_WRITE)), //
		SET_MONITOR_AND_ISSUE_MAX_TEMP(Doc.of(OpenemsType.INTEGER) //
				.accessMode(AccessMode.READ_WRITE) //
				.unit(Unit.DEGREE_CELSIUS)), //
		SET_MONITOR_AND_ISSUE_MIN_TEMP(Doc.of(OpenemsType.INTEGER) //
				.accessMode(AccessMode.READ_WRITE) //
				.unit(Unit.DEGREE_CELSIUS)), //
		EMERGENCY_STOP_STATE(Doc.of(Level.WARNING) //
				.text("Emergency Stop State is active")), //
		SPD_TRIPPED(Doc.of(Level.WARNING) //
				.text("SPD Tripped: Possible SPD damage")), //
		FUSE_TRIPPED(Doc.of(Level.WARNING)//
				.text("Fuse Tripped: At least one 24V fuse is off")), //
		PSU_TRIGGERED(Doc.of(Level.FAULT)//
				.text("PSU Triggered: Power supply unit DC fault")), //
		SMOKE_DETECTION(Doc.of(Level.FAULT)//
				.text("Smoke Detected!")),
		SMOKE_DETECTION_FAILURE(Doc.of(Level.WARNING)//
				.text("Failure in the Smoke detection system!")), //
		BMS_HARD_RESET(Doc.of(OpenemsType.BOOLEAN)), //
		CUMULATED_TIME_PUMP_RUNNING_STATE(Doc.of(OpenemsType.INTEGER) //
				.unit(Unit.CUMULATED_SECONDS) //
				.text("Accumulated runtime of cooling unit with pump active, measured in seconds.") //
				.persistencePriority(HIGH)), //
		CUMULATED_TIME_COMPRESSOR_1_RUNNING_STATE(Doc.of(OpenemsType.INTEGER) //
				.unit(Unit.CUMULATED_SECONDS) //
				.text("Accumulated runtime of cooling unit with compressor 1 active, measured in seconds.") //
				.persistencePriority(HIGH)), //
		CUMULATED_TIME_COMPRESSOR_2_RUNNING_STATE(Doc.of(OpenemsType.INTEGER) //
				.unit(Unit.CUMULATED_SECONDS) //
				.text("Accumulated runtime of cooling unit with compressor 2 active, measured in seconds.") //
				.persistencePriority(HIGH)), //
		CUMULATED_TIME_COMPRESSOR_1_AND_2_RUNNING_STATE(Doc.of(OpenemsType.INTEGER) //
				.unit(Unit.CUMULATED_SECONDS) //
				.text("Accumulated runtime of cooling unit with compressor 1 & 2 active, measured in seconds.") //
				.persistencePriority(HIGH)), //
		CUMULATED_TIME_HEATER_RUNNING_STATE(Doc.of(OpenemsType.INTEGER) //
				.unit(Unit.CUMULATED_SECONDS) //
				.text("Accumulated runtime of cooling unit with heater active, measured in seconds.") //
				.persistencePriority(HIGH)), //
		;

		private final Doc doc;

		private ChannelId(Doc doc) {
			this.doc = doc;
		}

		@Override
		public Doc doc() {
			return this.doc;
		}
	}

	/**
	 * Gets the Channel for {@link ChannelId#STATE_MACHINE}.
	 *
	 * @return the Channel
	 */
	public default Channel<State> getStateMachineChannel() {
		return this.channel(ChannelId.STATE_MACHINE);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#STATE_MACHINE}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setStateMachine(State value) {
		this.getStateMachineChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#RUN_FAILED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getRunFailedChannel() {
		return this.channel(ChannelId.RUN_FAILED);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#RUN_FAILED}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setRunFailed(boolean value) {
		this.getRunFailedChannel().setNextValue(value);
	}

	/**
	 * Gets the target Start/Stop mode from config or StartStop-Channel.
	 *
	 * @return {@link StartStop}
	 */
	public StartStop getStartStopTarget();

	/**
	 * Gets the Channel for {@link ChannelId#WATER_INLET_TEMP}.
	 *
	 * @return the Channel
	 */
	public default IntegerReadChannel getWaterInletTempChannel() {
		return this.channel(ChannelId.WATER_INLET_TEMP);
	}

	/**
	 * Gets the Water Inlet Temp value [Degree-celcius].
	 * 
	 * @return the value of the channel
	 */
	public default Value<Integer> getWaterInletTemp() {
		return this.getWaterInletTempChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#SET_COOLING_POINT}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getSetCoolingPointChannel() {
		return this.channel(ChannelId.SET_COOLING_POINT);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SET_HEATING_POINT}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getSetHeatingPointChannel() {
		return this.channel(ChannelId.SET_HEATING_POINT);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SET_RUNTIME_CONTROL_MODE}.
	 * 
	 * @return the Channel
	 */
	public default EnumWriteChannel getSetRunTimeControlModeChannel() {
		return this.channel(ChannelId.SET_RUNTIME_CONTROL_MODE);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SET_BMS_MODE_CONTROL}.
	 * 
	 * @return the Channel
	 */
	public default EnumWriteChannel getSetBmsModeControlModeChannel() {
		return this.channel(ChannelId.SET_BMS_MODE_CONTROL);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SET_MONITOR_AND_ISSUE_MAX_TEMP}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getSetMonitorAndIssueMaxTempChannel() {
		return this.channel(ChannelId.SET_MONITOR_AND_ISSUE_MAX_TEMP);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SET_MONITOR_AND_ISSUE_MIN_TEMP}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getSetMonitorAndIssueMinTempChannel() {
		return this.channel(ChannelId.SET_MONITOR_AND_ISSUE_MIN_TEMP);
	}

	/**
	 * Gets the Channel for {@link ChannelId#PUMP_RUNNING_STATE}.
	 *
	 * @return the Channel
	 */
	public default BooleanReadChannel getPumpRunningStateChannel() {
		return this.channel(ChannelId.PUMP_RUNNING_STATE);
	}

	/**
	 * Gets the PUMP_RUNNING_STATE, see {@link ChannelId#PUMP_RUNNING_STATE}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getPumpRunningState() {
		return this.getPumpRunningStateChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#HEATER_RUNNING_STATE}.
	 *
	 * @return the Channel
	 */
	public default BooleanReadChannel getHeaterRunningStateChannel() {
		return this.channel(ChannelId.HEATER_RUNNING_STATE);
	}

	/**
	 * Gets the CommandActivateBalancing, see
	 * {@link ChannelId#HEATER_RUNNING_STATE}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getHeaterRunningState() {
		return this.getHeaterRunningStateChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMPRESSOR_1_RUNNING_STATE}.
	 *
	 * @return the Channel
	 */
	public default BooleanReadChannel getCompressor1RunningStateChannel() {
		return this.channel(ChannelId.COMPRESSOR_1_RUNNING_STATE);
	}

	/**
	 * Gets the CommandActivateBalancing, see
	 * {@link ChannelId#COMPRESSOR_1_RUNNING_STATE}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getCompressor1RunningState() {
		return this.getCompressor1RunningStateChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMPRESSOR_2_RUNNING_STATE}.
	 *
	 * @return the Channel
	 */
	public default BooleanReadChannel getCompressor2RunningStateChannel() {
		return this.channel(ChannelId.COMPRESSOR_2_RUNNING_STATE);
	}

	/**
	 * Gets the CommandActivateBalancing, see
	 * {@link ChannelId#COMPRESSOR_2_RUNNING_STATE}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getCompressor2RunningState() {
		return this.getCompressor2RunningStateChannel().value();
	}

}