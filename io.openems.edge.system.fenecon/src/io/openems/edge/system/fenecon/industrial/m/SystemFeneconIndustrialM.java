package io.openems.edge.system.fenecon.industrial.m;

import org.osgi.service.event.EventHandler;

import io.openems.common.channel.AccessMode;
import io.openems.common.channel.Level;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.system.fenecon.industrial.m.enums.RequestStatus;
import io.openems.edge.system.fenecon.industrial.m.statemachine.StateMachine.State;

public interface SystemFeneconIndustrialM extends OpenemsComponent, EventHandler {

	public enum ChannelId implements io.openems.edge.common.channel.ChannelId {
		STATE_MACHINE(Doc.of(State.values())//
				.text("Current State of State-Machine")), //
		RUN_FAILED(Doc.of(Level.FAULT)//
				.text("Running the Logic failed")), //
		REQUEST_STATUS(Doc.of(RequestStatus.values())//
				.accessMode(AccessMode.READ_WRITE)), //
		EMERGENCY_STOP_STATE(Doc.of(Level.WARNING)//
				.text("Emergency Stop State is active")), //
		SPD_TRIPPED(Doc.of(Level.WARNING)//
				.text("SPD Tripped: Possible SPD damage")), //
		FUSE_TRIPPED(Doc.of(Level.WARNING)//
				.text("Fuse Tripped: At least one 24V fuse is off")), //
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
	 * Gets the target Start/Stop mode from config or StartStop-Channel.
	 *
	 * @return {@link StartStop}
	 */
	public StartStop getStartStopTarget();

	/**
	 * Gets the Channel for {@link ChannelId#STATE_MACHINE}.
	 *
	 * @return the Channel
	 */
	public default Channel<State> getStateMachineChannel() {
		return this.channel(ChannelId.STATE_MACHINE);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#STATE_MACHINE}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setStateMachine(State value) {
		this.getStateMachineChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#RUN_FAILED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getRunFailedChannel() {
		return this.channel(ChannelId.RUN_FAILED);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#RUN_FAILED}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setRunFailed(boolean value) {
		this.getRunFailedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#REQUEST_STATUS}.
	 *
	 * @return the Channel
	 */
	public default Channel<RequestStatus> getRequestStatusChannel() {
		return this.channel(ChannelId.REQUEST_STATUS);
	}

	/**
	 * Gets the RequestStatus, see {@link ChannelId#REQUEST_STATUS}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<RequestStatus> getRequestStatus() {
		return this.getRequestStatusChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#REQUEST_STATUS}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setRequestStatus(RequestStatus value) {
		this.getRequestStatusChannel().setNextValue(value);
	}

}
