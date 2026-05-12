package io.openems.edge.battery.fenecon.f2b.cluster.common.statemachine;

import io.openems.common.types.OptionsEnum;

public enum F2bUpdateSubState implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	RESET_F2B(1, "Resetting every f2b"), //
	UPDATE_F2B(2, "Updating all f2b"), //
	FINISHED(3, "Finished"), //
	ERROR(4, "Error"), //
	RETRY(5, "Retrying"), //
	;//

	private final int value;
	private final String name;

	F2bUpdateSubState(int value, String name) {
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
