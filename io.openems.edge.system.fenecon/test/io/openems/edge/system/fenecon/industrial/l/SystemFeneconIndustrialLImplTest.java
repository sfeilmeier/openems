package io.openems.edge.system.fenecon.industrial.l;

import static io.openems.common.test.TestUtils.createDummyClock;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.COMPRESSOR_1_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.COMPRESSOR_2_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.CUMULATED_TIME_COMPRESSOR_1_AND_2_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.CUMULATED_TIME_COMPRESSOR_1_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.CUMULATED_TIME_COMPRESSOR_2_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.CUMULATED_TIME_HEATER_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.CUMULATED_TIME_PUMP_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.HEATER_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.PUMP_RUNNING_STATE;

import java.util.Map;

import org.junit.Test;
import org.osgi.service.event.Event;

import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.event.EdgeEventConstants;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.DummyCycle;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.io.test.DummyInputOutput;
import io.openems.edge.system.fenecon.industrial.l.envicool.Envicool;
import io.openems.edge.timedata.test.DummyTimedata;

public class SystemFeneconIndustrialLImplTest {

	private static final String COMPONENT_ID = "system0";
	private static final String IO_ID = "io0";
	private static final String ESS_ID = "ess0";
	private static final String MODBUS_ID = "modbus0";
	private static final String BATTERY1_ID = "battery1";
	private static final String BATTERY2_ID = "battery2";
	private static final ChannelAddress EMERGENCY_STOP_STATE = new ChannelAddress(IO_ID, "InputOutput2");
	private static final ChannelAddress ACKNOWLEDGE_EMERGENCY_STOP = new ChannelAddress(IO_ID, "InputOutput3");
	private static final ChannelAddress SPD_STATE = new ChannelAddress(IO_ID, "InputOutput4");
	private static final ChannelAddress FUSE_STATE = new ChannelAddress(IO_ID, "InputOutput5");
	private static final ChannelAddress PSU_TRIGGERED = new ChannelAddress(IO_ID, "InputOutput6");

	private static final ChannelAddress SMOKE_DETECTION = new ChannelAddress(IO_ID, "InputOutput7");
	private static final ChannelAddress SMOKE_DETECTION_FAILURE = new ChannelAddress(IO_ID, "InputOutput8");
	private static final ChannelAddress BMS_HARD_RESET = new ChannelAddress(IO_ID, "InputOutput9");

	private static final ChannelAddress START_STOP = new ChannelAddress(COMPONENT_ID, "StartStop");

