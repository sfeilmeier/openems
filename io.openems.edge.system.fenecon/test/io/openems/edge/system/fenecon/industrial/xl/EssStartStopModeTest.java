package io.openems.edge.system.fenecon.industrial.xl;

import static io.openems.edge.common.test.DummyUser.DUMMY_INSTALLER;

import java.time.temporal.ChronoUnit;

import org.junit.jupiter.api.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.test.TestUtils;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.aircooling.blueeplus.DummyBlueeplusImpl;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.RpcTestUtils;
import io.openems.edge.ess.test.DummyManagedSymmetricEss;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.firealarmsystem.hekatron.DummyHekatronB9X2Impl;
import io.openems.edge.fluidcooling.hydac.DummyHydacImpl;
import io.openems.edge.io.test.DummyCustomInputOutput;
import io.openems.edge.system.fenecon.industrial.enums.FluidCoolingMode;
import io.openems.edge.system.fenecon.industrial.jsonrpc.TestMode;
import io.openems.edge.system.fenecon.industrial.jsonrpc.TestMode.TestAction.EssTest;
import io.openems.edge.system.fenecon.industrial.jsonrpc.TestModeRpcExtension;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;
import io.openems.edge.temperature.jumo.DummyJumoHydroTransS20Impl;

public class EssStartStopModeTest {
	private static final ChannelAddress STATE_MACHINE = new ChannelAddress("system0", "StateMachine");
	private static final ChannelAddress STATUS_SYS_OFF = new ChannelAddress("system0", "StatusSysOff");
	private static final ChannelAddress ENABLE_COUPLING_SWITCH = new ChannelAddress("system0", "EnableCouplingSwitch");
	private static final ChannelAddress SYS_SERVICE_SWITCH = new ChannelAddress("system0", "SysServiceSwitch");

	@Test
	public void testTestModeRequestHandling() throws Exception {
		final var system = new SystemFeneconIndustrialXlImpl();
		final var clock = TestUtils.createDummyClock();
		final var temp = new DummyJumoHydroTransS20Impl("temp0")//
				.withHumidity(5)//
				.withTemperature(20);
		final var fireAlarmSystem = new DummyHekatronB9X2Impl("fireAlarmSystem0");
		final var hydac = new DummyHydacImpl("fluidCooling")//
				.withOutletTemperature(25)//
				.withCoolingRequired(true)//
				.withPump(true)//
				.withCompressor(true);
		final var blueeplus = new DummyBlueeplusImpl("airCooling") //
				.withSetupStandardControlSetpoint(20);
		var ess1 = new DummyManagedSymmetricEss("ess1") //
				.withStartStop(StartStop.STOP);
		var ess2 = new DummyManagedSymmetricEss("ess2") //
				.withStartStop(StartStop.STOP);
		var ess3 = new DummyManagedSymmetricEss("ess3") //
				.withStartStop(StartStop.STOP);
		var ess4 = new DummyManagedSymmetricEss("ess4") //
				.withStartStop(StartStop.STOP);
		var ess5 = new DummyManagedSymmetricEss("ess5") //
				.withStartStop(StartStop.STOP);
		var ess6 = new DummyManagedSymmetricEss("ess6") //
				.withStartStop(StartStop.STOP);
		var ess7 = new DummyManagedSymmetricEss("ess7") //
				.withStartStop(StartStop.STOP);
		var ess8 = new DummyManagedSymmetricEss("ess8") //
				.withStartStop(StartStop.STOP);
		var ess9 = new DummyManagedSymmetricEss("ess9") //
				.withStartStop(StartStop.STOP);
		var ess10 = new DummyManagedSymmetricEss("ess10") //
				.withStartStop(StartStop.STOP);
		var essCluster = new DummyMetaEss("ess0", ess1, ess2, ess3, ess4, ess5, ess6, ess7, ess8, ess9, ess10);
		new ComponentTest(system) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("cm", new DummyConfigurationAdmin())//
				.addComponent(ess1)//
				.addComponent(ess2)//
				.addComponent(ess3)//
				.addComponent(ess4)//
				.addComponent(ess5)//
				.addComponent(ess6)//
				.addComponent(ess7)//
				.addComponent(ess8)//
				.addComponent(ess9)//
				.addComponent(ess10)//
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
				.next(new TestCase()//
						.output(STATE_MACHINE, State.UNDEFINED))//
				.next(new TestCase()//
						.output(STATE_MACHINE, State.GO_STOPPED))//
				.next(new TestCase()//
						.output(STATE_MACHINE, State.STOPPED))//
				.next(new TestCase()//
						.onAfterProcessImage(() -> {
							RpcTestUtils.performCall(//
									new TestModeRpcExtension(), //
									system, //
									new TestMode(), //
									new TestMode.Request(new EssTest()), //
									DUMMY_INSTALLER//
							);
						}))//
				.next(new TestCase()//
						.output(STATE_MACHINE, State.STOPPED))//
				.next(new TestCase()//
						.output(STATE_MACHINE, State.TEST_MODE_IDLE))//
				.next(new TestCase()//
						.timeleap(clock, 6, ChronoUnit.SECONDS)//
						.output(STATE_MACHINE, State.TEST_MODE_ESS), 51)//
				.next(new TestCase()//
						.output(STATE_MACHINE, State.TEST_MODE_IDLE))//
		;

	}
}