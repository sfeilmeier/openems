package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

public enum DtcFailure {

	// No Error
	NO_ERROR(0, "System", "No Error", ""), //

	// Communication Errors (2-5, 429, 438, 1500, 1861)
	SCAN_TRANSMIT_FAILURE(2, "Communication", "BMS cannot transmit message by SCAN", "QM"), //
	ACAN_RECEIVE_FAILURE(4, "Communication", "BMS can not receive any CAN messages on ACAN", "QM"), //
	SCAN_RECEIVE_FAILURE(5, "Communication", "BMS can't receive any CAN messages on SCAN", "QM"), //
	BMS_TO_VCU_COMM_FAILURE(429, "Communication", "BMS to VCU communication fault", "QM"), //
	ACAN_TRANSMIT_FAILURE(438, "Communication", "BMS cannot transmit message by ACAN", "QM"), //
	BMU_CMC_E2E_FAULT_1500(1500, "Communication function", "E2E fault between BMU and CMC communication", "ASILB"), //
	SCAN_TRANSMIT_FAILURE_1861(1861, "Communication function", "BMS cannot transmit message by SCAN", "ASILB"), //

	// Power Supply Errors (6, 8-9, 11-12, 1542-1543, 1608-1609)
	BMS_UNEXPECTED_SHUTDOWN(6, "Power Supply", "BMS unexpected shutdown", "QM"), //
	BMS_POWER_UNDERVOLTAGE(8, "Power Supply", "BMS power supply undervoltage", "QM"), //
	BMS_POWER_OVERVOLTAGE(9, "Power Supply", "BMS power supply overvoltage", "QM"), //
	BMS_VOLTAGE_TOO_LOW(11, "Power Supply", "BMS power supply voltage measured value out of range to too low fault",
			"QM"), //
	BMS_VOLTAGE_TOO_HIGH(12, "Power Supply", "BMS power supply voltage measured value out of range to too high fault",
			"QM"), //
	BMS_POWER_UNDERVOLTAGE_1542(1542, "Power Supply", "BMS power supply undervoltage", "ASILB"), //
	BMS_POWER_OVERVOLTAGE_1543(1543, "Power Supply", "BMS power supply overvoltage", "ASILB"), //
	BMS_VOLTAGE_TOO_LOW_1608(1608, "Power Supply",
			"BMS power supply voltage measured value out of range to too low fault", "ASILB"), //
	BMS_VOLTAGE_TOO_HIGH_1609(1609, "Power supply",
			"BMS power supply voltage measured value out of range to too high fault", "ASILB"), //

	// Contactor/Power Supply Errors (10, 13, 1610-1611)
	CONTACTOR_UNDERVOLTAGE(10, "Contactor", "Contactor separate power supply undervoltage", "QM"), //
	CONTACTOR_OVERVOLTAGE(13, "Contactor", "Contactor separate power supply overvoltage", "QM"), //
	CONTACTOR_POWER_UNDERVOLTAGE(1610, "Contactor", "Contactor separate power supply undervoltage", "ASIL B"), //
	CONTACTOR_POWER_OVERVOLTAGE_1611(1611, "Provide status of pos. neg. contactors",
			"Contactor separate power supply overvoltage", "ASILB"), //

	// Pre-Charge Errors (34-36, 39, 1580)
	PRECHARGE_TIMEOUT(34, "Pre-Charge",
			"Precharge time exceeds the timeout protection threshold of the precharge resistor", "QM"), //
	PRECHARGE_OVER_CURRENT(35, "Pre-Charge",
			"Precharge current exceeds the over current protection threshold of the precharge resistor", "QM"), //
	PRECHARGE_SHORT_CURRENT(36, "Pre-Charge",
			"Precharge current exceeds the short current protection threshold of the precharge resistor", "QM"), //
	PRECHARGE_TOO_MUCH(39, "Pre-Charge", "Precharge too much in short time", "QM"), //
	PRECHARGE_RELAY_CLOSE_FAILED_1580(1580, "Pre-Charge function",
			"After a while of requesting close precharge relay & precharge relay cannot close is detected", "ASILB"), //

	// SOH Estimation Errors (44-45)
	SOH_LEVEL1_ALARM(44, "SOH", "Battery health status (SOH) reaches alarm threshold (level 1 75%)", "QM"), //
	SOH_LEVEL2_ALARM(45, "SOH", "Battery health status (SOH) reaches alarm threshold (level 2 70%)", "QM"), //

	// Balance Function Errors (48-50, 481)
	BALANCE_OVER_TEMPERATURE(48, "Balancing", "Balance temperature sampling value fault due to over temperature", "QM"), //
	BALANCE_INVALID_TEMP(49, "Balancing", "Balance temperature sampling value fault due to invalid value", "QM"), //
	BALANCE_SOC_DIFFERENCE(50, "Balancing",
			"The battery cell maximum SOC and minimum SOC difference exceeds the normal range (threshold 15%)", "QM"), //
	BALANCE_CIRCUIT_FAULT(481, "Balancing", "BMS detects a circuit fault in the balance circuit", "QM"), //

