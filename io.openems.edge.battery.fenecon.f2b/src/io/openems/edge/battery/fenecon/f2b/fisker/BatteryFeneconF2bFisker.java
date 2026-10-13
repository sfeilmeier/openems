package io.openems.edge.battery.fenecon.f2b.fisker;

import io.openems.common.channel.AccessMode;
import io.openems.common.channel.Level;
import io.openems.common.channel.PersistencePriority;
import io.openems.common.channel.Unit;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.types.OpenemsType;
import io.openems.edge.battery.fenecon.f2b.BatteryFeneconF2b;
import io.openems.edge.battery.fenecon.f2b.common.enums.F2bBatteryError;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.ActualState;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.ActualSubStateHvStartUp;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.BalancingStatus;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.BduStatus;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.BmsStateMachine;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.ControlRequest;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.GoRunningSubState;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.OperatingStates;
import io.openems.edge.battery.fenecon.f2b.fisker.statemachine.StateMachine.State;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.IntegerDoc;
import io.openems.edge.common.channel.StateChannel;
import io.openems.edge.common.channel.WriteChannel;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;

public interface BatteryFeneconF2bFisker extends BatteryFeneconF2b, StartStoppable, OpenemsComponent {

	public enum ChannelId implements io.openems.edge.common.channel.ChannelId {
		CURRENT_HIGH_RESOLUTION(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.MILLIAMPERE)//
				.accessMode(AccessMode.READ_ONLY)), //
		GO_RUNNING_STATE_MACHINE(Doc.of(GoRunningSubState.values())//
				.text("Current State of GoRunning State-Machine")), //
		NO_F2B_ERROR(Doc.of(OpenemsType.BOOLEAN)//
				.accessMode(AccessMode.READ_ONLY)), //
		F2B_ERROR_RESET_FAILED(Doc.of(Level.FAULT)//
				.accessMode(AccessMode.READ_ONLY)), //
		PRECHARGE_FAILED(Doc.of(Level.FAULT)//
				.accessMode(AccessMode.READ_ONLY)), //
		ISOLATION_TEST_FAILED_RESISTANCE_TO_LOW(Doc.of(Level.FAULT)//
				.accessMode(AccessMode.READ_ONLY)), //
		ISOLATION_TEST_FAILED_RESISTANCE_TO_HIGH(Doc.of(Level.FAULT)//
				.accessMode(AccessMode.READ_ONLY)), //
		ISOLATION_TEST_FAILED_BMS_HV_OFF_EMERGENCY(Doc.of(Level.FAULT)//
				.accessMode(AccessMode.READ_ONLY)), //
		BMS_HAS_LEFT_HV_ACTIVE(Doc.of(Level.FAULT)//
				.accessMode(AccessMode.READ_ONLY)), //
		DTC_1(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.persistencePriority(PersistencePriority.HIGH)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange((self, value) -> {
					if (!value.isDefined()) {
						return;
					}
					self.updateDtcFailure("DTC_1", (int) value.get());
				})//
		), //

