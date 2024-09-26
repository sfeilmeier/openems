package io.openems.edge.battery.enfasbms;

import org.junit.Test;

import io.openems.common.types.ChannelAddress;
import io.openems.edge.battery.enfasbms.enums.FirmwareVersion;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.DummyConfigurationAdmin;

public class EnfasBmsImplSocCalculationTest {

	private static final String MODBUS_ID = "modbus0";
	private static final String BATTERY_ID = "battery0";
	private static final ChannelAddress BATTERY_SOC = new ChannelAddress(BATTERY_ID, "BatterySoc");
	private static final ChannelAddress SOC = new ChannelAddress(BATTERY_ID, "Soc");

	public static final int MAX_16BIT_UNSIGNED_INT = 65535;

	@Test
	public void batteryValuesTest() throws Exception {
		new ComponentTest(new EnfasBmsImpl()) //
				.addReference("setModbus", new DummyModbusBridge(MODBUS_ID)) //
				.addReference("componentManager", new DummyComponentManager())
				.addReference("cm", new DummyConfigurationAdmin()) //
				.activate(MyConfig.create() //
						.setId(BATTERY_ID) //
						.setModbusId(MODBUS_ID) //
						.setStartStop(StartStopConfig.START) //
						.setVersion(FirmwareVersion.WUERTH_VERSION_1_0_20)//
						.setBatteryProtectionType(BatteryProtectionType.DEFAULT)//
						.build())
				.next(new TestCase("1") //
						.input(BATTERY_SOC, 90) //
						.output(SOC, 90))
				.next(new TestCase("2") //
						.input(BATTERY_SOC, 102) //
						.output(SOC, 100))
				.next(new TestCase("3") //
						.input(BATTERY_SOC, 20)//
						.output(SOC, 20))//
				.next(new TestCase("4") //
						.input(BATTERY_SOC, MAX_16BIT_UNSIGNED_INT) //
						.output(SOC, 20));
	}
}