	// Cell Protection Errors (63-65, 123, 131-132, 140, 1501-1502, 1505)
	CELL_OVERVOLTAGE_LEVEL1(63, "Cell Protection", "Single cell overvoltage fault level 1 (>4310mV)", "QM"), //
	CELL_OVERVOLTAGE_LEVEL2(64, "Cell Protection", "Single cell overvoltage fault level 2 (>4350mV)", "QM"), //
	CELL_OVERVOLTAGE_LEVEL3(65, "Cell Protection", "Single cell overvoltage fault level 3 (>4550mV)", "QM"), //
	HV_OPEN_LOOP_CIRCUIT(123, "HV Circuit",
			"Battery system high voltage open loop circuit (high voltage connection between main positive/main negative relay) open circuit",
			"QM"), //
	CELL_UNDERVOLTAGE_LEVEL1(131, "Cell Protection", "Single cell undervoltage fault level 1 (<2500mV)", "QM"), //
	CELL_UNDERVOLTAGE_LEVEL2(132, "Cell Protection", "Single cell undervoltage fault level 2 (<2300mV)", "QM"), //
	CELL_UNDERVOLTAGE_LEVEL3(140, "Cell Protection", "Single cell undervoltage fault level 3 (<2000mV)", "QM"), //
	CELL_UNDERVOLTAGE_LEVEL4_1501(1501, "Cell undervoltage protection",
			"Single cell undervoltage fault level 4 (<1500mV)", "ASILB"), //
	CELL_OVERVOLTAGE_LEVEL4_1502(1502, "Cell overvoltage protection", "Single cell overvoltage fault level 4 (>4555mV)",
			"ASILB"), //
	CELL_OVERVOLTAGE_LEVEL3_1505(1505, "Cell overvoltage protection", "Single cell overvoltage fault level 3 (>4550mV)",
			"ASILB"), //

	// Cell Voltage Acquisition (124-125, 1503-1504, 1506, 1792)
	CELL_VOLTAGE_DIFFERENCE_OVER_THRESHOLD_124(124, "Cell Voltage Acquisition",
			"Difference between Sum of Cells Voltage sampled and chip total voltage over threshold", "QM"), //
	CELL_VOLTAGE_DIFFERENCE_OVER_THRESHOLD_125(125, "Cell Voltage Acquisition",
			"Difference between Sum of Cells Voltage sampled and chip total voltage over threshold", "QM"), //
	CELL_VOLTAGE_DIFFERENCE_OVER_THRESHOLD_1503(1503, "Cell voltage acquisition function",
			"Difference between Sum of Cells Voltage sampled and chip total voltage over threshold", "ASILB"), //
	CELL_VOLTAGE_OUT_OF_RANGE_1504(1504, "Cell voltage acquisition function",
			"Single cell voltage out of the normal range (over 5000mV)", "ASILB"), //
	CELL_VOLTAGE_SAMPLE_OPEN_WIRE_1506(1506, "Cell voltage acquisition function", "Cell voltage sample open wire fault",
			"ASILB"), //
	SAMPLE_CHIP_HARDWARE_FAULT_1792(1792, "Cell voltage acquisition function", "Sample chip hardware fault", "ASILB"), //

