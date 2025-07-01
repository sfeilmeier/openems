package io.openems.edge.battery.nuvationbms;

import static io.openems.common.test.TestUtils.createDummyClock;
import static io.openems.edge.battery.api.Battery.ChannelId.SOC;
import static io.openems.edge.battery.nuvationbms.NuvationSunSpecModel.S801.SO_C;
import static io.openems.edge.battery.nuvationbms.NuvationSunSpecModel.S801.SO_C_S_F;
import static io.openems.edge.battery.nuvationbms.NuvationSunSpecModel.S802.BAT_ST;
import static io.openems.edge.battery.nuvationbms.NuvationSunSpecModel.S803.B_CURRENT_S_F;
import static io.openems.edge.battery.nuvationbms.NuvationSunSpecModel.S803.B_TOT_D_C_CUR;

import java.util.stream.IntStream;

import org.junit.Test;

import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;
import io.openems.edge.common.test.DummyComponentManager;
import io.openems.edge.common.test.DummyConfigurationAdmin;

public class NuvationBmsImplTest {

	@Test
	public void setUp() throws Exception {
		var sut = new NuvationBmsImpl();
		new ComponentTest(sut)//
				.addReference("cm", new DummyConfigurationAdmin())
				.addReference("componentManager", new DummyComponentManager(createDummyClock()))
				.addReference("setModbus", new DummyModbusBridge("modbus0") //
						.withRegisters(40_000, 0x5375, 0x6e53) // isSunSpec
						.withRegisters(40_002, 801, 22) // Block 801
						.withRegisters(40_004, IntStream.range(0, 22).map(i -> 0).toArray()) //
						.withRegisters(40_026, 802, 20) // Block 802
						.withRegisters(40_028, IntStream.range(0, 20).map(i -> 0).toArray()) //
						.withRegisters(40_048, 803, 32) // Block 803
						.withRegisters(40_050, IntStream.range(0, 32).map(i -> 0).toArray()) //
						.withRegisters(40_082, 0xFFFF, 0)) // END_OF_MAP
				.activate(MyConfig.create() //
						.setId("battery0") //
						.setModbusId("modbus0") //
						.setStartStop(StartStopConfig.START)//
						.build()) //
				.next(new TestCase(), 6).next(new TestCase()//
						.input(SO_C_S_F.getChannelId(), 0)//
						.input(B_CURRENT_S_F.getChannelId(), -1))
				.next(new TestCase()//
						.input(BAT_ST.getChannelId(), NuvationSunSpecModel.S802BatSt.CONNECTED))
				.next(new TestCase(), 2).next(new TestCase()//
						.input(SO_C.getChannelId(), 100)//
						.input(B_TOT_D_C_CUR.getChannelId(), -207))
				.next(new TestCase()//
						.output("battery0", SOC, 0))
				.deactivate();
	}
}
