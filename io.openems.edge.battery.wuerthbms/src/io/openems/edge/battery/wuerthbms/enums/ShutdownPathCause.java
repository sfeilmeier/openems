package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum ShutdownPathCause implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	NONE(0, "None"), //
	DIE_TEMPERATURE_SHUTDOWN(1, "MCU temperature fault"), //
	SOCTEMPDEP_OVERCURRENT(2, "Fault in case load based over current from QM"), //
	HEARTBEAT_STATUS(3, "Fault in LTC heartbeat"), //
	CURRENT_STATUS(4, "Fault in the current reading"), //
	BATTERY_CELL_STATUS(5, "Fault in cell reading values or dangerous cell voltage measurement"), //
	SHUTDOWN_PATH_TEST(6, "Shutdown path test failed"), //
	SYSTEM_LOCK_RELAY_STATUS(7, "System locked due to relay malfunction"), //
	SYSTEM_LOCK_CELL_STATUS(8, "System locked due to cell measurements"), //
	SYSTEM_LOCK_OVERCURRENT(9, "System locked due to overcurrent"), //
	SYSTEM_LOCK_NVM_ERROR(10, "System locked due to Non Volatile Manager error"), //
	SYSTEM_LOCK_TEMPDEP_OVERCURRENT(11, "System locked due to temperature dependent overcurrent monitoring"), //
	TASK_MONITORING(12, "Task malfunction"), //
	STM_TIMER_MONITORING(13, "System Timer module fault"), //
	WDG_CONFIG_MONITORING(14, "Not possible to configure Watchdog"), //
	WDG_STATUS_MONITORING(15, "Watchdog expired"), //
	CVCM_NOT_READY(16, "Not possible to start LTC driver (current readings)"), //
	BCM_NOT_READY(17, "Not possible to start BCM module (TPL fault, CSC fault...)"), //
	SHUNT_CALIBRATION_FAIL(18, "Shunt calibration stored value fault or not stored"), //
	OVERCURRENT_SAFESTATE(19, "Check CR_Contactor_Opening_during_overcurrent document"), //
	ADC_SAFETY_FAIL(20, "Fail in ADC calculation"), //
	PRECHARGE_ENERGY_FAILED(21, "Fail in precharge energy calculation"), //
	;

	private final int value;
	private final String name;

	ShutdownPathCause(int value, String name) {
		this.value = value;
		this.name = name;
	}

	@Override
	public int getValue() {
		return this.value;
	}

	@Override
	public String getName() {
		return this.name;
	}

	@Override
	public OptionsEnum getUndefined() {
		return UNDEFINED;
	}

}
