package io.openems.edge.battery.enfasbms;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

import org.junit.Test;

import io.openems.common.test.TimeLeapClock;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.battery.enfasbms.enums.FirmwareVersion;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.DummyConfigurationAdmin;

public class EnfasBmsImplTest {

	private static final String MODBUS_ID = "modbus0";

	private static final String BATTERY_ID = "battery0";

	private static final ChannelAddress MODULE_0_MAX_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module0MaxCellVoltage");
	private static final ChannelAddress MODULE_1_MAX_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module1MaxCellVoltage");
	private static final ChannelAddress MODULE_2_MAX_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module2MaxCellVoltage");
	private static final ChannelAddress MODULE_3_MAX_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module3MaxCellVoltage");
	private static final ChannelAddress MODULE_4_MAX_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module4MaxCellVoltage");
	private static final ChannelAddress MODULE_5_MAX_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module5MaxCellVoltage");

	private static final ChannelAddress MODULE_0_MIN_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module0MinCellVoltage");
	private static final ChannelAddress MODULE_1_MIN_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module1MinCellVoltage");
	private static final ChannelAddress MODULE_2_MIN_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module2MinCellVoltage");
	private static final ChannelAddress MODULE_3_MIN_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module3MinCellVoltage");
	private static final ChannelAddress MODULE_4_MIN_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module4MinCellVoltage");
	private static final ChannelAddress MODULE_5_MIN_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID,
			"Module5MinCellVoltage");

	private static final ChannelAddress MAX_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID, "MaxCellVoltage");
	private static final ChannelAddress MIN_CELL_VOLTAGE = new ChannelAddress(BATTERY_ID, "MinCellVoltage");

	private static final ChannelAddress RESET_BATTERY_COMMAND = new ChannelAddress(BATTERY_ID, "ResetBatteryCommand");
	private static final ChannelAddress STRING_MODULE_COUNT = new ChannelAddress(BATTERY_ID, "StringModuleCount");

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
						.input(MODULE_0_MAX_CELL_VOLTAGE, 90) //
						.input(MODULE_1_MAX_CELL_VOLTAGE, 90) //
						.input(MODULE_2_MAX_CELL_VOLTAGE, 90) //
						.input(MODULE_3_MAX_CELL_VOLTAGE, 90) //
						.input(MODULE_4_MAX_CELL_VOLTAGE, 100) //
						.input(MODULE_5_MAX_CELL_VOLTAGE, 90) //
						.output(MAX_CELL_VOLTAGE, 100) //
						.output(MIN_CELL_VOLTAGE, null))
				.activate(MyConfig.create() //
						.setId(BATTERY_ID) //
						.setModbusId(MODBUS_ID) //
						.setStartStop(StartStopConfig.START) //
						.setVersion(FirmwareVersion.WUERTH_VERSION_1_0_20)//
						.setBatteryProtectionType(BatteryProtectionType.DEFAULT)//
						.build())//
				.next(new TestCase() //
						.input(MODULE_5_MAX_CELL_VOLTAGE, 120) //
						.output(MAX_CELL_VOLTAGE, 120) //
						.output(MIN_CELL_VOLTAGE, null))
				.next(new TestCase() //
						.input(MODULE_0_MIN_CELL_VOLTAGE, 120) //
						.input(MODULE_2_MIN_CELL_VOLTAGE, 120) //
						.input(MODULE_0_MIN_CELL_VOLTAGE, 120) //
						.input(MODULE_3_MIN_CELL_VOLTAGE, 120) //
						.input(MODULE_4_MIN_CELL_VOLTAGE, 120) //
						.input(MODULE_5_MIN_CELL_VOLTAGE, 50) //
						.input(MODULE_1_MIN_CELL_VOLTAGE, 600) //
						.output(MAX_CELL_VOLTAGE, 120) //
						.output(MIN_CELL_VOLTAGE, 50))

		;
	}

	@Test
	public void resetBatteryTest() throws Exception {
		final var clock = new TimeLeapClock(Instant.parse("2020-02-03T08:30:00.00Z"), ZoneOffset.UTC);
		new ComponentTest(new EnfasBmsImpl()) //
				.addReference("setModbus", new DummyModbusBridge(MODBUS_ID)) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.activate(MyConfig.create() //
						.setId(BATTERY_ID) //
						.setModbusId(MODBUS_ID) //
						.setStartStop(StartStopConfig.START) //
						.setVersion(FirmwareVersion.WUERTH_VERSION_1_0_20)//
						.setBatteryProtectionType(BatteryProtectionType.DEFAULT)//
						.build())

				.next(new TestCase() //
						.input(RESET_BATTERY_COMMAND, true)) //
				.next(new TestCase() //
						.timeleap(clock, 2600, ChronoUnit.MILLIS)) //
				.next(new TestCase() //
						.timeleap(clock, 5100, ChronoUnit.MILLIS)) //
				.next(new TestCase()) //
				.next(new TestCase()) //
				.next(new TestCase() //
						.timeleap(clock, 5200, ChronoUnit.MILLIS)) //
				.next(new TestCase() //
						.input(RESET_BATTERY_COMMAND, true)) //
				.next(new TestCase() //
						.input(RESET_BATTERY_COMMAND, false)) //
				.next(new TestCase() //
						.input(RESET_BATTERY_COMMAND, true)) //
				.next(new TestCase() //
						.input(RESET_BATTERY_COMMAND, false)) //
				.next(new TestCase() //
						.input(RESET_BATTERY_COMMAND, false)) //

		;
	}

	@Test
	public void modbusProtocolTest() throws Exception {
		final var clock = new TimeLeapClock(Instant.parse("2020-02-03T08:30:00.00Z"), ZoneOffset.UTC);
		final var numberOfModules = 9;
		new ComponentTest(new EnfasBmsImpl()) //
				.addReference("setModbus", new DummyModbusBridge(MODBUS_ID)) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.activate(MyConfig.create() //
						.setId(BATTERY_ID) //
						.setModbusId(MODBUS_ID) //
						.setStartStop(StartStopConfig.START) //
						.setVersion(FirmwareVersion.WUERTH_VERSION_1_0_20)//
						.setBatteryProtectionType(BatteryProtectionType.DEFAULT)//
						.build())
				.next(new TestCase("1") //
						.input(STRING_MODULE_COUNT, numberOfModules));

	}

}
