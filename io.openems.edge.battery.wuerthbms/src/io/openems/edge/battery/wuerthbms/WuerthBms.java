package io.openems.edge.battery.wuerthbms;

import static io.openems.common.channel.AccessMode.READ_ONLY;
import static io.openems.common.channel.AccessMode.READ_WRITE;
import static io.openems.common.channel.AccessMode.WRITE_ONLY;
import static io.openems.common.channel.Level.FAULT;
import static io.openems.common.channel.Level.INFO;
import static io.openems.common.channel.Level.WARNING;
import static io.openems.common.channel.Unit.AMPERE;
import static io.openems.common.channel.Unit.AMPERE_HOURS;
import static io.openems.common.channel.Unit.DEGREE_CELSIUS;
import static io.openems.common.channel.Unit.KILOJOULE;
import static io.openems.common.channel.Unit.KILOWATT_HOURS;
import static io.openems.common.channel.Unit.MILLIAMPERE;
import static io.openems.common.channel.Unit.MILLISECONDS;
import static io.openems.common.channel.Unit.MILLIVOLT;
import static io.openems.common.channel.Unit.MINUTE;
import static io.openems.common.channel.Unit.OHM;
import static io.openems.common.channel.Unit.PERCENT;
import static io.openems.common.channel.Unit.THOUSANDTH;
import static io.openems.common.channel.Unit.VOLT;
import static io.openems.common.channel.Unit.WATT_HOURS;
import static io.openems.common.types.OpenemsType.BOOLEAN;
import static io.openems.common.types.OpenemsType.DOUBLE;
import static io.openems.common.types.OpenemsType.INTEGER;
import static io.openems.common.types.OpenemsType.STRING;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.api.BatteryErrorAcknowledge;
import io.openems.edge.battery.protection.BatteryVoltageProtection;
import io.openems.edge.battery.wuerthbms.enums.CommandStateRequest;
import io.openems.edge.battery.wuerthbms.enums.CvcmFaultCause;
import io.openems.edge.battery.wuerthbms.enums.ShutdownPathCause;
import io.openems.edge.battery.wuerthbms.enums.StartUpPathTestFailedAt;
import io.openems.edge.battery.wuerthbms.enums.SystemBalancingState;
import io.openems.edge.battery.wuerthbms.enums.SystemContactorState;
import io.openems.edge.battery.wuerthbms.enums.SystemGlobalState;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine.State;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.EnumReadChannel;
import io.openems.edge.common.channel.IntegerDoc;
import io.openems.edge.common.channel.IntegerWriteChannel;
import io.openems.edge.common.channel.WriteChannel;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;

