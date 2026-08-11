package io.openems.edge.battery.fenecon.f2b.update;

import io.openems.common.types.OptionsEnum;

public enum HardwareType implements OptionsEnum {

	UNDEFINED(-1, "Undefined", new F2bFirmwareVersion(0, 0), "00_00_0000"), //
	FM_29(0, "FM29", new F2bFirmwareVersion(1, 2), "26_02_2026");

	private final int value;
	private final String name;
	private final F2bFirmwareVersion latestFirmwareVersion;
	private final String latestVersionDate;

	HardwareType(int value, String name, F2bFirmwareVersion latestFirmwareVersion, String latestVersionDate) {
		this.value = value;
		this.name = name;
		this.latestFirmwareVersion = latestFirmwareVersion;
		this.latestVersionDate = latestVersionDate;
	}

	@Override
	public int getValue() {
		return this.value;
	}

	@Override
	public String getName() {
		return this.name;
	}

	public String getLatestVersionDate() {
		return this.latestVersionDate;
	}

	public F2bFirmwareVersion getLatestFirmwareVersion() {
		return this.latestFirmwareVersion;
	}

	@Override
	public OptionsEnum getUndefined() {
		return UNDEFINED;
	}

}
