package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import io.openems.common.types.OptionsEnum;

public enum BduStatus implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	INITIALIZING(2, "Bms initializing"), //
	STANDBY(3, "Balancing standby"), //
	PRECHARGING(4, "Balancing precharging"), //
	HV_ACTIVE(5, "Balancing HV active"), //
	HV_OFF_EMERGENCY(7, "Balancing HV off emergency"), //
	SHUTDOWN(8, "Balancing shutdown"), //
	;//

	private final int value;
	private final String name;

	private BduStatus(int value, String name) {
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