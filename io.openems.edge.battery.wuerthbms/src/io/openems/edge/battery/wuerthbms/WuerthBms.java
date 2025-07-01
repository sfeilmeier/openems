package io.openems.edge.battery.wuerthbms;

import static io.openems.common.channel.AccessMode.READ_ONLY;
import static io.openems.common.channel.AccessMode.READ_WRITE;
import static io.openems.common.channel.AccessMode.WRITE_ONLY;
import static io.openems.common.channel.Level.WARNING;
import static io.openems.common.channel.Unit.AMPERE;
import static io.openems.common.channel.Unit.DEGREE_CELSIUS;
import static io.openems.common.channel.Unit.KILOWATT_HOURS;
import static io.openems.common.channel.Unit.MILLIAMPERE;
import static io.openems.common.channel.Unit.MILLIVOLT;
import static io.openems.common.channel.Unit.MINUTE;
import static io.openems.common.channel.Unit.PERCENT;
import static io.openems.common.channel.Unit.VOLT;
import static io.openems.common.channel.Unit.WATT_HOURS;
import static io.openems.common.types.OpenemsType.BOOLEAN;
import static io.openems.common.types.OpenemsType.DOUBLE;
import static io.openems.common.types.OpenemsType.INTEGER;
import static io.openems.common.types.OpenemsType.STRING;

import io.openems.common.channel.Level;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.protection.BatteryVoltageProtection;
import io.openems.edge.battery.wuerthbms.enums.BalancingState;
import io.openems.edge.battery.wuerthbms.enums.BmsState;
import io.openems.edge.battery.wuerthbms.enums.CommandStateRequest;
import io.openems.edge.battery.wuerthbms.enums.ContactorState;
import io.openems.edge.battery.wuerthbms.enums.ShutdownPathCause;
import io.openems.edge.battery.wuerthbms.enums.ShutdownPathTestFail;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine.State;
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

public interface WuerthBms extends Battery, OpenemsComponent, StartStoppable, BatteryVoltageProtection {

	/**
	 * Gets the target Start/Stop mode from config or StartStop-Channel.
	 *
	 * @return {@link StartStop}
	 */
	StartStop getStartStopTarget();

	enum ChannelId implements io.openems.edge.common.channel.ChannelId {
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

		/**
		 * State of the battery. (SystemGlobalState)
		 */
		BATTERY_STATE(Doc.of(BmsState.values())),

		PRECHARGE_ENERGY(Doc.of(INTEGER)),

		SYSTEM_CONTACTOR_STATE(Doc.of(ContactorState.values())),

		SYSTEM_BALANCING_STATE(Doc.of(BalancingState.values())),

