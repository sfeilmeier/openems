package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import io.openems.common.types.OptionsEnum;

public enum OtaReadyStatus implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	INITAL(0, "Ota inital"), //
	READY(1, "Ota ready"), //
	NOT_READY(2, "Ota not ready"), //
	INVALID(3, "Ota invalid"), //
	;//

	private final int value;
	private final String name;

	private OtaReadyStatus(int value, String name) {
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