package io.openems.edge.battery.wuerthbms;

import static io.openems.common.test.TestUtils.createDummyClock;
import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.RESET_BATTERY_COMMAND;
import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.STRING_MODULE_COUNT;

import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.SW_VERSION_MAJOR;
import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.SW_VERSION_MINOR;
import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.SW_VERSION_PATCH;

import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.PACK_LIMIT_MAX_BATTERY_VOLTAGE;
import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.PACK_LIMIT_MIN_BATTERY_VOLTAGE;

import static io.openems.edge.battery.protection.BatteryVoltageProtection.ChannelId.BVP_CHARGE_BMS;
import static io.openems.edge.battery.protection.BatteryVoltageProtection.ChannelId.BVP_DISCHARGE_BMS;

import static io.openems.edge.common.startstop.StartStopConfig.START;
import static io.openems.edge.common.startstop.StartStoppable.ChannelId.START_STOP;
import static java.time.temporal.ChronoUnit.MILLIS;

import java.time.Clock;
import java.util.function.Consumer;

import org.junit.jupiter.api.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.utils.FunctionUtils;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;

public class WuerthBmsImplTest {

	@Test
	public void resetBatteryTest() throws Exception {
		final var clock = createDummyClock();
		createComponentTest(clock) //
				.next(new TestCase() //
						.input(RESET_BATTERY_COMMAND, true)) //
				.next(new TestCase() //
						.timeleap(clock, 2600, MILLIS)) //
				.next(new TestCase() //
						.timeleap(clock, 5100, MILLIS)) //
				.next(new TestCase()) //
				.next(new TestCase()) //
				.next(new TestCase() //
						.timeleap(clock, 5200, MILLIS)) //
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
		final var numberOfModules = 9;
		createComponentTest() //
				.next(new TestCase("1") //
						.input(STRING_MODULE_COUNT, numberOfModules));

	}

	@Test
	public void capacityCalculationTest() throws Exception {
		createComponentTest() //
				.next(new TestCase() //
						.input(START_STOP, StartStop.START))//
				.next(new TestCase() //
						.output(Battery.ChannelId.CAPACITY, 161_100))//
				.next(new TestCase() //
						.input(START_STOP, StartStop.STOP))//
				.next(new TestCase() //
						.output(Battery.ChannelId.CAPACITY, 0))//
		;
	}

	protected static ComponentTest createComponentTest() throws Exception {
		return createComponentTest(createDummyClock(), FunctionUtils::doNothing);
	}

	protected static ComponentTest createComponentTest(Consumer<DummyModbusBridge> modbus) throws Exception {
		return createComponentTest(createDummyClock(), modbus);
	}

	protected static ComponentTest createComponentTest(Clock clock) throws Exception {
		return createComponentTest(clock, FunctionUtils::doNothing);
	}

