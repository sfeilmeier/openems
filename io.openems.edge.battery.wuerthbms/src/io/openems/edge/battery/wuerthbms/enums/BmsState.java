package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum BmsState implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	INITIALIZATION(0, "BMS initialization"), //
	IDLE_STATE(1, "BMS idle state"), //
	DISCHARGE_STATE(2, "BMS discharge state"), //
	CHARGE_STATE(3, "BMS charge state"), //
	OFFLINE_STATE(4, "BMS offline state"), //
	ERROR_STATE(5, "BMS error state"), //
	SAFE_STATE(6, "BMS safe state"), //
	SLEEP_STATE(7, "BMS sleep state"), //
	RECALIBRATION(8, "BMS recalibration state"), //
	CLOSING(9, "BMS closing state"), //
	OPENING(10, "BMS opening state") //
	;

	private final int value;
	private final String name;

	BmsState(int value, String name) {
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
