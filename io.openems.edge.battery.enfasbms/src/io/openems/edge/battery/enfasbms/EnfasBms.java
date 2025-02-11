package io.openems.edge.battery.enfasbms;

import static io.openems.common.channel.AccessMode.READ_ONLY;
import static io.openems.common.channel.AccessMode.WRITE_ONLY;
import static io.openems.common.channel.Unit.AMPERE;
import static io.openems.common.channel.Unit.DEGREE_CELSIUS;
import static io.openems.common.channel.Unit.KILOWATT;
import static io.openems.common.channel.Unit.KILOWATT_HOURS;
import static io.openems.common.channel.Unit.MILLIAMPERE;
import static io.openems.common.channel.Unit.MILLIVOLT;
import static io.openems.common.channel.Unit.NONE;
import static io.openems.common.channel.Unit.PERCENT;
import static io.openems.common.channel.Unit.VOLT;
import static io.openems.common.types.OpenemsType.BOOLEAN;
import static io.openems.common.types.OpenemsType.DOUBLE;
import static io.openems.common.types.OpenemsType.INTEGER;

import io.openems.common.channel.Level;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.enfasbms.enums.BalancingState;
import io.openems.edge.battery.enfasbms.enums.CommandStateRequest;
import io.openems.edge.battery.enfasbms.enums.ContactorState;
import io.openems.edge.battery.enfasbms.enums.GlobalState;
import io.openems.edge.battery.enfasbms.statemachine.StateMachine.State;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.DoubleReadChannel;
import io.openems.edge.common.channel.EnumReadChannel;
import io.openems.edge.common.channel.IntegerDoc;
import io.openems.edge.common.channel.IntegerReadChannel;
import io.openems.edge.common.channel.IntegerWriteChannel;
import io.openems.edge.common.channel.StateChannel;
import io.openems.edge.common.channel.WriteChannel;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;

public interface EnfasBms extends Battery, OpenemsComponent, StartStoppable {

	/**
	 * Gets the target Start/Stop mode from config or StartStop-Channel.
	 *
	 * @return {@link StartStop}
	 */
	public StartStop getStartStopTarget();

	public enum ChannelId implements io.openems.edge.common.channel.ChannelId {
		/**
		 * Stop battery timeout passed.
		 * 
		 * <p>
		 * This fault forces the EssGeneric into the GO_STOPPED state.
		 */
		TIMEOUT_STOP_BATTERY(Doc.of(Level.FAULT) //
				.text("Stop battery timeout passed!")), //
		/**
		 * Start battery timeout passed.
		 * 
		 * <p>
		 * This fault forces the EssGeneric into the GO_STOPPED state.
		 */
		TIMEOUT_START_BATTERY(Doc.of(Level.FAULT) //
				.text("Start battery timeout passed!")), //

