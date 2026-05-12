package io.openems.edge.system.fenecon.industrial.xl;

import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.test.AbstractDummyOpenemsComponent;
import io.openems.edge.system.fenecon.industrial.xl.hydac.Hydac;

public class DummyHydacImpl extends AbstractDummyOpenemsComponent<DummyHydacImpl>
		implements Hydac, OpenemsComponent, ModbusComponent {

	public DummyHydacImpl(String id) {
		super(//
				id, //
				OpenemsComponent.ChannelId.values(), //
				ModbusComponent.ChannelId.values(), //
				Hydac.ChannelId.values() //
		);
		for (var channel : this.channels()) {
			channel.nextProcessImage();
		}
	}

	/**
	 * Sets and applies the {@link Hydac.ChannelId#COOLING_CIRCUIT_1_TEMPERATURE}.
	 *
	 * @param value the temperature value
	 * @return myself
	 */
	public DummyHydacImpl withCoolingCircuit1Temperature(int value) {
		this.getCoolingCircuit1TemperatureChannel().setNextValue(value);
		this.getCoolingCircuit1TemperatureChannel().nextProcessImage();
		return this;
	}

	/**
	 * Sets and applies the {@link Hydac.ChannelId#FAN}.
	 *
	 * @param value the boolean value
	 * @return myself
	 */
	public DummyHydacImpl withFan(boolean value) {
		this.getFanChannel().setNextValue(value);
		this.getFanChannel().nextProcessImage();
		return this;
	}

	/**
	 * Sets and applies the {@link Hydac.ChannelId#COOLING_REQUIRED}.
	 *
	 * @param value the boolean value
	 * @return myself
	 */
	public DummyHydacImpl withCoolingRequired(boolean value) {
		this.getCoolingRequiredChannel().setNextValue(value);
		this.getCoolingRequiredChannel().nextProcessImage();
		return this;
	}

	/**
	 * Sets and applies the {@link Hydac.ChannelId#PUMP}.
	 *
	 * @param value the boolean value
	 * @return myself
	 */
	public DummyHydacImpl withPump(boolean value) {
		this.getPumpChannel().setNextValue(value);
		this.getPumpChannel().nextProcessImage();
		return this;
	}

	/**
	 * Sets and applies the {@link Hydac.ChannelId#COMPRESSOR}.
	 *
	 * @param value the boolean value
	 * @return myself
	 */
	public DummyHydacImpl withCompressor(boolean value) {
		this.getCompressorChannel().setNextValue(value);
		this.getCompressorChannel().nextProcessImage();
		return this;
	}

	@Override
	public void retryModbusCommunication() {

	}

	@Override
	protected DummyHydacImpl self() {
		return this;
	}

}
