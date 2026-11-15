package io.openems.edge.system.fenecon.industrial.m.enums;

public enum CoolingType {

	CHILLER(33, 32), //
	FAN(26, 25), //
	;

	public final int upperThreshold; // [°C]
	public final int lowerThreshold; // [°C]

	private CoolingType(int upperThreshold, int lowerThreshold) {
		this.upperThreshold = upperThreshold;
		this.lowerThreshold = lowerThreshold;
	}

}