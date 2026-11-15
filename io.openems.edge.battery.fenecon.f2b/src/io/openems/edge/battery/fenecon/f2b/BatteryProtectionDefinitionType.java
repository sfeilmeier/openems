package io.openems.edge.battery.fenecon.f2b;

import io.openems.common.types.OptionsEnum;

public enum BatteryProtectionDefinitionType implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	DEFAULT_PROTECTION(0, "Default battery protection"), //
	RESTRICTED_PROTECTION(1, "Limited battery protection becuase of cooling unit failure");

	private final int value;
	private final String name;

	private BatteryProtectionDefinitionType(int value, String name) {
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