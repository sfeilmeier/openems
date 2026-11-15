package io.openems.edge.system.fenecon.industrial.m.external.coolingunit;

import org.junit.jupiter.api.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.io.test.DummyInputOutput;
import io.openems.edge.system.fenecon.industrial.m.dummy.DummyBatteryInverterRefuStore88kImpl;

public class AirconditioningImplTest {

	private static final String COMPONENT_ID = "industrialMAircondition0";
	private static final String BATTERYINVERTER1_ID = "batteryInverter1";
	private static final String BATTERYINVERTER2_ID = "batteryInverter2";
	private static final String BATTERYINVERTER3_ID = "batteryInverter3";
	private static final String IO_ID = "io0";

	private static final ChannelAddress COOLING_UNIT_BMW = new ChannelAddress(IO_ID, "InputOutput0");
	private static final ChannelAddress AIRCONDITONING_UNIT = new ChannelAddress(IO_ID, "InputOutput1");

	private static final ChannelAddress MAX_TEMP = new ChannelAddress(COMPONENT_ID, "MaxBatteryinverterTmp"); // MAX_BATTERYINVERTER_TMP
	private static final ChannelAddress CABIN_TEMP1 = new ChannelAddress(BATTERYINVERTER1_ID, "TmpCab");
	private static final ChannelAddress CABIN_TEMP2 = new ChannelAddress(BATTERYINVERTER2_ID, "TmpCab");
	private static final ChannelAddress CABIN_TEMP3 = new ChannelAddress(BATTERYINVERTER3_ID, "TmpCab");

	@Test
	public void testCluster() throws Exception {

		var batteryInverter1 = new DummyBatteryInverterRefuStore88kImpl(BATTERYINVERTER1_ID);
		var batteryInverter2 = new DummyBatteryInverterRefuStore88kImpl(BATTERYINVERTER2_ID);
		var batteryInverter3 = new DummyBatteryInverterRefuStore88kImpl(BATTERYINVERTER3_ID);

		new ComponentTest(new AirconditioningImpl()) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("componentManager", new DummyComponentManager()) //
				.addReference("addBatteryInverter", batteryInverter1)//
				.addReference("addBatteryInverter", batteryInverter2)//
				.addReference("addBatteryInverter", batteryInverter3)//
				.addComponent(new DummyInputOutput(IO_ID)) //
				.activate(MyConfig.create() //
						.setId(COMPONENT_ID) //
						.setAirconditioningUnitChannelAddress(AIRCONDITONING_UNIT.toString()) //
						.setCoolingUnitBmwChannelAddress(COOLING_UNIT_BMW.toString()) //
						.setBatteryInverters(//
								new String[] { BATTERYINVERTER1_ID, //
										BATTERYINVERTER2_ID, //
										BATTERYINVERTER3_ID }) //
						.setThresholdTempr(45) //
						.build())
				.next(new TestCase() //
						.input(COOLING_UNIT_BMW, false)//
						.output(AIRCONDITONING_UNIT, false)) //
				.next(new TestCase() //
						.input(COOLING_UNIT_BMW, false) //
						.input(CABIN_TEMP1, 46) //
						.input(CABIN_TEMP2, 41) //
						.input(CABIN_TEMP3, 43)//
						.output(MAX_TEMP, 46) //
						.output(AIRCONDITONING_UNIT, true))
				.next(new TestCase() //
						.input(COOLING_UNIT_BMW, false) //
						.input(CABIN_TEMP1, 45) //
						.input(CABIN_TEMP2, 41) //
						.input(CABIN_TEMP3, 43) //
						.output(MAX_TEMP, 45) //
						.output(AIRCONDITONING_UNIT, false))
				.next(new TestCase() //
						.input(COOLING_UNIT_BMW, true) //
						.input(CABIN_TEMP1, 45) //
						.input(CABIN_TEMP2, 41) //
						.input(CABIN_TEMP3, 43) //
						.output(MAX_TEMP, 45) //
						.output(AIRCONDITONING_UNIT, true));
	}

}