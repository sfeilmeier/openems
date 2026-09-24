package io.openems.edge.system.fenecon.industrial.xl;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.fluidcooling.hydac.DummyHydacImpl;
import io.openems.edge.io.test.DummyCustomInputOutput;
import io.openems.edge.system.fenecon.industrial.enums.FluidCoolingMode;

public class SystemFeneconIndustrialXlImplTest {

	private static final ChannelAddress ENABLE_COUPLING_SWITCH = new ChannelAddress("system0", "EnableCouplingSwitch");
	private static final ChannelAddress STATUS_24V_PDU_F2B_1 = new ChannelAddress("system0", "Status24vPduF2b1");
	private static final ChannelAddress STATUS_24V_PDU_F2B_2 = new ChannelAddress("system0", "Status24vPduF2b2");
	private static final ChannelAddress STATUS_24V_PDU_F2B_3 = new ChannelAddress("system0", "Status24vPduF2b3");
	private static final ChannelAddress STATUS_24V_PDU_CSYS = new ChannelAddress("system0", "Status24vPduCsys");
	private static final ChannelAddress STATUS_SPD_CC_AC = new ChannelAddress("system0", "StatusSpdCcAc");
	private static final ChannelAddress STATUS_SPD_CCS = new ChannelAddress("system0", "StatusSpdCcs");
	private static final ChannelAddress BUFFERING_24V_F2B = new ChannelAddress("system0", "Buffering24vF2b");
	private static final ChannelAddress STATUS_SPD_INV = new ChannelAddress("system0", "StatusSpdInv");
	private static final ChannelAddress STATUS_SWITCH_F2B_1 = new ChannelAddress("system0", "StatusSwitchF2b1");
	private static final ChannelAddress STATUS_SWITCH_F2B_2 = new ChannelAddress("system0", "StatusSwitchF2b2");
	private static final ChannelAddress STATUS_SWITCH_F2B_3 = new ChannelAddress("system0", "StatusSwitchF2b3");
	private static final ChannelAddress STATUS_DOOR_CSYS = new ChannelAddress("system0", "StatusDoorCsys");
	private static final ChannelAddress STATUS_DOOR_BAT_1 = new ChannelAddress("system0", "StatusDoorBat1");
	private static final ChannelAddress STATUS_DOOR_BAT_2 = new ChannelAddress("system0", "StatusDoorBat2");
	private static final ChannelAddress STATUS_DOOR_BAT_3 = new ChannelAddress("system0", "StatusDoorBat3");

	private static final ChannelAddress STATUS_24V_PSU_CSYS = new ChannelAddress("system0", "Status24vPsuCsys");
	private static final ChannelAddress STATUS_24V_PSU_F2B_1 = new ChannelAddress("system0", "Status24vPsuF2b1");
	private static final ChannelAddress STATUS_24V_PSU_F2B_2 = new ChannelAddress("system0", "Status24vPsuF2b2");
	private static final ChannelAddress STATUS_24V_PSU_F2B_3 = new ChannelAddress("system0", "Status24vPsuF2b3");
	private static final ChannelAddress STATUS_SPD_CC_CI = new ChannelAddress("system0", "StatusSpdCcCi");
	private static final ChannelAddress STATUS_SPD_DC_BAT_1 = new ChannelAddress("system0", "StatusSpdDcBat1");
	private static final ChannelAddress STATUS_SPD_DC_BAT_2 = new ChannelAddress("system0", "StatusSpdDcBat2");
	private static final ChannelAddress STATUS_SPD_DC_BAT_3 = new ChannelAddress("system0", "StatusSpdDcBat3");
	private static final ChannelAddress STATUS_LEAK_MONITOR_1 = new ChannelAddress("system0", "StatusLeakMonitor1");
	private static final ChannelAddress STATUS_LEAK_MONITOR_2 = new ChannelAddress("system0", "StatusLeakMonitor2");
	private static final ChannelAddress STATUS_LIGHTING = new ChannelAddress("system0", "StatusLighting");
	private static final ChannelAddress STATUS_SYS_OFF = new ChannelAddress("system0", "StatusSysOff");
	private static final ChannelAddress SYS_SERVICE_SWITCH = new ChannelAddress("system0", "SysServiceSwitch");