	// Bus Current Acquisition (133-139, 148-149, 1639-1641, 1651-1658, 1661, 1664,
	// 1667-1669, 1671)
	DISCHARGE_OVER_CURRENT_LEVEL3(133, "Current Acquisition",
			"Discharge over current level 3 (>1.3 times look up discharge current)", "QM"), //
	CHARGE_OVER_CURRENT_LEVEL1(134, "Current Acquisition",
			"Charge over current level 1 (>1.05 times look up discharge current)", "QM"), //
	CHARGE_OVER_CURRENT_LEVEL2(135, "Current Acquisition",
			"Charge over current level 2 (>1.1 times look up discharge current)", "QM"), //
	CHARGE_OVER_CURRENT_LEVEL3(136, "Current Acquisition",
			"Charge over current level 3 (>1.1 times look up discharge current)", "QM"), //
	RECHARGE_OVER_CURRENT_LEVEL1(137, "Current Acquisition",
			"Recharge over current level 1 (>1.05 times look up discharge current)", "QM"), //
	RECHARGE_OVER_CURRENT_LEVEL2(138, "Current Acquisition",
			"Recharge over current level 2 (>1.1 times look up discharge current)", "QM"), //
	RECHARGE_OVER_CURRENT_LEVEL3(139, "Current Acquisition",
			"Recharge over current level 3 (>1.1 times look up discharge current)", "QM"), //
	DISCHARGE_OVER_CURRENT_LEVEL1(148, "Current Acquisition",
			"Discharge over current level 1 (>1.1 times look up discharge current)", "QM"), //
	DISCHARGE_OVER_CURRENT_LEVEL2(149, "Current Acquisition",
			"Discharge over current level 2 (>1.2 times look up discharge current)", "QM"), //
	PRIMARY_CURRENT_SENSOR_INVALID_1639(1639, "Bus current acquisition function",
			"Primary current value sent by current sensor is invalid or internal fault appears in current sensor (Applied to CSU)",
			"ASILB"), //
	PRIMARY_CURRENT_SENSOR_INVALID_1640(1640, "Bus current acquisition function",
			"Primary current value sent by current sensor is invalid or internal fault appears in current sensor (Applied to CSU)",
			"ASILB"), //
	PRIMARY_CURRENT_SENSOR_INVALID_1641(1641, "Bus current acquisition function",
			"Primary current value sent by current sensor is invalid or internal fault appears in current sensor (Applied to CSU)",
			"ASILB"), //
	BMU_CANNOT_RECEIVE_CURRENT_SAMPLING_1651(1651, "Fault diagnosis and treatment",
			"BMU cannot receive current sampling message sent by current sensor (CSU current sensor used)", "ASILB"), //
	BMU_CANNOT_RECEIVE_CURRENT_SAMPLING_1652(1652, "Fault diagnosis and treatment",
			"BMU cannot receive current sampling message sent by current sensor (CSU current sensor used)", "ASILB"), //
	BMU_CANNOT_RECEIVE_CURRENT_SAMPLING_1653(1653, "Fault diagnosis and treatment",
			"BMU cannot receive current sampling message sent by current sensor (CSU current sensor used)", "ASILB"), //
	CURRENT_SAMPLING_CRC_CHECK_FAIL_1654(1654, "Fault diagnosis and treatment",
			"Current sampling message CRC check fail (BCD and HV CSU used)", "ASILB"), //
	CURRENT_SAMPLING_CRC_CHECK_FAIL_1655(1655, "Fault diagnosis and treatment",
			"Current sampling message CRC check fail (BCD and HV CSU used)", "ASILB"), //
	CURRENT_SAMPLING_CRC_CHECK_FAIL_1656(1656, "Fault diagnosis and treatment",
			"Current sampling message CRC check fail (BCD and HV CSU used)", "ASILB"), //
	ZERO_OFFSET_DEVIATION_1657(1657, "Bus current acquisition function",
			"Zero offset appears and leads to sample deviation", "ASILB"), //
	CANNOT_RECEIVE_CURRENT_SAMPLING_1658(1658, "Bus current acquisition function",
			"BMU cannot receive current sampling message sent by current sensor (Applied to sensor which communicates by CAN)",
			"ASILB"), //
	CURRENT_MESSAGE_CRC_FAIL_1661(1661, "Bus current acquisition function",
			"Primary current message CRC check fault occurs (Applied to sensor which communicates by CAN and has CRC strategy)",
			"ASILB"), //
	CURRENT_MESSAGE_ROLLING_COUNTER_FAIL_1664(1664, "Bus current acquisition function",
			"Primary current sampling message rolling counter fault occurs (Applied to sensor which communicates by CAN and has RC strategy)",
			"ASILB"), //
	CURRENT_MESSAGE_ROLLING_COUNTER_FAULT_1667(1667, "Fault diagnosis and treatment",
			"Current Message rolling counter Fault occur in any branch (BCD and HV CSU used)", "ASILB"), //
	CURRENT_MESSAGE_ROLLING_COUNTER_FAULT_1668(1668, "Fault diagnosis and treatment",
			"Current Message rolling counter Fault occur in any branch (BCD and HV CSU used)", "ASILB"), //
	CURRENT_MESSAGE_ROLLING_COUNTER_FAULT_1669(1669, "Fault diagnosis and treatment",
			"Current Message rolling counter Fault occur in any branch (BCD and HV CSU used)", "ASILB"), //
	CURRENT_OUT_OF_RANGE_2000A_1671(1671, "Bus current acquisition function",
			"Current value is out of current sensor measurement range (2000A)", "ASILB"), //

	// Temperature Related (81-82, 84-85, 153-154, 1612-1614, 1616-1617, 1793-1794)
	CELL_OVER_TEMPERATURE_LEVEL1(81, "Temperature", "Cell battery over temperature fault level 1 (≥50℃)", "QM"), //
	CELL_OVER_TEMPERATURE_LEVEL2(82, "Temperature", "Cell battery over temperature fault level 2(≥60℃)", "QM"), //
	CELL_UNDER_TEMPERATURE_LEVEL1(84, "Temperature", "Cell battery under temperature fault level 1 (<-35℃)", "QM"), //
	TEMPERATURE_DIFFERENCE_WARNING(85, "Temperature",
			"Difference between cell maximum temperature and minimum temperature over warning threshold (>25℃)", "QM"), //
	CELL_OVER_TEMPERATURE_LEVEL3(153, "Temperature", "Cell battery over temperature fault level 3 (≥67℃)", "QM"), //
	CELL_OVER_TEMPERATURE_LEVEL4(154, "Temperature", "Cell battery over temperature fault level 4 (≥70℃)", "ASILC"), //
	BATTERY_OVER_TEMPERATURE_125C_1612(1612, "Battery temperature acquisition",
			"Over temperature fault (over 125℃) (1 NTC sampling value)", "ASILB"), //
	BATTERY_UNDER_TEMPERATURE_MINUS40C_1613(1613, "Battery temperature acquisition",
			"Under temperature fault (lower -40℃) (1 NTC sampling value)", "ASILB"), //
	CELL_TEMP_SENSOR_COMM_E2E_FAULT_1614(1614, "Battery temperature acquisition",
			"Cell temperature sensor communication E2E fault", "ASILB"), //
	CELL_TEMP_SENSOR_MINOR_FAULT_1616(1616, "Battery temperature acquisition", "Cell temperature sensor minor fault",
			"ASILB"), //
	CELL_TEMP_SENSOR_SERIOUS_FAULT_1617(1617, "Battery temperature acquisition",
			"Cell temperature sensor serious fault (3 NTC normal values)", "ASILB"), //
	NTC_IMPLAUSIBILITY_MINOR_FAULT_1793(1793, "Battery temperature acquisition", "NTCImPlausMinorFlt", "ASILB"), //
	NTC_IMPLAUSIBILITY_MODERATE_FAULT_1794(1794, "Battery temperature acquisition", "NTC implausibility moderate fault",
			"ASILB"), //

