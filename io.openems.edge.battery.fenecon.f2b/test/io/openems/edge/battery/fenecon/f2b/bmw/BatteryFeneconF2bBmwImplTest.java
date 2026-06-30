package io.openems.edge.battery.fenecon.f2b.bmw;

import static io.openems.common.test.TestUtils.createDummyClock;
import static io.openems.edge.common.startstop.StartStoppable.ChannelId.START_STOP;

import java.time.Clock;
import java.util.function.Consumer;

import org.junit.jupiter.api.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.utils.FunctionUtils;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.DummyCycle;

public class BatteryFeneconF2bBmwImplTest {

	@Test
	public void capacityCalculationTest() throws Exception {
		createComponentTest() //
				.next(new TestCase() //
						.input(START_STOP, StartStop.START))//
				.next(new TestCase() //
						.output(Battery.ChannelId.CAPACITY, 41_000))//
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
		return new ComponentTest(new BatteryFeneconF2bBmwImpl()) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("cycle", new DummyCycle(1000)) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("setModbus", new DummyModbusBridge("modbus0")) //
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setModbusId("modbus0") //
						.setModbusUnitId(0) //
						.setStartStop(StartStopConfig.START) //
						.build())
				.next(new TestCase());
	}

}