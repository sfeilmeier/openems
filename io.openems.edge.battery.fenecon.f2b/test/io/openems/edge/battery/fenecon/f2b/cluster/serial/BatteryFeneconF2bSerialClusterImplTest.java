package io.openems.edge.battery.fenecon.f2b.cluster.serial;

import static io.openems.edge.battery.api.Battery.ChannelId.CHARGE_MAX_VOLTAGE;
import static io.openems.edge.battery.api.Battery.ChannelId.DISCHARGE_MIN_VOLTAGE;
import static io.openems.edge.battery.api.Battery.ChannelId.SOC;
import static io.openems.edge.battery.api.Battery.ChannelId.VOLTAGE;
import static io.openems.edge.battery.fenecon.f2b.dummy.BatteryFeneconF2bDummy.ChannelId.DUMMY_FAULT;

import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.Test;

import io.openems.common.test.TimeLeapClock;
import io.openems.edge.battery.fenecon.f2b.cluster.common.statemachine.StateMachine;
import io.openems.edge.battery.fenecon.f2b.cluster.parallel.BatteryFeneconF2bClusterParallel;
import io.openems.edge.battery.fenecon.f2b.dummy.BatteryFeneconF2bDummyImpl;
import io.openems.edge.battery.fenecon.f2b.dummy.statemachine.StateMachine.State;
import io.openems.edge.common.channel.ChannelId;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.DummyConfigurationAdmin;

public class BatteryFeneconF2bSerialClusterImplTest {

	private static final ChannelId STATE = BatteryFeneconF2bClusterParallel.ChannelId.STATE_MACHINE;

	@Test
	public void startTest() throws Exception {
		final var clock = new TimeLeapClock(Instant.parse("2000-01-01T01:00:00.00Z"), ZoneOffset.UTC);
		var battery1 = new BatteryFeneconF2bDummyImpl();
		var dummyBattery1 = new ComponentTest(battery1) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery1") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var battery2 = new BatteryFeneconF2bDummyImpl();
		var dummyBattery2 = new ComponentTest(battery2) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery2") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var batteryCluster = new BatteryFeneconF2bClusterSerialImpl();
		new ComponentTest(batteryCluster) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("addBattery", battery1) //
				.addReference("addBattery", battery2) //
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setStartStop(StartStopConfig.START) //
						.setBatteryIds("battery1", "battery2") //
						.build())
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.input("battery1", STATE, State.UNDEFINED) //
						.input("battery2", STATE, State.UNDEFINED) //
						.input(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase())))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.input("battery1", VOLTAGE, 400)//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.STOPPED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.GO_RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.GO_RUNNING) //
						.output("battery2", STATE, State.GO_RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))
				.next(new TestCase()//
						.input("battery1", VOLTAGE, 344) //
						.input("battery1", SOC, 50) //
						.input("battery1", CHARGE_MAX_VOLTAGE, 403) //
						.input("battery1", DISCHARGE_MIN_VOLTAGE, 259)) //
				.next(new TestCase("Time leap") //
						.onAfterProcessImage(() -> battery1.setHvContactorUnlocked(true))//
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.GO_RUNNING) //
						.output("battery2", STATE, State.GO_RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))
				.next(new TestCase()//
						.input("battery2", VOLTAGE, 344) //
						.input("battery2", SOC, 50) //
						.input("battery2", CHARGE_MAX_VOLTAGE, 403) //
						.input("battery2", DISCHARGE_MIN_VOLTAGE, 259)) //
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> battery2.setHvContactorUnlocked(true))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.GO_RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.RUNNING) //
						.output(STATE, StateMachine.State.RUNNING))//
		;
	}

	@Test
	public void stopTest() throws Exception {
		final var clock = new TimeLeapClock(Instant.parse("2000-01-01T01:00:00.00Z"), ZoneOffset.UTC);
		var battery1 = new BatteryFeneconF2bDummyImpl();
		var dummyBattery1 = new ComponentTest(battery1) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery1") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var battery2 = new BatteryFeneconF2bDummyImpl();
		var dummyBattery2 = new ComponentTest(battery2) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery2") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var batteryCluster = new BatteryFeneconF2bClusterSerialImpl();
		new ComponentTest(batteryCluster) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("addBattery", battery1) //
				.addReference("addBattery", battery2) //
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setStartStop(StartStopConfig.STOP) //
						.setBatteryIds("battery1", "battery2") //
						.build())
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.input("battery1", STATE, State.UNDEFINED) //
						.input("battery2", STATE, State.UNDEFINED) //
						.input(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.GO_STOPPED)//
						.output("battery2", STATE, State.GO_STOPPED) //
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.UNDEFINED))
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.STOPPED))//
		;
	}

	@Test
	public void errorTest() throws Exception {
		final var clock = new TimeLeapClock(Instant.parse("2000-01-01T01:00:00.00Z"), ZoneOffset.UTC);
		var battery1 = new BatteryFeneconF2bDummyImpl();
		var dummyBattery1 = new ComponentTest(battery1) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery1") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var battery2 = new BatteryFeneconF2bDummyImpl();
		var dummyBattery2 = new ComponentTest(battery2) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery2") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var batteryCluster = new BatteryFeneconF2bClusterSerialImpl();
		new ComponentTest(batteryCluster) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("addBattery", battery1) //
				.addReference("addBattery", battery2) //
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setStartStop(StartStopConfig.START) //
						.setBatteryIds("battery1", "battery2") //
						.build())
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.input("battery1", STATE, State.UNDEFINED) //
						.input("battery2", STATE, State.UNDEFINED) //
						.input(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase())))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.input("battery1", VOLTAGE, 400)//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.STOPPED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.STOPPED) //
						.output(STATE, StateMachine.State.GO_RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.GO_RUNNING) //
						.output("battery2", STATE, State.GO_RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))
				.next(new TestCase()//
						.input("battery1", VOLTAGE, 344) //
						.input("battery1", SOC, 50) //
						.input("battery1", CHARGE_MAX_VOLTAGE, 403) //
						.input("battery1", DISCHARGE_MIN_VOLTAGE, 259)) //
				.next(new TestCase("Time leap") //
						.onAfterProcessImage(() -> battery1.setHvContactorUnlocked(true))//
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.GO_RUNNING) //
						.output("battery2", STATE, State.GO_RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))
				.next(new TestCase()//
						.input("battery2", VOLTAGE, 344) //
						.input("battery2", SOC, 50) //
						.input("battery2", CHARGE_MAX_VOLTAGE, 403) //
						.input("battery2", DISCHARGE_MIN_VOLTAGE, 259)) //
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> battery2.setHvContactorUnlocked(true))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.GO_RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.RUNNING) //
						.output(STATE, StateMachine.State.GO_RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.RUNNING) //
						.output(STATE, StateMachine.State.RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()//
								.input(DUMMY_FAULT, true)))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.RUNNING) //
						.output(STATE, StateMachine.State.RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.RUNNING) //
						.output(STATE, StateMachine.State.RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.RUNNING) //
						.output("battery2", STATE, State.ERROR) //
						.output(STATE, StateMachine.State.RUNNING))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.GO_STOPPED) //
						.output("battery2", STATE, State.ERROR) //
						.output(STATE, StateMachine.State.ERROR))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.ERROR) //
						.output(STATE, StateMachine.State.ERROR))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> dummyBattery1.next(new TestCase()))//
						.onAfterProcessImage(() -> dummyBattery2.next(new TestCase()))//
						.output("battery1", STATE, State.STOPPED) //
						.output("battery2", STATE, State.ERROR) //
						.output(STATE, StateMachine.State.ERROR))//
		;
	}
}
