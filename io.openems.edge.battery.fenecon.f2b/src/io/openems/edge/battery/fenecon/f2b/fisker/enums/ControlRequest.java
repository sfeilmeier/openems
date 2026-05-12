package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import io.openems.common.types.OptionsEnum;

public enum ControlRequest implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	NO_REQUEST(0, "No request"), //
	REQUEST_OFF(1, "Off request"), //
	REQUEST_STANDBY(2, "Standby request"), //
	REQUEST_HV_ON(3, "HV on request"), //
	;//

	private final int value;
	private final String name;

	private ControlRequest(int value, String name) {
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