		DTC_2(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.persistencePriority(PersistencePriority.HIGH)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange((self, value) -> {
					if (!value.isDefined()) {
						return;
					}
					self.updateDtcFailure("DTC_2", (int) value.get());
				})), //
		DTC_3(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.persistencePriority(PersistencePriority.HIGH)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange((self, value) -> {
					if (!value.isDefined()) {
						return;
					}
					self.updateDtcFailure("DTC_3", (int) value.get());
				})), //
		DTC_4(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange((self, value) -> {
					if (!value.isDefined()) {
						return;
					}
					self.updateDtcFailure("DTC_4", (int) value.get());
				})), //
		DTC_5(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange((self, value) -> {
					if (!value.isDefined()) {
						return;
					}
					self.updateDtcFailure("DTC_5", (int) value.get());
				})), //
		DTC_6(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange((self, value) -> {
					if (!value.isDefined()) {
						return;
					}
					self.updateDtcFailure("DTC_6", (int) value.get());
				})), //
		DTC_7(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange((self, value) -> {
					if (!value.isDefined()) {
						return;
					}
					self.updateDtcFailure("DTC_7", (int) value.get());
				})), //
		DTC_8(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange((self, value) -> {
					if (!value.isDefined()) {
						return;
					}
					self.updateDtcFailure("DTC_8", (int) value.get());
				})), //
		DTC_9(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange((self, value) -> {
					if (!value.isDefined()) {
						return;
					}
					self.updateDtcFailure("DTC_9", (int) value.get());
				})), //
		DTC_10(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange((self, value) -> {
					if (!value.isDefined()) {
						return;
					}
					self.updateDtcFailure("DTC_10", (int) value.get());
				})), //
		CONTROL_REQUEST(Doc.of(ControlRequest.values())//
				.accessMode(AccessMode.READ_WRITE)), //
		ERROR_RESET_REQUEST(Doc.of(OpenemsType.BOOLEAN)//
				.accessMode(AccessMode.READ_WRITE)), //
		F2B_BATTERY_ERROR(Doc.of(F2bBatteryError.values())//
				.accessMode(AccessMode.READ_ONLY)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange(//
						BatteryFeneconF2bFiskerImpl::updateBatteryFaultChannels)), //
		ACTUAL_CAPACITY(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)),
		AVERAGE_CELL_TEMPERATURE(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)),
		AVERAGE_CELL_VOLTAGE(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)),
		BDU_STATUS(Doc.of(BduStatus.values())//
				.accessMode(AccessMode.READ_ONLY)),
		DIFFERENCE_CELL_TEMPERATURE(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)),
		INSULATION_RESISTANCE_NEG_POLE_GND(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)),
		INSULATION_RESISTANCE_POS_POLE_GND(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)),
		OPERATING_STATES(Doc.of(OperatingStates.values())//
				.accessMode(AccessMode.READ_ONLY)),
		RELATIVE_INSULATION_RESISTANCE_NEG_POLE_GND(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)),
		RELATIVE_INSULATION_RESISTANCE_POS_POLE_GND(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)),
		THERMAL_MANAGEMENT_REQUIRED(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)),
		T30C_VOLTAGE(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.MILLIAMPERE)//
				.accessMode(AccessMode.READ_ONLY)),
		BALANCING_STATUS(Doc.of(BalancingStatus.values())//
				.accessMode(AccessMode.READ_ONLY)),
		TOTAL_VOLTAGE_LOAD_END(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)),
		BMS_STATE_MACHINE(Doc.of(BmsStateMachine.values())//
				.accessMode(AccessMode.READ_ONLY)),
		ACTUAL_STATE(Doc.of(ActualState.values())//
				.accessMode(AccessMode.READ_ONLY)), //
		ACTUAL_SUB_STATE_HV_START_UP(Doc.of(ActualSubStateHvStartUp.values())//
				.accessMode(AccessMode.READ_ONLY)), //
		CRC_NO_FAILED_MSGS(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		CAN_NO_FAILED_MSGS(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		DEBUG_1(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		DEBUG_2(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		DEBUG_3(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		DEBUG_4(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		DEBUG_5(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		DEBUG_6(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		DEBUG_7(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		DEBUG_8(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		DEBUG_9(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		DEBUG_10(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)), //
		CAT0(Doc.of(OpenemsType.BOOLEAN)//
				.text("CAT0 Active")//
				.accessMode(AccessMode.READ_ONLY)), //
		CAT1(Doc.of(OpenemsType.BOOLEAN)//
				.text("CAT1 Active")//
				.accessMode(AccessMode.READ_ONLY)), //
		CAT2(Doc.of(OpenemsType.BOOLEAN)//
				.text("CAT2 Active")//
				.accessMode(AccessMode.READ_ONLY)), //
		CAT3(Doc.of(OpenemsType.BOOLEAN)//
				.text("CAT3 Active")//
				.accessMode(AccessMode.READ_ONLY)), //
		CAT4(Doc.of(OpenemsType.BOOLEAN)//
				.text("CAT4 Active")//
				.accessMode(AccessMode.READ_ONLY)), //
		CAT5(Doc.of(OpenemsType.BOOLEAN)//
				.text("CAT5 Active")//
				.accessMode(AccessMode.READ_ONLY)), //
		CAT6(Doc.of(OpenemsType.BOOLEAN)//
				.text("CAT6 Active")//
				.accessMode(AccessMode.READ_ONLY)), //
		CAT7(Doc.of(OpenemsType.BOOLEAN)//
				.text("CAT7 Active")//
				.accessMode(AccessMode.READ_ONLY)), //
		CAT8(Doc.of(OpenemsType.BOOLEAN)//
				.text("CAT8 Active")//
				.accessMode(AccessMode.READ_ONLY)), //
		DISCHARGE_LIMIT_CURRENT(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.AMPERE)), //
		CHARGE_LIMIT_CURRENT(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.AMPERE)), //
		PLT_CHARGE_MAX_CURRENT(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.AMPERE)), //
		PMLT_CHARGE_MAX_CURRENT(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.AMPERE)), //
		CHARGE_MAX_CURRENT_TIME_UNTIL_CHANGE(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.SECONDS)), //
		STATE_MACHINE(Doc.of(State.values())//
				.text("Current state of State-Machine")), //
		RUN_FAILED(Doc.of(Level.WARNING)//
				.text("Running the logic failed")), //
		MODBUS_COMMUNICATION_TO_FEMS_FAILED(Doc.of(Level.FAULT)//
				.text("Battery to FEMS communication has failed")), //
		COUNTER_24H(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.persistencePriority(PersistencePriority.HIGH)//
				.<BatteryFeneconF2bFiskerImpl>onChannelChange(//
						BatteryFeneconF2bFiskerImpl::triggerF2bReset)//
		), //
		COUNTER_24H_WARNING(Doc.of(Level.WARNING)//
				.translationKey(BatteryFeneconF2bFisker.class, "counter24hWarning")), //
		COUNTER_24H_FAULT(Doc.of(Level.FAULT)//
				.translationKey(BatteryFeneconF2bFisker.class, "counter24hFault")), //
		COUNTER_LONG_TIME(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.persistencePriority(PersistencePriority.HIGH)), //
		COUNTER_LONG_TIME_INFO(Doc.of(Level.INFO)//
				.translationKey(BatteryFeneconF2bFisker.class, "counterLongTimeInfo")), //
		COUNTER_LONG_TIME_FAULT(Doc.of(Level.FAULT)//
				.translationKey(BatteryFeneconF2bFisker.class, "counterLongTimeFault")), //
		COUNTER_LIFE_TIME(Doc.of(OpenemsType.INTEGER)//
				.accessMode(AccessMode.READ_ONLY)//
				.persistencePriority(PersistencePriority.HIGH)), //
		BATTERY_SOC(Doc.of(OpenemsType.INTEGER)//
				.unit(Unit.PERCENT)//
				.persistencePriority(PersistencePriority.HIGH)), //
		BATTERY_SOC_HIGH_RESOLUTION(new IntegerDoc() //
				.accessMode(AccessMode.READ_ONLY) //
				.unit(Unit.PERCENT)//
				.persistencePriority(PersistencePriority.HIGH)//
				.onChannelUpdate(BatteryFeneconF2bFiskerImpl::updateSoc)), //

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
	 * Gets the main contactor target which set by {@link #setHvContactor(Boolean)}
	 * method.
	 * 
	 * @return main contactor target.
	 */
	public boolean isHvContactorUnlocked();

	/**
	 * Gets the target Start/Stop mode from config or StartStop-Channel.
	 *
	 * @return {@link StartStop}
	 */
	public StartStop getStartStopTarget();

	/**
	 * Gets the Channel for {@link ChannelId#BMS_STATE_MACHINE}.
	 *
	 * @return the Channel
	 */
	public default Channel<BmsStateMachine> getBmsStateMachineChannel() {
		return this.channel(ChannelId.BMS_STATE_MACHINE);
	}

	/**
	 * Gets the {@link BmsStateMachine} for {@link ChannelId#BMS_STATE_MACHINE}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default BmsStateMachine getBmsStateMachine() {
		return this.getBmsStateMachineChannel().value().asEnum();
	}

	/**
	 * Gets the Channel for {@link ChannelId#ACTUAL_STATE}.
	 *
	 * @return the Channel
	 */
	public default Channel<ActualState> getActualStateChannel() {
		return this.channel(ChannelId.ACTUAL_STATE);
	}

	/**
	 * Gets the {@link ActualState} for {@link ChannelId#ACTUAL_STATE}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default ActualState getActualState() {
		return this.getActualStateChannel().value().asEnum();
	}

	/**
	 * Gets the Channel for {@link ChannelId#STATE_MACHINE}.
	 *
	 * @return the Channel
	 */
	public default Channel<State> getStateMachineChannel() {
		return this.channel(ChannelId.STATE_MACHINE);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#STATE_MACHINE}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<State> getStateMachine() {
		return this.getStateMachineChannel().value();
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
	 * Gets the Channel for {@link ChannelId#CONTROL_REQUEST}.
	 *
	 * @return the Channel {@link Channel}
	 */
	public default WriteChannel<ControlRequest> getControlRequestChannel() {
		return this.channel(ChannelId.CONTROL_REQUEST);
	}

	/**
	 * Writes the value to the {@link ChannelId#CONTROL_REQUEST} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	public default void setControlRequest(ControlRequest value) throws OpenemsNamedException {
		this.getControlRequestChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#ERROR_RESET_REQUEST}.
	 *
	 * @return the Channel {@link Channel}
	 */
	public default WriteChannel<Boolean> getErrorResetRequestChannel() {
		return this.channel(ChannelId.ERROR_RESET_REQUEST);
	}

	/**
	 * Writes the value to the {@link ChannelId#ERROR_RESET_REQUEST} Register.
	 *
	 * @param value the next value
	 * @throws OpenemsNamedException on error
	 */
	public default void setErrorResetRequest(Boolean value) throws OpenemsNamedException {
		this.getErrorResetRequestChannel().setNextWriteValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#NO_F2B_ERROR}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getNoF2bErrorChannel() {
		return this.channel(ChannelId.NO_F2B_ERROR);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#NO_F2B_ERROR}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setNoF2bError(boolean value) {
		this.getNoF2bErrorChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#F2B_ERROR_RESET_FAILED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getF2bErrorResetFailedChannel() {
		return this.channel(ChannelId.F2B_ERROR_RESET_FAILED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#F2B_ERROR_RESET_FAILED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setF2bErrorResetFailed(boolean value) {
		this.getF2bErrorResetFailedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#PRECHARGE_FAILED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getPrechargeFailedChannel() {
		return this.channel(ChannelId.PRECHARGE_FAILED);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#PRECHARGE_FAILED}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setPrechargeFailed(boolean value) {
		this.getPrechargeFailedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for
	 * {@link ChannelId#ISOLATION_TEST_FAILED_RESISTANCE_TO_LOW}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getIsolationTestFailedResistanceToLowChannel() {
		return this.channel(ChannelId.ISOLATION_TEST_FAILED_RESISTANCE_TO_LOW);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#ISOLATION_TEST_FAILED_RESISTANCE_TO_LOW} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setIsolationTestFailedResistanceToLow(boolean value) {
		this.getIsolationTestFailedResistanceToLowChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for
	 * {@link ChannelId#ISOLATION_TEST_FAILED_RESISTANCE_TO_HIGH}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getIsolationTestFailedResistanceToHighChannel() {
		return this.channel(ChannelId.ISOLATION_TEST_FAILED_RESISTANCE_TO_HIGH);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#ISOLATION_TEST_FAILED_RESISTANCE_TO_HIGH} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setIsolationTestFailedResistanceToHigh(boolean value) {
		this.getIsolationTestFailedResistanceToHighChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for
	 * {@link ChannelId#ISOLATION_TEST_FAILED_BMS_HV_OFF_EMERGENCY}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getIsolationTestFailedBmsHvOffEmergencyChannel() {
		return this.channel(ChannelId.ISOLATION_TEST_FAILED_BMS_HV_OFF_EMERGENCY);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#ISOLATION_TEST_FAILED_BMS_HV_OFF_EMERGENCY} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setIsolationTestFailedBmsHvOffEmergency(boolean value) {
		this.getIsolationTestFailedBmsHvOffEmergencyChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#BMS_HAS_LEFT_HV_ACTIVE}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getBmsHasLeftHvActiveChannel() {
		return this.channel(ChannelId.BMS_HAS_LEFT_HV_ACTIVE);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#BMS_HAS_LEFT_HV_ACTIVE} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setBmsHasLeftHvActive(boolean value) {
		this.getBmsHasLeftHvActiveChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for ChannelId.MODBUS_COMMUNICATION_TO_FEMS_FAILED.
	 *
	 * @return the Channel
	 */
	public default StateChannel getModbusCommunicationToFemsFailedChannel() {
		return this.channel(ChannelId.MODBUS_COMMUNICATION_TO_FEMS_FAILED);
	}

	/**
	 * Writes the value to the ChannelId.MODBUS_COMMUNICATION_TO_FEMS_FAILED.
	 *
	 * @param value the next value
	 */
	public default void _setModbusCommunicationToFemsFailed(boolean value) {
		this.getModbusCommunicationToFemsFailedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUNTER_24H}.
	 *
	 * @return the Channel
	 */
	public default Channel<Integer> getCounter24hChannel() {
		return this.channel(ChannelId.COUNTER_24H);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUNTER_24H}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getCounter24h() {
		return this.getCounter24hChannel().value();
	}

	/**
	 * Writes the value to the {@link ChannelId#COUNTER_24H}.
	 *
	 * @param value the next value
	 */
	public default void _setCounter24h(int value) {
		this.getCounter24hChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUNTER_24H_WARNING}.
	 *
	 * @return the Channel
	 */
	public default StateChannel getCounter24hWarningChannel() {
		return this.channel(ChannelId.COUNTER_24H_WARNING);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#COUNTER_24H_WARNING}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getCounter24hWarning() {
		return this.getCounter24hWarningChannel().value();
	}

	/**
	 * Writes the value to the {@link ChannelId#COUNTER_24H_WARNING}.
	 *
	 * @param value the next value
	 */
	public default void _setCounter24hWarning(boolean value) {
		this.getCounter24hWarningChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUNTER_24H_FAULT}.
	 *
	 * @return the Channel
	 */
	public default StateChannel getCounter24hFaultChannel() {
		return this.channel(ChannelId.COUNTER_24H_FAULT);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#COUNTER_24H_WARNING}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getCounter24hFault() {
		return this.getCounter24hFaultChannel().value();
	}

	/**
	 * Writes the value to the {@link ChannelId#COUNTER_24H_FAULT}.
	 *
	 * @param value the next value
	 */
	public default void _setCounter24hFault(boolean value) {
		this.getCounter24hFaultChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUNTER_LONG_TIME}.
	 *
	 * @return the Channel
	 */
	public default Channel<Integer> getCounterLongTimeChannel() {
		return this.channel(ChannelId.COUNTER_LONG_TIME);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUNTER_LONG_TIME}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getCounterLongTime() {
		return this.getCounterLongTimeChannel().value();
	}

	/**
	 * Writes the value to the {@link ChannelId#COUNTER_LONG_TIME}.
	 *
	 * @param value the next value
	 */
	public default void _setCounterLongTime(int value) {
		this.getCounterLongTimeChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUNTER_LONG_TIME_INFO}.
	 *
	 * @return the Channel
	 */
	public default StateChannel getCounterLongTimeInfoChannel() {
		return this.channel(ChannelId.COUNTER_LONG_TIME_INFO);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#COUNTER_LONG_TIME_INFO}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getCounterLongTimeInfo() {
		return this.getCounterLongTimeInfoChannel().value();
	}

	/**
	 * Writes the value to the {@link ChannelId#COUNTER_LONG_TIME_INFO}.
	 *
	 * @param value the next value
	 */
	public default void _setCounterLongTimeInfo(boolean value) {
		this.getCounterLongTimeInfoChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUNTER_LONG_TIME_FAULT}.
	 *
	 * @return the Channel
	 */
	public default StateChannel getCounterLongTimeFaultChannel() {
		return this.channel(ChannelId.COUNTER_LONG_TIME_FAULT);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#COUNTER_LONG_TIME_FAULT}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getCounterLongTimeFault() {
		return this.getCounterLongTimeFaultChannel().value();
	}

	/**
	 * Writes the value to the {@link ChannelId#COUNTER_LONG_TIME_FAULT}.
	 *
	 * @param value the next value
	 */
	public default void _setCounterLongTimeFault(boolean value) {
		this.getCounterLongTimeFaultChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUNTER_LIFE_TIME}.
	 *
	 * @return the Channel
	 */
	public default Channel<Integer> getCounterLifeTimeChannel() {
		return this.channel(ChannelId.COUNTER_LIFE_TIME);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUNTER_LIFE_TIME}.
	 *
	 * @return the Channel {@link Value}
	 */
	public default Value<Integer> getCounterLifeTime() {
		return this.getCounterLifeTimeChannel().value();
	}

	/**
	 * Writes the value to the {@link ChannelId#COUNTER_LIFE_TIME}.
	 *
	 * @param value the next value
	 */
	public default void _setCounterLifeTime(int value) {
		this.getCounterLifeTimeChannel().setNextValue(value);
	}

}
