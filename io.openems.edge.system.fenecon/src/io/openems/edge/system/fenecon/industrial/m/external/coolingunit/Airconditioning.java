package io.openems.edge.system.fenecon.industrial.m.external.coolingunit;

import org.osgi.service.event.EventHandler;

import io.openems.common.channel.AccessMode;
import io.openems.common.channel.Unit;
import io.openems.common.types.OpenemsType;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.IntegerReadChannel;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.OpenemsComponent;

public interface Airconditioning extends OpenemsComponent, EventHandler {

	public enum ChannelId implements io.openems.edge.common.channel.ChannelId {
		MAX_BATTERYINVERTER_TMP(Doc.of(OpenemsType.INTEGER) //
				.unit(Unit.DEGREE_CELSIUS)//
				.accessMode(AccessMode.READ_ONLY)), //

		;

		private final Doc doc;

		private ChannelId(Doc doc) {
			this.doc = doc;
		}

		@Override
		public Doc doc() {
			return this.doc;
		}
	}

	/**
	 * Gets the Channel for {@link ChannelId#MAX_BATTERYINVERTER_TMP}.
	 *
	 * @return the {@link Channel}
	 */
	public default IntegerReadChannel getInverterTemperatureChannel() {
		return this.channel(ChannelId.MAX_BATTERYINVERTER_TMP);
	}

	/**
	 * Gets the Inverter Cabin temperature. See
	 * {@link ChannelId#MAX_BATTERYINVERTER_TMP}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getInverterTemperature() {
		return this.getInverterTemperatureChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#MAX_BATTERYINVERTER_TMP} Channel.
	 *
	 * @param value the next value
	 */
	public default void setMaxBatteryInverterTemp(Integer value) {
		this.getInverterTemperatureChannel().setNextValue(value);
	}

}