		MODULE_0_AVG_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Average Temperature on Module 0")),
		MODULE_1_AVG_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Average Temperature on Module 1")),
		MODULE_2_AVG_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Average Temperature on Module 2")),
		MODULE_3_AVG_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Average Temperature on Module 3")),
		MODULE_4_AVG_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Average Temperature on Module 4")),
		MODULE_5_AVG_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Average Temperature on Module 5")),
		MODULE_6_AVG_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Average Temperature on Module 6")),
		MODULE_7_AVG_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Average Temperature on Module 7")),
		MODULE_8_AVG_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Average Temperature on Module 8")),
		MODULE_0_MIN_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Minimum Temperature on Module 0")),
		MODULE_1_MIN_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Minimum Temperature on Module 1")),
		MODULE_2_MIN_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Minimum Temperature on Module 2")),
		MODULE_3_MIN_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Minimum Temperature on Module 3")),
		MODULE_4_MIN_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Minimum Temperature on Module 4")),
		MODULE_5_MIN_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Minimum Temperature on Module 5")),
		MODULE_6_MIN_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Minimum Temperature on Module 6")),
		MODULE_7_MIN_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Minimum Temperature on Module 7")),
		MODULE_8_MIN_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Minimum Temperature on Module 8")),
		MODULE_0_MAX_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Maximum Temperature on Module 0")),
		MODULE_1_MAX_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Maximum Temperature on Module 1")),
		MODULE_2_MAX_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Maximum Temperature on Module 2")),
		MODULE_3_MAX_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Maximum Temperature on Module 3")),
		MODULE_4_MAX_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Maximum Temperature on Module 4")),
		MODULE_5_MAX_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Maximum Temperature on Module 5")),
		MODULE_6_MAX_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Maximum Temperature on Module 6")),
		MODULE_7_MAX_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Maximum Temperature on Module 7")),
		MODULE_8_MAX_CELL_VOLTAGE(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Maximum Temperature on Module 8")),

		MODULE_0_AVG_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Average Temperature on Module 0")),
		MODULE_1_AVG_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Average Temperature on Module 1")),
		MODULE_2_AVG_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Average Temperature on Module 2")),
		MODULE_3_AVG_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Average Temperature on Module 3")),
		MODULE_4_AVG_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Average Temperature on Module 4")),
		MODULE_5_AVG_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Average Temperature on Module 5")),
		MODULE_6_AVG_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Average Temperature on Module 6")),
		MODULE_7_AVG_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Average Temperature on Module 7")),
		MODULE_8_AVG_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Average Temperature on Module 8")),
		MODULE_0_MIN_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Minimum Temperature on Module 0")),
		MODULE_1_MIN_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Minimum Temperature on Module 1")),
		MODULE_2_MIN_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Minimum Temperature on Module 2")),
		MODULE_3_MIN_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Minimum Temperature on Module 3")),
		MODULE_4_MIN_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Minimum Temperature on Module 4")),
		MODULE_5_MIN_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Minimum Temperature on Module 5")),
		MODULE_6_MIN_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Minimum Temperature on Module 6")),
		MODULE_7_MIN_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Minimum Temperature on Module 7")),
		MODULE_8_MIN_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Minimum Temperature on Module 8")),
		MODULE_0_MAX_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Maximum Temperature on Module 0")),
		MODULE_1_MAX_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Maximum Temperature on Module 1")),
		MODULE_2_MAX_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Maximum Temperature on Module 2")),
		MODULE_3_MAX_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Maximum Temperature on Module 3")),
		MODULE_4_MAX_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Maximum Temperature on Module 4")),
		MODULE_5_MAX_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Maximum Temperature on Module 5")),
		MODULE_6_MAX_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Maximum Temperature on Module 6")),
		MODULE_7_MAX_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Maximum Temperature on Module 7")),
		MODULE_8_MAX_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Maximum Temperature on Module 8")),

		MODULE_0_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of health on Module 0")),
		MODULE_1_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of health on Module 1")),
		MODULE_2_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of health on Module 2")),
		MODULE_3_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of health on Module 3")),
		MODULE_4_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of health on Module 4")),
		MODULE_5_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of health on Module 5")),
		MODULE_6_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of health on Module 6")),
		MODULE_7_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of health on Module 7")),
		MODULE_8_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of health on Module 8")),

		MODULE_0_STATE_ENERGY(Doc.of(INTEGER) //
				.unit(KILOWATT_HOURS) //
				.text("State Energy on Module 0")),
		MODULE_1_STATE_ENERGY(Doc.of(INTEGER) //
				.unit(KILOWATT_HOURS) //
				.text("State Energy on Module 1")),
		MODULE_2_STATE_ENERGY(Doc.of(INTEGER) //
				.unit(KILOWATT_HOURS) //
				.text("State Energy on Module 2")),
		MODULE_3_STATE_ENERGY(Doc.of(INTEGER) //
				.unit(KILOWATT_HOURS) //
				.text("State Energy on Module 3")),
		MODULE_4_STATE_ENERGY(Doc.of(INTEGER) //
				.unit(KILOWATT_HOURS) //
				.text("State Energy on Module 4")),
		MODULE_5_STATE_ENERGY(Doc.of(INTEGER) //
				.unit(KILOWATT_HOURS) //
				.text("State Energy on Module 5")),
		MODULE_6_STATE_ENERGY(Doc.of(INTEGER) //
				.unit(KILOWATT_HOURS) //
				.text("State Energy on Module 6")),
		MODULE_7_STATE_ENERGY(Doc.of(INTEGER) //
				.unit(KILOWATT_HOURS) //
				.text("State Energy on Module 7")),
		MODULE_8_STATE_ENERGY(Doc.of(INTEGER) //
				.unit(KILOWATT_HOURS) //
				.text("State Energy on Module 8")),

		BATTERY_STATE(Doc.of(GlobalState.values())),

		SYSTEM_EMERGENCY_SHUTDHOWN(Doc.of(INTEGER)),

		SYSTEM_RESERVED(Doc.of(INTEGER)),

		SYSTEM_CONTACTOR_STATE(Doc.of(ContactorState.values())),

		SYSTEM_BALANCING_STATE(Doc.of(BalancingState.values())),

		SYSTEM_SAFETY_EVENTS(Doc.of(INTEGER) //
				.text("Number of Safety events active")),

		SYSTEM_WARNING_EVENTS(Doc.of(INTEGER) //
				.text("Number of warning events active")),

		PACK_CURRENT(Doc.of(INTEGER) //
				.unit(MILLIAMPERE) //
				.text("Total pack current")),

		PACK_SHUNT_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Shunt temperature")),

		PACK_PRECHARGE_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Pre circuit temperature")),

		PACK_LIMIT_MAX_BATTERY_VOLTAGE(Doc.of(DOUBLE) //
				.unit(VOLT) //
				.text("Maximum battery voltage allowed")),

		PACK_LIMIT_MIN_BATTERY_VOLTAGE(Doc.of(DOUBLE) //
				.unit(VOLT) //
				.text("Minimum battery voltage allowed")),

		PACK_LIMIT_MAX_CHARGE_CURRENT(Doc.of(DOUBLE) //
				.unit(AMPERE) //
				.text("Maximum charge current allowed")),

		PACK_LIMIT_MAX_DISCHARGE_CURRENT(Doc.of(DOUBLE) //
				.unit(AMPERE) //
				.text("Maximum discharge current allowed")),

		PACK_LIMIT_MAX_CHARGE_POWER(Doc.of(DOUBLE) //
				.unit(KILOWATT) //
				.text("Maximum charge power allowed")),

		PACK_LIMIT_MAX_DISCHARGE_POWER(Doc.of(DOUBLE) //
				.unit(KILOWATT) //
				.text("Maximum discharge power allowed")),

		PACK_STATE_SOC(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of charge")),

		PACK_STATE_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("State of health")),

		PACK_STATE_ENERGY(Doc.of(DOUBLE) //
				.unit(KILOWATT_HOURS) //
				.text("Remaining energy")),

		PACK_VOLTAGE(Doc.of(DOUBLE) //
				.unit(VOLT) //
				.text("Total voltage of the pack")),

		PACK_HIGH_VOLTAGE_PLUS(Doc.of(DOUBLE) //
				.unit(VOLT) //
				.text("Plus side voltage after contactor is closed")),

		PACK_HIGH_VOLTAGE_MINUS(Doc.of(DOUBLE) //
				.unit(VOLT) //
				.text("Minus side voltage after contactor is closed")),
		STRING_EVENT_CELL_OT_CUTOFF(Doc.of(Level.FAULT)), //
		STRING_EVENT_CELL_OT_MAX(Doc.of(Level.WARNING)), //
		STRING_EVENT_CELL_OT_WARN(Doc.of(BOOLEAN)), //
		STRING_EVENT_CELL_OV_CUTOFF(Doc.of(Level.FAULT)), //
		STRING_EVENT_CELL_OV_MAX(Doc.of(Level.WARNING)), //
		STRING_EVENT_CELL_OV_WARN(Doc.of(BOOLEAN)), //
		STRING_EVENT_CELL_UT_CUTOFF(Doc.of(Level.FAULT)), //
		STRING_EVENT_CELL_UT_MAX(Doc.of(Level.WARNING)), //
		STRING_EVENT_CELL_UT_WARN(Doc.of(BOOLEAN)), //
		STRING_EVENT_CELL_UV_CUTOFF(Doc.of(Level.FAULT)), //
		STRING_EVENT_CELL_UV_MAX(Doc.of(Level.WARNING)), //
		STRING_EVENT_CELL_UV_WARN(Doc.of(BOOLEAN)), //

		STRING_EVENT_COMMUNICATION_ERROR(Doc.of(Level.FAULT)//
				.text("String event communication error")), //
		STRING_EVENT_CONT_NEGATIVE_ERR(Doc.of(Level.FAULT)//
				.text("String event negative error")),
		STRING_EVENT_CONT_POSITIVE_ERR(Doc.of(Level.FAULT)//
				.text("String event positive error")),

		STRING_EVENT_CURRENT_OC_CHARGE(Doc.of(BOOLEAN)), //
		STRING_EVENT_CURRENT_OC_DISCHARGE(Doc.of(BOOLEAN)), //

		STRING_EVENT_CURRENT_MEASURE_ERROR(Doc.of(Level.FAULT)//
				.text("String event current measure error")),
		STRING_EVENT_INSULATION_ERROR(Doc.of(BOOLEAN)//
				.text("String event insulation error")),
		STRING_EVENT_INTERNAL_ERROR(Doc.of(BOOLEAN)//
				.text("String event internal error")),
		STRING_EVENT_SOC_LOW(Doc.of(BOOLEAN)//
				.text("String event soc error")),
		STRING_EVENT_SOH_ERROR(Doc.of(BOOLEAN)//
				.text("String event soh error")),

		STRING_EVENT_STRING_CONNECTED(Doc.of(Level.WARNING)), //

		STRING_EVENT_TEMP_DIFFERENCE_ERROR(Doc.of(BOOLEAN)//
				.text("String event temperature difference error")),

		/**
		 * This channel value will be read once in the compact system and it will be
		 * always 8. This value never changes.
		 */
		STRING_MODULE_COUNT(new IntegerDoc() //
				.<EnfasBmsImpl>onChannelChange(EnfasBmsImpl::initializeModulesChannels)),

		STRING_MODULE_COUNT_ERROR(Doc.of(BOOLEAN)//
				.text("String module count error. Must be 9, other than 9 its an error")),

		STRING_EVENT_BALANCING_ERROR(Doc.of(Level.WARNING)), //
		STRING_EVENT_SOC_HIGH_ERROR(Doc.of(BOOLEAN)),

		CSC_INIT_BROKEN_AT(Doc.of(INTEGER)),

		SOFTWARE_VERSION_OUTDATED(Doc.of(Level.WARNING)//
				.text("Achtung: BMS Firmware Update benötigt. Wenden Sie sich hierzu bitte an aftersales.industrial@fenecon.de")),

		SOFTWARE_VERSION_MAJOR(Doc.of(INTEGER) //
				.unit(NONE) //
				.text("SW Version Major Value (Vx.0.0)") //
				.<EnfasBmsImpl>onChannelChange(t -> t.updateSoftwareVersionOutdated())),
		SOFTWARE_VERSION_MINOR(Doc.of(INTEGER) // //
				.unit(NONE) //
				.text("SW Version Minor Value (V0.x.0)") //
				.<EnfasBmsImpl>onChannelChange(t -> t.updateSoftwareVersionOutdated())),
		SOFTWARE_VERSION_PATCH(Doc.of(INTEGER) // //
				.unit(NONE) //
				.text("SW Version Path Value (V0.0.x)") //
				.<EnfasBmsImpl>onChannelChange(t -> t.updateSoftwareVersionOutdated())),

		// write registers
		DEBUG_COMMAND_STATE_REQUEST(new IntegerDoc()), //
		COMMAND_STATE_REQUEST(Doc.of(CommandStateRequest.values()) //
				.accessMode(WRITE_ONLY)
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_STATE_REQUEST)),

