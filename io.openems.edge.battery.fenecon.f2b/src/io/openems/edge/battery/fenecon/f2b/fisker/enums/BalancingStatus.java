package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import io.openems.common.types.OptionsEnum;

public enum BalancingStatus implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	DEACTIVATED(0, "Balancing deactivated"), //
	IDLE(1, "Balancing idle"), //
	START(2, "Balancing start"), //
	OPERATIONAL(3, "Balancing operational"), //
	STOP(4, "Balancing stop"), //
	RELAXATION(5, "Balancing relaxation"), //
	;//

	private final int value;
	private final String name;

	private BalancingStatus(int value, String name) {
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