	// High Voltage Acquisition (168-171, 247-250, 254-259, 1545-1548, 1552-1553,
	// 1556-1557)
	PACK_OVER_VOLTAGE_LEVEL1(168, "High Voltage", "Pack voltage over voltage fault level 1 ( ≥443.7V)", "QM"), //
	PACK_OVER_VOLTAGE_LEVEL2(169, "High Voltage", "Pack voltage over voltage fault level 2( ≥448V)", "QM"), //
	PACK_UNDER_VOLTAGE_LEVEL1(170, "High Voltage", "Pack voltage under voltage fault level 1 ( ≤234.6V)", "QM"), //
	PACK_UNDER_VOLTAGE_LEVEL2(171, "High Voltage", "Pack voltage under voltage fault level 2( ≤204V)", "QM"), //
	HV_MEASURING_G0_SPI_ABNORMAL(247, "High Voltage", "High voltage measuring by G0 reference point SPI abnormal",
			"ASILA"), //
	HV_MEASURING_G1_SPI_ABNORMAL(248, "High Voltage", "High voltage measuring by G1 reference point SPI abnormal",
			"ASILA"), //
	HV_MEASURING_G0_REF_OUT_RANGE(249, "High Voltage",
			"High voltage measuring by G0 reference point reference voltage out range", "ASILA"), //
	HV_MEASURING_G1_REF_OUT_RANGE(250, "High Voltage",
			"High voltage measuring by G1 reference point reference voltage out range", "ASILA"), //
	MAIN_POS_TO_G0_HV_SENSOR_CIRCUIT_FAULT(254, "High Voltage",
			"MainPosToG0 High voltage sensor circuit open or short to GND", "ASILA"), //
	MAIN_POS_TO_G0_HV_OUT_OF_RANGE(255, "High Voltage", "MainPosToG0 High voltage out of range (over 500V)", "ASILA"), //
	BATTERY_TO_G0_HV_SENSOR_CIRCUIT_FAULT(258, "High Voltage",
			"BatteryToG0 High voltage sensor circuit open or short to GND", "ASILA"), //
	BATTERY_TO_G0_HV_OUT_OF_RANGE(259, "High Voltage", "BatteryToG0 High voltage out of range (over 500V)", "ASILA"), //
	HV_MEASURING_G0_SPI_ABNORMAL_1545(1545, "High voltage acquisition function",
			"High voltage measuring by G0 reference point SPI abnormal", "ASILB"), //
	HV_MEASURING_G1_SPI_ABNORMAL_1546(1546, "High voltage acquisition function",
			"High voltage measuring by G1 reference point SPI abnormal", "ASILB"), //
	HV_MEASURING_G0_REF_OUT_RANGE_1547(1547, "High voltage acquisition function",
			"High voltage measuring by G0 reference point reference voltage out range", "ASILB"), //
	HV_MEASURING_G1_REF_OUT_RANGE_1548(1548, "High voltage acquisition function",
			"High voltage measuring by G1 reference point reference voltage out range", "ASILB"), //
	MAIN_POS_TO_G0_HV_SENSOR_CIRCUIT_FAULT_1552(1552, "High voltage acquisition function",
			"MainPosToG0 High voltage sensor circuit open or short to GND", "ASILB"), //
	MAIN_POS_TO_G0_HV_OUT_OF_RANGE_1553(1553, "High voltage acquisition function",
			"MainPosToG0 High voltage out of range (over 500V)", "ASILB"), //
	BATTERY_TO_G0_HV_SENSOR_CIRCUIT_FAULT_1556(1556, "High voltage acquisition function",
			"BatteryToG0 High voltage sensor circuit open or short to GND", "ASILB"), //
	BATTERY_TO_G0_HV_OUT_OF_RANGE_1557(1557, "High voltage acquisition function",
			"BatteryToG0 High voltage out of range (over 500V)", "ASILB"), //

