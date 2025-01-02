package io.openems.edge.battery.fenecon.f2b.cluster.parallel;

import static io.openems.common.test.TestUtils.createDummyClock;

import org.junit.Test;

import io.openems.edge.battery.fenecon.f2b.cluster.common.statemachine.StateMachine;
import io.openems.edge.battery.fenecon.f2b.dummy.BatteryFeneconF2bDummyImpl;
import io.openems.edge.battery.fenecon.f2b.dummy.statemachine.StateMachine.State;
import io.openems.edge.common.channel.ChannelId;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.DummyConfigurationAdmin;

public class BatteryFeneconF2bParallelClusterImplTest {

	private static final ChannelId STATE = BatteryFeneconF2bClusterParallel.ChannelId.STATE_MACHINE;

	@Test
	public void startTest() throws Exception {
		final var clock = createDummyClock();

		var battery1 = new BatteryFeneconF2bDummyImpl();
		new ComponentTest(battery1) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery1") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var battery2 = new BatteryFeneconF2bDummyImpl();
		new ComponentTest(battery2) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery2") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var parallelCluster = new BatteryFeneconF2bClusterParallelImpl();
		new ComponentTest(parallelCluster) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("addBattery", battery1) //
				.addReference("addBattery", battery2) //
				.activate(io.openems.edge.battery.fenecon.f2b.cluster.parallel.MyConfig.create() //
						.setId("battery0") //
						.setStartStop(StartStopConfig.START) //
						.setBatteryIds("battery1", "battery2") //
						.build())
				.next(new TestCase()//
						.output("battery1", STATE, State.UNDEFINED)//
						.output("battery2", STATE, State.UNDEFINED)//
						.output("battery0", STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.GO_STOPPED)//
						.output("battery2", STATE, State.GO_STOPPED)//
						.output("battery0", STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.STOPPED)//
						.output("battery2", STATE, State.STOPPED)//
						.output("battery0", STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.STOPPED)//
						.output("battery2", STATE, State.STOPPED)//
						.output("battery0", STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.STOPPED)//
						.output("battery2", STATE, State.STOPPED)//
						.output("battery0", STATE, StateMachine.State.UNDEFINED))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.STOPPED)//
		// .output("battery2", STATE, State.STOPPED)//
		// .output("battery0", STATE, StateMachine.State.STOPPED))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.STOPPED)//
		// .output("battery2", STATE, State.STOPPED)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .input("battery1", SOC, 50) //
		// .input("battery2", SOC, 50) //
		// .input("battery1", CHARGE_MAX_VOLTAGE, 403) //
		// .input("battery2", CHARGE_MAX_VOLTAGE, 403) //
		// .input("battery1", DISCHARGE_MIN_VOLTAGE, 259)//
		// .input("battery2", DISCHARGE_MIN_VOLTAGE, 259)//
		// .input("battery1", VOLTAGE, 400)//
		// .input("battery2", VOLTAGE, 404)//
		// .input("battery1", INTERNAL_VOLTAGE, 400)//
		// .input("battery2", INTERNAL_VOLTAGE, 404)//
		// .output("battery1", STATE, State.GO_RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.GO_RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.RUNNING)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.RUNNING)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.RUNNING)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.RUNNING)//
		// .output("battery0", STATE, StateMachine.State.RUNNING))//
		;
	}

	@Test
	public void voltageDifferenceHighTest() throws Exception {
		final var clock = createDummyClock();
		var battery1 = new BatteryFeneconF2bDummyImpl();
		new ComponentTest(battery1) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery1") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var battery2 = new BatteryFeneconF2bDummyImpl();
		new ComponentTest(battery2) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery2") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var parallelCluster = new BatteryFeneconF2bClusterParallelImpl();
		new ComponentTest(parallelCluster) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("addBattery", battery1) //
				.addReference("addBattery", battery2) //
				.activate(io.openems.edge.battery.fenecon.f2b.cluster.parallel.MyConfig.create() //
						.setId("battery0") //
						.setStartStop(StartStopConfig.START) //
						.setBatteryIds("battery1", "battery2") //
						.build())
				.next(new TestCase()//
						.output("battery1", STATE, State.UNDEFINED)//
						.output("battery2", STATE, State.UNDEFINED)//
						.output("battery0", STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.GO_STOPPED)//
						.output("battery2", STATE, State.GO_STOPPED)//
						.output("battery0", STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.STOPPED)//
						.output("battery2", STATE, State.STOPPED)//
						.output("battery0", STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.STOPPED)//
						.output("battery2", STATE, State.STOPPED)//
						.output("battery0", STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.STOPPED)//
						.output("battery2", STATE, State.STOPPED)//
						.output("battery0", STATE, StateMachine.State.UNDEFINED))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.STOPPED)//
		// .output("battery2", STATE, State.STOPPED)//
		// .output("battery0", STATE, StateMachine.State.STOPPED))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.STOPPED)//
		// .output("battery2", STATE, State.STOPPED)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .input("battery1", SOC, 50) //
		// .input("battery2", SOC, 50) //
		// .input("battery1", CHARGE_MAX_VOLTAGE, 403) //
		// .input("battery2", CHARGE_MAX_VOLTAGE, 403) //
		// .input("battery1", DISCHARGE_MIN_VOLTAGE, 259)//
		// .input("battery2", DISCHARGE_MIN_VOLTAGE, 259)//
		// .input("battery1", VOLTAGE, 400)//
		// .input("battery2", VOLTAGE, 406)//
		// .input("battery1", INTERNAL_VOLTAGE, 400)//
		// .input("battery2", INTERNAL_VOLTAGE, 406)//
		// .output("battery1", STATE, State.GO_RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.GO_RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.GO_STOPPED)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.STOPPED)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.STOPPED)//
		// .output("battery0", STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.STOPPED)//
		// .output("battery0", STATE, StateMachine.State.RUNNING))//
		;
	}

	@Test
	public void errorTest() throws Exception {
		final var clock = createDummyClock();

		var battery1 = new BatteryFeneconF2bDummyImpl();
		new ComponentTest(battery1) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery1") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var battery2 = new BatteryFeneconF2bDummyImpl();
		new ComponentTest(battery2) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.activate(io.openems.edge.battery.fenecon.f2b.dummy.MyConfig.create() //
						.setId("battery2") //
						.setStartStop(StartStopConfig.AUTO) //
						.build());
		var parallelCluster = new BatteryFeneconF2bClusterParallelImpl();
		new ComponentTest(parallelCluster) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("addBattery", battery1) //
				.addReference("addBattery", battery2) //
				.activate(io.openems.edge.battery.fenecon.f2b.cluster.parallel.MyConfig.create() //
						.setId("battery0") //
						.setStartStop(StartStopConfig.START) //
						.setBatteryIds("battery1", "battery2") //
						.build())
				.next(new TestCase()//
						.output("battery1", STATE, State.UNDEFINED)//
						.output("battery2", STATE, State.UNDEFINED)//
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.GO_STOPPED)//
						.output("battery2", STATE, State.GO_STOPPED)//
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.STOPPED)//
						.output("battery2", STATE, State.STOPPED)//
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.STOPPED)//
						.output("battery2", STATE, State.STOPPED)//
						.output(STATE, StateMachine.State.UNDEFINED))//
				.next(new TestCase()//
						.output("battery1", STATE, State.STOPPED)//
						.output("battery2", STATE, State.STOPPED)//
						.output(STATE, StateMachine.State.UNDEFINED))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.STOPPED)//
		// .output("battery2", STATE, State.STOPPED)//
		// .output(STATE, StateMachine.State.STOPPED))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.STOPPED)//
		// .output("battery2", STATE, State.STOPPED)//
		// .output(STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .input("battery1", SOC, 50) //
		// .input("battery2", SOC, 50) //
		// .input("battery1", CHARGE_MAX_VOLTAGE, 403) //
		// .input("battery2", CHARGE_MAX_VOLTAGE, 403) //
		// .input("battery1", DISCHARGE_MIN_VOLTAGE, 259)//
		// .input("battery2", DISCHARGE_MIN_VOLTAGE, 259)//
		// .input("battery1", VOLTAGE, 400)//
		// .input("battery2", VOLTAGE, 404)//
		// .input("battery1", INTERNAL_VOLTAGE, 400)//
		// .input("battery2", INTERNAL_VOLTAGE, 404)//
		// .output("battery1", STATE, State.GO_RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output(STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.GO_RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output(STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output(STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output(STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.GO_RUNNING)//
		// .output(STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.RUNNING)//
		// .output(STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.RUNNING)//
		// .output(STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.RUNNING)//
		// .output(STATE, StateMachine.State.GO_RUNNING))//
		// .next(new TestCase()//
		// .output("battery1", STATE, State.RUNNING)//
		// .output("battery2", STATE, State.RUNNING)//
		// .output(STATE, StateMachine.State.RUNNING))//
		// .next(new TestCase() //
		// .output("battery2", DUMMY_FAULT, true) //
		// .output("battery1", STATE, State.RUNNING) //
		// .output("battery2", STATE, State.RUNNING) //
		// .output(STATE, StateMachine.State.RUNNING))//
		// .next(new TestCase() //
		// .output("battery1", STATE, State.RUNNING) //
		// .output("battery2", STATE, State.RUNNING) //
		// .output(STATE, StateMachine.State.RUNNING))//
		// .next(new TestCase() //
		// .output("battery1", STATE, State.RUNNING) //
		// .output("battery2", STATE, State.ERROR) //
		// .output(STATE, StateMachine.State.RUNNING))//
		// .next(new TestCase() //
		// .output("battery1", STATE, State.RUNNING) //
		// .output("battery2", STATE, State.ERROR) //
		// .output(STATE, StateMachine.State.RUNNING))//
		// .next(new TestCase() //
		// .output("battery1", STATE, State.RUNNING) //
		// .output("battery2", STATE, State.ERROR) //
		// .output(STATE, StateMachine.State.RUNNING))//
		// .next(new TestCase() //
		// .output("battery1", STATE, State.RUNNING) //
		// .output("battery2", STATE, State.ERROR) //
		// .output(STATE, StateMachine.State.RUNNING))//
		;
	}
}