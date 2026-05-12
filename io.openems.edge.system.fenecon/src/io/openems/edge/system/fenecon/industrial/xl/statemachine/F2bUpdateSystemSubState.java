package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import io.openems.common.types.OptionsEnum;

public enum F2bUpdateSystemSubState implements OptionsEnum {
	UNDEFINED(-1, "Undefined"), //
	INSTALL_TFTP(0, "Installing Tftp package"), //
	STOP_BATTERIES(1, "Stoping all batteries"), //
	UPDATE_F2BS(2, "Updating all f2b"), //
	ERROR(3, "Error"), //
	FINISHED(4, "Finished"), //
	;//

	private final int value;
	private final String name;

	F2bUpdateSystemSubState(int value, String name) {
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