	// Contactor Status (172-173, 177-178, 181, 210-212, 214-216, 218, 220, 230-235,
	// 1511, 1522, 1570, 1573, 1579, 1587-1597, 1682-1687)
	MAIN_POSITIVE_RELAY_STUCK(172, "Contactor",
			"Main positive or precharge relay stuck during high voltage power on or when high voltage power off",
			"ASILB"), //
	MAIN_NEGATIVE_RELAY_STUCK(173, "Contactor", "Main negative relay stuck when high voltage power on", "ASILB"), //
	MAIN_POSITIVE_RELAY_STUCK_POWER_OFF(177, "Contactor",
			"Main positive or precharge relay stuck during high voltage power off", "ASILB"), //
	MAIN_POSITIVE_RELAY_OPEN(178, "Contactor", "Main positive relay is open after requesting close main positive relay",
			"ASILB"), //
	MAIN_NEGATIVE_RELAY_STUCK_DETECT(181, "Contactor", "Detect Main Neg. relay stuck during power on", "ASILB"), //
	MAIN_POSITIVE_CONTACTOR_COIL_SHORT_GND(210, "Contactor", "Main positive contactor coil circuit short to GND fault",
			"ASILB"), //
	MAIN_POSITIVE_CONTACTOR_COIL_SHORT_POWER(211, "Contactor",
			"Main positive contactor coil circuit short to power fault", "ASILB"), //
	MAIN_POSITIVE_CONTACTOR_COIL_OPEN(212, "Contactor", "Main positive contactor coil circuit open fault", "ASILB"), //
	MAIN_NEGATIVE_CONTACTOR_COIL_SHORT_GND(214, "Contactor", "Main negative contactor coil circuit short to GND fault",
			"ASILB"), //
	MAIN_NEGATIVE_CONTACTOR_COIL_SHORT_POWER(215, "Contactor",
			"Main negative contactor coil circuit short to power fault", "ASILB"), //
	MAIN_NEGATIVE_CONTACTOR_COIL_OPEN(216, "Contactor", "Main negative contactor coil circuit open fault", "ASILB"), //
	PRECHARGE_CONTACTOR_COIL_SHORT_GND(218, "Contactor", "Precharge contactor coil circuit short to GND fault",
			"ASILB"), //
	PRECHARGE_CONTACTOR_COIL_OPEN(220, "Contactor", "Precharge contactor coil circuit open fault", "ASILB"), //
	MAIN_POSITIVE_RELAY_AGE_LEVEL1(230, "Contactor", "Main positive relay age level1 alarm fault (over 750,000 times)",
			"ASILB"), //
	MAIN_POSITIVE_RELAY_LIFE_EXHAUSTED(231, "Contactor",
			"Main positive relay life cycle has exhausted, relay has welded risk, level 2 fault (over 800,000 times)",
			"ASILB"), //
	MAIN_NEGATIVE_RELAY_AGE_LEVEL1(232, "Contactor",
			"Main negative relay life cycle is nearly exhausted, relay welded risk risen, level 1 fault (over 750,000 times)",
			"ASILB"), //
	MAIN_NEGATIVE_RELAY_LIFE_EXHAUSTED(233, "Contactor",
			"Main negative relay life cycle has exhausted, relay has welded risk, level 2 fault (over 800,000 times)",
			"ASILB"), //
	PRECHARGE_RELAY_AGE_LEVEL1(234, "Contactor",
			"Precharge relay life cycle is nearly exhausted, relay welded risk risen, level 1 fault (over 370,000 times)",
			"ASILB"), //
	PRECHARGE_RELAY_LIFE_EXHAUSTED(235, "Contactor",
			"Precharge relay life cycle has exhausted, relay has welded risk, level 2 fault (over 400,000 times)",
			"ASILB"), //
	MAIN_NEGATIVE_RELAY_STUCK_POWER_OFF_1511(1511, "Status of neg. contactors",
			"Main negative relay stuck during high voltage power off", "ASILB"), //
	MAIN_POSITIVE_RELAY_STUCK_POWER_OFF_1522(1522, "Status of pos. and neg. contactors",
			"Main positive or precharge relay stuck during high voltage power off", "ASILB"), //
	MAIN_NEGATIVE_RELAY_STUCK_1570(1570, "Status of pos. and neg. contactors",
			"Main negative relay stuck when high voltage power on", "ASILB"), //
	MAIN_POSITIVE_RELAY_OPEN_1573(1573, "Status of pos. and neg. contactors",
			"Main positive relay is open after requesting close main positive relay", "ASILB"), //
	MAIN_NEGATIVE_RELAY_STUCK_DETECT_1579(1579, "Status of pos. and neg. contactors",
			"Detect Main Neg. relay stuck during power on", "ASILB"), //
	MAIN_POSITIVE_CONTACTOR_COIL_SHORT_GND_1587(1587, "Status of pos. and neg. contactors",
			"Main positive contactor coil circuit short to GND fault", "ASILB"), //
	MAIN_POSITIVE_CONTACTOR_COIL_SHORT_POWER_1588(1588, "Status of pos. and neg. contactors",
			"Main positive contactor coil circuit short to power fault", "ASILB"), //
	MAIN_POSITIVE_CONTACTOR_COIL_OPEN_1589(1589, "Status of pos. and neg. contactors",
			"Main positive contactor coil circuit open fault", "ASILB"), //
	MAIN_NEGATIVE_CONTACTOR_COIL_SHORT_GND_1591(1591, "Status of pos. and neg. contactors",
			"Main negative contactor coil circuit short to GND fault", "ASILB"), //
	MAIN_NEGATIVE_CONTACTOR_COIL_SHORT_POWER_1592(1592, "Status of pos. and neg. contactors",
			"Main negative contactor coil circuit short to power fault", "ASILB"), //
	MAIN_NEGATIVE_CONTACTOR_COIL_OPEN_1593(1593, "Status of pos. and neg. contactors",
			"Main negative contactor coil circuit open fault", "ASILB"), //
	PRECHARGE_CONTACTOR_COIL_SHORT_GND_1595(1595, "Status of pos. and neg. contactors",
			"Precharge contactor coil circuit short to GND fault", "ASILB"), //
	PRECHARGE_CONTACTOR_COIL_SHORT_POWER_1596(1596, "Status of pos. and neg. contactors",
			"Precharge contactor coil circuit short to power fault", "ASILB"), //
	PRECHARGE_CONTACTOR_COIL_OPEN_1597(1597, "Status of pos. and neg. contactors",
			"Precharge contactor coil circuit open fault", "ASILB"), //
	MAIN_POSITIVE_RELAY_AGE_LEVEL1_1682(1682, "Status of pos. and neg. contactors",
			"Main positive relay age level1 alarm fault (over 750,000 times)", "ASILB"), //
	MAIN_POSITIVE_RELAY_LIFE_EXHAUSTED_1683(1683, "Status of pos. and neg. contactors",
			"Main positive relay life cycle has exhausted, relay has welded risk, level 2 fault (over 800,000 times)",
			"ASILB"), //
	MAIN_NEGATIVE_RELAY_AGE_LEVEL1_1684(1684, "Status of pos. and neg. contactors",
			"Main negative relay life cycle is nearly exhausted, relay welded risk risen, level 1 fault (over 750,000 times)",
			"ASILB"), //
	MAIN_NEGATIVE_RELAY_LIFE_EXHAUSTED_1685(1685, "Status of pos. and neg. contactors",
			"Main negative relay life cycle has exhausted, relay has welded risk, level 2 fault (over 800,000 times)",
			"ASILB"), //
	PRECHARGE_RELAY_AGE_LEVEL1_1686(1686, "Status of pos. and neg. contactors",
			"Precharge relay life cycle is nearly exhausted, relay welded risk risen, level 1 fault (over 370,000 times)",
			"ASILB"), //
	PRECHARGE_RELAY_LIFE_EXHAUSTED_1687(1687, "Status of pos. and neg. contactors",
			"Precharge relay life cycle has exhausted, relay has welded risk, level 2 fault (over 400,000 times)",
			"ASILB"), //

