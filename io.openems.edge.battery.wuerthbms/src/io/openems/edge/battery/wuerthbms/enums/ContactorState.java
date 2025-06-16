package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum ContactorState implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	INIT(0, "Contactor init state"), //
	OPEN(1, "Contactor open state"), //
	CLOSE_NEGATIVE(2, "Contactor close negative state"), //
	PRECHARGING(3, "Contactor precharging state"), //
	CLOSE_POSITIVE(4, "Contactor close positive state"), //
	CLOSED(5, "Contactor closed state"), //
	OPENING(6, "Contactor opening state"), //
	ERROR(7, "Contactor error state");

	private final int value;
	private final String name;

	ContactorState(int value, String name) {
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
