package io.openems.edge.battery.enfasbms;

import io.openems.common.types.OptionsEnum;

public enum BatteryProtectionType implements OptionsEnum {

	DEFAULT(1, "Default battery protection"), //
	EXTENDED_VOLTAGE_RANGE(2, "Extended Voltage Range");

	private final int value;
	private final String name;

	private BatteryProtectionType(int value, String name) {
		this.value = value;
		this.name = name;
	}

	@Override
	public int getValue() {
		return this.value;
	}

	@Override
	public OptionsEnum getUndefined() {
		return DEFAULT;
	}

	@Override
	public String getName() {
		return this.name;
	}
}