		RELAY_FEEDBACK_0_AUX_0(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Relay 0 Feedback HighSide")), //

		RELAY_FEEDBACK_0_AUX_1(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Relay 0 Feedback LowSide")), //

		RELAY_FEEDBACK_1_AUX_0(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Relay 1 Feedback HighSide")), //

		RELAY_FEEDBACK_1_AUX_1(Doc.of(INTEGER) //
				.unit(MILLIVOLT) //
				.text("Relay 1 Feedback LowSide")), //

		PACK_REMAINING_CAPACITY(Doc.of(INTEGER) //
				.unit(MINUTE) //
				.text("Show the remaining Capacity")), //

		CONTACTOR_SOH(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.text("Contactor state of health")), //

		PACK_SHUNT_TEMPERATURE(Doc.of(INTEGER) //
				.unit(DEGREE_CELSIUS) //
				.text("Shunt temperature")),

		PACK_STATE_ENERGY(Doc.of(DOUBLE) //
				.unit(KILOWATT_HOURS) //
				.text("Remaining energy")),

		PACK_HIGH_VOLTAGE_PLUS(Doc.of(DOUBLE) //
				.unit(VOLT) //
				.text("Plus side voltage after contactor is closed")),

		PACK_HIGH_VOLTAGE_MINUS(Doc.of(DOUBLE) //
				.unit(VOLT) //
				.text("Minus side voltage after contactor is closed")),

		STRING_EVENT_CELL_OT_CUTOFF(Doc.of(WARNING)), //
		STRING_EVENT_CELL_OT_MAX(Doc.of(WARNING)), //
		STRING_EVENT_CELL_OT_WARN(Doc.of(WARNING)), //
		STRING_EVENT_CELL_OV_CUTOFF(Doc.of(WARNING)), //
		STRING_EVENT_CELL_OV_MAX(Doc.of(WARNING)), //
		STRING_EVENT_CELL_OV_WARN(Doc.of(WARNING)), //
		STRING_EVENT_CELL_UT_CUTOFF(Doc.of(WARNING)), //
		STRING_EVENT_CELL_UT_MAX(Doc.of(WARNING)), //
		STRING_EVENT_CELL_UT_WARN(Doc.of(WARNING)), //
		STRING_EVENT_CELL_UV_CUTOFF(Doc.of(WARNING)), //
		STRING_EVENT_CELL_UV_MAX(Doc.of(WARNING)), //
		STRING_EVENT_CELL_UV_WARN(Doc.of(WARNING)), //

		STRING_EVENT_COMMUNICATION_ERROR(Doc.of(WARNING) //
				.text("String event communication error")), //

		STRING_EVENT_CONT_NEGATIVE_ERR(Doc.of(WARNING) //
				.text("String event negative error")), //

		STRING_EVENT_CONT_POSITIVE_ERR(Doc.of(WARNING) //
				.text("String event positive error")), //

		STRING_EVENT_SOC_ERROR(Doc.of(WARNING) //
				.text("String event SoC error")), //

		STRING_EVENT_CURRENT_OC_CHARGE(Doc.of(WARNING)), //
		STRING_EVENT_CURRENT_OC_DISCHARGE(Doc.of(WARNING)), //

		STRING_EVENT_CURRENT_MEASURE_ERROR(Doc.of(WARNING) //
				.text("String event current measure error")),

		STRING_EVENT_INSULATION_ERROR(Doc.of(WARNING) //
				.text("String event insulation error")),

		STRING_EVENT_VOLT_PLAUSIBILITY_ERROR(Doc.of(WARNING) //
				.text("String event volt plausibility error")),

		STRING_EVENT_SOH_ERROR(Doc.of(WARNING) //
				.text("String event soh error")),

		SOC_RECALIBRATION_WARNING(Doc.of(WARNING) //
				.text("SoC recalibration warning")),

		SYSTEM_LOCK_STATUS(Doc.of(Level.INFO) //
				.text("System lock status")),

		SHUTDOWN_PATH_ACTIVE(Doc.of(Level.INFO) //
				.text("Shutdown path active")),

		MCU_EVENT_DIE_TEMP(Doc.of(WARNING) //
				.text("MCU event die temp")),

		SHUNT_OVERTEMPERATURE(Doc.of(WARNING) //
				.text("Shunt over temperature")),

		PRECHARGE_FAILED(Doc.of(WARNING) //
				.text("Precharge failed")),

		KL_30_C_FAULT(Doc.of(WARNING) //
				.text("KL30C fault")),

		CALIBRATION_PASSED(Doc.of(Level.INFO) //
				.text("Calibration passed")),

		SET_IP_FAIL(Doc.of(WARNING) //
				.text("Set IP fail")),

		FEEDBACK_BROKEN(Doc.of(WARNING) //
				.text("Feedback broken")),

		STRING_EVENT_STRING_CONNECTED(Doc.of(WARNING)), //

		STRING_EVENT_TEMP_DIFFERENCE_ERROR(Doc.of(WARNING) //
				.text("String event temperature difference error")),

		/**
		 * Since version 1.0.09 this number is variable.
		 */
		STRING_MODULE_COUNT(Doc.of(INTEGER) //
				.accessMode(READ_ONLY) //
				.text("Total number of Modules")),

		STRING_EVENT_BALANCING_ERROR(Doc.of(WARNING)), //
		STRING_EVENT_SOC_HIGH_ERROR(Doc.of(WARNING)), //

		SOFTWARE_VERSION_OUTDATED(Doc.of(WARNING) //
				.text("Achtung: BMS Firmware Update benötigt. Wenden Sie sich hierzu bitte an aftersales.industrial@fenecon.de")),

		SOFTWARE_VERSION_MAJOR(Doc.of(INTEGER) //
				.text("SW Version Major Value (Vx.0.0)") //
				.onChannelChange(WuerthBmsImpl::updateSoftwareVersionOutdated)),
		SOFTWARE_VERSION_MINOR(Doc.of(INTEGER) // //
				.text("SW Version Minor Value (V0.x.0)") //
				.onChannelChange(WuerthBmsImpl::updateSoftwareVersionOutdated)),
		SOFTWARE_VERSION_PATCH(Doc.of(INTEGER) // //
				.text("SW Version Path Value (V0.0.x)") //
				.onChannelChange(WuerthBmsImpl::updateSoftwareVersionOutdated)),

		// write registers
		DEBUG_COMMAND_STATE_REQUEST(Doc.of(INTEGER)), //
		COMMAND_STATE_REQUEST(Doc.of(CommandStateRequest.values()) //
				.accessMode(READ_WRITE)
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_STATE_REQUEST)),

		DEBUG_COMMAND_ACTIVATE_BALANCING(Doc.of(INTEGER)), //
		COMMAND_ACTIVATE_BALANCING(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_ACTIVATE_BALANCING)),

		DEBUG_COMMAND_BALANCING_THRESHOLD(Doc.of(INTEGER)), //
		COMMAND_BALANCING_THRESHOLD(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_ACTIVATE_BALANCING)),

