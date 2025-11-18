package io.openems.edge.system.fenecon.industrial.l;

import static io.openems.common.types.ChannelAddress.fromString;

import io.openems.common.exceptions.OpenemsError;
import io.openems.common.types.ChannelAddress;

public class SystemInputChannelsL {

	public enum SystemInputChannels {
		SPD_TRIPPED("io0/DigitalInput2"), //
		FUSE_TRIPPED("io0/DigitalInput4"), //
		PSU_TRIPPED("io0/DigitalInput1"), //
		EMERGENCY_STOP_STATE("io0/DigitalInput3"), //
		ACKNOWLEDGE_EMERGENCY_STOP("io0/DigitalOutput2"), //
		BMS_HARD_RESET("io0/DigitalOutput1"), //
		SMOKE_DETECTION("io0/DigitalInputOutput1"), //
		SMOKE_DETECTION_FAILURE("io0/DigitalInputOutput2"), //
		;

		private final String channelAddress;

		SystemInputChannels(String channelAddress) {
			this.channelAddress = channelAddress;
		}

		/**
		 * Parses a string "Component-ID/Channel-ID" to a ChannelAddress.
		 *
		 * @return the ChannelAddress
		 * @throws OpenemsError.OpenemsNamedException on parse error
		 */
		public ChannelAddress getAddress() throws OpenemsError.OpenemsNamedException {
			return fromString(this.channelAddress);
		}

	}
}