	// Current Sensor (273-274, 288, 303-306, 311-312, 321, 327, 333, 339, 342, 348,
	// 369, 371, 383, 393, 396, 401, 407-410, 439-443, 452)
	PRESSURE_SENSOR_ABNORMAL_ERROR(273, "Fault Diagnosis", "Pressure sensor abnormal error", "QM"), //
	PRESSURE_SENSOR_WAKEUP_ERROR(274, "Fault Diagnosis", "Pressure sensor wake up BMS hardwire line error", "QM"), //
	PRIMARY_CURRENT_SENSOR_INVALID(288, "Current Sensor",
			"Primary current value sent by current sensor is invalid or internal fault appears in current sensor",
			"QM"), //
	INSULATION_LEVEL1_OPENED(303, "Insulation",
			"High voltage relay opened, isolation level 1 fault (750Ω/V during DC charging 500Ω/V)", "ASILB"), //
	DOUBLE_INSULATION_RESISTANCE_LOW(304, "Insulation",
			"Double isolation resistance is low (500Ω/V during DC charging 100Ω/V)", "ASILB"), //
	ISOLATION_DETECTION_CIRCUIT_FAULT(305, "Insulation", "Isolation detection circuit fault", "ASILB"), //
	VEHICLE_COOLANT_DEFEAT_ERROR(306, "Thermal Management", "Vehicle coolant defeat error", "QM"), //
	WATER_INLET_TEMP_SENSOR_FAIL(311, "Thermal Management", "Water inlet temperature sensor failure", "QM"), //
	WATER_OUTLET_TEMP_SENSOR_FAIL(312, "Thermal Management", "Water outlet temperature sensor failure", "QM"), //
	CANNOT_RECEIVE_CURRENT_SAMPLING(321, "Current Sensor",
			"BMU cannot receive current sampling message sent by current sensor", "ASILC"), //
	BMU_CANNOT_RECEIVE_CURRENT_SAMPLING(327, "Fault Diagnosis",
			"BMU cannot receive current sampling message sent by current sensor", "QM"), //
	CURRENT_MESSAGE_CRC_FAIL(333, "Current Sensor", "Primary current message CRC check fault occurs", "ASILC"), //
	CURRENT_SAMPLING_CRC_CHECK_FAIL(339, "Fault Diagnosis", "Current sampling message CRC check fail", "QM"), //
	CURRENT_MESSAGE_ROLLING_COUNTER_FAIL(342, "Current Sensor",
			"Primary current sampling message rolling counter fault occurs", "ASILC"), //
	CURRENT_MESSAGE_ROLLING_COUNTER_FAULT(348, "Fault Diagnosis",
			"Current Message rolling counter Fault occur in any branch", "QM"), //
	ZERO_OFFSET_DEVIATION(369, "Current Sensor", "Zero offset appears and leads to sample deviation", "ASILC"), //
	CURRENT_OUT_OF_RANGE_2000A(371, "Current Sensor",
			"Current value is out of current sensor measurement range (2000A)", "ASILC"), //
	ALL_CURRENT_SENSOR_INVALID(383, "Current Sensor", "All current sensor collect invalid data", "ASILC"), //
	CSU_ECC_DOUBLE_FAULT(393, "Current Sensor", "CSU ECC double fault, won't impact current validity", "QM"), //
	CSU_RESET_FAULT(396, "Fault Diagnosis", "CSU reset fault, maybe impact on current validity", "QM"), //
	BMS_CANNOT_DETECT_KL15_SIGNAL(401, "Fault Diagnosis",
			"In power on mode, BMS can not detect the kl15 signal from the hardware line", "QM"), //
	CELL_TEMP_SENSOR_COMM_E2E_FAULT(407, "Temperature", "Cell temperature sensor communication E2E fault", "ASILC"), //
	CELL_TEMP_SENSOR_MINOR_FAULT(408, "Temperature", "Cell temperature sensor minor fault", "ASILC"), //
	CELL_TEMP_SENSOR_SERIOUS_FAULT(409, "Temperature", "Cell temperature sensor serious fault (3 NTC normal values)",
			"ASILC"), //
	SAMPLE_CHIP_HARDWARE_FAULT(410, "Cell Voltage", "Sample chip hardware fault", "ASILC"), //
	CURRENT_SENSOR_SUPPLY_VOLTAGE_FAULT(439, "Current Sensor",
			"Current Sensor Supply power Voltage too Low or too high Fault", "QM"), //
	CSU_READ_KB_VALUE_FAULT(440, "Current Sensor", "CSU read KB value fault, won't impact current validity", "QM"), //
	PRIMARY_CURRENT_SENSOR_TEMP_OVER_441(441, "Current Sensor",
			"Primary current sensor CSU internal sample temperature over protection threshold", "QM"), //
	PRIMARY_CURRENT_SENSOR_TEMP_OVER(442, "Current Sensor",
			"Primary current sensor CSU internal sample temperature over protection threshold", "QM"), //
	BMU_CANNOT_RECEIVE_CSU_STATUS(443, "CSU Fault", "BMU cannot receive CSU fault status message sent by CSU", "QM"), //
	RTC_CHIP_INITIAL_FAIL(452, "Fault Diagnosis", "RTC Chip Initial fail or no update", "QM"), //