		DEBUG_COMMAND_ACTIVATE_BALANCING(new IntegerDoc()), //
		COMMAND_ACTIVATE_BALANCING(new IntegerDoc() //
				.accessMode(WRITE_ONLY)
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_ACTIVATE_BALANCING)),

		DEBUG_COMMAND_BALANCING_THRESHOLD(new IntegerDoc()), //
		COMMAND_BALANCING_THRESHOLD(new IntegerDoc() //
				.accessMode(WRITE_ONLY)//
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_ACTIVATE_BALANCING)),

		DEBUG_COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT(new IntegerDoc()),
		COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT(new IntegerDoc() //
				.accessMode(WRITE_ONLY)//
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT)),

		DEBUG_COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT(new IntegerDoc()),
		COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT(new IntegerDoc() //
				.accessMode(WRITE_ONLY)//
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT)),

		DEBUG_COMMAND_RESET_1(new IntegerDoc()), //
		COMMAND_RESET_1(new IntegerDoc() //
				.accessMode(WRITE_ONLY) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_RESET_1)),

		DEBUG_COMMAND_RESET_2(new IntegerDoc()), //
		COMMAND_RESET_2(new IntegerDoc() //
				.accessMode(WRITE_ONLY) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_RESET_2)),

		DEBUG_COMMAND_ALIVE_COUNTER(new IntegerDoc()), //
		COMMAND_ALIVE_COUNTER(new IntegerDoc() //
				.accessMode(WRITE_ONLY) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_ALIVE_COUNTER)),

		STATE_MACHINE(Doc.of(State.values()) //
				.text("Current State of State-Machine")),

		RUN_FAILED(Doc.of(Level.WARNING) //
				.text("Running the Logic failed")),

		RESET_BATTERY_COMMAND(Doc.of(BOOLEAN) //
				.accessMode(WRITE_ONLY) //
				.text("Reset the battery")),
		BATTERY_SOC(new IntegerDoc() //
				.accessMode(READ_ONLY) //
				.unit(PERCENT)//
				.onChannelChange(EnfasBmsImpl::updateSoc)), //
		USER_SOC_RAW_VALUE(Doc.of(INTEGER) //
				.accessMode(READ_ONLY)) //
		; //

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
	 * Gets the Channel for {@link ChannelId#SOFTWARE_VERSION_MAJOR}.
	 * 
	 * @return the Channel
	 */
	public default IntegerReadChannel getSoftwareVersionMajorChannel() {
		return this.channel(ChannelId.SOFTWARE_VERSION_MAJOR);
	}

	/**
	 * Gets the Software Version Major, see
	 * {@link ChannelId#SOFTWARE_VERSION_MAJOR}.
	 * 
	 * @return the Software Version {@link value}.
	 */
	public default Value<Integer> getSoftwareVersionMajor() {
		return this.getSoftwareVersionMajorChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#SOFTWARE_VERSION_MINOR}.
	 * 
	 * @return the Channel
	 */
	public default IntegerReadChannel getSoftwareVersionMinorChannel() {
		return this.channel(ChannelId.SOFTWARE_VERSION_MINOR);
	}

	/**
	 * Gets the Software Version Minor, see
	 * {@link ChannelId#SOFTWARE_VERSION_MINOR}.
	 * 
	 * @return the Software Version {@link value}.
	 */
	public default Value<Integer> getSoftwareVersionMinor() {
		return this.getSoftwareVersionMinorChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#SOFTWARE_VERSION_PATCH}.
	 * 
	 * @return the Channel
	 */
	public default IntegerReadChannel getSoftwareVersionPatchChannel() {
		return this.channel(ChannelId.SOFTWARE_VERSION_PATCH);
	}

	/**
	 * Gets the Software Version Path, see {@link ChannelId#SOFTWARE_VERSION_PATCH}.
	 * 
	 * @return the Software Version {@link value}.
	 */
	public default Value<Integer> getSoftwareVersionPatch() {
		return this.getSoftwareVersionPatchChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#SOFTWARE_VERSION_OUTDATED}.
	 * 
	 * @return the Channel
	 */
	public default StateChannel getSoftwareVersionOutdatedChannel() {
		return this.channel(ChannelId.SOFTWARE_VERSION_OUTDATED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#SOFTWARE_VERSION_OUTDATED} Channel.
	 * 
	 * @param value the next value
	 */
	public default void _setSoftwareVersionOutdated(boolean value) {
		this.getSoftwareVersionOutdatedChannel()._setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#RESET_BATTERY_COMMAND}.
	 * 
	 * @return the Channel
	 */
	public default WriteChannel<Boolean> getResetBatteryCommandChannel() {
		return this.channel(ChannelId.RESET_BATTERY_COMMAND);
	}

	/**
	 * Gets the Channel for {@link ChannelId#TIMEOUT_START_BATTERY}.
	 * 
	 * @return the Channel
	 */
	public default StateChannel getTimeoutStartBatteryChannel() {
		return this.channel(ChannelId.TIMEOUT_START_BATTERY);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#TIMEOUT_START_BATTERY}.
	 * 
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getTimeoutStartBattery() {
		return this.getTimeoutStartBatteryChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#TIMEOUT_START_BATTERY} Channel.
	 * 
	 * @param value the next value
	 */
	public default void _setTimeoutStartBattery(Boolean value) {
		this.getTimeoutStartBatteryChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#TIMEOUT_STOP_BATTERY}.
	 * 
	 * @return the Channel
	 */
	public default StateChannel getTimeoutStopBatteryChannel() {
		return this.channel(ChannelId.TIMEOUT_STOP_BATTERY);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#TIMEOUT_STOP_BATTERY}.
	 * 
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getTimeoutStopBattery() {
		return this.getTimeoutStopBatteryChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#TIMEOUT_STOP_BATTERY} Channel.
	 * 
	 * @param value the next value
	 */
	public default void _setTimeoutStopBattery(Boolean value) {
		this.getTimeoutStopBatteryChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SYSTEM_CONTACTOR_STATE}.
	 * 
	 * @return the Channel
	 */
	public default EnumReadChannel getSystemContactorStateChannel() {
		return this.channel(ChannelId.SYSTEM_CONTACTOR_STATE);
	}

	/**
	 * Gets the ContactorState, see {@link ChannelId#SYSTEM_CONTACTOR_STATE}.
	 * 
	 * @return the Channel {@link value}.
	 */
	public default ContactorState getSystemContactorState() {
		return this.getSystemContactorStateChannel().value().asEnum();
	}

	/**
	 * Gets the Channel for {@link ChannelId#BATTERY_STATE}.
	 * 
	 * @return the Channel
	 */
	public default EnumReadChannel getBatteryStateChannel() {
		return this.channel(ChannelId.BATTERY_STATE);
	}

	/**
	 * Gets the ContactorState, see {@link ChannelId#BATTERY_STATE}.
	 * 
	 * @return the Channel {@link value}.
	 */
	public default GlobalState getBatteryState() {
		return this.getBatteryStateChannel().value().asEnum();
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_STATE_REQUEST}.
	 *
	 * @return the Channel
	 */
	public default WriteChannel<CommandStateRequest> getCommandStateRequestChannel() {
		return this.channel(ChannelId.COMMAND_STATE_REQUEST);
	}

	/**
	 * Gets the CommandStateRequest, see {@link ChannelId#COMMAND_STATE_REQUEST}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default CommandStateRequest getCommandStateRequest() {
		return this.getCommandStateRequestChannel().value().asEnum();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_STATE_REQUEST} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setCommandStateRequest(CommandStateRequest value) {
		this.getCommandStateRequestChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_STATE_REQUEST} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	public default void setCommandStateRequest(CommandStateRequest value) throws OpenemsNamedException {
		this.getCommandStateRequestChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_ACTIVATE_BALANCING}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getCommandActivateBalancingChannel() {
		return this.channel(ChannelId.COMMAND_ACTIVATE_BALANCING);
	}

	/**
	 * Gets the CommandActivateBalancing, see
	 * {@link ChannelId#COMMAND_ACTIVATE_BALANCING}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default int getCommandActivateBalancing() {
		return this.getCommandActivateBalancingChannel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_ACTIVATE_BALANCING} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setCommandActivateBalancing(int value) {
		this.getCommandActivateBalancingChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_ACTIVATE_BALANCING}
	 * Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	public default void setCommandActivateBalancing(int value) throws OpenemsNamedException {
		this.getCommandActivateBalancingChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_BALANCING_THRESHOLD}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getCommandBalancingThresholdChannel() {
		return this.channel(ChannelId.COMMAND_BALANCING_THRESHOLD);
	}

	/**
	 * Gets the CommandBalancingThreshold, see
	 * {@link ChannelId#COMMAND_BALANCING_THRESHOLD}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default int getCommandBalancingThreshold() {
		return this.getCommandBalancingThresholdChannel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_BALANCING_THRESHOLD} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setCommandBalancingThreshold(int value) {
		this.getCommandBalancingThresholdChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_BALANCING_THRESHOLD}
	 * Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	public default void setCommandBalancingThreshold(int value) throws OpenemsNamedException {
		this.getCommandBalancingThresholdChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getCommandCustomCurrentChargeLimitChannel() {
		return this.channel(ChannelId.COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT);
	}

	/**
	 * Gets the PreChargeControl, see
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default int getCommandCustomCurrentChargeLimit() {
		return this.getCommandCustomCurrentChargeLimitChannel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setCommandCustomCurrentChargeLimit(int value) {
		this.getCommandCustomCurrentChargeLimitChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT}
	 * Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	public default void setCommandCustomCurrentChargeLimit(int value) throws OpenemsNamedException {
		this.getCommandCustomCurrentChargeLimitChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getCommandCustomCurrentDischargeLimitChannel() {
		return this.channel(ChannelId.COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT);
	}

	/**
	 * Gets the PreChargeControl, see
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default int getCommandCustomCurrentDischargeLimit() {
		return this.getCommandCustomCurrentDischargeLimitChannel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setCommandCustomCurrentDischargeLimit(int value) {
		this.getCommandCustomCurrentDischargeLimitChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	public default void setCommandCustomCurrentDischargeLimit(int value) throws OpenemsNamedException {
		this.getCommandCustomCurrentDischargeLimitChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_RESET_1}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getCommandReset1Channel() {
		return this.channel(ChannelId.COMMAND_RESET_1);
	}

	/**
	 * Gets the PreChargeControl, see {@link ChannelId#COMMAND_RESET_1}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default int getCommandReset1() {
		return this.getCommandReset1Channel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#COMMAND_RESET_1}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setCommandReset1(int value) {
		this.getCommandReset1Channel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_RESET_1} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	public default void setCommandReset1(int value) throws OpenemsNamedException {
		this.getCommandReset1Channel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_RESET_2}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getCommandReset2Channel() {
		return this.channel(ChannelId.COMMAND_RESET_2);
	}

	/**
	 * Gets the PreChargeControl, see {@link ChannelId#COMMAND_RESET_2}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default int getCommandReset2() {
		return this.getCommandReset2Channel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#COMMAND_RESET_2}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setCommandReset2(int value) {
		this.getCommandReset2Channel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_RESET_2} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	public default void setCommandReset2(int value) throws OpenemsNamedException {
		this.getCommandReset2Channel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_ALIVE_COUNTER}.
	 *
	 * @return the Channel
	 */
	public default IntegerWriteChannel getCommandAliveCounterChannel() {
		return this.channel(ChannelId.COMMAND_ALIVE_COUNTER);
	}

	/**
	 * Gets the PreChargeControl, see {@link ChannelId#COMMAND_ALIVE_COUNTER}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default int getCommandAliveCounter() {
		return this.getCommandAliveCounterChannel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_ALIVE_COUNTER} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setCommandAliveCounter(int value) {
		this.getCommandAliveCounterChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_ALIVE_COUNTER} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	public default void setCommandAliveCounter(int value) throws OpenemsNamedException {
		this.getCommandAliveCounterChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#PACK_VOLTAGE}.
	 *
	 * @return the Channel
	 */
	public default DoubleReadChannel getPackVoltageChannel() {
		return this.channel(ChannelId.PACK_VOLTAGE);
	}

	/**
	 * Gets the Pack voltage. See {@link ChannelId#PACK_VOLTAGE}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Double> getPackVoltage() {
		return this.getPackVoltageChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#PACK_HIGH_VOLTAGE_PLUS}.
	 *
	 * @return the Channel
	 */
	public default DoubleReadChannel getPackHighVoltagePlusChannel() {
		return this.channel(ChannelId.PACK_HIGH_VOLTAGE_PLUS);
	}

	/**
	 * Gets the Pack voltage. See {@link ChannelId#PACK_HIGH_VOLTAGE_PLUS}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Double> getPackHighVoltagePlus() {
		return this.getPackHighVoltagePlusChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#STRING_EVENT_COMMUNICATION_ERROR}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getStringEventCommunicationErrorChannel() {
		return this.channel(ChannelId.STRING_EVENT_COMMUNICATION_ERROR);
	}

	/**
	 * Gets the StringEventCommunicationError, see
	 * {@link ChannelId#STRING_EVENT_COMMUNICATION_ERROR}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getStringEventCommunicationError() {
		return this.getStringEventCommunicationErrorChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#STRING_MODULE_COUNT}.
	 *
	 * @return the Channel
	 */
	public default Channel<Integer> getStringModuleCountChannel() {
		return this.channel(ChannelId.STRING_MODULE_COUNT);
	}

	/**
	 * Gets the channel value see {@link ChannelId#STRING_MODULE_COUNT}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getStringModuleCount() {
		return this.getStringModuleCountChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#BATTERY_SOC}.
	 *
	 * @return the Channel
	 */
	public default Channel<Integer> getBatterySocChannel() {
		return this.channel(ChannelId.BATTERY_SOC);
	}

	/**
	 * Gets the channel value see {@link ChannelId#BATTERY_SOC}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getBatterySoc() {
		return this.getBatterySocChannel().value();
	}

}
