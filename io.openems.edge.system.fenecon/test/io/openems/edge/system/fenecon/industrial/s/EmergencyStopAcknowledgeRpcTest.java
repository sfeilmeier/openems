package io.openems.edge.system.fenecon.industrial.s;

import static io.openems.edge.common.test.DummyUser.DUMMY_GUEST;
import static io.openems.edge.common.test.DummyUser.DUMMY_INSTALLER;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import io.openems.common.jsonrpc.base.JsonrpcResponseError;
import io.openems.common.test.DummyConfigurationAdmin;
import io.openems.edge.common.channel.WriteChannel;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.RpcTestUtils;
import io.openems.edge.ess.test.DummyMetaEss;
import io.openems.edge.io.test.DummyInputOutput;
import io.openems.edge.system.fenecon.industrial.enums.FluidCoolingMode;
import io.openems.edge.system.fenecon.industrial.jsonrpc.EmergencyStopAcknowledgeRpcExtension;

public class EmergencyStopAcknowledgeRpcTest {
	private static final String METHOD = "emergencyStopAcknowledge";

	@Test
	public void testEmergencyStopAcknowledge() throws Exception {
		final var system = new SystemFeneconIndustrialSImpl();
		final var io = new DummyInputOutput("io0");
		final WriteChannel<Boolean> acknowledgeChannel = io.channel(DummyInputOutput.ChannelId.INPUT_OUTPUT3);
		new ComponentTest(system) //
				.addReference("componentManager", new DummyComponentManager()) //
				.addReference("cm", new DummyConfigurationAdmin())//
				.addReference("ess", new DummyMetaEss("ess0")) //
				.addComponent(io) //
				.activate(MyConfig.create() //
						.setId("system0") //
						.setStartStopConfig(StartStopConfig.START) //
						.setCoolingUnitMode(FluidCoolingMode.AUTO) //
						.setEssId("ess0") //
						.setBatteryIds("battery11", "battery12", "battery21", "battery22") //
						.setCoolingUnitError("io0/InputOutput0") //
						.setCoolingUnitEnable("io0/InputOutput1") //
						.setEmergencyStopState("io0/InputOutput2") //
						.setAcknowledgeEmergencyStop("io0/InputOutput3") //
						.setSpdState("io0/InputOutput4") //
						.setFuseState("io0/InputOutput5") //
						.build()) //
				.next(new TestCase()) //

				// A user without the INSTALLER role is rejected
				.next(new TestCase()//
						.onAfterProcessImage(() -> {
							var call = RpcTestUtils.performEmptyCall(//
									new EmergencyStopAcknowledgeRpcExtension(), //
									system, //
									METHOD, //
									DUMMY_GUEST//
							);
							assertInstanceOf(JsonrpcResponseError.class, call.getResponse());
							assertEquals(Optional.empty(), acknowledgeChannel.getNextWriteValue());
						}))//

				// The acknowledge writes the acknowledge output
				.next(new TestCase()//
						.onAfterProcessImage(() -> {
							RpcTestUtils.performEmptyCall(//
									new EmergencyStopAcknowledgeRpcExtension(), //
									system, //
									METHOD, //
									DUMMY_INSTALLER//
							);
							assertEquals(Optional.of(true), acknowledgeChannel.getNextWriteValue());
						}))//
		;
	}
}
