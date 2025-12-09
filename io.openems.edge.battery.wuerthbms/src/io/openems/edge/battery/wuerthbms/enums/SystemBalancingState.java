package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum SystemBalancingState implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	PENDING(0, "Balancing pending"), //
	ACTIVE(1, "Balancing active"), //
	DONE(2, "Balancing done"), //
	INACTIVE(3, "Balancing inactive"); //

	private final int value;
	private final String name;

	SystemBalancingState(int value, String name) {
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
