package io.openems.edge.system.fenecon.industrial.l;

import static io.openems.edge.common.startstop.StartStoppable.ChannelId.START_STOP;
import static io.openems.edge.common.test.TestUtils.createDummyClock;
import static io.openems.edge.io.test.DummyInputOutput.ChannelId.INPUT_OUTPUT7;
import static io.openems.edge.io.test.DummyInputOutput.ChannelId.INPUT_OUTPUT8;

import org.junit.Test;

import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.DummyConfigurationAdmin;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.io.test.DummyInputOutput;
import io.openems.edge.system.fenecon.industrial.l.envicool.Envicool;

public class SystemFeneconIndustrialLImplTest {

	@Test
	public void test() throws Exception {
		final var clock = createDummyClock();
		new ComponentTest(new SystemFeneconIndustrialLImpl()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("setCoolingUnitModbus", new DummyModbusBridge("modbus0")) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("ess", new DummyMetaEss("ess0")) //
				.addComponent(new DummyInputOutput("io0")) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setStartStopConfig(StartStopConfig.START) //
						.setCoolingUnitModbusId("modbus0") //
						.setEssId("ess0")//
						.setBatteryIds("battery1", "battery2") //
						.setCoolingUnitMode(Envicool.Mode.DISABLED) //
						.setCoolingUnitCoolingSetPoint(20) //
						.setCoolingUnitHeatingSetPoint(10) //
						.setEmergencyStopState("io0/InputOutput2") //
						.setAcknowledgeEmergencyStop("io0/InputOutput3") //
						.setSpdTripped("io0/InputOutput4") //
						.setFuseTripped("io0/InputOutput5") //
						.setPsuTriggered("io0/InputOutput6") //
						.setIsSmokeDetectionInstalled(false) //
						.setSmokeDetection("io0/InputOutput7") //
						.setSmokeDetectionFailure("io0/InputOutput8") //
						.build())
				.next(new TestCase()//
						.input("io0", INPUT_OUTPUT7, false) //
						.input(START_STOP, StartStop.STOP) //
						.output("io0", INPUT_OUTPUT7, false))
				.next(new TestCase()//
						.input("io0", INPUT_OUTPUT8, true) //
						.input(START_STOP, StartStop.STOP) //
						.output("io0", INPUT_OUTPUT8, true));
	}

	@Test
	public void testWithSmokeDetection() throws Exception {
		final var clock = createDummyClock();
		new ComponentTest(new SystemFeneconIndustrialLImpl()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("setCoolingUnitModbus", new DummyModbusBridge("modbus0")) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("ess", new DummyMetaEss("ess0")) //
				.addComponent(new DummyInputOutput("io0")) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setStartStopConfig(StartStopConfig.START) //
						.setCoolingUnitModbusId("modbus0") //
						.setEssId("ess0")//
						.setBatteryIds("battery1", "battery2")//
						.setCoolingUnitMode(Envicool.Mode.DISABLED) //
						.setCoolingUnitCoolingSetPoint(20) //
						.setCoolingUnitHeatingSetPoint(10) //
						.setEmergencyStopState("io0/InputOutput2") //
						.setAcknowledgeEmergencyStop("io0/InputOutput3") //
						.setSpdTripped("io0/InputOutput4") //
						.setFuseTripped("io0/InputOutput5") //
						.setPsuTriggered("io0/InputOutput6") //
						.setIsSmokeDetectionInstalled(true) //
						.setSmokeDetection("io0/InputOutput7") //
						.setSmokeDetectionFailure("io0/InputOutput8") //
						.build())
				.next(new TestCase()//
						.input("io0", INPUT_OUTPUT7, false)//
						.input(START_STOP, StartStop.STOP)//
						.output("io0", INPUT_OUTPUT7, false))
				.next(new TestCase()//
						.input("io0", INPUT_OUTPUT8, true)//
						.input(START_STOP, StartStop.STOP)//
						.output("io0", INPUT_OUTPUT8, true));
	}
}