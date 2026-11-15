package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import io.openems.common.types.OptionsEnum;

public enum OperatingStates implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	BOOT(1, "Bms boot"), //
	PRE_OPERATIONAL(2, "Bms preoperational"), //
	OPERATIONAL(3, "Bms operational"), //
	PRE_SLEEP(4, "Balancing presleep"), //
	CONFIG(5, "Balancing config"), //
	;//

	private final int value;
	private final String name;

	private OperatingStates(int value, String name) {
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