package io.openems.edge.ess.refubeckhoff;

import static io.openems.edge.ess.refubeckhoff.RefuBeckhoffEss.ChannelId.SET_WORK_STATE;
import static io.openems.edge.ess.refubeckhoff.RefuBeckhoffEss.ChannelId.SYSTEM_STATE;

import org.junit.Test;

import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyConfigurationAdmin;
import io.openems.edge.ess.refubeckhoff.enums.EssState;
import io.openems.edge.ess.refubeckhoff.enums.SetOperationMode;
import io.openems.edge.ess.refubeckhoff.enums.StopStart;
import io.openems.edge.ess.refubeckhoff.enums.SystemState;
import io.openems.edge.ess.test.DummyPower;

public class MyRefuDeviceTest {

	@Test
	public void test() throws Exception {
		new ComponentTest(new RefuBeckhoffEssImpl()) //
				.addReference("cm", new DummyConfigurationAdmin()) //
				.addReference("power", new DummyPower()) //
				.addReference("setModbus", new DummyModbusBridge("modbus0")) //
				.activate(MyConfig.create() //
						.setId("ess0") //
						.setModbusId("modbus0") //
						.setEssState(EssState.AUTO) //
						.setSetOperationMode(SetOperationMode.PQ_SET_POINT) //
						.setAcknowledgeError(10) //
						.setEssState(EssState.AUTO).build())
				.next(new TestCase("1") //
						.input(SYSTEM_STATE, SystemState.INIT)) //
				.next(new TestCase("2") //
						.output(SET_WORK_STATE, StopStart.START)) //
				.next(new TestCase("3") //
						.input(SYSTEM_STATE, SystemState.OFF)) //
				.next(new TestCase("4")) //
				.next(new TestCase("5") //
						.output(SYSTEM_STATE, SystemState.OFF)) //
				.next(new TestCase("6") //
						.input(SYSTEM_STATE, SystemState.ERROR)) //
				.next(new TestCase("1 times")) //
				.next(new TestCase("2 times")) //
				.next(new TestCase("3 times")) //
				.next(new TestCase("4 times")) //
				.next(new TestCase("5 times")) //
				.next(new TestCase("6 times")) //
				.next(new TestCase("7 times")) //
				.next(new TestCase("8 times")) //
				.next(new TestCase("9 times")) //
				.next(new TestCase("10 times")) //
				.next(new TestCase("7") //
						.output(SYSTEM_STATE, SystemState.ERROR)) //
				.next(new TestCase("8")) //
				.next(new TestCase("9") //
						.output(SYSTEM_STATE, SystemState.ERROR)) //
				.next(new TestCase("10")) //
		; //
	}

}
