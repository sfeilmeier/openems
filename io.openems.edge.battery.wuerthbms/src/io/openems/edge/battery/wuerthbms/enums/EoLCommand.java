package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum EoLCommand implements OptionsEnum {

	DO_NOTHING(-1, "Do nothing"), //
	OPEN(0, "Close contactors"), //
	CLOSE(1, "Open contactors"); //

	private final int value;
	private final String name;

	EoLCommand(int value, String name) {
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
		return DO_NOTHING;
	}

}
