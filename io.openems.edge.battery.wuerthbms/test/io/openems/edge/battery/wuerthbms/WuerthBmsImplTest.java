package io.openems.edge.battery.wuerthbms;

import static io.openems.common.test.TestUtils.createDummyClock;
import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.RESET_BATTERY_COMMAND;
import static io.openems.edge.battery.wuerthbms.WuerthBms.ChannelId.STRING_MODULE_COUNT;
import static io.openems.edge.common.startstop.StartStopConfig.START;
import static java.time.temporal.ChronoUnit.MILLIS;

import java.time.Clock;
import java.util.function.Consumer;

import org.junit.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.utils.FunctionUtils;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
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
}
