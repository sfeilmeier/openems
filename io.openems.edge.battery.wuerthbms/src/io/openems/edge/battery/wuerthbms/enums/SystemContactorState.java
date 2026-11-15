package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum SystemContactorState implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	IGNORE(0, "Contactor ignore"), //
	INIT(1, "Contactor init"), //
	CLOSING(2, "Contactor closing"), //
	OPENING(3, "Contactor opening"), //
	CLOSED(4, "Contactor closed"), //
	OPEN(5, "Contactor open"), //
	ERROR(6, "Contactor error"), //
	LOCKED(7, "Contactor locked"), //
	;

	private final int value;
	private final String name;

	SystemContactorState(int value, String name) {
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
