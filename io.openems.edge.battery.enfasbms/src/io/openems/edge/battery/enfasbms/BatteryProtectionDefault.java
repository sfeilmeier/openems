package io.openems.edge.battery.enfasbms;

import io.openems.edge.common.linecharacteristic.PolyLine;

public class BatteryProtectionDefault extends EnfasBatteryProtectionDefinition {

	@Override
	public PolyLine getChargeVoltageToPercent() {
		return PolyLine.create() //
				.addPoint(4085, 1) //
				.addPoint(4100, 0.1) //
				.addPoint(Math.nextDown(4104), 0.01) //
				.addPoint(4109, 0) //
				.build();
	}

	@Override
	public PolyLine getDischargeVoltageToPercent() {
		return PolyLine.create() //
				.addPoint(3338, 0) //
				.addPoint(Math.nextUp(3343), 0.01) //
				.addPoint(3347, 0.1) //
				.addPoint(3387, 1) //
				.build();
	}

}