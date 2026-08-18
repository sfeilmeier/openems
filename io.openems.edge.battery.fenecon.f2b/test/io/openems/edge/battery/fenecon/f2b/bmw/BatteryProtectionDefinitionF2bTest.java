package io.openems.edge.battery.fenecon.f2b.bmw;

import static io.openems.edge.common.test.TestUtils.withValue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.fenecon.f2b.bmw.enums.HeatingRequest;

public class BatteryProtectionDefinitionF2bTest {

	@Test
	public void testVoltageNull() {
		var battery = new BatteryFeneconF2bBmwImpl();
		assertForceChargeDischargeCurrent(battery, 2);
	}

	@Test
	public void testVoltageZero() {
		var battery = new BatteryFeneconF2bBmwImpl();
		withValue(battery, Battery.ChannelId.VOLTAGE, 0);
		assertForceChargeDischargeCurrent(battery, 2);
	}

	@Test
	public void testNoHeatingActive() {
		var battery = new BatteryFeneconF2bBmwImpl();
		withValue(battery, Battery.ChannelId.VOLTAGE, 325);
		assertForceChargeDischargeCurrent(battery, 2);
	}

	@Test
	public void testHeatingActiveWithKnownPower() {
		var battery = new BatteryFeneconF2bBmwImpl();
		withValue(battery, Battery.ChannelId.VOLTAGE, 325);
		withValue(battery, BatteryFeneconF2bBmw.ChannelId.HEATING_POWER, Constants.RELEASED_POWER); // 1000 W
		assertForceChargeDischargeCurrent(battery, 6);
	}

	@Test
	public void testHeatingRequestedButPowerNotYetAvailable() {
		var battery = new BatteryFeneconF2bBmwImpl();
		withValue(battery, Battery.ChannelId.VOLTAGE, 325);
		withValue(battery, BatteryFeneconF2bBmw.ChannelId.HEATING_REQUEST,
				HeatingRequest.BATTERY_HEATING_PRECONDITIONING);
		assertForceChargeDischargeCurrent(battery, 6);
	}

	@Test
	public void testHigherHeaterCurrentAtLowerVoltage() {
		var battery = new BatteryFeneconF2bBmwImpl();
		withValue(battery, Battery.ChannelId.VOLTAGE, 200);
		withValue(battery, BatteryFeneconF2bBmw.ChannelId.HEATING_POWER, Constants.RELEASED_POWER); // 1000 W
		assertForceChargeDischargeCurrent(battery, 7);
	}

	private static void assertForceChargeDischargeCurrent(BatteryFeneconF2bBmwImpl battery, int expected) {
		assertEquals(expected, //
				new BatteryProtectionDefinitionF2b(battery) //
						.getForceChargeDischargeCurrent() //
						.getAsInt());
	}
}
