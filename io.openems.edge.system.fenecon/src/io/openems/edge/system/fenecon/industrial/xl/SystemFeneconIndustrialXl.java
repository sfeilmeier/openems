package io.openems.edge.system.fenecon.industrial.xl;

import org.osgi.service.event.EventHandler;

import io.openems.common.channel.AccessMode;
import io.openems.common.channel.Level;
import io.openems.common.types.OpenemsType;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public interface SystemFeneconIndustrialXl extends OpenemsComponent, StartStoppable, EventHandler {

	public enum ChannelId implements io.openems.edge.common.channel.ChannelId {
		STATE_MACHINE(Doc.of(State.values())//
				.text("Current State of State-Machine")), //
		RUN_FAILED(Doc.of(Level.FAULT)//
				.text("Running the Logic failed")), //
		IN_LAMP_TEST_MODE(Doc.of(Level.WARNING)//
				.text("The system is under the lamp test mode")), //
		IN_ESS_TEST_MODE(Doc.of(Level.WARNING)//
				.text("The system is under the ess test mode")), //
		ESS_TEST_FAILED(Doc.of(Level.WARNING)//
				.text("ESS test failed")), //
		IN_IDLE_MODE(Doc.of(Level.INFO)//
				.translationKey(SystemFeneconIndustrialXl.class, "testModeActive")), //
		IN_MANUAL_BATTERY_START(Doc.of(Level.WARNING)//
				.text("The system is in manual battery start, waiting for exit")), //

		SYSTEM_SYS_OFF_UNDEFINED(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "systemSysOffUndefined")),
		OVER_VOLTAGE_PROTECTION_UNDEFINED(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "overVoltageProtectionUndefined")),
		DOOR_SWITCH_UNDEFINED(Doc.of(Level.INFO)//
				.translationKey(SystemFeneconIndustrialXl.class, "doorSwitchUndefined")),
		POWER_SUPPLY_UNDEFINED(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "powerSupplyUndefined")),
		NETWORK_DISTRIBUTION_UNDEFINED(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "networkDistributionUndefined")),
		CONTAINER_LIGHTING_UNDEFINED(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "containerLightingUndefined")),
		LEAK_MONITORING_UNDEFINED(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "leakMonitoringUndefined")),
		SYSTEM_IOS_UNDEFINED(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "systemIosUndefined")),

		// Digital Outputs
		DISABLE_24V_F2B(Doc.of(OpenemsType.BOOLEAN)//
				.accessMode(AccessMode.READ_WRITE)), //
		SSI_RUNNING_FLASHING(Doc.of(OpenemsType.BOOLEAN)//
				.accessMode(AccessMode.READ_WRITE)), //
		SSI_RUNNING(Doc.of(OpenemsType.BOOLEAN)//
				.accessMode(AccessMode.READ_WRITE)), //
		SSI_WARNING(Doc.of(OpenemsType.BOOLEAN)//
				.accessMode(AccessMode.READ_WRITE)), //
		SSI_ERROR(Doc.of(OpenemsType.BOOLEAN)//
				.accessMode(AccessMode.READ_WRITE)), //
		ALL_ESS_FAULT_IN_OPERATION(Doc.of(Level.FAULT)//
				.translationKey(SystemFeneconIndustrialXl.class, "allEssFaultInOperation")), //
		ALL_ESS_FAULT_SYSTEM_START(Doc.of(Level.FAULT)//
				.translationKey(SystemFeneconIndustrialXl.class, "allEssFaultSystemStart")), //
		AT_LEAST_ONE_ESS_INFO(Doc.of(Level.INFO)//
				.translationKey(SystemFeneconIndustrialXl.class, "atLeastOneEssInfo")), //
		AT_LEAST_ONE_ESS_WARNING(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "atLeastOneEssWarning")), //
		NOT_ALL_ESS_STARTED(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "notAllEssStarted")), //
		SYSTEM_SHUTDOWN_FAULT(Doc.of(Level.FAULT)//
				.translationKey(SystemFeneconIndustrialXl.class, "systemShutdownFault")), //
		UNCLEAR_SHUTDOWN(Doc.of(Level.FAULT)//
				.translationKey(SystemFeneconIndustrialXl.class, "unclearShutdown")), //
		COUPLING_SWITCH_FAULT_IN_OPERATION(Doc.of(Level.FAULT)//
				.translationKey(SystemFeneconIndustrialXl.class, "couplingSwitchFaultInOperation")), //
		SERVICE_SWITCH_PRESSED_IN_OPERATION(Doc.of(Level.FAULT)//
				.translationKey(SystemFeneconIndustrialXl.class, "serviceSwitchPressedInOperation")), //
		START_BLOCKED_BY_SERVICE_SWITCH(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "startBlockedByServiceSwitch")), //
		START_BLOCKED_BY_FIRE_ALARM(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "startBlockedByFireAlarm")), //
		START_BLOCKED_BY_COUPLING_SWITCH(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "startBlockedByCouplingSwitch")), //
		START_BLOCKED_BY_ESS_FAULT(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "startBlockedByEssFault")), //
		FEMS_TO_FIRE_ALARM_SYS_COMMUNICATION_FAILURE(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "femsToFireAlarmSysCommunicationFailure")), //
		SERVICE_SWITCH_PRESSED_ON_STOPPED(Doc.of(Level.INFO)//
				.translationKey(SystemFeneconIndustrialXl.class, "serviceSwitchPressedOnStopped")), //
		SHUTDOWN_ACTIVE_ON_STOPPED(Doc.of(Level.INFO)//
				.translationKey(SystemFeneconIndustrialXl.class, "shutdownActiveOnStopped")), //
		COUPLING_SWITCH_PRESSED_ON_STOPPED(Doc.of(Level.INFO)//
				.translationKey(SystemFeneconIndustrialXl.class, "couplingSwitchPressedOnStopped")), //
		FIRE_ALARM_SYSTEM_FAULT(Doc.of(Level.FAULT)//
				.translationKey(SystemFeneconIndustrialXl.class, "fireAlarmSystemFault")), //
		FIRE_ALARM_SYSTEM_WARNING(Doc.of(Level.WARNING)//
				.translationKey(SystemFeneconIndustrialXl.class, "fireAlarmSystemWarning")), //
		LEAK_MONITOR_FAULT(Doc.of(Level.FAULT)//
				.translationKey(SystemFeneconIndustrialXl.class, "leakMonitorFailure")), //
		FLUID_COOLING_AUTO(Doc.of(Level.INFO)//
				.translationKey(SystemFeneconIndustrialXl.class, "fluidCoolingAuto")), //

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
	 * Gets the Channel for {@link ChannelId#SYSTEM_SYS_OFF_UNDEFINED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getSystemSysOffUndefinedChannel() {
		return this.channel(ChannelId.SYSTEM_SYS_OFF_UNDEFINED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#SYSTEM_SYS_OFF_UNDEFINED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setSystemSysOffUndefined(boolean value) {
		this.getSystemSysOffUndefinedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#OVER_VOLTAGE_PROTECTION_UNDEFINED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getOverVoltageProtectionUndefinedChannel() {
		return this.channel(ChannelId.OVER_VOLTAGE_PROTECTION_UNDEFINED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#OVER_VOLTAGE_PROTECTION_UNDEFINED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setOverVoltageProtectionUndefined(boolean value) {
		this.getOverVoltageProtectionUndefinedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#DOOR_SWITCH_UNDEFINED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getDoorSwitchUndefinedChannel() {
		return this.channel(ChannelId.DOOR_SWITCH_UNDEFINED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#DOOR_SWITCH_UNDEFINED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setDoorSwitchUndefined(boolean value) {
		this.getDoorSwitchUndefinedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#POWER_SUPPLY_UNDEFINED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getPowerSupplyUndefinedChannel() {
		return this.channel(ChannelId.POWER_SUPPLY_UNDEFINED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#POWER_SUPPLY_UNDEFINED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setPowerSupplyUndefined(boolean value) {
		this.getPowerSupplyUndefinedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#NETWORK_DISTRIBUTION_UNDEFINED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getNetworkDistributionUndefinedChannel() {
		return this.channel(ChannelId.NETWORK_DISTRIBUTION_UNDEFINED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#NETWORK_DISTRIBUTION_UNDEFINED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setNetworkDistributionUndefined(boolean value) {
		this.getNetworkDistributionUndefinedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#CONTAINER_LIGHTING_UNDEFINED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getContainerLightingUndefinedChannel() {
		return this.channel(ChannelId.CONTAINER_LIGHTING_UNDEFINED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#CONTAINER_LIGHTING_UNDEFINED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setContainerLightingUndefined(boolean value) {
		this.getContainerLightingUndefinedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#LEAK_MONITORING_UNDEFINED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getLeakMonitorUndefinedChannel() {
		return this.channel(ChannelId.LEAK_MONITORING_UNDEFINED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#LEAK_MONITORING_UNDEFINED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setLeakMonitorUndefined(boolean value) {
		this.getLeakMonitorUndefinedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SYSTEM_IOS_UNDEFINED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getSystemIosUndefinedChannel() {
		return this.channel(ChannelId.SYSTEM_IOS_UNDEFINED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#SYSTEM_IOS_UNDEFINED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setSystemIosUndefined(boolean value) {
		this.getSystemIosUndefinedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#ALL_ESS_FAULT_IN_OPERATION}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getAllEssFaultInOperationChannel() {
		return this.channel(ChannelId.ALL_ESS_FAULT_IN_OPERATION);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#ALL_ESS_FAULT_IN_OPERATION} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setAllEssFaultInOperation(boolean value) {
		this.getAllEssFaultInOperationChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#ALL_ESS_FAULT_SYSTEM_START}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getAllEssFaultSystemStartChannel() {
		return this.channel(ChannelId.ALL_ESS_FAULT_SYSTEM_START);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#ALL_ESS_FAULT_SYSTEM_START} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setAllEssFaultSystemStart(boolean value) {
		this.getAllEssFaultSystemStartChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#AT_LEAST_ONE_ESS_INFO}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getAtLeastOneEssInfoChannel() {
		return this.channel(ChannelId.AT_LEAST_ONE_ESS_INFO);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#AT_LEAST_ONE_ESS_INFO} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setAtLeastOneEssInfo(boolean value) {
		this.getAtLeastOneEssInfoChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#AT_LEAST_ONE_ESS_WARNING}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getAtLeastOneEssWarningChannel() {
		return this.channel(ChannelId.AT_LEAST_ONE_ESS_WARNING);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#AT_LEAST_ONE_ESS_WARNING} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setAtLeastOneEssWarning(boolean value) {
		this.getAtLeastOneEssWarningChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#IN_LAMP_TEST_MODE}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getInLampTestModeChannel() {
		return this.channel(ChannelId.IN_LAMP_TEST_MODE);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#IN_LAMP_TEST_MODE}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setInLampTestMode(boolean value) {
		this.getInLampTestModeChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#IN_ESS_TEST_MODE}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getInEssTestModeChannel() {
		return this.channel(ChannelId.IN_ESS_TEST_MODE);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#IN_ESS_TEST_MODE}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setInEssTestMode(boolean value) {
		this.getInEssTestModeChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#ESS_TEST_FAILED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getEssTestFailedChannel() {
		return this.channel(ChannelId.ESS_TEST_FAILED);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#ESS_TEST_FAILED}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setEssTestFailed(boolean value) {
		this.getEssTestFailedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#IN_IDLE_MODE}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getInIdleModeChannel() {
		return this.channel(ChannelId.IN_IDLE_MODE);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#IN_IDLE_MODE}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setInIdleMode(boolean value) {
		this.getInIdleModeChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#IN_MANUAL_BATTERY_START}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getInManualBatteryStartModeChannel() {
		return this.channel(ChannelId.IN_MANUAL_BATTERY_START);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#IN_MANUAL_BATTERY_START} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setInManualBatteryStartMode(boolean value) {
		this.getInManualBatteryStartModeChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SYSTEM_SHUTDOWN_FAULT}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getSystemShutdownFaultChannel() {
		return this.channel(ChannelId.SYSTEM_SHUTDOWN_FAULT);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#SYSTEM_SHUTDOWN_FAULT} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setSystemShutdownFault(boolean value) {
		this.getSystemShutdownFaultChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#UNCLEAR_SHUTDOWN}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getUnclearShutdownChannel() {
		return this.channel(ChannelId.UNCLEAR_SHUTDOWN);
	}

	/**
	 * Internal method to set the 'nextValue' on {@link ChannelId#UNCLEAR_SHUTDOWN}
	 * Channel.
	 *
	 * @param value the next value
	 */
	public default void _setUnclearShutdown(boolean value) {
		this.getUnclearShutdownChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUPLING_SWITCH_FAULT_IN_OPERATION}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getCouplingSwitchFaultInOperationChannel() {
		return this.channel(ChannelId.COUPLING_SWITCH_FAULT_IN_OPERATION);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COUPLING_SWITCH_FAULT_IN_OPERATION} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setCouplingSwitchFaultInOperation(boolean value) {
		this.getCouplingSwitchFaultInOperationChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SERVICE_SWITCH_PRESSED_IN_OPERATION}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getServiceSwitchPressedInOperationChannel() {
		return this.channel(ChannelId.SERVICE_SWITCH_PRESSED_IN_OPERATION);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#SERVICE_SWITCH_PRESSED_IN_OPERATION} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setServiceSwitchPressedInOperation(boolean value) {
		this.getServiceSwitchPressedInOperationChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#START_BLOCKED_BY_SERVICE_SWITCH}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getStartBlockedByServiceSwitchChannel() {
		return this.channel(ChannelId.START_BLOCKED_BY_SERVICE_SWITCH);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#START_BLOCKED_BY_SERVICE_SWITCH} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setStartBlockedByServiceSwitch(boolean value) {
		this.getStartBlockedByServiceSwitchChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#START_BLOCKED_BY_FIRE_ALARM}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getStartBlockedByFireAlarmChannel() {
		return this.channel(ChannelId.START_BLOCKED_BY_FIRE_ALARM);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#START_BLOCKED_BY_FIRE_ALARM} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setStartBlockedByFireAlarm(boolean value) {
		this.getStartBlockedByFireAlarmChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#START_BLOCKED_BY_COUPLING_SWITCH}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getStartBlockedByCouplingSwitchChannel() {
		return this.channel(ChannelId.START_BLOCKED_BY_COUPLING_SWITCH);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#START_BLOCKED_BY_COUPLING_SWITCH} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setStartBlockedByCouplingSwitch(boolean value) {
		this.getStartBlockedByCouplingSwitchChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#START_BLOCKED_BY_ESS_FAULT}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getStartBlockedByEssFaultChannel() {
		return this.channel(ChannelId.START_BLOCKED_BY_ESS_FAULT);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#START_BLOCKED_BY_ESS_FAULT} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setStartBlockedByEssFault(boolean value) {
		this.getStartBlockedByEssFaultChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for
	 * {@link ChannelId#FEMS_TO_FIRE_ALARM_SYS_COMMUNICATION_FAILURE}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getFemsToFireAlarmSysCommunicationFailureChannel() {
		return this.channel(ChannelId.FEMS_TO_FIRE_ALARM_SYS_COMMUNICATION_FAILURE);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#FEMS_TO_FIRE_ALARM_SYS_COMMUNICATION_FAILURE} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setFemsToFireAlarmSysCommunicationFailure(boolean value) {
		this.getFemsToFireAlarmSysCommunicationFailureChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SERVICE_SWITCH_PRESSED_ON_STOPPED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getServiceSwitchPressedOnStoppedChannel() {
		return this.channel(ChannelId.SERVICE_SWITCH_PRESSED_ON_STOPPED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#SERVICE_SWITCH_PRESSED_ON_STOPPED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setServiceSwitchPressedOnStopped(boolean value) {
		this.getServiceSwitchPressedOnStoppedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#SHUTDOWN_ACTIVE_ON_STOPPED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getShutdownActiveOnStoppedChannel() {
		return this.channel(ChannelId.SHUTDOWN_ACTIVE_ON_STOPPED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#SHUTDOWN_ACTIVE_ON_STOPPED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setShutdownActiveOnStopped(boolean value) {
		this.getShutdownActiveOnStoppedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#COUPLING_SWITCH_PRESSED_ON_STOPPED}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getCouplingSwitchPressedOnStoppedChannel() {
		return this.channel(ChannelId.COUPLING_SWITCH_PRESSED_ON_STOPPED);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#COUPLING_SWITCH_PRESSED_ON_STOPPED} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setCouplingSwitchPressedOnStopped(boolean value) {
		this.getCouplingSwitchPressedOnStoppedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#FIRE_ALARM_SYSTEM_FAULT}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getFireAlarmSystemFaultChannel() {
		return this.channel(ChannelId.FIRE_ALARM_SYSTEM_FAULT);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#FIRE_ALARM_SYSTEM_FAULT} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setFireAlarmSystemFault(boolean value) {
		this.getFireAlarmSystemFaultChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#FIRE_ALARM_SYSTEM_WARNING}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getFireAlarmSystemWarningChannel() {
		return this.channel(ChannelId.FIRE_ALARM_SYSTEM_WARNING);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#FIRE_ALARM_SYSTEM_WARNING} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setFireAlarmSystemWarning(boolean value) {
		this.getFireAlarmSystemWarningChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#LEAK_MONITOR_FAULT}.
	 *
	 * @return the Channel
	 */
	public default Channel<Boolean> getLeakMonitorFaultChannel() {
		return this.channel(ChannelId.LEAK_MONITOR_FAULT);
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#LEAK_MONITOR_FAULT} Channel.
	 *
	 * @param value the next value
	 */
	public default void _setLeakMonitorFault(boolean value) {
		this.getLeakMonitorFaultChannel().setNextValue(value);
	}

}