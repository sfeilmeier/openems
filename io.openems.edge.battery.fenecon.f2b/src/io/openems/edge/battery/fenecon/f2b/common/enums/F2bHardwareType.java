package io.openems.edge.battery.fenecon.f2b.common.enums;

import io.openems.common.types.OptionsEnum;

/**
 * These types are separate values within the hardware sourcecode and are not
 * directly related to the software version, e.g. there can be a firmware
 * version 1.3 but no hardware type F2B_FM_29_1V3.
 */
public enum F2bHardwareType implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	NO_TYPE_DEFINED(0, "No type defined"), //
	F2B_SE09_PCB_R8(1, "F2B SE09 PCB R8"), //
	F2B_REN_PCB(2, "F2B REN PCB"), //
	F2B_FIS_PCB(3, "F2B FIS PCB"), //
	F2B_FM29_1V0(4, "F2B FM29 1V0"), //
	F2B_FM29_1V2(5, "F2B FM29 1V2"), //
	F2B_FM29_1V3(6, "F2B FM29 1V3"), //
	;//

	private final int value;
	private final String name;

	private F2bHardwareType(int value, String name) {
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

	public String getHardwareModelName() {
		return switch (this) {
		case F2B_FM29_1V0, F2B_FM29_1V2, F2B_FM29_1V3 -> "FM29";
		default -> null;
		};
	}

}