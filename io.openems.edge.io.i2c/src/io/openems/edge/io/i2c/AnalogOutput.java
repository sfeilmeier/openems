package io.openems.edge.io.i2c;

public enum AnalogOutput {
	MODBERRY_CHANNEL_1(0x50, 0x60), //
	MODBERRY_CHANNEL_2(0x52, 0x60), //
	;

	public final int registerAddress;
	public final int slaveAddress;

	private AnalogOutput(int registerAddress, int slaveAddress) {
		this.registerAddress = registerAddress;
		this.slaveAddress = slaveAddress;
	}
}