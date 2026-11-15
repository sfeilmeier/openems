package io.openems.edge.system.fenecon.industrial.l;

import static io.openems.common.test.TestUtils.createDummyClock;
import static java.time.temporal.ChronoUnit.MINUTES;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.ZonedDateTime;
import java.util.function.Consumer;

import org.junit.jupiter.api.Test;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.system.fenecon.industrial.l.envicool.Envicool;
import io.openems.edge.system.fenecon.industrial.l.statemachine.StateMachine;

public class SystemFeneconIndustrialLImplTest {

	@Test
	public void test() throws Exception {
		new ComponentTest(new SystemFeneconIndustrialLImpl()) //
				.addReference("componentManager", new DummyComponentManager(createDummyClock())) //
				.addReference("setCoolingUnitModbus", new DummyModbusBridge("modbus0")) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("ess", new DummyMetaEss("ess0")) //
				.addComponent(new DummyIoIndustrialL("io0")) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setRestartTask("[]") //
						.setStartStopConfig(StartStopConfig.START) //
						.setCoolingUnitModbusId("modbus0") //
						.setEssId("ess0")//
						.setBatteryIds("battery1", "battery2")//
						.setCoolingUnitMode(Envicool.Mode.DISABLED) //
						.setCoolingUnitCoolingSetPoint(20) //
						.setCoolingUnitHeatingSetPoint(10) //
						.setIsSmokeDetectionInstalled(false)//
						.build());
	}

	@Test
	public void testRestartTask() throws Exception {
		final var clock = createDummyClock();
		final var sut = new SystemFeneconIndustrialLImpl();

		Consumer<String> assertNow = s -> assertEquals(s, ZonedDateTime.now(clock).toString());
		Consumer<String> assertDebugLog = s -> assertEquals(s, sut.debugLog());

		new ComponentTest(sut) //
				.addReference("componentManager", new DummyComponentManager(clock)) //
				.addReference("setCoolingUnitModbus", new DummyModbusBridge("modbus0")) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("ess", new DummyMetaEss("ess0")) //
				.addComponent(new DummyIoIndustrialL("io0")) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setRestartTask("""
								[
								  {
								    "@type": "Task",
								    "start": "20:00:00",
								    "recurrenceRules": [
								      {
								        "frequency": "monthly",
								        "byDay": [
								          "su"
								        ]
								      }
								    ]
								  }
								]""") //
						.setStartStopConfig(StartStopConfig.START) //
						.setCoolingUnitModbusId("modbus0") //
						.setEssId("ess0")//
						.setBatteryIds("battery1", "battery2")//
						.setCoolingUnitMode(Envicool.Mode.DISABLED) //
						.setCoolingUnitCoolingSetPoint(20) //
						.setCoolingUnitHeatingSetPoint(10) //
						.setIsSmokeDetectionInstalled(false)//
						.build()) //
				.next(new TestCase() //
						.onBeforeProcessImage(() -> assertNow.accept("2020-01-01T00:00Z")) //
						.output("StateMachine", StateMachine.State.UNDEFINED) //

						.onAfterProcessImage(() -> assertDebugLog.accept("GoStopped|CoolingUnit: UNDEFINED"))) //
				.next(new TestCase("1: Precondition") //
						.timeleap(clock, 4 * 24 * 60 + 19 * 60 + 59, MINUTES) //
						.onBeforeProcessImage(() -> assertNow.accept("2020-01-05T19:59Z")) //
						.output("StateMachine", StateMachine.State.GO_STOPPED)) //

				.next(new TestCase() //
						.timeleap(clock, 1, MINUTES) //
						.onBeforeProcessImage(() -> assertNow.accept("2020-01-05T20:00Z")) //
						.output("StateMachine", StateMachine.State.GO_STOPPED)) //

				.next(new TestCase() //
						.onBeforeProcessImage(() -> assertNow.accept("2020-01-05T20:00Z")) //
						.output("StateMachine", StateMachine.State.GO_STOPPED) //

						.onAfterProcessImage(() -> assertDebugLog.accept("BmsReset-StopSystem|CoolingUnit: UNDEFINED"))) //
				.next(new TestCase() //
						.onBeforeProcessImage(() -> assertNow.accept("2020-01-05T20:00Z")) //
						.output("StateMachine", StateMachine.State.BMS_RESET)) //
				.deactivate();
	}

}