	// Fault Diagnosis (455-470, 473-474, 150, 151, 199, 1508-1518, 1581-1586, 1681,
	// 1692-1699, 1700-1705, 1726, 1746, 1851-1852)
	SOC_HIGHER_THAN_UPPER_LIMIT(150, "SOC", "SOC is higher than the upper limit (>100%)", "QM"), //
	SOC_LOWER_THAN_LOWER_LIMIT1(151, "SOC", "SOC is lower than the lower limit1 (<5%)", "QM"), //
	BPS_LOW_POWER_CALIBRATION_FAILURE(199, "Fault Diagnosis",
			"BPS low power parameter calibration failure after BSM initialization", "QM"), //
	HVIL1_OPEN_CIRCUIT_1508(1508, "HVIL Circuitry Status",
			"High voltage interlock loop 1 open circuit fault (HVIL1 to Vehicle)", "ASILB"), //
	HVIL1_SHORT_TO_POWER_1510(1510, "HVIL Circuitry Status",
			"High voltage interlock loop 1 short to power fault (HVIL1 to Vehicle)", "ASILB"), //
	HVIL1_SHORT_TO_GND_1512(1512, "HVIL Circuitry Status",
			"The high voltage interlock loop 1 of voltage or current happen short to GND fault", "ASILB"), //
	HVIL2_OPEN_CIRCUIT_1513(1513, "HVIL Circuitry Status",
			"The high voltage interlock loop 2 of voltage or current happen open circuit fault", "ASILB"), //
	HVIL2_SHORT_TO_POWER_1514(1514, "HVIL Circuitry Status",
			"The high voltage interlock loop 2 of voltage or current short to power fault", "ASILB"), //
	HVIL2_SHORT_TO_GND_1515(1515, "HVIL Circuitry Status",
			"The high voltage interlock loop 2 of voltage or current happen short to GND fault", "ASILB"), //
	HVIL3_OPEN_CIRCUIT_1516(1516, "HVIL Circuitry Status",
			"The high voltage interlock loop 3 of voltage or current happen open circuit fault", "ASILB"), //
	HVIL3_SHORT_TO_POWER_1517(1517, "HVIL Circuitry Status",
			"The high voltage interlock loop 3 of voltage or current short to power fault", "ASILB"), //
	HVIL3_SHORT_TO_GND_1518(1518, "HVIL Circuitry Status",
			"The high voltage interlock loop 3 of voltage or current happen short to GND fault", "ASILB"), //
	INSULATION_LEVEL2_CLOSED_1581(1581, "Insulation resistance acquisition function",
			"High voltage relay closed, isolation level 2 fault (500Ω/V during DC charging 100Ω/V)", "ASILB"), //
	INSULATION_LEVEL2_OPENED_1582(1582, "Insulation resistance acquisition function",
			"High voltage relay opened, isolation level 2 fault (500Ω/V during DC charging 100Ω/V)", "ASILB"), //
	INSULATION_LEVEL1_CLOSED_1583(1583, "Insulation resistance acquisition function",
			"High voltage relay closed, isolation level 1 fault (750Ω/V during DC charging 500Ω/V)", "ASILB"), //
	INSULATION_LEVEL1_OPENED_1584(1584, "Insulation resistance acquisition function",
			"High voltage relay opened, isolation level 1 fault (750Ω/V during DC charging 500Ω/V)", "ASILB"), //
	DOUBLE_INSULATION_RESISTANCE_LOW_1585(1585, "Insulation resistance acquisition function",
			"Double isolation resistance is low (500Ω/V during DC charging 100Ω/V)", "ASILB"), //
	ISOLATION_DETECTION_CIRCUIT_FAULT_1586(1586, "Insulation resistance acquisition function",
			"Isolation detection circuit fault", "ASILB"), //
	MCU_INTERNAL_ADC_FAULT_1681(1681, "Fault diagnosis and treatment", "MCU internal ADC fault", "ASILB"), //
	MCU_HARDWARE_SELF_TEST_FAULT_1692(1692, "Fault diagnosis and treatment", "MCU hardware self-test fault", "ASILB"), //
	BMS_UNEXPECTED_RESET_FAULT_1693(1693, "Fault diagnosis and treatment", "BMS unexpected reset fault", "ASILB"), //
	MCAL_FAULT_1694(1694, "Fault diagnosis and treatment", "MCAL Fault", "ASILB"), //
	POWER_SUPPLY_IC_SELF_TEST_FAULT_1695(1695, "Fault diagnosis and treatment", "Power supply IC self-test fault",
			"ASILB"), //
	POWER_SUPPLY_IC_INTERNAL_LEVEL1_1696(1696, "Fault diagnosis and treatment",
			"Power supply IC power internal circuit level 1 fault", "ASILB"), //
	POWER_SUPPLY_IC_INTERNAL_LEVEL2_1697(1697, "Fault diagnosis and treatment",
			"Power supply IC power internal circuit level 2 fault", "ASILB"), //
	POWER_SUPPLY_IC_EXTERNAL_LEVEL1_1698(1698, "Fault diagnosis and treatment",
			"Power supply IC power BMU external happen level 1 fault", "ASILB"), //
	POWER_SUPPLY_IC_EXTERNAL_LEVEL2_1699(1699, "Power supply chip fault",
			"Power supply IC power external level 2 fault", "ASILB"), //
	MCU_RAM_ERROR_1700(1700, "Fault diagnosis and treatment", "MCU RAM Error", "ASILB"), //
	MCU_ROM_ERROR_1701(1701, "Fault diagnosis and treatment", "MCU ROM Error", "ASILB"), //
	MCU_NVRAM_ERROR_1702(1702, "Fault diagnosis and treatment", "MCU NVRAM Error", "ASILB"), //
	MCU_INTERNAL_WATCHDOG_ERROR_1703(1703, "Fault diagnosis and treatment", "MCU internal watchdog Error", "ASILB"), //
	MCU_EXTERNAL_WATCHDOG_ERROR_1704(1704, "Fault diagnosis and treatment", "MCU external watchdog Error", "ASILB"), //
	MCU_REGISTER_ERROR_1705(1705, "Fault diagnosis and treatment", "MCU Register Error", "ASILB"), //
	BMU_CANNOT_RECEIVE_CSU_STATUS_1726(1726, "CSU fault",
			"BMU cannot receive CSU fault status message sent by CSU (Applied to CSU)", "ASILB"), //
	NVM_OR_DFLASH_INVALID_FAULT_1746(1746, "Fault diagnosis and treatment", "NVM or Dflash Invalid Fault", "ASILB"), //
	BPS_COMMUNICATION_TIMEOUT(473, "Fault Diagnosis", "BPS communication timeout", "QM"), //
	THERMAL_RUNAWAY_FAULT(474, "Thermal Runaway", "Thermal runaway fault", "QM"), //
	THERMAL_RUNAWAY_DETECTION_CIRCUIT_FAULT_1851(1851, "Thermal runaway - detection",
			"Thermal runaway detection circuit fault", "ASILB"), //
	THERMAL_RUNAWAY_FAULT_1852(1852, "Thermal runaway - detection", "Thermal runaway fault", "ASILB"), //

