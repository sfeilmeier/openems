package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum ShutdownPathTestFail implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	BATTERY_STRING(0, "Battery string"), //
	HV_PLUS(1, "HV plus"), //
	HV_MINUS(2, "HV minus"), //
	PRECHARGE(3, "Precharge"), //
	NONE(4, "None");

	private final int value;
	private final String name;

	ShutdownPathTestFail(int value, String name) {
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
