package io.openems.edge.system.fenecon.industrial.s;

import org.junit.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.io.test.DummyInputOutput;
import io.openems.edge.system.fenecon.industrial.s.enums.CoolingUnitMode;

public class SystemFeneconIndustrialSImplTest {

	@Test
	public void test() throws Exception {
		new ComponentTest(new SystemFeneconIndustrialSImpl()) //
				.addReference("componentManager", new DummyComponentManager()) //
				.addReference("cm", new DummyConfigurationAdmin())//
				.addReference("ess", new DummyMetaEss("ess0")) //
				.addComponent(new DummyInputOutput("io0")) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setStartStopConfig(StartStopConfig.START) //
						.setCoolingUnitMode(CoolingUnitMode.AUTO) //
						.setEssId("ess0") //
						.setBatteryIds("battery11", "battery12", "battery21", "battery22") //
						.setCoolingUnitError("io0/InputOutput0") //
						.setCoolingUnitEnable("io0/InputOutput1") //
						.setEmergencyStopState("io0/InputOutput2") //
						.setAcknowledgeEmergencyStop("io0/InputOutput3") //
						.setSpdState("io0/InputOutput4") //
						.setFuseState("io0/InputOutput5") //
						.build()) //
				.next(new TestCase()) //
				.deactivate();
	}
}
