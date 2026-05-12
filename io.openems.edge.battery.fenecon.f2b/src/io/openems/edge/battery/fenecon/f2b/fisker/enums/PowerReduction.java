package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import io.openems.common.types.OptionsEnum;

public enum PowerReduction implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	NOT_ALLOWED(0, "Power reduction not allowed"), //
	ALLOWED(1, "Power reduction allowed"), //
	;//

	private final int value;
	private final String name;

	private PowerReduction(int value, String name) {
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