		DEBUG_COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT(Doc.of(INTEGER)),
		COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT)),

		DEBUG_COMMAND_RESET_1(Doc.of(INTEGER)), //
		COMMAND_RESET_1(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_RESET_1)),

		DEBUG_COMMAND_RESET_2(Doc.of(INTEGER)), //
		COMMAND_RESET_2(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_RESET_2)),

		DEBUG_COMMAND_ALIVE_COUNTER(Doc.of(INTEGER)), //
		COMMAND_ALIVE_COUNTER(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_ALIVE_COUNTER) //
				.text("This value should be incremented every time the message is sent.")),

		DEBUG_COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT(Doc.of(INTEGER)), //
		COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT(Doc.of(INTEGER) //
				.unit(AMPERE) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT)), //

		DEBUG_COMMAND_CUSTOM_CURRENT_DISCH_LIMIT(Doc.of(INTEGER)), //
		COMMAND_CUSTOM_CURRENT_DISCH_LIMIT(Doc.of(INTEGER) //
				.unit(AMPERE) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_CUSTOM_CURRENT_DISCH_LIMIT) //
				.text("Maximum Allowed Current for Charge (0-default Maximum Current)")), //

		DEBUG_COMMAND_RESET_SYSTEM_LOCK_MSB(Doc.of(INTEGER)), //
		COMMAND_RESET_SYSTEM_LOCK_MSB(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_RESET_SYSTEM_LOCK_MSB) //
				.text("Maximum Allowed Current for Discharge (0-default Maximum Current)")), //

		DEBUG_COMMAND_RESET_SYSTEM_LOCK_LSB(Doc.of(INTEGER)), //
		COMMAND_RESET_SYSTEM_LOCK_LSB(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_RESET_SYSTEM_LOCK_LSB)), //

		DEBUG_COMMAND_RESET_SYSTEM_LOCK_CRC_MSB(Doc.of(INTEGER)), //
		COMMAND_RESET_SYSTEM_LOCK_CRC_MSB(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_RESET_SYSTEM_LOCK_CRC_MSB)), //

		DEBUG_COMMAND_RESET_SYSTEM_LOCK_CRC_LSB(Doc.of(INTEGER)), //
		COMMAND_RESET_SYSTEM_LOCK_CRC_LSB(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_RESET_SYSTEM_LOCK_CRC_LSB)), //

		DEBUG_COMMAND_MAINTENANCE_MODE(Doc.of(INTEGER)), //
		COMMAND_MAINTENANCE_MODE(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_MAINTENANCE_MODE)), //

		DEBUG_COMMAND_SOH_RESET(Doc.of(INTEGER)), //
		COMMAND_SOH_RESET(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_SOH_RESET)), //

		DEBUG_COMMAND_SOH_HIGH_RESOLUTION_LSB(Doc.of(INTEGER)), //
		COMMAND_SOH_HIGH_RESOLUTION_LSB(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_SOH_HIGH_RESOLUTION_LSB)),

		DEBUG_COMMAND_SOH_HIGH_RESOLUTION_MSB(Doc.of(INTEGER)), //
		COMMAND_SOH_HIGH_RESOLUTION_MSB(Doc.of(INTEGER) //
				.accessMode(READ_WRITE) //
				.onChannelSetNextWriteMirrorToDebugChannel(ChannelId.DEBUG_COMMAND_SOH_HIGH_RESOLUTION_MSB)), //

		REGULATION_REMAINING_CAPACITY(Doc.of(INTEGER) //
				.unit(WATT_HOURS) //
				.accessMode(READ_WRITE)), //

		REGULATION_REMAINING_POWER_CAPABILITY(Doc.of(INTEGER).unit(PERCENT) //
				.accessMode(READ_WRITE) //
				.text("Relation of energy in / out (after SOC recalibration)")), //

		REGULATION_ROUND_TRIP_EFFICIENCY(Doc.of(INTEGER).unit(WATT_HOURS) //
				.accessMode(READ_WRITE) //
				.text("Capacity per month")), //

		REGULATION_SELF_DISCHARGING_RATE(Doc.of(INTEGER).unit(WATT_HOURS) //
				.accessMode(READ_WRITE)), //

		REGULATION_ENERGY_THROUGHPUT_OVERALL_IN_MSB(Doc.of(INTEGER) //
				.unit(WATT_HOURS) //
				.accessMode(READ_WRITE)), //

		REGULATION_ENERGY_THROUGHPUT_OVERALL_IN_LSB(Doc.of(INTEGER) //
				.unit(WATT_HOURS) //
				.accessMode(READ_WRITE)), //

		REGULATION_ENERGY_THROUGHPUT_OVERALL_OUT_MSB(Doc.of(INTEGER) //
				.unit(WATT_HOURS) //
				.accessMode(READ_WRITE)), //

		REGULATION_ENERGY_THROUGHPUT_OVERALL_OUT_LSB(Doc.of(INTEGER) //
				.unit(WATT_HOURS) //
				.accessMode(READ_WRITE)), //

		REGULATION_NUM_CHARGE_DISCHARGE_CYCLES(Doc.of(INTEGER) //
				.unit(PERCENT) //
				.accessMode(READ_WRITE)), //

		SHUNT_CALIBRATION_MSB(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //

		SHUNT_CALIBRATION_LSB(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET0(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET1(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET2(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET3(Doc.of(INTEGER).accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET4(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET5(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //

		IP_BYTE0(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //
		IP_BYTE1(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //
		IP_BYTE2(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //
		IP_BYTE3(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //
		GW_BYTE0(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //
		GW_BYTE1(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //
		GW_BYTE2(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //
		GW_BYTE3(Doc.of(INTEGER) //
				.accessMode(READ_WRITE)), //

		HW_SERIAL_NUMBER_CODE_0(Doc.of(INTEGER) //
				.text("Two digit hardware number part") //
				.accessMode(READ_WRITE)), //
		HW_SERIAL_NUMBER_CODE_1(Doc.of(INTEGER) //
				.text("Four digit hardware number part") //
				.accessMode(READ_WRITE)), //
		HW_SERIAL_NUMBER_CODE_2(Doc.of(INTEGER) //
				.text("Four digit hardware number part") //
				.accessMode(READ_WRITE)), //
		HW_SERIAL_NUMBER_LETTER(Doc.of(STRING) //
				.text("Two letter hardware number part") //
				.accessMode(READ_WRITE)), //

		STATE_MACHINE(Doc.of(State.values()) //
				.text("Current State of State-Machine")),

		RUN_FAILED(Doc.of(WARNING) //
				.text("Running the Logic failed")),

		RESET_BATTERY_COMMAND(Doc.of(BOOLEAN) //
				.accessMode(WRITE_ONLY) //
				.text("Reset the battery")),
		BATTERY_SOC(new IntegerDoc() //
				.accessMode(READ_ONLY) //
				.unit(PERCENT) //
				.onChannelChange(WuerthBmsImpl::updateSoc)), //

		// New protocol

		NUMBER_OF_MODULES(Doc.of(INTEGER) //
				.accessMode(READ_ONLY) //
				.onChannelChange(WuerthBmsImpl::initializeDynamicChannels) //
				.onChannelChange(WuerthBmsImpl::setBatteryVoltageProtection) //
				.text("Total number of modules")),

		NUMBER_OF_CELLS(Doc.of(INTEGER) //
				.accessMode(READ_ONLY) //
				.onChannelChange(WuerthBmsImpl::initializeDynamicChannels) //
				.onChannelChange(WuerthBmsImpl::setBatteryVoltageProtection) //
				.text("Total number of cells")),

		NUMBER_OF_TEMPERATURE_SENSORS(Doc.of(INTEGER) //
				.accessMode(READ_ONLY) //
				.onChannelChange(WuerthBmsImpl::initializeDynamicChannels) //
				.text("Total number of temperature senses")),

		PACK_LIMIT_MAX_BATTERY_VOLTAGE(Doc.of(INTEGER) //
				.unit(VOLT) //
				.text("Maximum battery voltage allowed")), //
		CELL_VOLT_PLAUSIBILITY(Doc.of(INTEGER)), //
		STACKS_CELLS_PLAUSIBILITY(Doc.of(INTEGER)), //
		PACK_LIMIT_MIN_BATTERY_VOLTAGE(Doc.of(INTEGER) //
				.unit(VOLT) //
				.text("Minimum battery voltage")), //
		COM_LAST_FAILED_CSC(Doc.of(INTEGER)), //
		KL_30(Doc.of(INTEGER) //
				.unit(VOLT)), //
		KL_30C(Doc.of(INTEGER) //
				.unit(VOLT)), //
		CELL_OPEN_WIRE_DETECTION(Doc.of(INTEGER)), //
		CSC_OPEN_WIRE_DETECTION(Doc.of(INTEGER)), //
		CVCM_FAULT_CASE(Doc.of(INTEGER)), //
		DIAG_LAST_FAILED_CSC(Doc.of(INTEGER)), //
		LATENT_LAST_FAILED_CSC(Doc.of(INTEGER)), //
		PACK_CURRENT_MA(Doc.of(INTEGER) //
				.unit(MILLIAMPERE) //
				.text("Shows the mA value of the current(used if necessary to get a bigger resolution) 0mA - 1000mA")), //

		SHUTDOWN_PATH_CAUSE(Doc.of(ShutdownPathCause.values())), //
		SHUTDOWN_PATH_TEST_FAIL(Doc.of(ShutdownPathTestFail.values())), //

		NUMBER_OF_TEMPERATURE_SENSORS_PER_MODULE(Doc.of(INTEGER)), //
		NUMBER_OF_CSC(Doc.of(INTEGER)), //
		CFG_CSC_TEMP_SENS_CSC(Doc.of(INTEGER)), //
		NUMBER_OF_CELLS_CSC(Doc.of(INTEGER) //
				.accessMode(READ_ONLY) //
				.onChannelChange(WuerthBmsImpl::initializeDynamicChannels) //
				.onChannelChange(WuerthBmsImpl::setBatteryVoltageProtection)), //
		CFG_CSC_TEMP_SENSORS(Doc.of(INTEGER)), //
		CFG_CSC_TEMP_T4(Doc.of(INTEGER)), //
		CFG_CSC_NTC_RNTC(Doc.of(INTEGER)), //
		CFG_CSC_NTC_REFTEMP(Doc.of(INTEGER)), //
		CFG_CSC_NTC_REFRES(Doc.of(INTEGER)), //
		CFG_CSC_NTC_BETA(Doc.of(INTEGER)), //
		CFG_CSC_NTC_CHANNELS(Doc.of(INTEGER)), //
		CFG_BATT_CAPACITY_AH(Doc.of(INTEGER)), //
		CFG_BATT_RELAX_PERIOD_MIN(Doc.of(INTEGER)), //
		CFG_BATT_CELL_SAFE_OV_V(Doc.of(INTEGER)), //
		CFG_BATT_CELL_CUTOFF_OV_V(Doc.of(INTEGER)), //
		CFG_BATT_CELL_WARN_OV_V(Doc.of(INTEGER)), //
		CFG_BATT_CELL_SAFE_UV_V(Doc.of(INTEGER)), //
		CFG_BATT_CELL_CUTOFF_UV_V(Doc.of(INTEGER)), //
		CFG_BATT_CELL_WARN_UV_V(Doc.of(INTEGER)), //
		CFG_BATT_CELL_CUTOFF_VOLTAGE_FTTI_MS(Doc.of(INTEGER)), //
		CFG_BATT_CELL_SAFE_VOLTAGE_FTTI_MS(Doc.of(INTEGER)), //
		CFG_BATT_CELL_SAFETY_TEMP_MAX(Doc.of(INTEGER)), //
		CFG_BATT_CELL_OPERATION_TEMP_MAX(Doc.of(INTEGER)), //
		CFG_BATT_CELL_WARN_TEMP_MAX(Doc.of(INTEGER)), //
		CFG_BATT_CELL_SAFETY_TEMP_MIN(Doc.of(INTEGER)), //
		CFG_BATT_CELL_OPERATION_TEMP_MIN(Doc.of(INTEGER)), //
		CFG_BATT_CELL_WARN_TEMP_MIN(Doc.of(INTEGER)), //
		CFG_BATT_CELL_CUTOFF_TEMPERATURE_FTTI_MS(Doc.of(INTEGER)), //
		CFG_BATT_CELL_SAFE_TEMPERATURE_FTTI_MS(Doc.of(INTEGER)), //
		CFG_BATT_STRING_MIN_V(Doc.of(INTEGER) //
				.unit(VOLT)), //
		CFG_BATT_STRING_MAX_V(Doc.of(INTEGER) //
				.unit(VOLT)), //
		CFG_BATT_STRING_CONT_CURRENT_MAX_A(Doc.of(INTEGER)), //
		CFG_BATT_STRING_MAX_CHARGE_POSSIBLE(Doc.of(INTEGER)), //
		CFG_BATT_STRING_PULSE15S_CURRENT_MAX_A(Doc.of(INTEGER)), //
		CFG_BATT_STRING_PULSE30S_CURRENT_MAX_A(Doc.of(INTEGER)), //
		CFG_BATT_STRING_PULSE_RECOVERY_TIME_MIN(Doc.of(INTEGER)), //
		CFG_BATT_WAIT_FOR_INVERTER_CURR_SYNC_MS(Doc.of(INTEGER)), //
		CFG_CHARGE_CURRENT_LIMIT_TOLERANCE_A(Doc.of(INTEGER)), //
		CFG_SHUNT_TEMPERATURE_HIGH(Doc.of(INTEGER)), //
		CFG_BALANCE_ACTIVATE(Doc.of(INTEGER)), //
		CFG_BALANCING_ACTIVATE_MV(Doc.of(INTEGER)), //
		CFG_BALANCING_DEACTIVE_MV(Doc.of(INTEGER)), //
		CFG_BALANCING_MINCELLVOLTAGE_MV(Doc.of(INTEGER)), //
		CFG_BATT_PLAUS_THRESHOLD_V(Doc.of(INTEGER) //
				.unit(VOLT)), //
		CFG_BATT_PLAUS_THRESHOLD_PERCENT(Doc.of(INTEGER)), //
		CFG_BMS_PARALLEL_STRINGS(Doc.of(INTEGER)), //
		CFG_BMS_IDLE_CURRENT_ABS_MA(Doc.of(INTEGER)), //
		CFG_BMS_MAXIMUM_SOC(Doc.of(INTEGER)), //
		CFG_BMS_MINIMUM_SOC(Doc.of(INTEGER)), //
		CFG_BMS_POWERBANK_ENABLE(Doc.of(INTEGER)), //
		CFG_CELL_MONITORING_DIAG_FTTI_MS(Doc.of(INTEGER)), //
		CFG_SMALL_SHUNT_R(Doc.of(INTEGER)), //
		CFG_BIG_SHUNT_R(Doc.of(INTEGER)), //
		CFG_SHUNT_RESISTANCE(Doc.of(INTEGER)), //
		CFG_CONT_PWM_CONTROLLED(Doc.of(INTEGER)), //
		CFG_PRECHARGE_ENABLED(Doc.of(INTEGER)), //
		CFG_PRECHARGE_THRESHOLD(Doc.of(INTEGER)), //
		CFG_PRECHARGE_CHECK_TIME(Doc.of(INTEGER)), //
		CFG_PRECHARGE_TIMEOUT(Doc.of(INTEGER)), //
		CFG_CONTACTOR_NEGATIVE_TIMEOUT(Doc.of(INTEGER)), //
		CFG_CONTACTOR_POSITIVE_TIMEOUT(Doc.of(INTEGER)), //
		CFG_CONATCTOR_UNDERLOAD_CURRENT(Doc.of(INTEGER)), //
		CFG_BMS_KL30_MAINSUPPLY_MV(Doc.of(INTEGER)), //
		CFG_BMS_KL30C_CONTSUPPLY_MV(Doc.of(INTEGER)), //
		CFG_BMS_SUPPLY_TOLERANCE_MV(Doc.of(INTEGER)), //
		CFG_PRECHARGE_ONBOARD(Doc.of(INTEGER)), //
		CFG_CONTACTOR_ACTIVATION_TIME_MS(Doc.of(INTEGER)), //
		BMS_RELEASE_TYPE(Doc.of(INTEGER)), //
		BMS_HV_DIVIDER_R1_KOHM(Doc.of(INTEGER)), //
		BMS_HV_DIVIDER_R2_KOHM(Doc.of(INTEGER)), //
		BMS_HV_DIVIDER(Doc.of(INTEGER)), //
		TEMPDEP_CURRENT_MONITOR_ACTIVE(Doc.of(INTEGER)), //
		TEMPDEP_CURRENT_SHUNT_TOL_ERROR_PERC(Doc.of(INTEGER)), //
		TEMPDEP_CURRENT_LTC_MEAS_ERROR_PERC(Doc.of(INTEGER)), //
		TEMPDEP_CURRENT_SHUNT_MAX_ERROR_PERC(Doc.of(INTEGER)), //
		TEMPDEP_CURRENT_OVERCURRENT_SHUTDOWN_MS(Doc.of(INTEGER)), //
		OVER_CURRENT_COMPARATOR_ACTIVE(Doc.of(INTEGER)), //
		OVER_CURRENT_CURRENT_LIMIT_A(Doc.of(INTEGER)), //
		OVER_CURRENT_COMPARATOR_LIMIT_MV(Doc.of(INTEGER)), //
		OVER_CURRENT_OVERCURRENT_SAFETY_MS(Doc.of(INTEGER)), //
		CELL_MONITORING_DIAG_FTTI_MS(Doc.of(INTEGER)), //
		CONTACTOR_VOLTAGE_TOLERANCE(Doc.of(INTEGER)), //
		DIE_TEMP_LIMIT_WARNING_LOWER_DEGC(Doc.of(INTEGER)), //
		DIE_TEMP_LIMIT_WARNING_UPPER_DEGC(Doc.of(INTEGER)), //
		DIE_TEMP_LIMIT_SAFETY_LOWER_DEGC(Doc.of(INTEGER)), //
		DIE_TEMP_LIMIT_SAFETY_UPPER_DEGC(Doc.of(INTEGER)), //
		DIE_TEMP_LIMIT_SMU_LOWER_DEGC(Doc.of(INTEGER)), //
		DIE_TEMP_LIMIT_SMU_UPPER_DEGC(Doc.of(INTEGER)), //
		CSC_VOLTAGE_MEASUREMENT_ERROR_COMBINED_MV(Doc.of(INTEGER)), //
		CSC_TEMPERATURE_MEASUREMENT_ERROR_COMBINED_DEGC(Doc.of(INTEGER)), //
		CSC_VOLTAGE_MEASUREMENT_PLAUSIBILITY_THRESHOLD_MV(Doc.of(INTEGER)), //
		CSC_STACK_VS_SUM_PLAUSIBILITY_THRESHOLD_MV(Doc.of(INTEGER)), //
		CSC_ALLOWED_COM_RETRIES(Doc.of(INTEGER)), //
		CSC_CELLBALANCINGTIME_PER_DIAG_CYCLE_MS(Doc.of(INTEGER)), //
		BMS_CONTACTOR_INVERTED(Doc.of(INTEGER)), //
		RELAY_AUX0_OPEN_MV(Doc.of(INTEGER)), //
		RELAY_AUX1_OPEN_MV(Doc.of(INTEGER)), //
		RELAY_AUX0_CLOSED_MV(Doc.of(INTEGER)), //
		RELAY_AUX1_CLOSED_MV(Doc.of(INTEGER)), //
		RELAY_AUX_DEVIATION_MAX_MV(Doc.of(INTEGER)), //
		WEBCM_DEV_ACTIVATE_BALANCING(Doc.of(INTEGER)), //
		WEBCM_DEV_ACTIVATE_ALLRUNTIME_CHECKS(Doc.of(INTEGER)), //
		WEBCM_DEV_ACTIVATE_RANGE_CHECKS(Doc.of(INTEGER)), //
		TEST_WEOS_DEACTIVATE_AREA_CHECK(Doc.of(INTEGER)), //
		TEST_WEOS_DEACTIVATE_BUS_MPU(Doc.of(INTEGER)), //
		TEST_WEOS_ALL_CORE0_TASKS_PRIVILEGED(Doc.of(INTEGER)), //
		OV_CUTOFF_MIN_TEMP(Doc.of(INTEGER) //
				.unit(MILLIVOLT)), //
		OV_CUTOFF_MAX_TEMP(Doc.of(INTEGER) //
				.unit(MILLIVOLT)), //
		UV_CUTOFF_MIN_TEMP(Doc.of(INTEGER) //
				.unit(MILLIVOLT)), //
		UV_CUTOFF_MAX_TEMP(Doc.of(INTEGER) //
				.unit(MILLIVOLT)), //
		OV_SAFE_MIN_TEMP(Doc.of(INTEGER) //
				.unit(MILLIVOLT)), //
		OV_SAFE_MAX_TEMP(Doc.of(INTEGER) //
				.unit(MILLIVOLT)), //
		UV_SAFE_MIN_TEMP(Doc.of(INTEGER) //
				.unit(MILLIVOLT)), //
		UV_SAFE_MAX_TEMP(Doc.of(INTEGER) //
				.unit(MILLIVOLT)), //
		CURRENT_CHARGE_MIN_TEMP(Doc.of(INTEGER) //
				.unit(AMPERE)), //
		CURRENT_CHARGE_MAX_TEMP(Doc.of(INTEGER) //
				.unit(AMPERE)), //
		CURRENT_DISCHARGE_MIN_TEMP(Doc.of(INTEGER) //
				.unit(AMPERE)), //
		CURRENT_DISCHARGE_MAX_TEMP(Doc.of(INTEGER) //
				.unit(AMPERE)), //

		SOC_MIN(Doc.of(INTEGER) //
				.unit(PERCENT)), //
		SOC_MAX(Doc.of(INTEGER) //
				.unit(PERCENT)), //
		LOCK_STATUS_CRC_MSB(Doc.of(INTEGER) //
				.text("CRC Value for LockStatus")), //
		LOCK_STATUS_CRC_LSB(Doc.of(INTEGER)), //

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
	 * Gets the Channel for {@link ChannelId#SOFTWARE_VERSION_MAJOR}.
	 *
	 * @return the Channel
	 */
	default IntegerReadChannel getSoftwareVersionMajorChannel() {
		return this.channel(ChannelId.SOFTWARE_VERSION_MAJOR);
	}

	/**
	 * Gets the Software Version Major, see
	 * {@link ChannelId#SOFTWARE_VERSION_MAJOR}.
	 *
	 * @return the Software Version.
	 */
	default Value<Integer> getSoftwareVersionMajor() {
		return this.getSoftwareVersionMajorChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#SOFTWARE_VERSION_MINOR}.
	 *
	 * @return the Channel
	 */
	default IntegerReadChannel getSoftwareVersionMinorChannel() {
		return this.channel(ChannelId.SOFTWARE_VERSION_MINOR);
	}

	/**
	 * Gets the Software Version Minor, see
	 * {@link ChannelId#SOFTWARE_VERSION_MINOR}.
	 *
	 * @return the Software Version.
	 */
	default Value<Integer> getSoftwareVersionMinor() {
		return this.getSoftwareVersionMinorChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#SOFTWARE_VERSION_PATCH}.
	 *
	 * @return the Channel
	 */
	default IntegerReadChannel getSoftwareVersionPatchChannel() {
		return this.channel(ChannelId.SOFTWARE_VERSION_PATCH);
	}

	/**
	 * Gets the Software Version Path, see {@link ChannelId#SOFTWARE_VERSION_PATCH}.
	 *
	 * @return the Software Version.
	 */
	default Value<Integer> getSoftwareVersionPatch() {
		return this.getSoftwareVersionPatchChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#SOFTWARE_VERSION_OUTDATED}.
	 *
	 * @return the Channel
	 */
	default StateChannel getSoftwareVersionOutdatedChannel() {
		return this.channel(ChannelId.SOFTWARE_VERSION_OUTDATED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#SOFTWARE_VERSION_OUTDATED} Channel.
	 *
	 * @param value the next value
	 */
	default void _setSoftwareVersionOutdated(boolean value) {
		this.getSoftwareVersionOutdatedChannel()._setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#RESET_BATTERY_COMMAND}.
	 *
	 * @return the Channel
	 */
	default WriteChannel<Boolean> getResetBatteryCommandChannel() {
		return this.channel(ChannelId.RESET_BATTERY_COMMAND);
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
	 * Gets the Channel for {@link ChannelId#SYSTEM_CONTACTOR_STATE}.
	 *
	 * @return the Channel
	 */
	default EnumReadChannel getSystemContactorStateChannel() {
		return this.channel(ChannelId.SYSTEM_CONTACTOR_STATE);
	}

	/**
	 * Gets the ContactorState, see {@link ChannelId#SYSTEM_CONTACTOR_STATE}.
	 *
	 * @return the Channel {@link ChannelId#SYSTEM_CONTACTOR_STATE}.
	 */
	default ContactorState getSystemContactorState() {
		return this.getSystemContactorStateChannel().value().asEnum();
	}

	/**
	 * Gets the Channel for {@link ChannelId#BATTERY_STATE}.
	 *
	 * @return the Channel
	 */
	default EnumReadChannel getBatteryStateChannel() {
		return this.channel(ChannelId.BATTERY_STATE);
	}

	/**
	 * Gets the ContactorState, see {@link ChannelId#BATTERY_STATE}.
	 *
	 * @return the Channel {@link ChannelId#BATTERY_STATE}.
	 */
	default BmsState getBatteryState() {
		return this.getBatteryStateChannel().value().asEnum();
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_STATE_REQUEST}.
	 *
	 * @return the Channel
	 */
	default WriteChannel<CommandStateRequest> getCommandStateRequestChannel() {
		return this.channel(ChannelId.COMMAND_STATE_REQUEST);
	}

	/**
	 * Gets the CommandStateRequest, see {@link ChannelId#COMMAND_STATE_REQUEST}.
	 *
	 * @return the Channel {@link Value}
	 */
	default CommandStateRequest getCommandStateRequest() {
		return this.getCommandStateRequestChannel().value().asEnum();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_STATE_REQUEST} Channel.
	 *
	 * @param value the next value
	 */
	default void _setCommandStateRequest(CommandStateRequest value) {
		this.getCommandStateRequestChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_STATE_REQUEST} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	default void setCommandStateRequest(CommandStateRequest value) throws OpenemsNamedException {
		this.getCommandStateRequestChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_ACTIVATE_BALANCING}.
	 *
	 * @return the Channel
	 */
	default IntegerWriteChannel getCommandActivateBalancingChannel() {
		return this.channel(ChannelId.COMMAND_ACTIVATE_BALANCING);
	}

	/**
	 * Gets the CommandActivateBalancing, see
	 * {@link ChannelId#COMMAND_ACTIVATE_BALANCING}.
	 *
	 * @return the Channel {@link Value}
	 */
	default int getCommandActivateBalancing() {
		return this.getCommandActivateBalancingChannel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_ACTIVATE_BALANCING} Channel.
	 *
	 * @param value the next value
	 */
	default void _setCommandActivateBalancing(int value) {
		this.getCommandActivateBalancingChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_ACTIVATE_BALANCING}
	 * Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	default void setCommandActivateBalancing(int value) throws OpenemsNamedException {
		this.getCommandActivateBalancingChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_BALANCING_THRESHOLD}.
	 *
	 * @return the Channel
	 */
	default IntegerWriteChannel getCommandBalancingThresholdChannel() {
		return this.channel(ChannelId.COMMAND_BALANCING_THRESHOLD);
	}

	/**
	 * Gets the CommandBalancingThreshold, see
	 * {@link ChannelId#COMMAND_BALANCING_THRESHOLD}.
	 *
	 * @return the Channel {@link Value}
	 */
	default int getCommandBalancingThreshold() {
		return this.getCommandBalancingThresholdChannel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_BALANCING_THRESHOLD} Channel.
	 *
	 * @param value the next value
	 */
	default void _setCommandBalancingThreshold(int value) {
		this.getCommandBalancingThresholdChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_BALANCING_THRESHOLD}
	 * Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	default void setCommandBalancingThreshold(int value) throws OpenemsNamedException {
		this.getCommandBalancingThresholdChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT}.
	 *
	 * @return the Channel
	 */
	default IntegerWriteChannel getCommandCustomCurrentChargeLimitChannel() {
		return this.channel(ChannelId.COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT);
	}

	/**
	 * Gets the PreChargeControl, see
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT}.
	 *
	 * @return the Channel {@link Value}
	 */
	default int getCommandCustomCurrentChargeLimit() {
		return this.getCommandCustomCurrentChargeLimitChannel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT} Channel.
	 *
	 * @param value the next value
	 */
	default void _setCommandCustomCurrentChargeLimit(int value) {
		this.getCommandCustomCurrentChargeLimitChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT}
	 * Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	default void setCommandCustomCurrentChargeLimit(int value) throws OpenemsNamedException {
		this.getCommandCustomCurrentChargeLimitChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT}.
	 *
	 * @return the Channel
	 */
	default IntegerWriteChannel getCommandCustomCurrentDischargeLimitChannel() {
		return this.channel(ChannelId.COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT);
	}

	/**
	 * Gets the PreChargeControl, see
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT}.
	 *
	 * @return the Channel {@link Value}
	 */
	default int getCommandCustomCurrentDischargeLimit() {
		return this.getCommandCustomCurrentDischargeLimitChannel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT} Channel.
	 *
	 * @param value the next value
	 */
	default void _setCommandCustomCurrentDischargeLimit(int value) {
		this.getCommandCustomCurrentDischargeLimitChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the
	 * {@link ChannelId#COMMAND_CUSTOM_CURRENT_DISCHARGE_LIMIT} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	default void setCommandCustomCurrentDischargeLimit(int value) throws OpenemsNamedException {
		this.getCommandCustomCurrentDischargeLimitChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_RESET_1}.
	 *
	 * @return the Channel
	 */
	default IntegerWriteChannel getCommandReset1Channel() {
		return this.channel(ChannelId.COMMAND_RESET_1);
	}

	/**
	 * Gets the PreChargeControl, see {@link ChannelId#COMMAND_RESET_1}.
	 *
	 * @return the Channel {@link Value}
	 */
	default int getCommandReset1() {
		return this.getCommandReset1Channel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#COMMAND_RESET_1}
	 * Channel.
	 *
	 * @param value the next value
	 */
	default void _setCommandReset1(int value) {
		this.getCommandReset1Channel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_RESET_1} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	default void setCommandReset1(int value) throws OpenemsNamedException {
		this.getCommandReset1Channel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_RESET_2}.
	 *
	 * @return the Channel
	 */
	default IntegerWriteChannel getCommandReset2Channel() {
		return this.channel(ChannelId.COMMAND_RESET_2);
	}

	/**
	 * Gets the PreChargeControl, see {@link ChannelId#COMMAND_RESET_2}.
	 *
	 * @return the Channel {@link Value}
	 */
	default int getCommandReset2() {
		return this.getCommandReset2Channel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#COMMAND_RESET_2}
	 * Channel.
	 *
	 * @param value the next value
	 */
	default void _setCommandReset2(int value) {
		this.getCommandReset2Channel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_RESET_2} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	default void setCommandReset2(int value) throws OpenemsNamedException {
		this.getCommandReset2Channel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COMMAND_ALIVE_COUNTER}.
	 *
	 * @return the Channel
	 */
	default IntegerWriteChannel getCommandAliveCounterChannel() {
		return this.channel(ChannelId.COMMAND_ALIVE_COUNTER);
	}

	/**
	 * Gets the PreChargeControl, see {@link ChannelId#COMMAND_ALIVE_COUNTER}.
	 *
	 * @return the Channel {@link Value}
	 */
	default int getCommandAliveCounter() {
		return this.getCommandAliveCounterChannel().value().asOptional().get();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COMMAND_ALIVE_COUNTER} Channel.
	 *
	 * @param value the next value
	 */
	default void _setCommandAliveCounter(int value) {
		this.getCommandAliveCounterChannel().setNextValue(value);
	}

	/**
	 * Writes the value to the {@link ChannelId#COMMAND_ALIVE_COUNTER} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	default void setCommandAliveCounter(int value) throws OpenemsNamedException {
		this.getCommandAliveCounterChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#PACK_HIGH_VOLTAGE_PLUS}.
	 *
	 * @return the Channel
	 */
	default DoubleReadChannel getPackHighVoltagePlusChannel() {
		return this.channel(ChannelId.PACK_HIGH_VOLTAGE_PLUS);
	}

	/**
	 * Gets the Pack voltage. See {@link ChannelId#PACK_HIGH_VOLTAGE_PLUS}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Double> getPackHighVoltagePlus() {
		return this.getPackHighVoltagePlusChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#STRING_EVENT_COMMUNICATION_ERROR}.
	 *
	 * @return the Channel
	 */
	default Channel<Boolean> getStringEventCommunicationErrorChannel() {
		return this.channel(ChannelId.STRING_EVENT_COMMUNICATION_ERROR);
	}

	/**
	 * Gets the StringEventCommunicationError, see
	 * {@link ChannelId#STRING_EVENT_COMMUNICATION_ERROR}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Boolean> getStringEventCommunicationError() {
		return this.getStringEventCommunicationErrorChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#STRING_MODULE_COUNT}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getStringModuleCountChannel() {
		return this.channel(ChannelId.STRING_MODULE_COUNT);
	}

	/**
	 * Gets the channel value see {@link ChannelId#STRING_MODULE_COUNT}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getStringModuleCount() {
		return this.getStringModuleCountChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#BATTERY_SOC}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getBatterySocChannel() {
		return this.channel(ChannelId.BATTERY_SOC);
	}

	/**
	 * Gets the channel value see {@link ChannelId#BATTERY_SOC}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getBatterySoc() {
		return this.getBatterySocChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#NUMBER_OF_MODULES}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getNumberOfModulesChannel() {
		return this.channel(ChannelId.NUMBER_OF_MODULES);
	}

	/**
	 * Gets the channel value see {@link ChannelId#NUMBER_OF_MODULES}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getNumberOfModules() {
		return this.getNumberOfModulesChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#NUMBER_OF_CELLS}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getNumberOfCellsChannel() {
		return this.channel(ChannelId.NUMBER_OF_CELLS);
	}

	/**
	 * Gets the channel value see {@link ChannelId#NUMBER_OF_CELLS}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getNumberOfCells() {
		return this.getNumberOfCellsChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#NUMBER_OF_CELLS_CSC}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getNumberOfCellsCscChannel() {
		return this.channel(ChannelId.NUMBER_OF_CELLS_CSC);
	}

	/**
	 * Gets the channel value see {@link ChannelId#NUMBER_OF_CELLS_CSC}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getNumberOfCellsCsc() {
		return this.getNumberOfCellsCscChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#NUMBER_OF_TEMPERATURE_SENSORS}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getNumberOfTemperatureSensorsChannel() {
		return this.channel(ChannelId.NUMBER_OF_TEMPERATURE_SENSORS);
	}

	/**
	 * Gets the channel value see {@link ChannelId#NUMBER_OF_TEMPERATURE_SENSORS}.
	 *
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getNumberOfTemperatureSensors() {
		return this.getNumberOfTemperatureSensorsChannel().value();
	}

	/**
	 * Gets the Channel for
	 * {@link ChannelId#NUMBER_OF_TEMPERATURE_SENSORS_PER_MODULE}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getNumberOfTemperatureSensorsPerModuleChannel() {
		return this.channel(ChannelId.NUMBER_OF_TEMPERATURE_SENSORS_PER_MODULE);
	}

	/**
	 * Gets the channel value see
	 * {@link ChannelId#NUMBER_OF_TEMPERATURE_SENSORS_PER_MODULE}.
	 *
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getNumberOfTemperatureSensorsPerModule() {
		return this.getNumberOfTemperatureSensorsPerModuleChannel().value();
	}

}
