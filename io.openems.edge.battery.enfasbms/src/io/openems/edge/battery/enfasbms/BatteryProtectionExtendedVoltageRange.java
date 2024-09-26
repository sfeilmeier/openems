package io.openems.edge.battery.enfasbms;

import io.openems.edge.common.linecharacteristic.PolyLine;

public class BatteryProtectionExtendedVoltageRange extends EnfasBatteryProtectionDefinition {

	@Override
	public PolyLine getChargeVoltageToPercent() {
		return PolyLine.create() //
				.addPoint(4145, 1) //
				.addPoint(4160, 0.1) //
				.addPoint(Math.nextDown(4165), 0.01) //
				.addPoint(4170, 0) //
				.build();
	}

	@Override
	public PolyLine getDischargeVoltageToPercent() {
		return PolyLine.create() //
				.addPoint(3143, 0) //
				.addPoint(Math.nextUp(3150), 0.01) //
				.addPoint(3347, 0.1) //
				.addPoint(3387, 1) //
				.build();
	}

}
