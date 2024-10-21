package io.openems.edge.io.i2c;

import static io.openems.edge.io.i2c.AnalogOutput.MODBERRY_CHANNEL_1;

import org.junit.Test;

import io.openems.edge.common.test.AbstractComponentTest.TestCase;
import io.openems.edge.common.test.ComponentTest;

public class I2CAnalogImplTest {

	@Test
	public void test() throws Exception {
		new ComponentTest(new I2CAnalogImpl()) //
				.activate(MyConfig.create() //
						.setId("analogOutput0") //
						.setOutputChannel(MODBERRY_CHANNEL_1)//
						.build())
				.next(new TestCase());
	}

}
