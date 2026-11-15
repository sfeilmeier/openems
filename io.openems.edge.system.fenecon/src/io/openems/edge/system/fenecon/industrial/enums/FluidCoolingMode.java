package io.openems.edge.system.fenecon.industrial.enums;

import io.openems.common.types.OptionsEnum;

public enum FluidCoolingMode implements OptionsEnum {

	DISABLED(0, "Manual OFF"), //
	ENABLED(1, "Manual ON"), //
	AUTO(2, "AUTO"), //
	;

	private final int value;
	private final String name;

	private FluidCoolingMode(int value, String name) {
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
		return DISABLED; // no undefined, because there should no "undefined" selection in the config
	}

}
