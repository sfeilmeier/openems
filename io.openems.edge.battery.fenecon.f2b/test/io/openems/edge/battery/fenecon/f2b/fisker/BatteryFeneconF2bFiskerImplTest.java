package io.openems.edge.battery.fenecon.f2b.fisker;

import static org.junit.Assert.assertThrows;

import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.test.TimeLeapClock;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;

public class BatteryFeneconF2bFiskerImplTest {

	private static final String COMPONENT_ID = "battery0";
	private static final String MODBUS_ID = "modbus0";
	private static final int MODBUS_UNIT_ID = 1;
	private static final ChannelAddress DTC_1 = new ChannelAddress(COMPONENT_ID, "Dtc1");
	private static final ChannelAddress DTC_1_WARNING = new ChannelAddress(COMPONENT_ID, "Dtc1Warning");

	@Test
	public void test() throws Exception {
		final var clock = new TimeLeapClock(Instant.parse("2020-01-01T01:00:00.00Z"), ZoneOffset.UTC);
		final var component = new ComponentTest(new BatteryFeneconF2bFiskerImpl())//
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("setModbus", new DummyModbusBridge(MODBUS_ID)) //
				.activate(MyConfig.create() //
						.setId(COMPONENT_ID) //
						.setModbusId(MODBUS_ID) //
						.setModbusUnitId(MODBUS_UNIT_ID) //
						.setStartStop(StartStopConfig.STOP)//
						.setBatteryId(BatteryId.F2B_BATTERY_1)//
						.build())
				.next(new TestCase()//
						.input(DTC_1, 0))//
				.next(new TestCase()//
						.input(DTC_1, 2))//
				.next(new TestCase()//
						.output(DTC_1_WARNING, true))//
				.next(new TestCase()//
						.input(DTC_1, 0))//
		;
		assertThrows(IllegalArgumentException.class, () -> component.getSut().channel(DTC_1_WARNING.getChannelId()));
	}
}