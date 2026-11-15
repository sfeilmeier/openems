package io.openems.edge.battery.enfasbms;

import static io.openems.edge.battery.api.Battery.ChannelId.SOC;
import static io.openems.edge.battery.enfasbms.EnfasBms.ChannelId.BATTERY_SOC;
import static io.openems.edge.battery.enfasbms.enums.FirmwareVersion.WUERTH_VERSION_1_0_20;
import static io.openems.edge.common.startstop.StartStopConfig.START;

import org.junit.jupiter.api.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;

public class EnfasBmsImplSocCalculationTest {

	public static final int MAX_16BIT_UNSIGNED_INT = 65535;

	@Test
	public void batteryValuesTest() throws Exception {
		new ComponentTest(new EnfasBmsImpl()) //
				.addReference("setModbus", new DummyModbusBridge("modbus0")) //
				.addReference("componentManager", new DummyComponentManager())
				.addReference("cm", new DummyConfigurationAdmin()) //
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setModbusId("modbus0") //
						.setStartStop(START) //
						.setVersion(WUERTH_VERSION_1_0_20)//
						.build())
				.next(new TestCase("1") //
						.input(BATTERY_SOC, 90) //
						.output(SOC, 90))
				.next(new TestCase("2") //
						.input(BATTERY_SOC, 102) //
						.output(SOC, 100))
				.next(new TestCase("3") //
						.input(BATTERY_SOC, 96) //
						.output(SOC, 95))
				.next(new TestCase("4") //
						.input(BATTERY_SOC, 20)//
						.output(SOC, 20))//
				.next(new TestCase("5") //
						.input(BATTERY_SOC, 4)//
						.output(SOC, 5))//
				.next(new TestCase("6") //
						.input(BATTERY_SOC, MAX_16BIT_UNSIGNED_INT) //
						.output(SOC, null))
				.next(new TestCase("7") //
						.input(BATTERY_SOC, -2) //
						.output(SOC, 0));
	}

}
