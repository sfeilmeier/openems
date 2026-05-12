package io.openems.edge.battery.fenecon.f2b.common.enums;

import io.openems.common.types.OptionsEnum;

public enum F2bBatteryError implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	NO_F2B_BATTERY_ERROR(0, "No f2b battery error"), //
	HV_START_UP_ERROR_RESET_FAILED(1, "Hv startup error reset failed"), //
	HV_START_UP_PRECHARGE_FAILED(2, "Hv startup precharge failed"), //
	HV_START_UP_ISOLATION_TEST_FAILED_RESISTANCE_TO_LOW(3, "Hv startup isolation test failed resistance to low"), //
	HV_START_UP_ISOLATION_TEST_FAILED_RESISTANCE_TO_HIGH(4, "Hv startup isolation test failed resistance to high"), //
	HV_START_UP_ISOLATION_TEST_FAILED_BMS_HV_OFF_EMERGENCY(5, "Hv startup isolation test failed bms hv off emergency"), //
	HV_ON_BMS_HAS_LEFT_HV_ACTIVE(6, "Hv on bms has left hv active"), //
	;//

	private final int value;
	private final String name;

	private F2bBatteryError(int value, String name) {
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