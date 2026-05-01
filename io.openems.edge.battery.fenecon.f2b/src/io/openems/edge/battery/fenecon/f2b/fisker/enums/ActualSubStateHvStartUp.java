package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import io.openems.common.types.OptionsEnum;

public enum ActualSubStateHvStartUp implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	NOT_INITIALISED(0, "Not initialised"), //
	DECISION_ERROR_RESET(1, "Decision error reset"), //
	ERROR_RESET(2, "Error reset"), //
	PRECHARGE(3, "Precharge"), //
	ISOLATION_TEST(4, "Isolation test"), //
	HV_STARTUP_SUCCESSFUL(5, "HV startup successful"), //
	;//

	private final int value;
	private final String name;

	private ActualSubStateHvStartUp(int value, String name) {
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