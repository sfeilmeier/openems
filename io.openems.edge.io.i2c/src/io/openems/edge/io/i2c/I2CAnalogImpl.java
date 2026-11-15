package io.openems.edge.io.i2c;

import java.io.IOException;

import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ConfigurationPolicy;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.metatype.annotations.Designate;

import io.helins.linux.i2c.I2CBus;
import io.helins.linux.i2c.SMBus.Block;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.function.ThrowingConsumer;
import io.openems.edge.common.component.AbstractOpenemsComponent;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.io.api.AnalogOutput;
import io.openems.edge.io.api.AnalogVoltageOutput;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "IO.I2C", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE //
)
public class I2CAnalogImpl extends AbstractOpenemsComponent
		implements I2CAnalog, OpenemsComponent, AnalogOutput, AnalogVoltageOutput {

	private static final int MAXIMUM_VOLTAGE = 4_092; // mV
	private static final int PRECISION = 1; // mV
	private static final int OFFSET = 0; // mV

	public I2CAnalogImpl() {
		super(//
				OpenemsComponent.ChannelId.values(), //
				I2CAnalog.ChannelId.values(), //
				AnalogVoltageOutput.ChannelId.values(), //
				AnalogOutput.ChannelId.values()//
		);
	}

	@Activate
	private void activate(ComponentContext context, Config config) {
		super.activate(context, config.id(), config.alias(), config.enabled());
		this.getSetOutputVoltageChannel().onSetNextWrite(this.writeAnalog(config));
	}

	private ThrowingConsumer<Integer, OpenemsNamedException> writeAnalog(Config config) {
		return value -> {
			int[] valueArray = { value >> 8, value & 0xFF };
			byte[] byteArray = new byte[valueArray.length];
			for (int i = 0; i < valueArray.length; i++) {
				byteArray[i] = (byte) valueArray[i];
			}

			try (I2CBus bus = new I2CBus(0);) {
				bus.selectSlave(config.outputChannel().slaveAddress);
				Block block = new Block();
				for (int i = 0; i < byteArray.length; i++) {
					block.set(i, byteArray[i]);
				}
				bus.smbus.writeBlock(config.outputChannel().registerAddress, block);
				bus.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		};
	}

	@Deactivate
	protected void deactivate() {
		super.deactivate();
	}

	@Override
	public Range range() {
		return new Range(OFFSET, PRECISION, MAXIMUM_VOLTAGE);
	}

}