	private static final ChannelAddress DIGITAL_INPUT_M0_C1 = new ChannelAddress("io0", "DigitalInputM0C1");
	private static final ChannelAddress DIGITAL_INPUT_M0_C2 = new ChannelAddress("io0", "DigitalInputM0C2");
	private static final ChannelAddress DIGITAL_INPUT_M0_C3 = new ChannelAddress("io0", "DigitalInputM0C3");
	private static final ChannelAddress DIGITAL_INPUT_M0_C4 = new ChannelAddress("io0", "DigitalInputM0C4");
	private static final ChannelAddress DIGITAL_INPUT_M0_C5 = new ChannelAddress("io0", "DigitalInputM0C5");
	private static final ChannelAddress DIGITAL_INPUT_M0_C6 = new ChannelAddress("io0", "DigitalInputM0C6");
	private static final ChannelAddress DIGITAL_INPUT_M0_C7 = new ChannelAddress("io0", "DigitalInputM0C7");
	private static final ChannelAddress DIGITAL_INPUT_M0_C8 = new ChannelAddress("io0", "DigitalInputM0C8");
	private static final ChannelAddress DIGITAL_INPUT_M0_C9 = new ChannelAddress("io0", "DigitalInputM0C9");
	private static final ChannelAddress DIGITAL_INPUT_M0_C10 = new ChannelAddress("io0", "DigitalInputM0C10");
	private static final ChannelAddress DIGITAL_INPUT_M0_C11 = new ChannelAddress("io0", "DigitalInputM0C11");
	private static final ChannelAddress DIGITAL_INPUT_M0_C12 = new ChannelAddress("io0", "DigitalInputM0C12");
	private static final ChannelAddress DIGITAL_INPUT_M0_C13 = new ChannelAddress("io0", "DigitalInputM0C13");
	private static final ChannelAddress DIGITAL_INPUT_M0_C14 = new ChannelAddress("io0", "DigitalInputM0C14");
	private static final ChannelAddress DIGITAL_INPUT_M0_C15 = new ChannelAddress("io0", "DigitalInputM0C15");
	private static final ChannelAddress DIGITAL_INPUT_M0_C16 = new ChannelAddress("io0", "DigitalInputM0C16");

	private static final ChannelAddress DIGITAL_INPUT_M1_C1 = new ChannelAddress("io0", "DigitalInputM1C1");
	private static final ChannelAddress DIGITAL_INPUT_M1_C3 = new ChannelAddress("io0", "DigitalInputM1C3");
	private static final ChannelAddress DIGITAL_INPUT_M1_C4 = new ChannelAddress("io0", "DigitalInputM1C4");
	private static final ChannelAddress DIGITAL_INPUT_M1_C5 = new ChannelAddress("io0", "DigitalInputM1C5");
	private static final ChannelAddress DIGITAL_INPUT_M1_C9 = new ChannelAddress("io0", "DigitalInputM1C9");
	private static final ChannelAddress DIGITAL_INPUT_M1_C10 = new ChannelAddress("io0", "DigitalInputM1C10");
	private static final ChannelAddress DIGITAL_INPUT_M1_C11 = new ChannelAddress("io0", "DigitalInputM1C11");
	private static final ChannelAddress DIGITAL_INPUT_M1_C12 = new ChannelAddress("io0", "DigitalInputM1C12");
	private static final ChannelAddress DIGITAL_INPUT_M1_C13 = new ChannelAddress("io0", "DigitalInputM1C13");
	private static final ChannelAddress DIGITAL_INPUT_M1_C14 = new ChannelAddress("io0", "DigitalInputM1C14");
	private static final ChannelAddress DIGITAL_INPUT_M1_C15 = new ChannelAddress("io0", "DigitalInputM1C15");
	private static final ChannelAddress DIGITAL_INPUT_M1_C16 = new ChannelAddress("io0", "DigitalInputM1C16");

