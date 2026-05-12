package io.openems.edge.system.fenecon.industrial.xl.firealarmsystem;

import io.openems.common.channel.Level;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.component.OpenemsComponent;

public interface HekatronB9X2 extends OpenemsComponent, ModbusComponent {

	public enum ChannelId implements io.openems.edge.common.channel.ChannelId {
		OPTICAL_SIGNAL_TRANSMITTER_SHUTDOWN(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "opticalSignalTransmitterShutdown")), //
		OPTICAL_SIGNAL_TRANSMITTER_ACTIVE(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "opticalSignalTransmitterActive")), //
		ACOUSTIC_SIGNAL_TRANSMITTER_SHUTDOWN(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "acousticSignalTransmitterShutdown")), //
		ACOUSTIC_SIGNAL_TRANSMITTER_ACTIVE(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "acousticSignalTransmitterActive")), //
		RELAY_ALARM_SHUTDOWN(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "relayAlarmShutdown")), //
		RELAY_ALARM_ACTIVE(Doc.of(Level.FAULT)//
				.translationKey(HekatronB9X2.class, "relayAlarmActive")), //
		RELAY_MALFUNCTION_SHUTDOWN(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "relayMalfunctionShutdown")), //
		RELAY_MALFUNCTION_ACTIVE(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "relayMalfunctionActive")), //
		RELAY_CONTAINER_SHUTDOWN(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "relayContainerShutdown")), //
		RELAY_CONTAINER_ACTIVE(Doc.of(Level.FAULT)//
				.translationKey(HekatronB9X2.class, "relayContainerActive")), //
		DETECTOR_1_ALARM(Doc.of(Level.FAULT)//
				.translationKey(HekatronB9X2.class, "detector1Alarm")), //
		DETECTOR_1_MALFUNCTION(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "detector1Malfunction")), //
		DETECTOR_1_SHUTDOWN(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "detector1Shutdown")), //
		DETECTOR_2_ALARM(Doc.of(Level.FAULT)//
				.translationKey(HekatronB9X2.class, "detector2Alarm")), //
		DETECTOR_2_MALFUNCTION(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "detector2Malfunction")), //
		DETECTOR_2_SHUTDOWN(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "detector2Shutdown")), //
		CO_DETECTOR_ALARM(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "coDetectorAlarm")), //
		CO_DETECTOR_MALFUNCTION(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "coDetectorMalfunction")), //
		CO_DETECTOR_SHUTDOWN(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "coDetectorShutdown")), //
		PRE_ALARM(Doc.of(Level.FAULT)//
				.translationKey(HekatronB9X2.class, "preAlarm")), //
		PRE_ALARM_MESSAGE_DISABLED(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "preAlarmMessageDisabled")), //
		MAIN_ALARM(Doc.of(Level.FAULT)//
				.translationKey(HekatronB9X2.class, "mainAlarm")), //
		MAIN_ALARM_MESSAGE_DISABLED(Doc.of(Level.WARNING)//
				.translationKey(HekatronB9X2.class, "mainAlarmMessageDisabled")), //

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

}