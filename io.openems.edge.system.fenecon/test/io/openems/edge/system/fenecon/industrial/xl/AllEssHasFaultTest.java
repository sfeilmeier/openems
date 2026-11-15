package io.openems.edge.system.fenecon.industrial.xl;

import org.junit.jupiter.api.Test;

import io.openems.common.channel.Level;
import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.test.TestUtils;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.aircooling.blueeplus.DummyBlueeplusImpl;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.ess.test.DummyManagedSymmetricEss;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.firealarmsystem.hekatron.DummyHekatronB9X2Impl;
import io.openems.edge.fluidcooling.hydac.DummyHydacImpl;
import io.openems.edge.io.test.DummyCustomInputOutput;
import io.openems.edge.system.fenecon.industrial.enums.FluidCoolingMode;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;
import io.openems.edge.temperature.jumo.DummyJumoHydroTransS20Impl;

public class AllEssHasFaultTest {

	private static final ChannelAddress STATE_MACHINE = new ChannelAddress("system0", "StateMachine");
	private static final ChannelAddress STATUS_SYS_OFF = new ChannelAddress("system0", "StatusSysOff");
	private static final ChannelAddress ENABLE_COUPLING_SWITCH = new ChannelAddress("system0", "EnableCouplingSwitch");
	private static final ChannelAddress SYS_SERVICE_SWITCH = new ChannelAddress("system0", "SysServiceSwitch");

	@Test
	public void testAreAllEssInFailure() throws Exception {
		final var clock = TestUtils.createDummyClock();
		final var system = new SystemFeneconIndustrialXlImpl();

		final var temp = new DummyJumoHydroTransS20Impl("temp0") //
				.withHumidity(5) //
				.withTemperature(20);
		final var fireAlarmSystem = new DummyHekatronB9X2Impl("fireAlarmSys0");
		final var hydac = new DummyHydacImpl("fluidCooling") //
				.withOutletTemperature(25) //
				.withCoolingRequired(true) //
				.withPump(true) //
				.withCompressor(true);
		final var blueeplus = new DummyBlueeplusImpl("airCooling") //
				.withSetupStandardControlSetpoint(20);
		var ess1 = new DummyManagedSymmetricEss("ess1").withLevel(Level.WARNING);
		var ess2 = new DummyManagedSymmetricEss("ess2").withLevel(Level.WARNING);
		var ess3 = new DummyManagedSymmetricEss("ess3").withLevel(Level.WARNING);
		var essCluster = new DummyMetaEss("ess0", ess1, ess2, ess3);
		new ComponentTest(system) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("cm", new DummyConfigurationAdmin())//
				.addComponent(ess1)//
				.addComponent(ess2)//
				.addComponent(ess3)//
				.addReference("ess", essCluster)//
				.addReference("temp", temp) //
				.addReference("fireAlarmSystem", fireAlarmSystem) //
				.addReference("airCooling", blueeplus) //
				.addReference("fluidCooling", hydac) //
				.addComponent(new DummyCustomInputOutput("io0", "DIGITAL_INPUT_M", "C", 3, 16, 0)) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setStartStopConfig(StartStopConfig.STOP) //
						.setEssId("ess0") //
						.setBatteryIds("battery1", "battery2", "battery3", "battery4") //
						.setTempId("temp0") //
						.setFireAlarmSysId("fireAlarmSystem0") //
						.setAirCoolingId("airCooling0")//
						.setAirCoolingSetPoint(25)//
						.setFluidCoolingId("fluidCooling0")//
						.setFluidCoolingMode(FluidCoolingMode.ENABLED)//
						.build()) //
				.next(new TestCase("System inputs OK") //
						.input(SYS_SERVICE_SWITCH, false)//
						.input(STATUS_SYS_OFF, false)//
						.input(ENABLE_COUPLING_SWITCH, false))//
				.next(new TestCase("All ESS in failure")//
						.onAfterProcessImage(() -> ess1.withLevel(Level.FAULT))//
						.onAfterProcessImage(() -> ess2.withLevel(Level.FAULT))//
						.onAfterProcessImage(() -> ess3.withLevel(Level.FAULT)))//
				.next(new TestCase()//
						.output(STATE_MACHINE, State.GO_STOPPED))//
				.next(new TestCase()//
						.output(STATE_MACHINE, State.STOPPED))//

		;
	}

}
