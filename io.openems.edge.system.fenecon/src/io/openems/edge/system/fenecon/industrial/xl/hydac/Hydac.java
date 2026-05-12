package io.openems.edge.system.fenecon.industrial.xl.hydac;

import io.openems.common.channel.AccessMode;
import io.openems.common.channel.Level;
import io.openems.common.channel.PersistencePriority;
import io.openems.common.channel.Unit;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.types.OpenemsType;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.common.channel.BooleanWriteChannel;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.IntegerWriteChannel;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.OpenemsComponent;

public interface Hydac extends OpenemsComponent, ModbusComponent {

	public enum ChannelId implements io.openems.edge.common.channel.ChannelId {
		COOLING_CIRCUIT_1_TEMPERATURE(Doc.of(OpenemsType.INTEGER) //
				.unit(Unit.DEZIDEGREE_CELSIUS)//
				.persistencePriority(PersistencePriority.HIGH)), //
		COOLING_CIRCUIT_1_FLOW(Doc.of(OpenemsType.INTEGER) //
				.unit(Unit.MILLILITER_PER_MINUTE)), //
		COOLING_CIRCUIT_1_CONDUCTANCE(Doc.of(OpenemsType.INTEGER) //
				.unit(Unit.MIKROSIEMENS_PER_CENTIMETRE)), //
		COOLING_CIRCUIT_1_TEMPERATURE_AMBIENT(Doc.of(OpenemsType.INTEGER) //
				.unit(Unit.DEZIDEGREE_CELSIUS) //
				.persistencePriority(PersistencePriority.HIGH)), //
		GATEWAY_ERROR(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "gatewayError")), //
		SYSTEM_ERROR(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "systemError")), //
		ALARM_ACTIVE(Doc.of(OpenemsType.BOOLEAN) //
				.translationKey(Hydac.class, "alarmActive")), //
		WARNING_ACTIVE(Doc.of(OpenemsType.BOOLEAN) //
				.translationKey(Hydac.class, "warningActive")), //
		CHILLER_RUNNING(Doc.of(OpenemsType.BOOLEAN) //
				.text("Chiller running")), //
		COOLING_REQUIRED(Doc.of(OpenemsType.BOOLEAN) //
				.text("Cooling required")), //
		CHILLER_READY(Doc.of(OpenemsType.BOOLEAN) //
				.text("Chiller ready")), //
		DI_VALVE(Doc.of(OpenemsType.BOOLEAN) //
				.text("DI Valve")), //
		FAN(Doc.of(OpenemsType.BOOLEAN) //
				.text("Fan")), //
		HGB_VALUE(Doc.of(OpenemsType.BOOLEAN) //
				.text("HGB-Value")), //
		HEATER(Doc.of(OpenemsType.BOOLEAN) //
				.text("Heater")), //
		PUMP(Doc.of(OpenemsType.BOOLEAN) //
				.text("Pump")), //
		COMPRESSOR(Doc.of(OpenemsType.BOOLEAN) //
				.text("Compressor")), //
		OVER_TEMPERATURE_ALARM(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "overTemperatureAlarm")), //
		UNDER_TEMPERATURE_ALARM(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "underTemperatureAlarm")), //
		FLOW_ALARM(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "flowAlarm")), //
		DRY_RUN(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "dryRun")), //
		CONDUCTANCE_WARNING(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "conductanceWarning")), //
		OVER_TEMPERATURE_WARNING(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "overTemperatureWarning")), //
		UNDER_TEMPERATURE_WARNING(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "underTemperatureWarning")), //
		FLOW_WARNING(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "flowWarning")), //
		WATER_LEVEL_WARNING(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "waterLevelWarning")), //
		HOUSING_OPENED(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "housingOpened")), //
		FILTER_SPOILED(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "filterSpoiled")), //
		LOW_PRESSURE_ALARM(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "lowPressureAlarm")), //
		HIGH_PRESSURE_ALARM(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "highPressureAlarm")), //
		PHASE_ERROR(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "phaseError")), //
		FAN_ERROR(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "fanError")), //
		MISCELLANEOUS_WARNING(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "miscellaneousWarning")), //
		MISCELLANEOUS_ALARM(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "miscellaneousAlarm")), //
		MOTOR_PROTECTION_SWITCH_PUMP(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "motorProtectionSwitchPump")), //
		MOTOR_PROTECTION_SWITCH_COMPRESSOR(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "motorProtectionSwitchCompressor")), //
		SENSOR_ERROR(Doc.of(Level.WARNING) //
				.translationKey(Hydac.class, "sensorError")), //
		COOLING_CIRCUIT_1_SET_POINT_MIN(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.DEGREE_CELSIUS) //
				.accessMode(AccessMode.READ_WRITE)), //
		COOLING_CIRCUIT_1_SET_POINT_MAX(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.DEGREE_CELSIUS) //
				.accessMode(AccessMode.READ_WRITE)), //
		COOLING_CIRCUIT_1_SET_POINT(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.DEGREE_CELSIUS) //
				.accessMode(AccessMode.READ_WRITE) //
				.persistencePriority(PersistencePriority.HIGH)), //
		COOLING_CIRCUIT_1_SET_POINT_OFFSET(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.MILLILITER_PER_MINUTE) //
				.accessMode(AccessMode.READ_WRITE)), //
		COOLING_CIRCUIT_1_FLOW_ALARM_SETPOINT(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.MILLILITER_PER_MINUTE) //
				.accessMode(AccessMode.READ_WRITE)), //
		COOLING_CIRCUIT_1_CONDUCTANCE_SETPOINT(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_WRITE)), //
		COOLING_CIRCUIT_1_CONTROL_MODE(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_WRITE)), //
		CHILLER_ON(Doc.of(OpenemsType.BOOLEAN) //
				.accessMode(AccessMode.READ_WRITE)), //
		CHILLER_OFF(Doc.of(OpenemsType.BOOLEAN) //
				.accessMode(AccessMode.READ_WRITE)), //
		CLEAR_ERROR(Doc.of(OpenemsType.BOOLEAN) //
				.accessMode(AccessMode.READ_WRITE)), //
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
	 * Gets the Channel for {@link ChannelId#CHILLER_ON}.
	 *
	 * @return the Channel
	 */
	public default BooleanWriteChannel getChillerOnChannel() {
		return this.channel(ChannelId.CHILLER_ON);
	}

	/**
	 * Sets the ChillerOn, see {@link ChannelId#CHILLER_OFF}.
	 *
	 * @param value the boolean value
	 * @throws OpenemsNamedException on error
	 */
	public default void setChillerOn(boolean value) throws OpenemsNamedException {
		this.getChillerOnChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#CHILLER_OFF}.
	 *
	 * @return the Channel
	 */
	public default BooleanWriteChannel getChillerOffChannel() {
		return this.channel(ChannelId.CHILLER_OFF);
	}

	/**
	 * Sets the ChillerOff, see {@link ChannelId#CHILLER_OFF}.
	 *
	 * @param value the boolean value
	 * @throws OpenemsNamedException on error
	 */
	public default void setChillerOff(boolean value) throws OpenemsNamedException {
		this.getChillerOffChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COOLING_CIRCUIT_1_TEMPERATURE}.
	 *
	 * @return the Channel
	 */
	public default Channel<Integer> getCoolingCircuit1TemperatureChannel() {
		return this.channel(ChannelId.COOLING_CIRCUIT_1_TEMPERATURE);
	}

	/**
	 * Gets the LinkVoltageHighRes, see
	 * {@link ChannelId#COOLING_CIRCUIT_1_TEMPERATURE}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getCoolingCircuit1Temperature() {
		return this.getCoolingCircuit1TemperatureChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#COOLING_CIRCUIT_1_SET_POINT}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getCoolingCircuit1SetPointChannel() {
		return this.channel(ChannelId.COOLING_CIRCUIT_1_SET_POINT);
	}

	/**
	 * Sets the CoolingCircuit1SetPoint, see
	 * {@link ChannelId#COOLING_CIRCUIT_1_SET_POINT}.
	 * 
	 * @param value the int value
	 * @throws OpenemsNamedException on error
	 */
	public default void setCoolingCircuit1SetPoint(int value) throws OpenemsNamedException {
		this.getCoolingCircuit1SetPointChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#FAN}.
	 *
	 * @return the Channel
	 */
	public default Channel<Integer> getFanChannel() {
		return this.channel(ChannelId.FAN);
	}

	/**
	 * Gets the Fan status, see {@link ChannelId#FAN}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getFan() {
		return this.getFanChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#COOLING_REQUIRED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Integer> getCoolingRequiredChannel() {
		return this.channel(ChannelId.COOLING_REQUIRED);
	}

	/**
	 * Gets the CoolingRequired, see {@link ChannelId#COOLING_REQUIRED}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getCoolingRequired() {
		return this.getCoolingRequiredChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#PUMP}.
	 *
	 * @return the Channel
	 */
	public default Channel<Integer> getPumpChannel() {
		return this.channel(ChannelId.PUMP);
	}

	/**
	 * Gets the Pump status, see {@link ChannelId#PUMP}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getPump() {
		return this.getPumpChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMPRESSOR}.
	 *
	 * @return the Channel
	 */
	public default Channel<Integer> getCompressorChannel() {
		return this.channel(ChannelId.COMPRESSOR);
	}

	/**
	 * Gets the Compressor status, see {@link ChannelId#COMPRESSOR}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getCompressor() {
		return this.getCompressorChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#CLEAR_ERROR}.
	 *
	 * @return the Channel
	 */
	default Channel<Boolean> getClearErrorChannel() {
		return this.channel(ChannelId.CLEAR_ERROR);
	}

	/**
	 * Gets the Compressor status, see {@link ChannelId#CLEAR_ERROR}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Boolean> getClearError() {
		return this.getClearErrorChannel().value();
	}

	/**
	 * Clears the errors, see {@link ChannelId#CLEAR_ERROR}.
	 *
	 * @param value true/false
	 */
	default void setClearError(boolean value) {
		this.getClearErrorChannel().setNextValue(value);
	}

}
