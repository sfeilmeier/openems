package io.openems.edge.system.fenecon.industrial.xl;

import static io.openems.edge.common.startstop.StartStoppable.ChannelId.START_STOP;

import org.junit.jupiter.api.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.aircooling.blueeplus.DummyBlueeplusImpl;
import io.openems.edge.common.jsonapi.JsonApiBuilder;
import io.openems.edge.common.startstop.StartStop;
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
import io.openems.edge.system.fenecon.industrial.xl.jsonrpc.TestMode.TestAction.Exit;
import io.openems.edge.system.fenecon.industrial.xl.jsonrpc.TestMode.TestAction.ManualBatteryStart;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

class ManualBatteryStartTest {
	private static final ChannelAddress STATE_MACHINE = new ChannelAddress("system0", "StateMachine");

	@Test
	void setup() throws Exception {
		var ess1 = new DummyManagedSymmetricEss("ess1").withStartStop(StartStop.STOP);
		var ess2 = new DummyManagedSymmetricEss("ess2").withStartStop(StartStop.STOP);
		var ess3 = new DummyManagedSymmetricEss("ess3").withStartStop(StartStop.STOP);
		final var system = new SystemFeneconIndustrialXlImpl();
		final var temp = new DummyJumoHydroTransS20Impl("temp0") //
				.withHumidity(5) //
				.withTemperature(20);
		final var fireAlarmSystem = new DummyHekatronB9X2Impl("fireAlarmSys");
		final var hydac = new DummyHydacImpl("fluidCooling") //
				.withOutletTemperature(25) //
				.withCoolingRequired(true) //
				.withPump(true) //
				.withCompressor(true);
		final var blueeplus = new DummyBlueeplusImpl("airCooling") //
				.withSetupStandardControlSetpoint(20);
		new ComponentTest(system) //
				.addComponent(ess1) //
				.addComponent(ess2) //
				.addComponent(ess3) //
				.addComponent(new DummyCustomInputOutput("io0", "DIGITAL_OUTPUT_M", "C", 2, 8, 4)) //
				.addReference("componentManager", new DummyComponentManager()) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("ess", new DummyMetaEss("ess0", ess1, ess2, ess3))//
				.addReference("temp", temp) //
				.addReference("fireAlarmSystem", fireAlarmSystem) //
				.addReference("airCooling", blueeplus) //
				.addReference("fluidCooling", hydac) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setStartStopConfig(StartStopConfig.STOP) //
						.setEssId("ess0") //
						.setBatteryIds("battery1", "battery2", "battery3", "battery4", "battery5", //
								"battery6", "battery7", "battery8", "battery9") //
						.setTempId("temp0") //
						.setFireAlarmSysId("fireAlarmSystem0") //
						.setAirCoolingId("airCooling0") //
						.setAirCoolingSetPoint(25) //
						.setFluidCoolingId("fluidCooling0") //
						.setFluidCoolingMode(FluidCoolingMode.ENABLED) //
						.build()) //
				.next(new TestCase("System inputs OK") //
						.input(new ChannelAddress("system0", "SysServiceSwitch"), false) //
						.input(new ChannelAddress("system0", "StatusSysOff"), false) //
						.input(new ChannelAddress("system0", "EnableCouplingSwitch"), false)) //
				.next(new TestCase() //
						.output(STATE_MACHINE, State.UNDEFINED)) //
				.next(new TestCase() //
						.output(STATE_MACHINE, State.GO_STOPPED)) //
				.next(new TestCase() //
						.output(STATE_MACHINE, State.STOPPED))//
				.next(new TestCase() //
						.onAfterProcessImage(() -> {
							final var builder = new JsonApiBuilder();
							TestModeUtils.performJsonRpcCall(system, builder, ManualBatteryStart.getTypeName());
						})) //
				.next(new TestCase() //
						.input(START_STOP, StartStop.STOP)) //
				.next(new TestCase() //
						.output(STATE_MACHINE, State.TEST_MODE_IDLE)) //
				.next(new TestCase() //
						.output(STATE_MACHINE, State.MANUAL_BATTERY_START)) //
				.next(new TestCase()//
						.onAfterProcessImage(() -> {
							final var builder = new JsonApiBuilder();
							TestModeUtils.performJsonRpcCall(system, builder, Exit.getTypeName());
						}))//
				.next(new TestCase() //
						.output(STATE_MACHINE, State.MANUAL_BATTERY_START))//
				.next(new TestCase() //
						.output(STATE_MACHINE, State.STOPPED))//

		;
	}
}
