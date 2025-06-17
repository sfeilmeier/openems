package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum CellBalancingState implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	INIT(0, "Init"), //
	ONGOING(1, "Cell balance ongoing"), //
	FINISHED(2, "Cell balance finished"), //
	NOT_NEEDED(3, "Cell balance not needed"); //

	private final int value;
	private final String name;

	CellBalancingState(int value, String name) {
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
