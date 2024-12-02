package io.openems.edge.system.fenecon.industrial.m.enums;

import io.openems.common.types.OptionsEnum;

public enum CoolingUnitMode implements OptionsEnum {
	MANUAL_OFF(0, "Manual OFF"), //
	MANUAL_ON(1, "Manual ON"), //
	AUTO(2, "AUTO"), //
	;

	private final int value;
	private final String name;

	private CoolingUnitMode(int value, String name) {
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
		return MANUAL_OFF; // no undefined, because there should no "undefined" selection in the config
	}
}
