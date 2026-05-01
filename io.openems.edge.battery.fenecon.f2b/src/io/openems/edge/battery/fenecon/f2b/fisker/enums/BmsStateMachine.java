package io.openems.edge.battery.fenecon.f2b.fisker.enums;

import io.openems.common.types.OptionsEnum;

public enum BmsStateMachine implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	BMS_INIT(2, "Bms initializing"), //
	BMS_STANDBY(3, "Bms standby"), //
	BMS_PRECHARGING(4, "Bms precharging"), //
	HV_ACTIVE(5, "HV active"), //
	BMS_HV_OFF_EMERGENCY(7, "Bms HV off emergency"), //
	BMS_SHUTDOWN(8, "Bms shutdown"), //
	;//

	private final int value;
	private final String name;

	private BmsStateMachine(int value, String name) {
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