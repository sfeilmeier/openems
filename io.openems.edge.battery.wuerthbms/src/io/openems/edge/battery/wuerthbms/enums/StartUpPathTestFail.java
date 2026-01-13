package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum StartUpPathTestFail implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	HV_PLUS(0, "HV plus"), //
	HV_MINUS(1, "HV minus"), //
	PRECHARGE(2, "Precharge"), //
	NONE(3, "None");

	private final int value;
	private final String name;

	StartUpPathTestFail(int value, String name) {
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
