package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum CommandStateRequest implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	DO_NOTHING(0, "Command Do nothing"), //
	CLOSE_CONTACTORS(10, "Command Close contactors"), //
	OPEN_CONTACTORS(12, "Command Open contactors"), //
	SLEEP_MODE_REQUEST(14, "Command Sleep mode request");

	private final int value;
	private final String name;

	CommandStateRequest(int value, String name) {
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
