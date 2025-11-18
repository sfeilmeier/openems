package io.openems.edge.system.fenecon.industrial.l;

import static io.openems.common.test.TestUtils.createDummyClock;

import org.junit.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.io.test.DummyInputOutput;
import io.openems.edge.system.fenecon.industrial.l.envicool.Envicool;

public class SystemFeneconIndustrialLImplTest {

	private static final String COMPONENT_ID = "system0";
	private static final String IO_ID = "io0";
	private static final String ESS_ID = "ess0";
	private static final String MODBUS_ID = "modbus0";
	private static final String BATTERY1_ID = "battery1";
	private static final String BATTERY2_ID = "battery2";
	private static final DummyInputOutput dummyIo = new DummyInputOutput(IO_ID);
	private static final SystemFeneconIndustrialLImpl sut = new SystemFeneconIndustrialLImpl(); //

	@Test
	public void test() throws Exception {
		new ComponentTest(sut) //
				.addReference("componentManager", new DummyComponentManager(createDummyClock())) //
				.addReference("setCoolingUnitModbus", new DummyModbusBridge(MODBUS_ID)) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("ess", new DummyMetaEss(ESS_ID)) //
				.addComponent(dummyIo) //
				.activate(MyConfig.create() //
						.setId(COMPONENT_ID) //
						.setStartStopConfig(StartStopConfig.START) //
						.setCoolingUnitModbusId(MODBUS_ID) //
						.setEssId(ESS_ID)//
						.setBatteryIds(BATTERY1_ID, BATTERY2_ID)//
						.setCoolingUnitMode(Envicool.Mode.DISABLED) //
						.setCoolingUnitCoolingSetPoint(20) //
						.setCoolingUnitHeatingSetPoint(10) //
						.setIsSmokeDetectionInstalled(false)//
						.build());
	}
}