package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum SystemGlobalState implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	INITIALIZATION(0, "BMS initialization"), //
	IDLE(1, "BMS idle state"), //
	DISCHARGE(2, "BMS discharge state"), //
	CHARGE(3, "BMS charge state"), //
	OFFLINE(4, "BMS offline state"), //
	FAULT(5, "BMS fault state"), //
	SAFE(6, "BMS safe state"), //
	SLEEP(7, "BMS sleep state"), //
	RECALIBRATION(8, "BMS recalibration state"), //
	CLOSING(9, "BMS closing state"), //
	OPENING(10, "BMS opening state") //
	;

	private final int value;
	private final String name;

	SystemGlobalState(int value, String name) {
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