	// Additional entries from your original code that maintain the same structure
	MCU_HARDWARE_SELF_TEST_FAULT(455, "Fault Diagnosis", "MCU hardware self-test fault", "ASILB"), //
	MCU_INTERNAL_ADC_FAULT(456, "Fault Diagnosis", "MCU internal ADC fault", "ASILB"), //
	BMS_UNEXPECTED_RESET_FAULT(457, "Fault Diagnosis", "BMS unexpected reset fault", "ASILB"), //
	MCU_RAM_ERROR(458, "Fault Diagnosis", "MCU RAM Error", "ASILB"), //
	MCU_ROM_ERROR(459, "Fault Diagnosis", "MCU ROM Error", "ASILB"), //
	MCU_NVRAM_ERROR(460, "Fault Diagnosis", "MCU NVRAM Error", "ASILB"), //
	MCU_INTERNAL_WATCHDOG_ERROR(461, "Fault Diagnosis", "MCU internal watchdog Error", "ASILB"), //
	MCU_EXTERNAL_WATCHDOG_ERROR(462, "Fault Diagnosis", "MCU external watchdog Error", "ASILB"), //
	MCU_REGISTER_ERROR(463, "Fault Diagnosis", "MCU Register Error", "ASILB"), //
	MCAL_FAULT(464, "Fault Diagnosis", "MCAL Fault", "ASILB"), //
	POWER_SUPPLY_IC_SELF_TEST_FAULT(465, "Fault Diagnosis", "Power supply IC self-test fault", "ASILB"), //
	POWER_SUPPLY_IC_INTERNAL_LEVEL1(466, "Fault Diagnosis", "Power supply IC power internal circuit level 1 fault",
			"ASILB"), //
	POWER_SUPPLY_IC_INTERNAL_LEVEL2(467, "Fault Diagnosis", "Power supply IC power internal circuit level 2 fault",
			"ASILB"), //
	POWER_SUPPLY_IC_EXTERNAL_LEVEL1(468, "Fault Diagnosis", "Power supply IC power BMU external happen level 1 fault",
			"ASILB"), //
	POWER_SUPPLY_IC_EXTERNAL_LEVEL2(469, "Power Supply", "Power supply IC power external level 2 fault", "ASILB"), //
	NVM_OR_DFLASH_INVALID_FAULT(470, "Fault Diagnosis", "NVM or Dflash Invalid Fault", "ASILC"), //

	;

	private final int code;
	private final String category;
	private final String description;
	private final String safetyLevel;

	private DtcFailure(int code, String category, String description, String safetyLevel) {
		this.code = code;
		this.category = category;
		this.description = description;
		this.safetyLevel = safetyLevel;
	}

	public String getFormattedMessage() {
		return String.format("Fault Code(%d) %s function: %s [%s]", this.code, this.category, this.description,
				this.safetyLevel);
	}

	public int getCode() {
		return this.code;
	}

	public String getCategory() {
		return this.category;
	}

	public String getDescription() {
		return this.description;
	}

	public String getSafetyLevel() {
		return this.safetyLevel;
	}

	public static Map<Integer, String> getDtcFailures() {
		return Arrays.stream(DtcFailure.values())
				.collect(Collectors.toUnmodifiableMap(DtcFailure::getCode, DtcFailure::getFormattedMessage));
	}

}