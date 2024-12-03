package io.openems.edge.system.fenecon.industrial.m.enums;

import io.openems.common.types.OptionsEnum;

public enum RequestStatus implements OptionsEnum {
	UNDEFINED("Undefined", -1), //
	OFF("Switched off", 0), //
	ON("Switched on", 1), //
	;

	private RequestStatus(String name, int value) {
		this.name = name;
		this.value = value;
	}

	private int value;
	private String name;

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