	protected static ComponentTest createComponentTest(Clock clock, Consumer<DummyModbusBridge> modbus)
			throws Exception {
		return new ComponentTest(new WuerthBmsImpl()) //
				.addReference("setModbus", new DummyModbusBridge("modbus0")) //
				.addReference("componentManager", new DummyComponentManager(clock))
				.addReference("cm", new DummyConfigurationAdmin()) //
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setModbusId("modbus0") //
						.setStartStop(START) //
						.build());
	}

	@Test
	public void oldFirmwareTest() throws Exception {
		createComponentTest() //
				.next(new TestCase("1") //
						.input(SW_VERSION_MAJOR, 2) //
						.input(SW_VERSION_MINOR, 0) //
						.input(SW_VERSION_PATCH, 14)//
						.input(PACK_LIMIT_MAX_BATTERY_VOLTAGE, 967)//
						.input(PACK_LIMIT_MIN_BATTERY_VOLTAGE, 760)//
						.input(WuerthBms.ChannelId.CFG_MODULE_CNT, 9) //
						.input(WuerthBms.ChannelId.CFG_CELL_CNT, 13) //
						.input(WuerthBms.ChannelId.CFG_CSC_CELL_CSC_CNT, 13) //
						.input(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_OV_V, 4175) //
						.input(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_UV_V, 3143) //
						.input(WuerthBms.ChannelId.CFG_TEMP_SENS_CNT, 3) //
						.input(WuerthBms.ChannelId.CFG_TEMP_SENS_CNT_PER_MODULE, 4) //
						.input(Battery.ChannelId.VOLTAGE, 850) //
						.input(Battery.ChannelId.MAX_CELL_VOLTAGE, 3900) //
						.input(Battery.ChannelId.MIN_CELL_VOLTAGE, 3850) //
						.input(StartStoppable.ChannelId.START_STOP, StartStop.START))//
				.next(new TestCase("2") //
						.output(BVP_CHARGE_BMS, 903)//
						.output(BVP_DISCHARGE_BMS, 760)//
				);
	}

	@Test
	public void newFirmwareTest() throws Exception {
		createComponentTest() //
				.next(new TestCase("1") //
						.input(SW_VERSION_MAJOR, 2) //
						.input(SW_VERSION_MINOR, 0) //
						.input(SW_VERSION_PATCH, 15)//
						.input(PACK_LIMIT_MAX_BATTERY_VOLTAGE, 967)//
						.input(PACK_LIMIT_MIN_BATTERY_VOLTAGE, 760))//
				.next(new TestCase("2") //
						.output(BVP_CHARGE_BMS, 967)//
						.output(BVP_DISCHARGE_BMS, 760)//
				);
	}

	@Test
	public void nullFirmwareTest() throws Exception {
		createComponentTest() //
				.next(new TestCase("setup") //
						.input(SW_VERSION_MAJOR, null) //
						.input(SW_VERSION_MINOR, null) //
						.input(SW_VERSION_PATCH, null) //
						.input(WuerthBms.ChannelId.CFG_MODULE_CNT, 9) //
						.input(WuerthBms.ChannelId.CFG_CELL_CNT, 13) //
						.input(WuerthBms.ChannelId.CFG_CSC_CELL_CSC_CNT, 13) //
						.input(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_OV_V, 4175) //
						.input(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_UV_V, 3143) //
						.input(WuerthBms.ChannelId.CFG_TEMP_SENS_CNT, 3) //
						.input(WuerthBms.ChannelId.CFG_TEMP_SENS_CNT_PER_MODULE, 4) //
						.input(Battery.ChannelId.VOLTAGE, 850) //
						.input(Battery.ChannelId.MAX_CELL_VOLTAGE, 3900) //
						.input(Battery.ChannelId.MIN_CELL_VOLTAGE, 3850) //
						.input(StartStoppable.ChannelId.START_STOP, StartStop.START)) //
				.next(new TestCase("check bvp") //
						.output(BVP_CHARGE_BMS, 903) //
						.output(BVP_DISCHARGE_BMS, 760)); //
	}

	@Test
	public void startupTest() throws Exception {
		createComponentTest() //
				.next(new TestCase("setup") //
						.input(SW_VERSION_MAJOR, null) //
						.input(SW_VERSION_MINOR, null) //
						.input(SW_VERSION_PATCH, null)) //
				.next(new TestCase("check bvp") //
						.output(BVP_CHARGE_BMS, null) //
						.output(BVP_DISCHARGE_BMS, null)); //
	}

	@Test
	public void newFirmwareTest1() throws Exception {
		createComponentTest() //
				.next(new TestCase("setup") //
						.input(SW_VERSION_MAJOR, 2) //
						.input(SW_VERSION_MINOR, 0) //
						.input(SW_VERSION_PATCH, 15) //
						.input(WuerthBms.ChannelId.CFG_MODULE_CNT, 9) //
						.input(WuerthBms.ChannelId.CFG_CELL_CNT, 13) //
						.input(WuerthBms.ChannelId.CFG_CSC_CELL_CSC_CNT, 13) //
						.input(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_OV_V, 4175) //
						.input(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_UV_V, 3143) //
						.input(WuerthBms.ChannelId.CFG_TEMP_SENS_CNT, 3) //
						.input(WuerthBms.ChannelId.CFG_TEMP_SENS_CNT_PER_MODULE, 4) //
						.input(Battery.ChannelId.VOLTAGE, 850) //
						.input(Battery.ChannelId.MAX_CELL_VOLTAGE, 3900) //
						.input(Battery.ChannelId.MIN_CELL_VOLTAGE, 3850) //
						.input(StartStoppable.ChannelId.START_STOP, StartStop.START) //
						.input(WuerthBms.ChannelId.PACK_LIMIT_MAX_BATTERY_VOLTAGE, 967) //
						.input(WuerthBms.ChannelId.PACK_LIMIT_MIN_BATTERY_VOLTAGE, 760)) //
				.next(new TestCase("check bvp") //
						.output(BVP_CHARGE_BMS, 967) //
						.output(BVP_DISCHARGE_BMS, 760)); //
	}

}
