package io.openems.edge.battery.wuerthbms.version;

import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.protection.BatteryProtection;
import io.openems.edge.battery.wuerthbms.WuerthBms;
import io.openems.edge.battery.wuerthbms.WuerthBmsImpl;
import io.openems.edge.bridge.modbus.api.ElementToChannelConverter;
import io.openems.edge.bridge.modbus.api.ModbusProtocol;
import io.openems.edge.bridge.modbus.api.element.CoilElement;
import io.openems.edge.bridge.modbus.api.element.DummyRegisterElement;
import io.openems.edge.bridge.modbus.api.element.SignedWordElement;
import io.openems.edge.bridge.modbus.api.element.UnsignedWordElement;
import io.openems.edge.bridge.modbus.api.task.FC16WriteRegistersTask;
import io.openems.edge.bridge.modbus.api.task.FC2ReadInputsTask;
import io.openems.edge.bridge.modbus.api.task.FC4ReadInputRegistersTask;
import io.openems.edge.common.taskmanager.Priority;

import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.DIVIDE;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SCALE_FACTOR_3;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SCALE_FACTOR_MINUS_1;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SET_NULL_FOR_DEFAULT;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.chain;

public class WuerthVersion109Protocol {

	private static final ElementToChannelConverter SET_NULL_FOR_DEFAULT_0 = SET_NULL_FOR_DEFAULT(0);