public interface WuerthBms
		extends Battery, BatteryErrorAcknowledge, OpenemsComponent, StartStoppable, BatteryVoltageProtection {

	/**
	 * Gets the target Start/Stop mode from config or StartStop-Channel.
	 *
	 * @return {@link StartStop}
	 */
	StartStop getStartStopTarget();

	enum ChannelId implements io.openems.edge.common.channel.ChannelId {

		/**
		 * State of the battery. (SystemGlobalState)
		 */
		SYSTEM_GLOBAL_STATE(Doc.of(SystemGlobalState.values())),

		PRECHARGE_ENERGY(Doc.of(INTEGER)//
				.unit(KILOJOULE)//
				.text("Energy Accumulated over last precharge period")),

		SYSTEM_CONTACTOR_STATE(Doc.of(SystemContactorState.values())),

		SYSTEM_BALANCING_STATE(Doc.of(SystemBalancingState.values())),

		RELAY_FEEDBACK_0_AUX_0(Doc.of(INTEGER)//
				.unit(MILLIVOLT)//
				.text("Relay 0 Feedback HighSide")), //

		RELAY_FEEDBACK_0_AUX_1(Doc.of(INTEGER)//
				.unit(MILLIVOLT)//
				.text("Relay 0 Feedback LowSide")), //

		RELAY_FEEDBACK_1_AUX_0(Doc.of(INTEGER)//
				.unit(MILLIVOLT)//
				.text("Relay 1 Feedback HighSide")), //

		PACK_CURRENT(Doc.of(INTEGER)//
				.unit(AMPERE)), //

		RELAY_FEEDBACK_1_AUX_1(Doc.of(INTEGER)//
				.unit(MILLIVOLT)//
				.text("Relay 1 Feedback LowSide")), //

		PACK_REMAINING_CAPACITY(Doc.of(INTEGER)//
				.unit(AMPERE_HOURS)//
				.text("Show the remaining Capacity")), //

		CONTACTOR_SOH(Doc.of(INTEGER)//
				.unit(PERCENT)//
				.text("State of Health of the Contactors. Check bms_configurator excel file")), //

		PACK_SHUNT_TEMPERATURE(Doc.of(DOUBLE)//
				.unit(DEGREE_CELSIUS)//
				.text("Shunt temperature")),

		PACK_STATE_ENERGY(Doc.of(DOUBLE)//
				.unit(KILOWATT_HOURS)//
				.text("Remaining energy")),

		PACK_VOLTAGE(Doc.of(INTEGER)//
				.unit(VOLT)//
				.text("Total voltage of the pack")), //

		PACK_HIGH_VOLTAGE_PLUS(Doc.of(INTEGER)//
				.unit(VOLT)//
				.text("Plus side voltage after contactor is closed")),

		SW_VERSION_MAJOR(Doc.of(INTEGER)//
				.text("SW Version Major Value (Vx.0.0)")),

		SW_VERSION_MINOR(Doc.of(INTEGER)//
				.text("SW Version Minor Value (V0.x.0)")),

		SW_VERSION_PATCH(Doc.of(INTEGER)//
				.text("SW Version Path Value (V0.0.x)")),

		CELL_OT_CUTOFF(Doc.of(FAULT)//
				.text("Temperature bigger than Cutoff threshold")), //
		CELL_OT_MAX(Doc.of(FAULT)//
				.text("Temperature bigger than maximum threshold")), //
		CELL_OT_WARN(Doc.of(WARNING)//
				.text("Temperature bigger than warning threshold")), //
		CELL_OV_CUTOFF(Doc.of(FAULT)//
				.text("Voltage bigger than cutoff threshold")), //
		CELL_OV_MAX(Doc.of(FAULT)//
				.text("Voltage bigger than maximum threshold")), //
		CELL_OV_WARN(Doc.of(WARNING)//
				.text("Voltage bigger than warning threshold")), //
		CELL_UT_CUTOFF(Doc.of(FAULT)//
				.text("Voltage smaller than warning threshold")), //
		CELL_UT_MAX(Doc.of(FAULT)//
				.text("Temperature smaller than maximum threshold")), //
		CELL_UT_WARN(Doc.of(WARNING)//
				.text("Temperature smaller than warning threshold")), //
		CELL_UV_CUTOFF(Doc.of(FAULT)//
				.text("Voltage smaller than cutoff threshold")), //
		CELL_UV_MAX(Doc.of(FAULT)//
				.text("Voltage smaller than minimum allowed threshold")), //
		CELL_UV_WARN(Doc.of(WARNING)//
				.text("Voltage smaller than warning threshold")), //

		COMMUNICATION_ERROR(Doc.of(FAULT)//
				.text("Fail in CSC communication")), //

		CONT_NEGATIVE_ERR(Doc.of(WARNING)//
				.text("String event negative error")), //
		CONT_POSITIVE_ERR(Doc.of(WARNING)//
				.text("String event positive error")), //

		CURRENT_OC_CHARGE(Doc.of(FAULT)//
				.text("Overcurrent for charge state")), //

		CURRENT_OC_DISCHARGE(Doc.of(FAULT)//
				.text("Overcurrent for discharge state")), //

		CURRENT_MEASURE_ERROR(Doc.of(WARNING)//
				.text("String event current measure error")),

		INSULATION_ERROR(Doc.of(WARNING)//
				.text("String event insulation error")),

		VOLT_PLAUSIBILITY_ERROR(Doc.of(FAULT)//
				.text("Sum of cell voltages or sum of the CSC voltages do not match total voltage")),

		SOC_ERROR(Doc.of(INFO)//
				.text("SoC lower than threshold")), //

		SOH_ERROR(Doc.of(WARNING)//
				.text("String event soh error")),

		STRING_CONNECTED(Doc.of(WARNING)//
				.text("String connected")), //

		TEMP_DIFFERENCE_ERROR(Doc.of(WARNING)//
				.text("String event temperature difference error")),

		BALANCING_ERROR(Doc.of(WARNING)//
				.text("Balancing error")), //

		SOC_HIGH_ERROR(Doc.of(INFO)//
				.text("SoC bigger than threshold")), //

		SOC_RECALIBRATION_WARNING(Doc.of(WARNING)//
				.text("SoC calibration needed")),

		SYSTEM_LOCK_STATUS(Doc.of(FAULT)//
				.text("System lock status")),

		SHUTDOWN_PATH_ACTIVE(Doc.of(FAULT)//
				.text("Shutdown path active - Sets in case of safety events")),

		MCU_EVENT_DIE_TEMP(Doc.of(WARNING)//
				.text("Threshold failure of MCU temperature")),

		SHUNT_OVERTEMPERATURE(Doc.of(WARNING)//
				.text("Shunt temperature over threshold")),

		PRECHARGE_FAILED(Doc.of(FAULT)//
				.text("Threshold for Precharge Timeout passed")),

		KL_30_C_FAULT(Doc.of(FAULT)//
				.text("KL30C measurement threshold failed")),

		SHUNT_CALIBRATION_ERROR(Doc.of(FAULT)//
				.text("Shunt calibration procedure is not correct or value is out of range")),

		SET_IP_FAIL(Doc.of(WARNING)//
				.text("Set IP fail")),

		FEEDBACK_BROKEN(Doc.of(WARNING)//
				.text("Unintentional opening of contactors in closing state")),

		PRECHARGE_ENERGY_MAX(Doc.of(WARNING)//
				.text("Threshold energy on precharge resistor crossed")),

		CONTACTOR_SOH_WARNING(Doc.of(WARNING)//
				.text("SOH below threshold")),

		/**
		 * Since version 1.0.09 this number is variable.
		 */
		STRING_MODULE_COUNT(Doc.of(INTEGER)//
				.accessMode(READ_ONLY)//
				.text("Total number of Modules")),

		// write registers
		COMMAND_STATE_REQUEST(Doc.of(CommandStateRequest.values())//
				.accessMode(READ_WRITE)), //

		COMMAND_RESET_1(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)),

		COMMAND_RESET_2(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)),

		COMMAND_ALIVE_COUNTER(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)//
				.text("This value should be incremented every time the message is sent.")),

		COMMAND_RESET_SYSTEM_LOCK_MSB(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)//
				.text("Maximum Allowed Current for Discharge (0-default Maximum Current)")), //

		COMMAND_RESET_SYSTEM_LOCK_LSB(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		COMMAND_RESET_SYSTEM_LOCK_CRC_MSB(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		COMMAND_RESET_SYSTEM_LOCK_CRC_LSB(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		COMMAND_SOH_RESET(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		COMMAND_SOH_HIGH_RESOLUTION_LSB(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)),

		COMMAND_SOH_HIGH_RESOLUTION_MSB(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		REGULATION_REMAINING_CAPACITY(Doc.of(INTEGER)//
				.unit(WATT_HOURS)//
				.accessMode(READ_WRITE)), //

		REGULATION_REMAINING_POWER_CAPABILITY(Doc.of(INTEGER).unit(PERCENT)//
				.accessMode(READ_WRITE)//
				.text("Relation of energy in / out (after SOC recalibration)")), //

		REGULATION_ROUND_TRIP_EFFICIENCY(Doc.of(INTEGER).unit(WATT_HOURS)//
				.accessMode(READ_WRITE)//
				.text("Capacity per month")), //

		REGULATION_SELF_DISCHARGING_RATE(Doc.of(INTEGER).unit(WATT_HOURS)//
				.accessMode(READ_WRITE)), //

		REGULATION_ENERGY_THROUGHPUT_OVERALL_IN_MSB(Doc.of(INTEGER)//
				.unit(WATT_HOURS)//
				.accessMode(READ_WRITE)), //

		REGULATION_ENERGY_THROUGHPUT_OVERALL_IN_LSB(Doc.of(INTEGER)//
				.unit(WATT_HOURS)//
				.accessMode(READ_WRITE)), //

		REGULATION_ENERGY_THROUGHPUT_OVERALL_OUT_MSB(Doc.of(INTEGER)//
				.unit(WATT_HOURS)//
				.accessMode(READ_WRITE)), //

		REGULATION_ENERGY_THROUGHPUT_OVERALL_OUT_LSB(Doc.of(INTEGER)//
				.unit(WATT_HOURS)//
				.accessMode(READ_WRITE)), //

		REGULATION_NUM_CHARGE_DISCHARGE_CYCLES(Doc.of(INTEGER)//
				.unit(PERCENT)//
				.accessMode(READ_WRITE)), //

		SHUNT_CALIBRATION_MSB(Doc.of(INTEGER)//
				.accessMode(WRITE_ONLY)), //

		SHUNT_CALIBRATION_LSB(Doc.of(INTEGER)//
				.accessMode(WRITE_ONLY)), //

		MAC_ADDRESS_OCTET0(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET1(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET2(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET3(Doc.of(INTEGER).accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET4(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		MAC_ADDRESS_OCTET5(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		IP_BYTE0(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //
		IP_BYTE1(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //
		IP_BYTE2(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //
		IP_BYTE3(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //
		GW_BYTE0(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //
		GW_BYTE1(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //
		GW_BYTE2(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //
		GW_BYTE3(Doc.of(INTEGER)//
				.accessMode(READ_WRITE)), //

		HW_SERIAL_NUMBER_CODE_0(Doc.of(INTEGER)//
				.text("Two digit hardware number part")//
				.accessMode(READ_WRITE)), //
		HW_SERIAL_NUMBER_CODE_1(Doc.of(INTEGER)//
				.text("Four digit hardware number part")//
				.accessMode(READ_WRITE)), //
		HW_SERIAL_NUMBER_CODE_2(Doc.of(INTEGER)//
				.text("Four digit hardware number part")//
				.accessMode(READ_WRITE)), //
		HW_SERIAL_NUMBER_LETTER(Doc.of(STRING)//
				.text("Two letter hardware number part")//
				.accessMode(READ_WRITE)), //

		STATE_MACHINE(Doc.of(State.values())//
				.text("Current State of State-Machine")),

		RUN_FAILED(Doc.of(WARNING)//
				.text("Running the Logic failed")),

		RESET_BATTERY_COMMAND(Doc.of(BOOLEAN)//
				.accessMode(WRITE_ONLY)//
				.text("Reset the battery")),
		PACK_STATE_SOC(new IntegerDoc()//
				.accessMode(READ_ONLY)//
				.unit(THOUSANDTH)), //
		// New protocol
		PACK_LIMIT_MAX_BATTERY_VOLTAGE(Doc.of(INTEGER)//
				.unit(VOLT)//
				.text("Maximum battery voltage allowed")),
		PACK_LIMIT_MIN_BATTERY_VOLTAGE(Doc.of(INTEGER)//
				.unit(VOLT)//
				.text("Minimum battery voltage")),
		CELL_VOLT_PLAUSIBILITY(Doc.of(INTEGER)//
				.text("Checks the deviation between neighbour cells voltages - the number shows which CSC has this problem")), //
		STACK_CELLS_PLAUSIBILITY(Doc.of(INTEGER)//
				.text("Checks the deviation between stack and summed up cell voltages - the number shows which CSC has this problem")), //
		COM_LAST_FAILED_CSC(Doc.of(INTEGER)//
				.text("Shows the number for which CSC the board is not able to communicate with")), //
		KL_30(Doc.of(INTEGER)//
				.unit(VOLT)), //
		KL_30C(Doc.of(INTEGER)//
				.unit(VOLT)), //
		CELL_OPEN_WIRE_DETECTION(Doc.of(INTEGER)//
				.text("Cell number where open wire was detected")), //
		CSC_OPEN_WIRE_DETECTION(Doc.of(INTEGER)//
				.text("CSC number where open wire was detected")), //
		CVCM_FAULT_CASE(Doc.of(CvcmFaultCause.values())//
				.text("Internal faults related to current measurement chip")), //
		DIAG_LAST_FAILED_CSC(Doc.of(INTEGER)//
				.text("Shows the CSC number where some initialization tests failed or where the CSC could not be initialized.")), //
		LATENT_LAST_FAILED_CSC(Doc.of(INTEGER)//
				.text("Shows the CSC number failed in the latent tests")), //

		PACK_CURRENT_MA(Doc.of(INTEGER)//
				.unit(MILLIAMPERE)//
				.text("Shows the mA value of the current(used if necessary to get a bigger resolution) 0mA - 1000mA")), //
		AVG_CELL_VOLTAGE_STRING(Doc.of(INTEGER)//
				.unit(MILLIVOLT)//
				.text("Average Cell Voltage on String")), //
		AVG_TEMPERATURE_STRING(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)//
				.text("Average Temperature on String")), //

		SHUTDOWN_PATH_CAUSE(Doc.of(ShutdownPathCause.values())), //
		START_UP_PATH_FAILED_AT(Doc.of(StartUpPathTestFailedAt.values())//
				.text("Shows at what moment the startup test has failed. Need to run regular test to identify if the contactors are working properly")), //

		CFG_MODULE_CNT(Doc.of(INTEGER)//
				.accessMode(READ_ONLY)//
				.onChannelChange(WuerthBmsImpl::initializeDynamicChannels)//
				.text("Total number of modules")),
		CFG_CELL_CNT(Doc.of(INTEGER)//
				.accessMode(READ_ONLY)//
				.onChannelChange(WuerthBmsImpl::initializeDynamicChannels)//
				.text("Total number of cells")),
		CFG_TEMP_SENS_CNT(Doc.of(INTEGER)//
				.accessMode(READ_ONLY)//
				.onChannelChange(WuerthBmsImpl::initializeDynamicChannels)//
				.text("Total number of temperature senses")),
		CFG_TEMP_SENS_CNT_PER_MODULE(Doc.of(INTEGER)//
				.accessMode(READ_ONLY)//
				.onChannelChange(WuerthBmsImpl::initializeDynamicChannels)), //
		CFG_CSC_CELL_CSC_CNT(Doc.of(INTEGER)//
				.accessMode(READ_ONLY)//
				.onChannelChange(WuerthBmsImpl::initializeDynamicChannels)), //
		CFG_CSC_PER_MODULE(Doc.of(INTEGER)//
				.accessMode(READ_ONLY)//
				.onChannelChange(WuerthBmsImpl::initializeDynamicChannels)), //
		CFG_CSC_TEMP_SENS_CSC(Doc.of(INTEGER)), //
		CFG_CSC_TEMP_SENSORS(Doc.of(INTEGER)), //
		CFG_CSC_TEMP_T4(Doc.of(INTEGER)), //
		CFG_CSC_NTC_RNTC(Doc.of(INTEGER)//
				.unit(OHM)), //
		CFG_CSC_NTC_REFTEMP(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		CFG_CSC_NTC_REFRES(Doc.of(INTEGER)//
				.unit(OHM)), //
		CFG_CSC_NTC_BETA(Doc.of(INTEGER)), //
		CFG_CSC_NTC_CHANNELS(Doc.of(INTEGER)), //
		CFG_BATT_CAPACITY_AH(Doc.of(INTEGER)//
				.unit(AMPERE_HOURS)), //
		CFG_BATT_RELAX_PERIOD_MIN(Doc.of(INTEGER)//
				.unit(MINUTE)), //
		CFG_BATT_CELL_SAFE_OV_V(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CFG_BATT_CELL_CUTOFF_OV_V(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CFG_BATT_CELL_WARN_OV_V(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CFG_BATT_CELL_SAFE_UV_V(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CFG_BATT_CELL_CUTOFF_UV_V(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CFG_BATT_CELL_WARN_UV_V(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CFG_BATT_CELL_CUTOFF_VOLTAGE_FTTI_MS(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		CFG_BATT_CELL_SAFE_VOLTAGE_FTTI_MS(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		CFG_BATT_CELL_SAFETY_TEMP_MAX(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		CFG_BATT_CELL_OPERATION_TEMP_MAX(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		CFG_BATT_CELL_WARN_TEMP_MAX(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		CFG_BATT_CELL_SAFETY_TEMP_MIN(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		CFG_BATT_CELL_OPERATION_TEMP_MIN(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		CFG_BATT_CELL_WARN_TEMP_MIN(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		CFG_BATT_CELL_CUTOFF_TEMPERATURE_FTTI_MS(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		CFG_BATT_CELL_SAFE_TEMPERATURE_FTTI_MS(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		CFG_BATT_STRING_MIN_V(Doc.of(INTEGER)//
				.unit(VOLT)), //
		CFG_BATT_STRING_MAX_V(Doc.of(INTEGER)//
				.unit(VOLT)), //
		CONTACTOR_SOH_MIN_WARNING(Doc.of(INTEGER)//
				.unit(PERCENT)//
				.text("Configuration Warning Limit for Contactor SOH")), //
		SOC_MIN_WARNING(Doc.of(INTEGER)//
				.unit(PERCENT)//
				.text("Configuration Warning Limit for SOC")), //
		CONTACTOR_FEEDBACK_VOLTAGE_TOLERANCE(Doc.of(INTEGER)//
				.unit(MILLIVOLT)//
				.text("Internal parameter in BMS -> Voltage tolerance used for contactor feedbacks")), //
		PRECHARGE_MAX_POWER_DISSIPATION_J(Doc.of(INTEGER)//
				.text("Actual energy flowing through the prePrecharge Resistor")), //
		CFG_CHARGE_CURRENT_LIMIT_TOLERANCE_A(Doc.of(INTEGER)//
				.unit(AMPERE)//
				.text("Tolerance for the Current when system is in Charge State")), //
		CFG_SHUNT_TEMPERATURE_HIGH(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		CFG_BALANCE_ACTIVATE(Doc.of(BOOLEAN)), //
		CFG_BALANCING_ACTIVATE_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CFG_BALANCING_DEACTIVE_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CFG_BALANCING_MIN_CELL_VOLTAGE_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CFG_BATT_PLAUS_THRESHOLD_PERCENT(Doc.of(INTEGER)//
				.unit(PERCENT)), //
		CFG_BMS_IDLE_CURRENT_ABS_MA(Doc.of(INTEGER)//
				.unit(MILLIAMPERE)), //
		CFG_BMS_MAXIMUM_SOC(Doc.of(INTEGER)//
				.unit(PERCENT)), //
		CFG_BMS_MINIMUM_SOC(Doc.of(INTEGER)//
				.unit(PERCENT)), //
		CFG_PRECHARGE_ACTIVE_CURRENT_MA(Doc.of(INTEGER)//
				.unit(MILLIAMPERE)//
				.text("Internal parameter in BMS to define minimum current that can be measured for precharge calculations (currently set to 0)")), //
		CFG_PRECHARGE_RESISTOR_OHMS(Doc.of(INTEGER)//
				.unit(OHM)//
				.text("Configuration of Precharge Resistor value used ")), //
		CFG_PRECHARGE_THRESHOLD(Doc.of(INTEGER)//
				.unit(PERCENT)), //
		CFG_PRECHARGE_TIMEOUT(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		CFG_CONTACTOR_NEGATIVE_TIMEOUT(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		CFG_CONTACTOR_POSITIVE_TIMEOUT(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		CFG_CONTACTOR_UNDERLOAD_CURRENT(Doc.of(INTEGER)//
				.unit(MILLIAMPERE)), //
		CFG_PRECHARGE_ONBOARD(Doc.of(BOOLEAN)), //
		CFG_CONTACTOR_ACTIVATION_TIME_MS(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		TEMPDEP_CURRENT_MONITOR_ACTIVE(Doc.of(BOOLEAN)), //
		TEMPDEP_CURRENT_SHUNT_TOL_ERROR_PERC(Doc.of(INTEGER)//
				.unit(PERCENT)), //
		TEMPDEP_CURRENT_LTC_MEAS_ERROR_PERC(Doc.of(INTEGER)//
				.unit(PERCENT)), //
		TEMPDEP_CURRENT_SHUNT_MAX_ERROR_PERC(Doc.of(INTEGER)//
				.unit(PERCENT)), //
		TEMPDEP_CURRENT_OVERCURRENT_SHUTDOWN_MS(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		OVER_CURRENT_COMPARATOR_ACTIVE(Doc.of(BOOLEAN)), //
		OVER_CURRENT_CURRENT_LIMIT_A(Doc.of(INTEGER)//
				.unit(AMPERE)), //
		OVER_CURRENT_COMPARATOR_LIMIT_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		OVER_CURRENT_OVERCURRENT_SAFETY_MS(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		CELL_MONITORING_DIAG_FTTI_MS(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		DIE_TEMP_LIMIT_WARNING_LOWER_DEGC(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		DIE_TEMP_LIMIT_WARNING_UPPER_DEGC(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		DIE_TEMP_LIMIT_SAFETY_LOWER_DEGC(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		DIE_TEMP_LIMIT_SAFETY_UPPER_DEGC(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		DIE_TEMP_LIMIT_SMU_LOWER_DEGC(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		DIE_TEMP_LIMIT_SMU_UPPER_DEGC(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		CSC_VOLTAGE_MEASUREMENT_ERROR_COMBINED_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CSC_TEMPERATURE_MEASUREMENT_ERROR_COMBINED_DEGC(Doc.of(INTEGER)//
				.unit(DEGREE_CELSIUS)), //
		CSC_VOLTAGE_MEASUREMENT_PLAUSIBILITY_THRESHOLD_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CSC_STACK_VS_SUM_PLAUSIBILITY_THRESHOLD_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CSC_ALLOWED_COM_RETRIES(Doc.of(INTEGER)), //
		CSC_CELLBALANCINGTIME_PER_DIAG_CYCLE_MS(Doc.of(INTEGER)//
				.unit(MILLISECONDS)), //
		BMS_CONTACTOR_INVERTED(Doc.of(BOOLEAN)), //
		RELAY_AUX0_OPEN_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		RELAY_AUX1_OPEN_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		RELAY_AUX0_CLOSED_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		RELAY_AUX1_CLOSED_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		RELAY_AUX_DEVIATION_MAX_MV(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		WEBCM_DEV_ACTIVATE_BALANCING(Doc.of(BOOLEAN)), //
		WEBCM_DEV_ACTIVATE_ALLRUNTIME_CHECKS(Doc.of(BOOLEAN)), //
		WEBCM_DEV_ACTIVATE_RANGE_CHECKS(Doc.of(BOOLEAN)), //
		TEST_WEOS_DEACTIVATE_AREA_CHECK(Doc.of(BOOLEAN)), //
		TEST_WEOS_DEACTIVATE_BUS_MPU(Doc.of(BOOLEAN)), //
		TEST_WEOS_ALL_CORE0_TASKS_PRIVILEGED(Doc.of(BOOLEAN)), //
		OV_CUTOFF_MIN_TEMP(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		OV_CUTOFF_MAX_TEMP(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		UV_CUTOFF_MIN_TEMP(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		UV_CUTOFF_MAX_TEMP(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		OV_SAFE_MIN_TEMP(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		OV_SAFE_MAX_TEMP(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		UV_SAFE_MIN_TEMP(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		UV_SAFE_MAX_TEMP(Doc.of(INTEGER)//
				.unit(MILLIVOLT)), //
		CURRENT_CHARGE_MIN_TEMP(Doc.of(INTEGER)//
				.unit(AMPERE)), //
		CURRENT_CHARGE_MAX_TEMP(Doc.of(INTEGER)//
				.unit(AMPERE)), //
		CURRENT_DISCHARGE_MIN_TEMP(Doc.of(INTEGER)//
				.unit(AMPERE)), //
		CURRENT_DISCHARGE_MAX_TEMP(Doc.of(INTEGER)//
				.unit(AMPERE)), //
		CFG_OVERCURRENT_SAFE_STATE(Doc.of(INTEGER)), //
		CFG_OVER_CURRENT_SAFE_STATE_THRESHOLD(Doc.of(INTEGER)//
				.unit(AMPERE)), //
		CFG_PRECHARGE_MAX_ENERGY_WS(Doc.of(INTEGER)//
				.unit(KILOJOULE)), //

		SOC_MIN(Doc.of(INTEGER)//
				.unit(PERCENT)), //
		SOC_MAX(Doc.of(INTEGER)//
				.unit(PERCENT)), //
		LOCK_STATUS_CRC_MSB(Doc.of(INTEGER)//
				.text("CRC value for Lock Status")), //
		LOCK_STATUS_CRC_LSB(Doc.of(INTEGER)), //
		MODBUS_COMMUNICATION_TO_FEMS_FAILED(Doc.of(FAULT)//
				.text("Modbus Communication to FEMS failed")) //
		; //

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
	 * Gets the Channel for {@link ChannelId#RESET_BATTERY_COMMAND}.
	 *
	 * @return the Channel
	 */
	default WriteChannel<Boolean> getResetBatteryCommandChannel() {
		return this.channel(ChannelId.RESET_BATTERY_COMMAND);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SYSTEM_GLOBAL_STATE}.
	 *
	 * @return the Channel
	 */
	default EnumReadChannel getSystemGlobalStateChannel() {
		return this.channel(ChannelId.SYSTEM_GLOBAL_STATE);
	}

	/**
	 * Gets the ContactorState, see {@link ChannelId#SYSTEM_GLOBAL_STATE}.
	 *
	 * @return the Channel {@link ChannelId#SYSTEM_GLOBAL_STATE}.
	 */
	default SystemGlobalState getSystemGlobalState() {
		return this.getSystemGlobalStateChannel().value().asEnum();
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
	 * Writes the value to the {@link ChannelId#COMMAND_STATE_REQUEST} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	default void setCommandStateRequest(CommandStateRequest value) throws OpenemsNamedException {
		this.getCommandStateRequestChannel().setNextWriteValue(value);
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
	 * Writes the value to the {@link ChannelId#COMMAND_ALIVE_COUNTER} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	default void setCommandAliveCounter(int value) throws OpenemsNamedException {
		this.getCommandAliveCounterChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#CFG_CELL_CNT}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getCfgCellCntChannel() {
		return this.channel(ChannelId.CFG_CELL_CNT);
	}

	/**
	 * Gets the channel value see {@link ChannelId#CFG_CELL_CNT}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getCfgCellCnt() {
		return this.getCfgCellCntChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#CFG_MODULE_CNT}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getCfgModuleCntChannel() {
		return this.channel(ChannelId.CFG_MODULE_CNT);
	}

	/**
	 * Gets the channel value see {@link ChannelId#CFG_MODULE_CNT}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getCfgModuleCnt() {
		return this.getCfgModuleCntChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#CFG_CSC_CELL_CSC_CNT}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getCfgCscCellCscCntChannel() {
		return this.channel(ChannelId.CFG_CSC_CELL_CSC_CNT);
	}

	/**
	 * Gets the channel value see {@link ChannelId#CFG_CSC_CELL_CSC_CNT}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getCfgCscCellCscCnt() {
		return this.getCfgCscCellCscCntChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#CFG_TEMP_SENS_CNT}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getCfgTempSensCntChannel() {
		return this.channel(ChannelId.CFG_TEMP_SENS_CNT);
	}

	/**
	 * Gets the channel value see {@link ChannelId#CFG_TEMP_SENS_CNT}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getCfgTempSensCnt() {
		return this.getCfgTempSensCntChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#CFG_TEMP_SENS_CNT_PER_MODULE}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getCfgTempSensCntPerModuleChannel() {
		return this.channel(ChannelId.CFG_TEMP_SENS_CNT_PER_MODULE);
	}

	/**
	 * Gets the channel value see {@link ChannelId#CFG_TEMP_SENS_CNT_PER_MODULE}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getCfgTempSensCntPerModule() {
		return this.getCfgTempSensCntPerModuleChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#CFG_BATT_CELL_CUTOFF_OV_V}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getCfgBattCellCutoffOvVChannel() {
		return this.channel(ChannelId.CFG_BATT_CELL_CUTOFF_OV_V);
	}

	/**
	 * Gets the channel value see {@link ChannelId#CFG_BATT_CELL_CUTOFF_OV_V}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getCfgBattCellCutoffOvV() {
		return this.getCfgBattCellCutoffOvVChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#CFG_BATT_CELL_CUTOFF_UV_V}.
	 *
	 * @return the Channel
	 */
	default Channel<Integer> getCfgBattCellCutoffUvVChannel() {
		return this.channel(ChannelId.CFG_BATT_CELL_CUTOFF_UV_V);
	}

	/**
	 * Gets the channel value see {@link ChannelId#CFG_BATT_CELL_CUTOFF_UV_V}.
	 *
	 * @return the Channel {@link Value}
	 */
	default Value<Integer> getCfgBattCellCutoffUvV() {
		return this.getCfgBattCellCutoffUvVChannel().value();
	}

	/**
	 * Gets the Channel for {@link ChannelId#MODBUS_COMMUNICATION_TO_FEMS_FAILED}.
	 *
	 * @return the Channel
	 */
	default WriteChannel<Boolean> getModbusCommunicationToFemsFailedChannel() {
		return this.channel(ChannelId.MODBUS_COMMUNICATION_TO_FEMS_FAILED);
	}

	/**
	 * Writes the value to the
	 * {@link ChannelId#MODBUS_COMMUNICATION_TO_FEMS_FAILED}.
	 *
	 * @param value the value.
	 */
	default void setModbusCommunicationToFemsFailed(boolean value) {
		this.getModbusCommunicationToFemsFailedChannel().setNextValue(value);
	}

}
