package io.openems.edge.system.fenecon.industrial.m;

import org.junit.jupiter.api.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.test.TestUtils;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.io.test.DummyInputOutput;
import io.openems.edge.system.fenecon.industrial.enums.FluidCoolingMode;
import io.openems.edge.system.fenecon.industrial.m.enums.CoolingType;

public class SystemFeneconIndustrialMImplTest {

	@Test
	public void test() throws Exception {
		final var clock = TestUtils.createDummyClock();
		final var dummyIo = new DummyInputOutput("io0");
		new ComponentTest(new SystemFeneconIndustrialMImpl()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("cm", new DummyConfigurationAdmin())//
				.addReference("ess", new DummyMetaEss("ess0")) //
				.addComponent(dummyIo) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setStartStopConfig(StartStopConfig.START) //
						.setCoolingUnitMode(FluidCoolingMode.AUTO)//
						.setCoolingType(CoolingType.CHILLER)//
						.setEssId("ess0")//
						.setBatteryIds("battery11", "battery12", "battery21", "battery22")//
						.setCoolingUnitEnable("io0/InputOutput1")//
						.build())//
				.next(new TestCase()) //
				.deactivate();
	}
}
