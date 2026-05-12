package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import io.openems.common.types.OptionsEnum;

public enum GoRunningSubState implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	REQUEST_STANDBY(0, "Request standby"), //
	REQUEST_HV_ON(1, "Request HV On"), //
	FINISHED(2, "Finished"), //
	ERROR(3, "Error");//

	private final int value;
	private final String name;

	private GoRunningSubState(int value, String name) {
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
