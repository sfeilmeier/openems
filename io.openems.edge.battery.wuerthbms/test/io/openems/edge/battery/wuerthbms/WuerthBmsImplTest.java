package io.openems.edge.battery.wuerthbms;

import static io.openems.common.utils.FunctionUtils.supplier;
import static io.openems.edge.battery.api.Battery.ChannelId.MAX_CELL_VOLTAGE;
import static io.openems.edge.battery.api.Battery.ChannelId.MIN_CELL_VOLTAGE;
import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.RESET_BATTERY_COMMAND;
import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.STRING_MODULE_COUNT;
import static io.openems.edge.battery.wuerthbms.enums.FirmwareVersion.WUERTH_VERSION_1_0_9;
import static io.openems.edge.common.startstop.StartStopConfig.START;
import static java.time.temporal.ChronoUnit.MILLIS;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.function.Supplier;

import org.junit.Test;

import io.openems.common.test.TimeLeapClock;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.test.AbstractComponentTest;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.DummyConfigurationAdmin;

public class WuerthBmsImplTest {

	private static final String MODULE_0_MAX_CELL_VOLTAGE = "Module0MaxCellVoltage";
	private static final String MODULE_1_MAX_CELL_VOLTAGE = "Module1MaxCellVoltage";
	private static final String MODULE_2_MAX_CELL_VOLTAGE = "Module2MaxCellVoltage";
	private static final String MODULE_3_MAX_CELL_VOLTAGE = "Module3MaxCellVoltage";
	private static final String MODULE_4_MAX_CELL_VOLTAGE = "Module4MaxCellVoltage";
	private static final String MODULE_5_MAX_CELL_VOLTAGE = "Module5MaxCellVoltage";

	private static final String MODULE_0_MIN_CELL_VOLTAGE = "Module0MinCellVoltage";
	private static final String MODULE_1_MIN_CELL_VOLTAGE = "Module1MinCellVoltage";
	private static final String MODULE_2_MIN_CELL_VOLTAGE = "Module2MinCellVoltage";
	private static final String MODULE_3_MIN_CELL_VOLTAGE = "Module3MinCellVoltage";
	private static final String MODULE_4_MIN_CELL_VOLTAGE = "Module4MinCellVoltage";
	private static final String MODULE_5_MIN_CELL_VOLTAGE = "Module5MinCellVoltage";

	@Test
	public void outdatedSoftwareTest() {
		var zero = supplier(() -> new Value<>(null, 0));
		var one = supplier(() -> new Value<>(null, 1));
		var eight = supplier(() -> new Value<>(null, 8));
		var nine = supplier(() -> new Value<>(null, 9));
		Supplier<Value<Integer>> emptyValue = supplier(() -> new Value<>(null, null));
		assertTrue(WuerthBmsImpl.isSoftwareOutdated(one, zero, eight));
		var two = supplier(() -> new Value<>(null, 2));
		assertFalse(WuerthBmsImpl.isSoftwareOutdated(emptyValue, zero, nine));
		assertFalse(WuerthBmsImpl.isSoftwareOutdated(one, zero, nine));
		assertFalse(WuerthBmsImpl.isSoftwareOutdated(two, zero, eight));
	}

	@Test
	public void batteryValuesTest() throws Exception {
		var sut = new WuerthBmsImpl();

		sut.getStringModuleCountChannel().setNextValue(9);
		sut.getNumberOfModulesChannel().setNextValue(9);
		sut.getNumberOfCellsChannel().setNextValue(13);
		sut.getNumberOfCellsCscChannel().setNextValue(13);
		sut.getNumberOfTemperatureSensorsChannel().setNextValue(4);
		sut.getNumberOfTemperatureSensorsPerModuleChannel().setNextValue(3);

		new ComponentTest(sut) //
				.addReference("setModbus", new DummyModbusBridge("modbus0")) //
				.addReference("componentManager", new DummyComponentManager())
				.addReference("cm", new DummyConfigurationAdmin()) //
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setModbusId("modbus0") //
						.setStartStop(START) //
						.setVersion(WUERTH_VERSION_1_0_9)//
						.build())
				.next(new AbstractComponentTest.TestCase("1") //
						.input(MODULE_0_MAX_CELL_VOLTAGE, 90) //
						.input(MODULE_1_MAX_CELL_VOLTAGE, 90) //
						.input(MODULE_2_MAX_CELL_VOLTAGE, 90) //
						.input(MODULE_3_MAX_CELL_VOLTAGE, 90) //
						.input(MODULE_4_MAX_CELL_VOLTAGE, 100) //
						.input(MODULE_5_MAX_CELL_VOLTAGE, 90) //
						.output(MAX_CELL_VOLTAGE, 100) //
						.output(MIN_CELL_VOLTAGE, null))

				.activate(MyConfig.create() //
						.setId("battery0") //
						.setModbusId("modbus0") //
						.setStartStop(START) //
						.setVersion(WUERTH_VERSION_1_0_9)//
						.build())//
				.next(new AbstractComponentTest.TestCase() //
						.input(MODULE_5_MAX_CELL_VOLTAGE, 120) //
						.output(MAX_CELL_VOLTAGE, 120) //
						.output(MIN_CELL_VOLTAGE, null))
				.next(new AbstractComponentTest.TestCase() //
						.input(MODULE_0_MIN_CELL_VOLTAGE, 120) //
						.input(MODULE_2_MIN_CELL_VOLTAGE, 120) //
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
		new ComponentTest(new WuerthBmsImpl()) //
				.addReference("setModbus", new DummyModbusBridge("modbus0")) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setModbusId("modbus0") //
						.setStartStop(START) //
						.setVersion(WUERTH_VERSION_1_0_9)//
						.build())

				.next(new AbstractComponentTest.TestCase() //
						.input(RESET_BATTERY_COMMAND, true)) //
				.next(new AbstractComponentTest.TestCase() //
						.timeleap(clock, 2600, MILLIS)) //
				.next(new AbstractComponentTest.TestCase() //
						.timeleap(clock, 5100, MILLIS)) //
				.next(new AbstractComponentTest.TestCase()) //
				.next(new AbstractComponentTest.TestCase()) //
				.next(new AbstractComponentTest.TestCase() //
						.timeleap(clock, 5200, MILLIS)) //
				.next(new AbstractComponentTest.TestCase() //
						.input(RESET_BATTERY_COMMAND, true)) //
				.next(new AbstractComponentTest.TestCase() //
						.input(RESET_BATTERY_COMMAND, false)) //
				.next(new AbstractComponentTest.TestCase() //
						.input(RESET_BATTERY_COMMAND, true)) //
				.next(new AbstractComponentTest.TestCase() //
						.input(RESET_BATTERY_COMMAND, false)) //
				.next(new AbstractComponentTest.TestCase() //
						.input(RESET_BATTERY_COMMAND, false)) //

		;
	}

	@Test
	public void modbusProtocolTest() throws Exception {
		final var clock = new TimeLeapClock(Instant.parse("2020-02-03T08:30:00.00Z"), ZoneOffset.UTC);
		final var numberOfModules = 9;
		new ComponentTest(new WuerthBmsImpl()) //
				.addReference("setModbus", new DummyModbusBridge("modbus0")) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setModbusId("modbus0") //
						.setStartStop(START) //
						.setVersion(WUERTH_VERSION_1_0_9)//
						.build())
				.next(new AbstractComponentTest.TestCase("1") //
						.input(STRING_MODULE_COUNT, numberOfModules));

	}
}
