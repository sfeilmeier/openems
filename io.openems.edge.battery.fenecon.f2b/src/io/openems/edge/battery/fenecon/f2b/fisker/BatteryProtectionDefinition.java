package io.openems.edge.battery.fenecon.f2b.fisker;

import io.openems.edge.battery.protection.force.ForceCharge;
import io.openems.edge.battery.protection.force.ForceDischarge;
import io.openems.edge.common.linecharacteristic.PolyLine;

public class BatteryProtectionDefinition implements io.openems.edge.battery.protection.BatteryProtectionDefinition {

	@Override
	public int getInitialBmsMaxEverChargeCurrent() {
		return 135; // [A]
	}

	@Override
	public int getInitialBmsMaxEverDischargeCurrent() {
		return 135; // [A]
	}

	@Override
	public PolyLine getChargeVoltageToPercent() {
		return PolyLine.empty();
	}

	@Override
	public PolyLine getDischargeVoltageToPercent() {
		return PolyLine.empty();
	}

	@Override
	public PolyLine getChargeTemperatureToPercent() {
		return PolyLine.create() //
				.addPoint(-36, 0.01) //
				.addPoint(Math.nextUp(-36), 0.01) //
				.addPoint(5, 1) //
				.addPoint(45, 1) //
				.addPoint(Math.nextUp(45), 0.99) //
				.addPoint(Math.nextDown(50), 0.01) //
				.addPoint(51, 0) //
				.build();
	}

	@Override
	public PolyLine getDischargeTemperatureToPercent() {
		return PolyLine.create() //
				.addPoint(-36, 0.01) //
				.addPoint(Math.nextUp(-36), 0.01) //
				.addPoint(5, 1) //
				.addPoint(45, 1) //
				.addPoint(Math.nextUp(45), 0.99) //
				.addPoint(Math.nextDown(50), 0.01) //
				.addPoint(51, 0) //
				.build();
	}

	@Override
	public ForceDischarge.Params getForceDischargeParams() {
		return null;
	}

	@Override
	public ForceCharge.Params getForceChargeParams() {
		return null;
	}

	@Override
	public Double getMaxIncreaseAmperePerSecond() {
		return 1.; // [A] per second
	}

	@Override
	public PolyLine getChargeSocToPercent() {
		return PolyLine.create() //
				.addPoint(94, 1.0) //
				.addPoint(95, 0.0) //
				.build();

	}

	@Override
	public PolyLine getDischargeSocToPercent() {
		return PolyLine.create() //
				.addPoint(6, 1.0) //
				.addPoint(5, 0.0) //
				.build();
	}

	@Override
	public boolean isChargeAllowed() {
		return true;
	}

	@Override
	public boolean isDischargeAllowed() {
		return true;
	}

}