	@Test
	public void test() throws Exception {
		final var dummyIo = new DummyInputOutput(IO_ID);
		new ComponentTest(new SystemFeneconIndustrialLImpl()) //
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
						.setEmergencyStopState(EMERGENCY_STOP_STATE.toString()) //
						.setAcknowledgeEmergencyStop(ACKNOWLEDGE_EMERGENCY_STOP.toString())//
						.setSpdTripped(SPD_STATE.toString())//
						.setFuseTripped(FUSE_STATE.toString())//
						.setPsuTriggered(PSU_TRIGGERED.toString())//
						.setIsSmokeDetectionInstalled(false)//
						.setSmokeDetection(SMOKE_DETECTION.toString())
						.setSmokeDetectionFailure(SMOKE_DETECTION_FAILURE.toString())//
						.setBmsHardReset(BMS_HARD_RESET.toString())//
						.build())
				.next(new TestCase()//
						.input(SMOKE_DETECTION, false)//
						.input(START_STOP, StartStop.STOP)//
						.output(SMOKE_DETECTION, false))
				.next(new TestCase()//
						.input(SMOKE_DETECTION_FAILURE, true)//
						.input(START_STOP, StartStop.STOP)//
						.output(SMOKE_DETECTION_FAILURE, true));
	}

	@Test
	public void testWithSmokeDetection() throws Exception {
		final var dummyIo = new DummyInputOutput(IO_ID);
		new ComponentTest(new SystemFeneconIndustrialLImpl()) //
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
						.setEmergencyStopState(EMERGENCY_STOP_STATE.toString()) //
						.setAcknowledgeEmergencyStop(ACKNOWLEDGE_EMERGENCY_STOP.toString())//
						.setSpdTripped(SPD_STATE.toString())//
						.setFuseTripped(FUSE_STATE.toString())//
						.setPsuTriggered(PSU_TRIGGERED.toString())//
						.setIsSmokeDetectionInstalled(true)//
						.setSmokeDetection(SMOKE_DETECTION.toString())
						.setSmokeDetectionFailure(SMOKE_DETECTION_FAILURE.toString())//
						.setBmsHardReset(BMS_HARD_RESET.toString())//
						.build())
				.next(new TestCase()//
						.input(SMOKE_DETECTION, false)//
						.input(START_STOP, StartStop.STOP)//
						.output(SMOKE_DETECTION, false))
				.next(new TestCase()//
						.input(SMOKE_DETECTION_FAILURE, true)//
						.input(START_STOP, StartStop.STOP)//
						.output(SMOKE_DETECTION_FAILURE, true));
	}

	@Test
	public void testCumulatedTimeChannels() throws Exception {
		final var dummyIo = new DummyInputOutput(IO_ID);
		final var sut = new SystemFeneconIndustrialLImpl();
		final var timedata = new DummyTimedata("timedata");
		final var event = new Event(EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE, Map.of());
		new ComponentTest(sut) //
				.addReference("componentManager", new DummyComponentManager(createDummyClock())) //
				.addReference("setCoolingUnitModbus", new DummyModbusBridge(MODBUS_ID)) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("ess", new DummyMetaEss(ESS_ID)) //
				.addReference("timedata", timedata) //
				.addComponent(new DummyCycle(1000)) //
				.addComponent(dummyIo) //
				.activate(MyConfig.create() //
						.setId(COMPONENT_ID) //
						.setStartStopConfig(StartStopConfig.START) //
						.setCoolingUnitModbusId(MODBUS_ID) //
						.setEssId(ESS_ID) //
						.setBatteryIds(BATTERY1_ID, BATTERY2_ID) //
						.setCoolingUnitMode(Envicool.Mode.DISABLED) //
						.setCoolingUnitCoolingSetPoint(20) //
						.setCoolingUnitHeatingSetPoint(10) //
						.setEmergencyStopState(EMERGENCY_STOP_STATE.toString()) //
						.setAcknowledgeEmergencyStop(ACKNOWLEDGE_EMERGENCY_STOP.toString()) //
						.setSpdTripped(SPD_STATE.toString()) //
						.setFuseTripped(FUSE_STATE.toString()) //
						.setPsuTriggered(PSU_TRIGGERED.toString()) //
						.setIsSmokeDetectionInstalled(false) //
						.setSmokeDetection(SMOKE_DETECTION.toString()) //
						.setSmokeDetectionFailure(SMOKE_DETECTION_FAILURE.toString()) //
						.setBmsHardReset(BMS_HARD_RESET.toString()) //
						.build())
				.next(new TestCase() //
						.input(HEATER_RUNNING_STATE, true) //
						.input(PUMP_RUNNING_STATE, true) //
						.input(COMPRESSOR_1_RUNNING_STATE, true) //
						.input(COMPRESSOR_2_RUNNING_STATE, true) //
						.output(CUMULATED_TIME_HEATER_RUNNING_STATE, null) //
						.output(CUMULATED_TIME_PUMP_RUNNING_STATE, null) //
						.output(CUMULATED_TIME_COMPRESSOR_1_RUNNING_STATE, null) //
						.output(CUMULATED_TIME_COMPRESSOR_2_RUNNING_STATE, null) //
						.output(CUMULATED_TIME_COMPRESSOR_1_AND_2_RUNNING_STATE, null)) //
				.next(new TestCase() //
						.onBeforeProcessImage(() -> sut.handleEvent(event))) //
				.next(new TestCase() //
						.output(CUMULATED_TIME_HEATER_RUNNING_STATE, 0) //
						.output(CUMULATED_TIME_PUMP_RUNNING_STATE, 0) //
						.output(CUMULATED_TIME_COMPRESSOR_1_RUNNING_STATE, 0) //
						.output(CUMULATED_TIME_COMPRESSOR_2_RUNNING_STATE, 0) //
						.output(CUMULATED_TIME_COMPRESSOR_1_AND_2_RUNNING_STATE, 0)) //
		;
	}
}