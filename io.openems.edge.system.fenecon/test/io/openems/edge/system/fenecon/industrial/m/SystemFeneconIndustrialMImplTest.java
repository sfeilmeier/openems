package io.openems.edge.system.fenecon.industrial.m;

import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.test.TimeLeapClock;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.io.test.DummyInputOutput;
import io.openems.edge.system.fenecon.industrial.m.enums.CoolingType;
import io.openems.edge.system.fenecon.industrial.m.enums.CoolingUnitMode;

public class SystemFeneconIndustrialMImplTest {

	private static final String COMPONENT_ID = "system0";
	private static final String IO_ID = "io0";
	private static final String ESS_ID = "ess0";
	private static final String BATTERY11_ID = "battery11";
	private static final String BATTERY12_ID = "battery12";
	private static final String BATTERY21_ID = "battery21";
	private static final String BATTERY22_ID = "battery22";
	private static final ChannelAddress COOLING_UNIT_ENABLE = new ChannelAddress(IO_ID, "InputOutput1");

	@Test
	public void test() throws Exception {
		final var clock = new TimeLeapClock(Instant.parse("2020-01-01T01:00:00.00Z"), ZoneOffset.UTC);
		final var dummyIo = new DummyInputOutput(IO_ID);
		new ComponentTest(new SystemFeneconIndustrialMImpl()) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("cm", new DummyConfigurationAdmin())//
				.addReference("ess", new DummyMetaEss(ESS_ID)) //
				.addComponent(dummyIo) //
				.activate(MyConfig.create() //
						.setId(COMPONENT_ID) //
						.setStartStopConfig(StartStopConfig.START) //
						.setCoolingUnitMode(CoolingUnitMode.AUTO)//
						.setCoolingType(CoolingType.CHILLER)//
						.setEssId(ESS_ID)//
						.setBatteryIds(BATTERY11_ID, BATTERY12_ID, BATTERY21_ID, BATTERY22_ID)//
						.setCoolingUnitEnable(COOLING_UNIT_ENABLE.toString())//
						.build())//
		;
	}
}
