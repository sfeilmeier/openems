package io.openems.edge.battery.fenecon.f2b.fisker;

import static io.openems.common.test.TestUtils.createDummyClock;
import static io.openems.edge.common.startstop.StartStoppable.ChannelId.START_STOP;
import static org.junit.Assert.assertThrows;

import java.time.Clock;
import java.util.function.Consumer;

import org.junit.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.types.ChannelAddress;
import io.openems.common.utils.FunctionUtils;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;

public class BatteryFeneconF2bFiskerImplTest {

	private static final ChannelAddress DTC_1 = new ChannelAddress("battery0", "Dtc1");
	private static final ChannelAddress DTC_1_INFO = new ChannelAddress("battery0", "Dtc1Info");

	@Test
	public void dtc1InfoTest() throws Exception {
		assertThrows(//
				IllegalArgumentException.class, () -> createComponentTest().getSut().channel(DTC_1_INFO.getChannelId())//
		);
	}

	@Test
	public void capacityCalculationTest() throws Exception {
		createComponentTest() //
				.next(new TestCase() //
						.input(START_STOP, StartStop.START))//
				.next(new TestCase() //
						.output(Battery.ChannelId.CAPACITY, 100_659))//
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
		return new ComponentTest(new BatteryFeneconF2bFiskerImpl())//
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("setModbus", new DummyModbusBridge("modbus0")) //
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setModbusId("modbus0") //
						.setModbusUnitId(1) //
						.setStartStop(StartStopConfig.STOP)//
						.setBatteryId(BatteryId.F2B_BATTERY_1)//
						.build())
				.next(new TestCase()//
						.input(DTC_1, 0))//
				.next(new TestCase()//
						.input(DTC_1, 2))//
				.next(new TestCase()//
						.output(DTC_1_INFO, true))//
				.next(new TestCase()//
						.input(DTC_1, 0))//
		;
	}

}