	/**
	 * Returns the Modbus protocol.
	 * 
	 * @param parent the parent.
	 * @return the modbus protocol.
	 */
	public static ModbusProtocol getProtocol(WuerthBmsImpl parent) {
		var baseWritingRegisterAddress = 40000;
		return new ModbusProtocol(parent, //
				new FC2ReadInputsTask(10000, Priority.LOW, //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_OT_CUTOFF, new CoilElement(10000)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_OT_MAX, new CoilElement(10001)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_OT_WARN, new CoilElement(10002)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_OV_CUTOFF, new CoilElement(10003)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_OV_MAX, new CoilElement(10004)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_OV_WARN, new CoilElement(10005)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_UT_CUTOFF, new CoilElement(10006)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_UT_MAX, new CoilElement(10007)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_UT_WARN, new CoilElement(10008)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_UV_CUTOFF, new CoilElement(10009)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_UV_MAX, new CoilElement(10010)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CELL_UV_WARN, new CoilElement(10011)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_COMMUNICATION_ERROR, new CoilElement(10012)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CONT_NEGATIVE_ERR, new CoilElement(10013)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CONT_POSITIVE_ERR, new CoilElement(10014)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CURRENT_OC_CHARGE, new CoilElement(10015)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CURRENT_OC_DISCHARGE, new CoilElement(10016)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_CURRENT_MEASURE_ERROR, new CoilElement(10017)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_INSULATION_ERROR, new CoilElement(10018)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_VOLT_PLAUSIBILITY_ERROR, new CoilElement(10019)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_SOC_ERROR, new CoilElement(10020)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_SOH_ERROR, new CoilElement(10021)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_STRING_CONNECTED, new CoilElement(10022)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_TEMP_DIFFERENCE_ERROR, new CoilElement(10023)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_BALANCING_ERROR, new CoilElement(10024)), //
						parent.map(WuerthBms.ChannelId.STRING_EVENT_SOC_HIGH_ERROR, new CoilElement(10025)), //
						parent.map(WuerthBms.ChannelId.SOC_RECALIBRATION_WARNING, new CoilElement(10026)), //
						parent.map(WuerthBms.ChannelId.SYSTEM_LOCK_STATUS, new CoilElement(10027)), //
						parent.map(WuerthBms.ChannelId.SHUTDOWN_PATH_ACTIVE, new CoilElement(10028)), //
						parent.map(WuerthBms.ChannelId.MCU_EVENT_DIE_TEMP, new CoilElement(10029)), //
						parent.map(WuerthBms.ChannelId.SHUNT_OVERTEMPERATURE, new CoilElement(10030)), //
						parent.map(WuerthBms.ChannelId.PRECHARGE_FAILED, new CoilElement(10031)), //
						parent.map(WuerthBms.ChannelId.KL_30_C_FAULT, new CoilElement(10032)), //
						parent.map(WuerthBms.ChannelId.CALIBRATION_PASSED, new CoilElement(10033)), //
						parent.map(WuerthBms.ChannelId.SET_IP_FAIL, new CoilElement(10034)), //
						parent.map(WuerthBms.ChannelId.FEEDBACK_BROKEN, new CoilElement(10035)) //
				),

				new FC4ReadInputRegistersTask(30000, Priority.HIGH, //
						parent.map(WuerthBms.ChannelId.RELAY_FEEDBACK_0_AUX_0, new UnsignedWordElement(30000)),
						parent.map(WuerthBms.ChannelId.RELAY_FEEDBACK_0_AUX_1, new UnsignedWordElement(30001)),
						parent.map(WuerthBms.ChannelId.BATTERY_STATE, new UnsignedWordElement(30002)),
						parent.map(WuerthBms.ChannelId.PRECHARGE_ENERGY, new UnsignedWordElement(30003)),
						parent.map(WuerthBms.ChannelId.SYSTEM_CONTACTOR_STATE, new UnsignedWordElement(30004)),
						parent.map(WuerthBms.ChannelId.SYSTEM_BALANCING_STATE, new UnsignedWordElement(30005)),
						parent.map(WuerthBms.ChannelId.RELAY_FEEDBACK_1_AUX_0, new UnsignedWordElement(30006)),
						parent.map(WuerthBms.ChannelId.RELAY_FEEDBACK_1_AUX_1, new UnsignedWordElement(30007)),
						parent.map(Battery.ChannelId.CURRENT, new SignedWordElement(30008)),
						parent.map(WuerthBms.ChannelId.PACK_SHUNT_TEMPERATURE, new UnsignedWordElement(30009), //
								SCALE_FACTOR_MINUS_1), //
						new DummyRegisterElement(30010), //
						parent.map(WuerthBms.ChannelId.PACK_LIMIT_MAX_BATTERY_VOLTAGE, new UnsignedWordElement(30011)),
						parent.map(BatteryProtection.ChannelId.BP_CHARGE_BMS, new UnsignedWordElement(30012)),
						parent.map(WuerthBms.ChannelId.CELL_VOLT_PLAUSIBILITY, new UnsignedWordElement(30013)),
						parent.map(BatteryProtection.ChannelId.BP_DISCHARGE_BMS, new UnsignedWordElement(30014)),
						parent.map(WuerthBms.ChannelId.STACKS_CELLS_PLAUSIBILITY, new UnsignedWordElement(30015)),
						parent.map(WuerthBms.ChannelId.PACK_LIMIT_MIN_BATTERY_VOLTAGE, new UnsignedWordElement(30016)),
						parent.map(WuerthBms.ChannelId.BATTERY_SOC, new UnsignedWordElement(30017), //
								chain(SET_NULL_FOR_DEFAULT_0, SCALE_FACTOR_MINUS_1)), //
						parent.map(Battery.ChannelId.SOH, new UnsignedWordElement(30018)),
						parent.map(WuerthBms.ChannelId.PACK_STATE_ENERGY, new UnsignedWordElement(30019)),
						parent.map(Battery.ChannelId.VOLTAGE, new UnsignedWordElement(30020), SCALE_FACTOR_MINUS_1), //
						parent.map(WuerthBms.ChannelId.PACK_HIGH_VOLTAGE_PLUS, new UnsignedWordElement(30021), //
								SCALE_FACTOR_MINUS_1), //
						parent.map(WuerthBms.ChannelId.PACK_HIGH_VOLTAGE_MINUS, new UnsignedWordElement(30022)), //
						parent.map(WuerthBms.ChannelId.SOFTWARE_VERSION_MAJOR, new UnsignedWordElement(30023)), //
						parent.map(WuerthBms.ChannelId.SOFTWARE_VERSION_MINOR, new UnsignedWordElement(30024)), //
						parent.map(WuerthBms.ChannelId.SOFTWARE_VERSION_PATCH, new UnsignedWordElement(30025)), //
						parent.map(WuerthBms.ChannelId.COM_LAST_FAILED_CSC, new UnsignedWordElement(30026)), //
						parent.map(WuerthBms.ChannelId.STRING_MODULE_COUNT, new UnsignedWordElement(30027)), //
						parent.map(WuerthBms.ChannelId.KL_30, new UnsignedWordElement(30028)), //
						parent.map(WuerthBms.ChannelId.KL_30C, new UnsignedWordElement(30029)), //
						parent.map(WuerthBms.ChannelId.CELL_OPEN_WIRE_DETECTION, new UnsignedWordElement(30030)), //
						parent.map(WuerthBms.ChannelId.CSC_OPEN_WIRE_DETECTION, new UnsignedWordElement(30031)), //
						parent.map(WuerthBms.ChannelId.CVCM_FAULT_CASE, new UnsignedWordElement(30032)), //
						parent.map(WuerthBms.ChannelId.PACK_REMAINING_CAPACITY, new UnsignedWordElement(30033)), //
						parent.map(WuerthBms.ChannelId.CONTACTOR_SOH, new UnsignedWordElement(30034)), //
						parent.map(WuerthBms.ChannelId.DIAG_LAST_FAILED_CSC, new UnsignedWordElement(30035)), //
						parent.map(WuerthBms.ChannelId.LATENT_LAST_FAILED_CSC, new UnsignedWordElement(30036)), //
						parent.map(WuerthBms.ChannelId.SHUTDOWN_PATH_CAUSE, new UnsignedWordElement(30037)), //
						parent.map(WuerthBms.ChannelId.SHUTDOWN_PATH_TEST_FAIL, new UnsignedWordElement(30038)), //
						parent.map(WuerthBms.ChannelId.PACK_CURRENT_MA, new UnsignedWordElement(30039), SCALE_FACTOR_3) //
				), //

				new FC4ReadInputRegistersTask(33000, Priority.HIGH, //
						parent.map(WuerthBms.ChannelId.NUMBER_OF_MODULES, new UnsignedWordElement(33000)), //
						parent.map(WuerthBms.ChannelId.NUMBER_OF_CELLS, new UnsignedWordElement(33001)), //
						parent.map(WuerthBms.ChannelId.NUMBER_OF_TEMPERATURE_SENSORS, new UnsignedWordElement(33002)), //
						parent.map(WuerthBms.ChannelId.NUMBER_OF_TEMPERATURE_SENSORS_PER_MODULE,
								new UnsignedWordElement(33003)), //
						parent.map(WuerthBms.ChannelId.NUMBER_OF_CSC, new UnsignedWordElement(33004)), //
						parent.map(WuerthBms.ChannelId.NUMBER_OF_CELLS_CSC, new UnsignedWordElement(33005)), //
						parent.map(WuerthBms.ChannelId.CFG_CSC_TEMP_SENS_CSC, new UnsignedWordElement(33006)), //
						parent.map(WuerthBms.ChannelId.CFG_CSC_TEMP_SENSORS, new UnsignedWordElement(33007)), //
						parent.map(WuerthBms.ChannelId.CFG_CSC_TEMP_T4, new UnsignedWordElement(33008)), //
						parent.map(WuerthBms.ChannelId.CFG_CSC_NTC_RNTC, new UnsignedWordElement(33009)), //
						parent.map(WuerthBms.ChannelId.CFG_CSC_NTC_REFTEMP, new UnsignedWordElement(33010)), //
						parent.map(WuerthBms.ChannelId.CFG_CSC_NTC_REFRES, new UnsignedWordElement(33011)), //
						parent.map(WuerthBms.ChannelId.CFG_CSC_NTC_BETA, new UnsignedWordElement(33012)), //
						parent.map(WuerthBms.ChannelId.CFG_CSC_NTC_CHANNELS, new UnsignedWordElement(33013)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CAPACITY_AH, new UnsignedWordElement(33014)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_RELAX_PERIOD_MIN, new UnsignedWordElement(33015)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_SAFE_OV_V, new UnsignedWordElement(33016)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_OV_V, new UnsignedWordElement(33017)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_WARN_OV_V, new UnsignedWordElement(33018)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_SAFE_UV_V, new UnsignedWordElement(33019)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_UV_V, new UnsignedWordElement(33020)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_WARN_UV_V, new UnsignedWordElement(33021)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_VOLTAGE_FTTI_MS,
								new UnsignedWordElement(33022)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_SAFE_VOLTAGE_FTTI_MS,
								new UnsignedWordElement(33023)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_SAFETY_TEMP_MAX, new UnsignedWordElement(33024)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_OPERATION_TEMP_MAX,
								new UnsignedWordElement(33025)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_WARN_TEMP_MAX, new UnsignedWordElement(33026)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_SAFETY_TEMP_MIN, new UnsignedWordElement(33027)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_OPERATION_TEMP_MIN,
								new UnsignedWordElement(33028)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_WARN_TEMP_MIN, new UnsignedWordElement(33029)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_TEMPERATURE_FTTI_MS,
								new UnsignedWordElement(33030)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_CELL_SAFE_TEMPERATURE_FTTI_MS,
								new UnsignedWordElement(33031)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_STRING_MIN_V, new UnsignedWordElement(33032)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_STRING_MAX_V, new UnsignedWordElement(33033)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_STRING_CONT_CURRENT_MAX_A,
								new UnsignedWordElement(33034)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_STRING_MAX_CHARGE_POSSIBLE,
								new UnsignedWordElement(33035)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_STRING_PULSE15S_CURRENT_MAX_A,
								new UnsignedWordElement(33036)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_STRING_PULSE30S_CURRENT_MAX_A,
								new UnsignedWordElement(33037)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_STRING_PULSE_RECOVERY_TIME_MIN,
								new UnsignedWordElement(33038)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_WAIT_FOR_INVERTER_CURR_SYNC_MS,
								new UnsignedWordElement(33039)), //
						parent.map(WuerthBms.ChannelId.CFG_CHARGE_CURRENT_LIMIT_TOLERANCE_A,
								new UnsignedWordElement(33040)), //
						parent.map(WuerthBms.ChannelId.CFG_SHUNT_TEMPERATURE_HIGH, new UnsignedWordElement(33041)), //
						parent.map(WuerthBms.ChannelId.CFG_BALANCE_ACTIVATE, new UnsignedWordElement(33042)), //
						parent.map(WuerthBms.ChannelId.CFG_BALANCING_ACTIVATE_MV, new UnsignedWordElement(33043)), //
						parent.map(WuerthBms.ChannelId.CFG_BALANCING_DEACTIVE_MV, new UnsignedWordElement(33044)), //
						parent.map(WuerthBms.ChannelId.CFG_BALANCING_MINCELLVOLTAGE_MV, new UnsignedWordElement(33045)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_PLAUS_THRESHOLD_V, new UnsignedWordElement(33046)), //
						parent.map(WuerthBms.ChannelId.CFG_BATT_PLAUS_THRESHOLD_PERCENT,
								new UnsignedWordElement(33047)), //
						parent.map(WuerthBms.ChannelId.CFG_BMS_PARALLEL_STRINGS, new UnsignedWordElement(33048)), //
						parent.map(WuerthBms.ChannelId.CFG_BMS_IDLE_CURRENT_ABS_MA, new UnsignedWordElement(33049)), //
						parent.map(WuerthBms.ChannelId.CFG_BMS_MAXIMUM_SOC, new UnsignedWordElement(33050)), //
						parent.map(WuerthBms.ChannelId.CFG_BMS_MINIMUM_SOC, new UnsignedWordElement(33051)), //
						parent.map(WuerthBms.ChannelId.CFG_BMS_POWERBANK_ENABLE, new UnsignedWordElement(33052)), //
						parent.map(WuerthBms.ChannelId.CFG_CELL_MONITORING_DIAG_FTTI_MS,
								new UnsignedWordElement(33053)), //
						parent.map(WuerthBms.ChannelId.CFG_SMALL_SHUNT_R, new UnsignedWordElement(33054),
								DIVIDE(1000000)), //
						parent.map(WuerthBms.ChannelId.CFG_BIG_SHUNT_R, new UnsignedWordElement(33055),
								DIVIDE(1000000)), //
						parent.map(WuerthBms.ChannelId.CFG_SHUNT_RESISTANCE, new UnsignedWordElement(33056),
								DIVIDE(1000000)), //
						parent.map(WuerthBms.ChannelId.CFG_CONT_PWM_CONTROLLED, new UnsignedWordElement(33057)), //
						parent.map(WuerthBms.ChannelId.CFG_PRECHARGE_ENABLED, new UnsignedWordElement(33058)), //
						parent.map(WuerthBms.ChannelId.CFG_PRECHARGE_THRESHOLD, new UnsignedWordElement(33059)), //
						parent.map(WuerthBms.ChannelId.CFG_PRECHARGE_CHECK_TIME, new UnsignedWordElement(33060)), //
						parent.map(WuerthBms.ChannelId.CFG_PRECHARGE_TIMEOUT, new UnsignedWordElement(33061)), //
						parent.map(WuerthBms.ChannelId.CFG_CONTACTOR_NEGATIVE_TIMEOUT, new UnsignedWordElement(33062)), //
						parent.map(WuerthBms.ChannelId.CFG_CONTACTOR_POSITIVE_TIMEOUT, new UnsignedWordElement(33063)), //
						parent.map(WuerthBms.ChannelId.CFG_CONATCTOR_UNDERLOAD_CURRENT, new UnsignedWordElement(33064)), //
						parent.map(WuerthBms.ChannelId.CFG_BMS_KL30_MAINSUPPLY_MV, new UnsignedWordElement(33065)), //
						parent.map(WuerthBms.ChannelId.CFG_BMS_KL30C_CONTSUPPLY_MV, new UnsignedWordElement(33066)), //
						parent.map(WuerthBms.ChannelId.CFG_BMS_SUPPLY_TOLERANCE_MV, new UnsignedWordElement(33067)), //
						parent.map(WuerthBms.ChannelId.CFG_PRECHARGE_ONBOARD, new UnsignedWordElement(33068)), //
						parent.map(WuerthBms.ChannelId.CFG_CONTACTOR_ACTIVATION_TIME_MS,
								new UnsignedWordElement(33069)), //
						parent.map(WuerthBms.ChannelId.BMS_RELEASE_TYPE, new UnsignedWordElement(33070)), //
						parent.map(WuerthBms.ChannelId.BMS_HV_DIVIDER_R1_KOHM, new UnsignedWordElement(33071)), //
						parent.map(WuerthBms.ChannelId.BMS_HV_DIVIDER_R2_KOHM, new UnsignedWordElement(33072)), //
						parent.map(WuerthBms.ChannelId.BMS_HV_DIVIDER, new UnsignedWordElement(33073)), //
						parent.map(WuerthBms.ChannelId.TEMPDEP_CURRENT_MONITOR_ACTIVE, new UnsignedWordElement(33074)), //
						parent.map(WuerthBms.ChannelId.TEMPDEP_CURRENT_SHUNT_TOL_ERROR_PERC,
								new UnsignedWordElement(33075)), //
						parent.map(WuerthBms.ChannelId.TEMPDEP_CURRENT_LTC_MEAS_ERROR_PERC,
								new UnsignedWordElement(33076)), //
						parent.map(WuerthBms.ChannelId.TEMPDEP_CURRENT_SHUNT_MAX_ERROR_PERC,
								new UnsignedWordElement(33077)), //
						parent.map(WuerthBms.ChannelId.TEMPDEP_CURRENT_OVERCURRENT_SHUTDOWN_MS,
								new UnsignedWordElement(33078)), //
						parent.map(WuerthBms.ChannelId.OVER_CURRENT_COMPARATOR_ACTIVE, new UnsignedWordElement(33079)), //
						parent.map(WuerthBms.ChannelId.OVER_CURRENT_CURRENT_LIMIT_A, new UnsignedWordElement(33080)), //
						parent.map(WuerthBms.ChannelId.OVER_CURRENT_COMPARATOR_LIMIT_MV,
								new UnsignedWordElement(33081)), //
						parent.map(WuerthBms.ChannelId.OVER_CURRENT_OVERCURRENT_SAFETY_MS,
								new UnsignedWordElement(33082)), //
						parent.map(WuerthBms.ChannelId.CELL_MONITORING_DIAG_FTTI_MS, new UnsignedWordElement(33083)), //
						parent.map(WuerthBms.ChannelId.CONTACTOR_VOLTAGE_TOLERANCE, new UnsignedWordElement(33084),
								SCALE_FACTOR_MINUS_1), //
						parent.map(WuerthBms.ChannelId.DIE_TEMP_LIMIT_WARNING_LOWER_DEGC,
								new UnsignedWordElement(33085)), //
						parent.map(WuerthBms.ChannelId.DIE_TEMP_LIMIT_WARNING_UPPER_DEGC,
								new UnsignedWordElement(33086)), //
						parent.map(WuerthBms.ChannelId.DIE_TEMP_LIMIT_SAFETY_LOWER_DEGC,
								new UnsignedWordElement(33087)), //
						parent.map(WuerthBms.ChannelId.DIE_TEMP_LIMIT_SAFETY_UPPER_DEGC,
								new UnsignedWordElement(33088)), //
						parent.map(WuerthBms.ChannelId.DIE_TEMP_LIMIT_SMU_LOWER_DEGC, new UnsignedWordElement(33089)), //
						parent.map(WuerthBms.ChannelId.DIE_TEMP_LIMIT_SMU_UPPER_DEGC, new UnsignedWordElement(33090)), //
						parent.map(WuerthBms.ChannelId.CSC_VOLTAGE_MEASUREMENT_ERROR_COMBINED_MV,
								new UnsignedWordElement(33091)), //
						parent.map(WuerthBms.ChannelId.CSC_TEMPERATURE_MEASUREMENT_ERROR_COMBINED_DEGC,
								new UnsignedWordElement(33092)), //
						parent.map(WuerthBms.ChannelId.CSC_VOLTAGE_MEASUREMENT_PLAUSIBILITY_THRESHOLD_MV,
								new UnsignedWordElement(33093)), //
						parent.map(WuerthBms.ChannelId.CSC_STACK_VS_SUM_PLAUSIBILITY_THRESHOLD_MV,
								new UnsignedWordElement(33094)), //
						parent.map(WuerthBms.ChannelId.CSC_ALLOWED_COM_RETRIES, new UnsignedWordElement(33095)), //
						parent.map(WuerthBms.ChannelId.CSC_CELLBALANCINGTIME_PER_DIAG_CYCLE_MS,
								new UnsignedWordElement(33096)), //
						parent.map(WuerthBms.ChannelId.BMS_CONTACTOR_INVERTED, new UnsignedWordElement(33097)), //
						parent.map(WuerthBms.ChannelId.RELAY_AUX0_OPEN_MV, new UnsignedWordElement(33098)), //
						parent.map(WuerthBms.ChannelId.RELAY_AUX1_OPEN_MV, new UnsignedWordElement(33099)), //
						parent.map(WuerthBms.ChannelId.RELAY_AUX0_CLOSED_MV, new UnsignedWordElement(33100)), //
						parent.map(WuerthBms.ChannelId.RELAY_AUX1_CLOSED_MV, new UnsignedWordElement(33101)), //
						parent.map(WuerthBms.ChannelId.RELAY_AUX_DEVIATION_MAX_MV, new UnsignedWordElement(33102)), //
						parent.map(WuerthBms.ChannelId.WEBCM_DEV_ACTIVATE_BALANCING, new UnsignedWordElement(33103)), //
						parent.map(WuerthBms.ChannelId.WEBCM_DEV_ACTIVATE_ALLRUNTIME_CHECKS,
								new UnsignedWordElement(33104)), //
						parent.map(WuerthBms.ChannelId.WEBCM_DEV_ACTIVATE_RANGE_CHECKS, new UnsignedWordElement(33105)), //
						parent.map(WuerthBms.ChannelId.TEST_WEOS_DEACTIVATE_AREA_CHECK, new UnsignedWordElement(33106)), //
						parent.map(WuerthBms.ChannelId.TEST_WEOS_DEACTIVATE_BUS_MPU, new UnsignedWordElement(33107)), //
						parent.map(WuerthBms.ChannelId.TEST_WEOS_ALL_CORE0_TASKS_PRIVILEGED,
								new UnsignedWordElement(33108)), //
						parent.map(WuerthBms.ChannelId.OV_CUTOFF_MIN_TEMP, new UnsignedWordElement(33109)), //
						parent.map(WuerthBms.ChannelId.OV_CUTOFF_MAX_TEMP, new UnsignedWordElement(33110)), //
						parent.map(WuerthBms.ChannelId.UV_CUTOFF_MIN_TEMP, new UnsignedWordElement(33111)), //
						parent.map(WuerthBms.ChannelId.UV_CUTOFF_MAX_TEMP, new UnsignedWordElement(33112)), //
						parent.map(WuerthBms.ChannelId.OV_SAFE_MIN_TEMP, new UnsignedWordElement(33113)), //
						parent.map(WuerthBms.ChannelId.OV_SAFE_MAX_TEMP, new UnsignedWordElement(33114)), //
						parent.map(WuerthBms.ChannelId.UV_SAFE_MIN_TEMP, new UnsignedWordElement(33115)), //
						parent.map(WuerthBms.ChannelId.UV_SAFE_MAX_TEMP, new UnsignedWordElement(33116)), //
						parent.map(WuerthBms.ChannelId.CURRENT_CHARGE_MIN_TEMP, new UnsignedWordElement(33117)), //
						parent.map(WuerthBms.ChannelId.CURRENT_CHARGE_MAX_TEMP, new UnsignedWordElement(33118)), //
						parent.map(WuerthBms.ChannelId.CURRENT_DISCHARGE_MIN_TEMP, new UnsignedWordElement(33119)), //
						parent.map(WuerthBms.ChannelId.CURRENT_DISCHARGE_MAX_TEMP, new UnsignedWordElement(33120)) //
				), //

				new FC4ReadInputRegistersTask(33200, Priority.HIGH, //
						parent.map(WuerthBms.ChannelId.SOC_MIN, new UnsignedWordElement(33200)), //
						parent.map(WuerthBms.ChannelId.SOC_MAX, new UnsignedWordElement(33201)), //
						parent.map(WuerthBms.ChannelId.LOCK_STATUS_CRC_MSB, new UnsignedWordElement(33202)), //
						parent.map(WuerthBms.ChannelId.LOCK_STATUS_CRC_LSB, new UnsignedWordElement(33203))//
				),

				new FC16WriteRegistersTask(baseWritingRegisterAddress, //
						parent.map(WuerthBms.ChannelId.COMMAND_STATE_REQUEST,
								new UnsignedWordElement(baseWritingRegisterAddress)), //
						parent.map(WuerthBms.ChannelId.COMMAND_ACTIVATE_BALANCING,
								new UnsignedWordElement(baseWritingRegisterAddress + 1)), //
						parent.map(WuerthBms.ChannelId.COMMAND_BALANCING_THRESHOLD,
								new UnsignedWordElement(baseWritingRegisterAddress + 2)), //
						parent.map(WuerthBms.ChannelId.COMMAND_CUSTOM_CURRENT_CHARGE_LIMIT,
								new UnsignedWordElement(baseWritingRegisterAddress + 3)), //
						parent.map(WuerthBms.ChannelId.COMMAND_CUSTOM_CURRENT_DISCH_LIMIT,
								new UnsignedWordElement(baseWritingRegisterAddress + 4)), //
						parent.map(WuerthBms.ChannelId.COMMAND_RESET_1,
								new UnsignedWordElement(baseWritingRegisterAddress + 5)), //
						parent.map(WuerthBms.ChannelId.COMMAND_RESET_2,
								new UnsignedWordElement(baseWritingRegisterAddress + 6)), //
						parent.map(WuerthBms.ChannelId.COMMAND_ALIVE_COUNTER,
								new UnsignedWordElement(baseWritingRegisterAddress + 7)), //
						parent.map(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_MSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 8)), //
						parent.map(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_LSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 9)), //
						parent.map(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_CRC_MSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 10)), //
						parent.map(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_CRC_LSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 11)), //
						parent.map(WuerthBms.ChannelId.COMMAND_MAINTENANCE_MODE,
								new UnsignedWordElement(baseWritingRegisterAddress + 12)), //
						new DummyRegisterElement(baseWritingRegisterAddress + 13), //
						parent.map(WuerthBms.ChannelId.REGULATION_REMAINING_CAPACITY,
								new UnsignedWordElement(baseWritingRegisterAddress + 14)), //
						parent.map(WuerthBms.ChannelId.REGULATION_REMAINING_POWER_CAPABILITY,
								new UnsignedWordElement(baseWritingRegisterAddress + 15)), //
						parent.map(WuerthBms.ChannelId.REGULATION_ROUND_TRIP_EFFICIENCY,
								new UnsignedWordElement(baseWritingRegisterAddress + 16)), //
						parent.map(WuerthBms.ChannelId.REGULATION_SELF_DISCHARGING_RATE,
								new UnsignedWordElement(baseWritingRegisterAddress + 17)), //
						parent.map(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_IN_MSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 18)), //
						parent.map(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_IN_LSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 19)), //
						parent.map(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_OUT_MSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 20)), //
						parent.map(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_OUT_LSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 21)), //
						parent.map(WuerthBms.ChannelId.REGULATION_NUM_CHARGE_DISCHARGE_CYCLES,
								new UnsignedWordElement(baseWritingRegisterAddress + 22)), //
						parent.map(WuerthBms.ChannelId.SHUNT_CALIBRATION_MSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 23)), //
						parent.map(WuerthBms.ChannelId.SHUNT_CALIBRATION_LSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 24)), //
						parent.map(WuerthBms.ChannelId.MAC_ADDRESS_OCTET0,
								new UnsignedWordElement(baseWritingRegisterAddress + 25)), //
						parent.map(WuerthBms.ChannelId.MAC_ADDRESS_OCTET1,
								new UnsignedWordElement(baseWritingRegisterAddress + 26)), //
						parent.map(WuerthBms.ChannelId.MAC_ADDRESS_OCTET2,
								new UnsignedWordElement(baseWritingRegisterAddress + 27)), //
						parent.map(WuerthBms.ChannelId.MAC_ADDRESS_OCTET3,
								new UnsignedWordElement(baseWritingRegisterAddress + 28)), //
						parent.map(WuerthBms.ChannelId.MAC_ADDRESS_OCTET4,
								new UnsignedWordElement(baseWritingRegisterAddress + 29)), //
						parent.map(WuerthBms.ChannelId.MAC_ADDRESS_OCTET5,
								new UnsignedWordElement(baseWritingRegisterAddress + 30)), //
						parent.map(WuerthBms.ChannelId.IP_BYTE0,
								new UnsignedWordElement(baseWritingRegisterAddress + 31)), //
						parent.map(WuerthBms.ChannelId.IP_BYTE1,
								new UnsignedWordElement(baseWritingRegisterAddress + 32)), //
						parent.map(WuerthBms.ChannelId.IP_BYTE2,
								new UnsignedWordElement(baseWritingRegisterAddress + 33)), //
						parent.map(WuerthBms.ChannelId.IP_BYTE3,
								new UnsignedWordElement(baseWritingRegisterAddress + 34)), //
						parent.map(WuerthBms.ChannelId.GW_BYTE0,
								new UnsignedWordElement(baseWritingRegisterAddress + 35)), //
						parent.map(WuerthBms.ChannelId.GW_BYTE1,
								new UnsignedWordElement(baseWritingRegisterAddress + 36)), //
						parent.map(WuerthBms.ChannelId.GW_BYTE2,
								new UnsignedWordElement(baseWritingRegisterAddress + 37)), //
						parent.map(WuerthBms.ChannelId.GW_BYTE3,
								new UnsignedWordElement(baseWritingRegisterAddress + 38)), //
						parent.map(WuerthBms.ChannelId.HW_SERIAL_NUMBER_CODE_0,
								new UnsignedWordElement(baseWritingRegisterAddress + 39)), //
						parent.map(WuerthBms.ChannelId.HW_SERIAL_NUMBER_CODE_1,
								new UnsignedWordElement(baseWritingRegisterAddress + 40)), //
						parent.map(WuerthBms.ChannelId.HW_SERIAL_NUMBER_CODE_2,
								new UnsignedWordElement(baseWritingRegisterAddress + 41)), //
						parent.map(WuerthBms.ChannelId.HW_SERIAL_NUMBER_LETTER,
								new UnsignedWordElement(baseWritingRegisterAddress + 42)), //
						parent.map(WuerthBms.ChannelId.COMMAND_SOH_RESET,
								new UnsignedWordElement(baseWritingRegisterAddress + 43)), //
						parent.map(WuerthBms.ChannelId.COMMAND_SOH_HIGH_RESOLUTION_LSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 44)), //
						parent.map(WuerthBms.ChannelId.COMMAND_SOH_HIGH_RESOLUTION_MSB,
								new UnsignedWordElement(baseWritingRegisterAddress + 45)) //
				));
	}

}