	@Test
	public void testM0Module() throws Exception {
		final var system = new SystemFeneconIndustrialXlImpl();
		final var temp = new DummyJumoHydroTransS20Impl("temp0").withHumidity(5).withTemperature(20);
		final var fireAlarmSystem = new DummyHekatronB9X2Impl("fireAlarmSys");
		final var hydac = new DummyHydacImpl("fluidCooling").withOutletTemperature(25).withCoolingRequired(true)
				.withPump(true).withCompressor(true);
		final var blueeplus = new DummyBlueeplusImpl("airCooling").withSetupStandardControlSetpoint(20);
		new ComponentTest(system) //
				.addReference("componentManager", new DummyComponentManager()) //
				.addReference("cm", new DummyConfigurationAdmin())//
				.addReference("ess", new DummyMetaEss("ess0")) //
				.addReference("temp", temp) //
				.addReference("fireAlarmSystem", fireAlarmSystem) //
				.addReference("airCooling", blueeplus) //
				.addReference("fluidCooling", hydac) //
				.addComponent(new DummyCustomInputOutput("io0", "DIGITAL_INPUT_M", "C", 1, 16, 2)) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setStartStopConfig(StartStopConfig.START) //
						.setEssId("ess0") //
						.setBatteryIds("battery1", "battery2", "battery3", "battery4") //
						.setTempId("temp0") //
						.setFireAlarmSysId("fireAlarmSys0") //
						.setAirCoolingId("airCooling0")//
						.setAirCoolingSetPoint(25)//
						.setFluidCoolingId("fluidCooling0")//
						.setFluidCoolingMode(FluidCoolingMode.ENABLED)//
						.build()) //
				.next(new TestCase("System inputs OK") //
						.input(SYS_SERVICE_SWITCH, false)//
						.input(STATUS_SYS_OFF, false)//
						.input(ENABLE_COUPLING_SWITCH, false))//
				.next(new TestCase()//
						.input(DIGITAL_INPUT_M0_C1, true)//
						.input(DIGITAL_INPUT_M0_C2, true)//
						.input(DIGITAL_INPUT_M0_C3, true)//
						.input(DIGITAL_INPUT_M0_C4, true)//
						.input(DIGITAL_INPUT_M0_C5, true)//
						.input(DIGITAL_INPUT_M0_C6, true)//
						.input(DIGITAL_INPUT_M0_C7, true)//
						.input(DIGITAL_INPUT_M0_C8, true)//
						.input(DIGITAL_INPUT_M0_C9, true)//
						.input(DIGITAL_INPUT_M0_C10, false)//
						.input(DIGITAL_INPUT_M0_C11, false)//
						.input(DIGITAL_INPUT_M0_C12, false)//
						.input(DIGITAL_INPUT_M0_C13, true)//
						.input(DIGITAL_INPUT_M0_C14, true)//
						.input(DIGITAL_INPUT_M0_C15, true)//
						.input(DIGITAL_INPUT_M0_C16, false)//
						.input(DIGITAL_INPUT_M1_C1, true)//
						.input(DIGITAL_INPUT_M1_C3, true)//
						.input(DIGITAL_INPUT_M1_C4, true)//
						.input(DIGITAL_INPUT_M1_C5, true)//
						.input(DIGITAL_INPUT_M1_C9, true)//
						.input(DIGITAL_INPUT_M1_C10, true)//
						.input(DIGITAL_INPUT_M1_C11, true)//
						.input(DIGITAL_INPUT_M1_C12, true)//
						.input(DIGITAL_INPUT_M1_C13, true)//
						.input(DIGITAL_INPUT_M1_C14, true)//
						.input(DIGITAL_INPUT_M1_C15, false)//
						.input(DIGITAL_INPUT_M1_C16, false)//
				) //
				.next(new TestCase()//
						.input(DIGITAL_INPUT_M0_C1, true)//
						.input(DIGITAL_INPUT_M0_C2, true)//
						.input(DIGITAL_INPUT_M0_C3, true)//
						.input(DIGITAL_INPUT_M0_C4, true)//
						.input(DIGITAL_INPUT_M0_C5, true)//
						.input(DIGITAL_INPUT_M0_C6, true)//
						.input(DIGITAL_INPUT_M0_C7, true)//
						.input(DIGITAL_INPUT_M0_C8, true)//
						.input(DIGITAL_INPUT_M0_C9, true)//
						.input(DIGITAL_INPUT_M0_C10, false)//
						.input(DIGITAL_INPUT_M0_C11, false)//
						.input(DIGITAL_INPUT_M0_C12, false)//
						.input(DIGITAL_INPUT_M0_C13, true)//
						.input(DIGITAL_INPUT_M0_C14, true)//
						.input(DIGITAL_INPUT_M0_C15, true)//
						.input(DIGITAL_INPUT_M0_C16, false)//
						.input(DIGITAL_INPUT_M1_C1, true)//
						.input(DIGITAL_INPUT_M1_C3, true)//
						.input(DIGITAL_INPUT_M1_C4, true)//
						.input(DIGITAL_INPUT_M1_C5, true)//
						.input(DIGITAL_INPUT_M1_C9, true)//
						.input(DIGITAL_INPUT_M1_C10, true)//
						.input(DIGITAL_INPUT_M1_C11, true)//
						.input(DIGITAL_INPUT_M1_C12, true)//
						.input(DIGITAL_INPUT_M1_C13, true)//
						.input(DIGITAL_INPUT_M1_C14, true)//
						.input(DIGITAL_INPUT_M1_C15, false)//
						.input(DIGITAL_INPUT_M1_C16, false)//
				) //
				.next(new TestCase()//
						.output(ENABLE_COUPLING_SWITCH, false)//
						.output(STATUS_24V_PDU_F2B_1, false)//
						.output(STATUS_24V_PDU_F2B_2, false)//
						.output(STATUS_24V_PDU_F2B_3, false)//
						.output(STATUS_24V_PDU_CSYS, false)//
						.output(STATUS_SPD_CC_AC, false)//
						.output(STATUS_SPD_CCS, false)//
						.output(BUFFERING_24V_F2B, false)//
						.output(STATUS_SPD_INV, false)//
						.output(STATUS_SWITCH_F2B_1, false)//
						.output(STATUS_SWITCH_F2B_2, false)//
						.output(STATUS_SWITCH_F2B_3, false)//
						.output(STATUS_DOOR_CSYS, false)//
						.output(STATUS_DOOR_BAT_1, false)//
						.output(STATUS_DOOR_BAT_2, false)//
						.output(STATUS_DOOR_BAT_3, true)//
						.output(STATUS_24V_PSU_CSYS, false)//
						.output(STATUS_24V_PSU_F2B_1, false)//
						.output(STATUS_24V_PSU_F2B_2, false)//
						.output(STATUS_24V_PSU_F2B_3, false)//
						.output(STATUS_SPD_CC_CI, false)//
						.output(STATUS_SPD_DC_BAT_1, false)//
						.output(STATUS_SPD_DC_BAT_2, false)//
						.output(STATUS_SPD_DC_BAT_3, false)//
						.output(STATUS_LEAK_MONITOR_1, false)//
						.output(STATUS_LEAK_MONITOR_2, false)//
						.output(STATUS_LIGHTING, false)//
						.output(STATUS_SYS_OFF, false)//
				);
		assertEquals("GoRunning|Temperature:20 °C|Humidity:5 %", system.debugLog());
		assertEquals("INFO: Türschalter: Containertür Batterieturm 3 geöffnet", system.getStateChannel().listStates());
	}

	@Test
	public void testOutdatedF2bVersion() throws Exception {
		final var system = new SystemFeneconIndustrialXlImpl();
		final var temp = new DummyJumoHydroTransS20Impl("temp0").withHumidity(5).withTemperature(20);
		final var fireAlarmSystem = new DummyHekatronB9X2Impl("fireAlarmSys");
		final var hydac = new DummyHydacImpl("fluidCooling").withOutletTemperature(25).withCoolingRequired(true)
				.withPump(true).withCompressor(true);
		final var blueeplus = new DummyBlueeplusImpl("airCooling").withSetupStandardControlSetpoint(20);
		new ComponentTest(system) //
				.addReference("componentManager", new DummyComponentManager()) //
				.addReference("cm", new DummyConfigurationAdmin())//
				.addReference("ess", new DummyMetaEss("ess0")) //
				.addReference("temp", temp) //
				.addReference("fireAlarmSystem", fireAlarmSystem) //
				.addReference("airCooling", blueeplus) //
				.addReference("fluidCooling", hydac) //
				.addComponent(new DummyCustomInputOutput("io0", "DIGITAL_INPUT_M", "C", 1, 16, 2)) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setStartStopConfig(StartStopConfig.START) //
						.setEssId("ess0") //
						.setBatteryIds("battery1", "battery2", "battery3", "battery4") //
						.setTempId("temp0") //
						.setFireAlarmSysId("fireAlarmSys0") //
						.setAirCoolingId("airCooling0")//
						.setAirCoolingSetPoint(25)//
						.setFluidCoolingId("fluidCooling0")//
						.setFluidCoolingMode(FluidCoolingMode.ENABLED)//
						.build()) //
				.next(new TestCase("Set every battery to an outdated version/wrong hardware type") //
						.onAfterProcessImage(() -> system.getBatteries().forEach(battery -> { //
							battery.getF2bApplicationMainVersionChannel().setNextValue(1);
							battery.getF2bApplicationSubVersionChannel().setNextValue(1);
							battery.getF2bHardwareTypeChannel().setNextValue(4);
						})) //
				) //
				.next(new TestCase("Check if outdated/wrong version") //
						.onAfterProcessImage(() -> system.getBatteries().forEach(battery -> { //
							assertEquals(true, battery.getF2bSoftwareVersionOutdated().get());
							assertEquals(true, battery.getF2bHardwareVersionWrong().get());
						})) //
				) //
				.next(new TestCase("Set every battery to a high version that is never outdated") //
						.onAfterProcessImage(() -> system.getBatteries().forEach(battery -> { //
							battery.getF2bApplicationMainVersionChannel().setNextValue(100);
							battery.getF2bApplicationSubVersionChannel().setNextValue(100);
							battery.getF2bHardwareTypeChannel().setNextValue(5);
						})) //
				) //
				.next(new TestCase("Check if not outdated/right version") //
						.onAfterProcessImage(() -> system.getBatteries().forEach(battery -> { //
							assertEquals(false, battery.getF2bSoftwareVersionOutdated().get());
							assertEquals(false, battery.getF2bHardwareVersionWrong().get());
						})) //
				);//

	}

}
