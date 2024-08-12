package io.openems.edge.io.i2c;

import org.junit.Test;

import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.io.i2c.AnalogOutput;
import io.openems.edge.io.i2c.I2CAnalogImpl;
import io.openems.edge.common.test.ComponentTest;

public class I2CAnalogImplTest {

	private static final String COMPONENT_ID = "analogOutput0";
	private static final AnalogOutput ANALOG_OUTPUT = AnalogOutput.MODBERRY_CHANNEL_1;

	@Test
	public void test() throws Exception {
		new ComponentTest(new I2CAnalogImpl()) //
				.activate(MyConfig.create() //
						.setId(COMPONENT_ID) //
						.setOutputChannel(ANALOG_OUTPUT)//
						.build())
				.next(new TestCase());
	}

}
