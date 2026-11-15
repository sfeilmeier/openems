package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import io.openems.common.types.OptionsEnum;

public enum ActualState implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	RESERVED(0, "Reserved"), //
	OFF(1, "Off"), //
	STANDBY(2, "Standby"), //
	HV_ON(3, "HV on"), //
	HV_STARTUP(4, "HV startup"), //
	WAKEUP(5, "Wakeup"), //
	SHUTDOWN(6, "Shutdown"), //
	;//

	private final int value;
	private final String name;

	private ActualState(int value, String name) {
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