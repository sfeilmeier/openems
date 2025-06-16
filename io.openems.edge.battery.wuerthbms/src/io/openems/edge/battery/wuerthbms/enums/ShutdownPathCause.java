package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum ShutdownPathCause implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	NONE(0, "None"), //
	DIE_TEMPERATURE_SHUTDOWN(1, "DIE_TEMPERATURE_SHUTDOWN"), //
	HEARTBEAT_STATUS(2, "Heartbeat status"), //
	CURRENT_STATUS(3, "Current status"), //
	BATTERY_CELL_STATUS(4, "Battery cell status"), //
	SHUTDOWN_PATH_TEST(5, "Shutdown path test"), //
	SYSTEM_LOCK_RELAY_STATUS(6, "System lock relay status"), //
	SYSTEM_LOCK_CELL_STATUS(7, "System lock cell status"), //
	SYSTEM_LOCK_OVERCURRENT(8, "System lock overcurrent"), //
	SYSTEM_LOCK_NVM_ERROR(9, "System lock NVM error"), //
	SYSTEM_LOCK_TEMPDEP_OVERCURRENT(10, "System lock tempdep overcurrent"), //
	TASK_MONITORING(11, "Task monitoring"), //
	STM_TIMER_MONITORING(12, "STM timer monitoring"), //
	WDG_CONFIG_MONITORING(13, "WDG config monitoring"), //
	WDG_STATUS_MONITORING(14, "WDG status monitoring"), //
	CVCM_NOT_READY(15, "CVCM not ready"), //
	BCM_NOT_READY(16, "BCM not ready"), //
	SHUNT_CALIBRATION_FAIL(17, "Shunt calibration fail"), //
	;

	private final int value;
	private final String name;

	private ShutdownPathCause(int value, String name) {
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
