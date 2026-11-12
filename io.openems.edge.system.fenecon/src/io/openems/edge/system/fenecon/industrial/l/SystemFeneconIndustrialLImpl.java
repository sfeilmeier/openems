package io.openems.edge.system.fenecon.industrial.l;

import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.MULTIPLY;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverters.SCALE_FACTOR_MINUS_1;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.CUMULATED_TIME_COMPRESSOR_1_AND_2_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.CUMULATED_TIME_COMPRESSOR_1_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.CUMULATED_TIME_COMPRESSOR_2_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.CUMULATED_TIME_HEATER_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialL.ChannelId.CUMULATED_TIME_PUMP_RUNNING_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemInputChannelsL.SystemInputChannels.ACKNOWLEDGE_EMERGENCY_STOP;
import static io.openems.edge.system.fenecon.industrial.l.SystemInputChannelsL.SystemInputChannels.BMS_HARD_RESET;
import static io.openems.edge.system.fenecon.industrial.l.SystemInputChannelsL.SystemInputChannels.EMERGENCY_STOP_STATE;
import static io.openems.edge.system.fenecon.industrial.l.SystemInputChannelsL.SystemInputChannels.FUSE_TRIPPED;
import static io.openems.edge.system.fenecon.industrial.l.SystemInputChannelsL.SystemInputChannels.PSU_TRIPPED;
import static io.openems.edge.system.fenecon.industrial.l.SystemInputChannelsL.SystemInputChannels.SMOKE_DETECTION;
import static io.openems.edge.system.fenecon.industrial.l.SystemInputChannelsL.SystemInputChannels.SMOKE_DETECTION_FAILURE;
import static io.openems.edge.system.fenecon.industrial.l.SystemInputChannelsL.SystemInputChannels.SPD_TRIPPED;
import static io.openems.edge.system.fenecon.industrial.l.statemachine.StateMachine.State.BMS_RESET;
import static io.openems.edge.system.fenecon.industrial.l.statemachine.StateMachine.State.UNDEFINED;
import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.groupingBy;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Predicate;
import java.util.stream.Stream;

import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ConfigurationPolicy;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.component.annotations.ReferencePolicyOption;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventHandler;
import org.osgi.service.event.propertytypes.EventTopics;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.function.ThrowingConsumer;
import io.openems.common.jscalendar.JSCalendar;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.bridge.modbus.api.AbstractOpenemsModbusComponent;
import io.openems.edge.bridge.modbus.api.BridgeModbus;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.bridge.modbus.api.ModbusProtocol;
import io.openems.edge.bridge.modbus.api.element.CoilElement;
import io.openems.edge.bridge.modbus.api.element.DummyRegisterElement;
import io.openems.edge.bridge.modbus.api.element.UnsignedWordElement;
import io.openems.edge.bridge.modbus.api.task.FC2ReadInputsTask;
import io.openems.edge.bridge.modbus.api.task.FC3ReadRegistersTask;
import io.openems.edge.bridge.modbus.api.task.FC4ReadInputRegistersTask;
import io.openems.edge.bridge.modbus.api.task.FC5WriteCoilTask;
import io.openems.edge.bridge.modbus.api.task.FC6WriteRegisterTask;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.WriteChannel;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.event.EdgeEventConstants;
import io.openems.edge.common.jsonapi.ComponentJsonApi;
import io.openems.edge.common.jsonapi.JSCalendarApi;
import io.openems.edge.common.jsonapi.JsonApiBuilder;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.taskmanager.Priority;
import io.openems.edge.ess.api.MetaEss;
import io.openems.edge.ess.api.SymmetricEss;
import io.openems.edge.system.fenecon.industrial.jsonrpc.BmsHardwareResetRpc;
import io.openems.edge.system.fenecon.industrial.jsonrpc.EmergencyStopAcknowledgeRpc;
import io.openems.edge.system.fenecon.industrial.jsonrpc.ErrorAcknowledgeRpc;
import io.openems.edge.system.fenecon.industrial.l.envicool.Envicool;
import io.openems.edge.system.fenecon.industrial.l.statemachine.Context;
import io.openems.edge.system.fenecon.industrial.l.statemachine.StateMachine;
import io.openems.edge.timedata.api.Timedata;
import io.openems.edge.timedata.api.TimedataProvider;
import io.openems.edge.timedata.api.utils.CalculateActiveTime;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "System.Fenecon.Industrial.L", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE //
)
@EventTopics({ //
		EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE //
})
public class SystemFeneconIndustrialLImpl extends AbstractOpenemsModbusComponent
		implements SystemFeneconIndustrialL, ModbusComponent, OpenemsComponent, StartStoppable, EventHandler,
		ComponentJsonApi, TimedataProvider, ErrorAcknowledgeRpc, BmsHardwareResetRpc, EmergencyStopAcknowledgeRpc {

	private final Logger log = LoggerFactory.getLogger(SystemFeneconIndustrialLImpl.class);

	private final StateMachine stateMachine = new StateMachine(UNDEFINED);
	private final List<Battery> batteries = new CopyOnWriteArrayList<>();
	private final Envicool envicool = new Envicool();

	private StartStop startStopTarget;
	private ParsedConfig parsedConfig;

	private final CalculateActiveTime calculatePumpRunningTime = new CalculateActiveTime(this,
			CUMULATED_TIME_PUMP_RUNNING_STATE);
	private final CalculateActiveTime calculateHeaterRunningTime = new CalculateActiveTime(this,
			CUMULATED_TIME_HEATER_RUNNING_STATE);
	private final CalculateActiveTime calculateCompressor1RunningTime = new CalculateActiveTime(this,
			CUMULATED_TIME_COMPRESSOR_1_RUNNING_STATE);
	private final CalculateActiveTime calculateCompressor2RunningTime = new CalculateActiveTime(this,
			CUMULATED_TIME_COMPRESSOR_2_RUNNING_STATE);
	private final CalculateActiveTime calculateCompressor1and2RunningTime = new CalculateActiveTime(this,
			CUMULATED_TIME_COMPRESSOR_1_AND_2_RUNNING_STATE);

	@Reference
	private ConfigurationAdmin cm;

	@Reference
	private ComponentManager componentManager;

	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	protected void setCoolingUnitModbus(BridgeModbus modbus) {
		super.setModbus(modbus);
	}

	@Reference
	private SymmetricEss ess;

	@Reference(policy = ReferencePolicy.DYNAMIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.OPTIONAL)
	private volatile Timedata timedata = null;

	private JSCalendar.Tasks<Void> tasks;

	@Reference(//
			policy = ReferencePolicy.DYNAMIC, //
			policyOption = ReferencePolicyOption.GREEDY, //
			cardinality = ReferenceCardinality.MULTIPLE, //
			target = "(enabled=true)")
	protected synchronized void addBattery(Battery battery) {
		this.batteries.add(battery);
	}

	protected synchronized void removeBattery(Battery battery) {
		this.batteries.remove(battery);
	}

	public SystemFeneconIndustrialLImpl() {
		super(//
				OpenemsComponent.ChannelId.values(), //
				ModbusComponent.ChannelId.values(), //
				StartStoppable.ChannelId.values(), //
				SystemFeneconIndustrialL.ChannelId.values() //
		);
	}

	@Activate
	private void activate(ComponentContext context, Config config) throws OpenemsNamedException {
		super.activate(context, config.id(), config.alias(), config.enabled(), config.coolingUnitModbusUnitId(),
				this.cm, "CoolingUnitModbus", config.coolingUnitModbus_id());
		this.applyConfig(config);
	}

	@Modified
	private void modified(ComponentContext context, Config config) throws OpenemsNamedException {
		super.modified(context, config.id(), config.alias(), config.enabled(), config.coolingUnitModbusUnitId(),
				this.cm, "CoolingUnitModbus", config.coolingUnitModbus_id());
		this.applyConfig(config);
	}

	private boolean applyConfig(Config config) throws OpenemsNamedException {
		this.removeAcknowledgeCallback();
		this.parsedConfig = ParsedConfig.from(config);
		this.tasks = JSCalendar.Tasks.fromStringOrEmpty(this.componentManager.getClock(), config.restartTasks());
		this.addAcknowledgeCallBack();
		this.envicool.activate(Envicool.Context.from(config, this.batteries, //
				this.getSetBmsModeControlModeChannel(), this.getSetRunTimeControlModeChannel(), //
				this.getSetCoolingPointChannel(), this.getSetHeatingPointChannel(), //
				this.getSetMonitorAndIssueMinTempChannel(), this.getSetMonitorAndIssueMaxTempChannel()));

		if (Stream.of(//
				OpenemsComponent.updateReferenceFilter(this.cm, this.servicePid(), "ess", config.ess_id()), //
				OpenemsComponent.updateReferenceFilter(this.cm, this.servicePid(), "Battery", config.battery_ids()))
				.anyMatch(t -> t)) {
			return true;
		}
		return false;
	}

	@Deactivate
	protected void deactivate() {
		super.deactivate();
	}

	@Override
	public void handleEvent(Event event) {
		if (!this.isEnabled()) {
			return;
		}
		switch (event.getTopic()) {
		case EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE -> {
			this.envicool.onBeforeProcessImage();
			this.handleStateMachine();
			this.handleInputChannel(this.parsedConfig.emergencyStopStateChannel(),
					SystemFeneconIndustrialL.ChannelId.EMERGENCY_STOP_STATE);
			this.handleInputChannel(this.parsedConfig.spdStateChannel(),
					SystemFeneconIndustrialL.ChannelId.SPD_TRIPPED);
			this.handleInputChannel(this.parsedConfig.fuseStateChannel(),
					SystemFeneconIndustrialL.ChannelId.FUSE_TRIPPED);
			this.handleInputChannel(this.parsedConfig.psuTriggeredChannel(),
					SystemFeneconIndustrialL.ChannelId.PSU_TRIGGERED);
			this.handleInputChannel(this.parsedConfig.bmsHardResetChannel(),
					SystemFeneconIndustrialL.ChannelId.BMS_HARD_RESET);
			if (this.parsedConfig.smokeDetectionChannel != null) {
				this.handleInputChannel(this.parsedConfig.smokeDetectionChannel(), //
						SystemFeneconIndustrialL.ChannelId.SMOKE_DETECTION, true);
			}
			if (this.parsedConfig.smokeDetectionFailureChannel != null) {
				this.handleInputChannel(this.parsedConfig.smokeDetectionFailureChannel(),
						SystemFeneconIndustrialL.ChannelId.SMOKE_DETECTION_FAILURE);
			}
			this.handleAcknowledge();
			this.updateCumulatedActiveTimeChannels();
			this.handleRestartTasks();
		}
		}
	}

	public record ParsedConfig(//
			StartStopConfig startStop, //
			ChannelAddress emergencyStopStateChannel, //
			ChannelAddress spdStateChannel, //
			ChannelAddress fuseStateChannel, //
			ChannelAddress psuTriggeredChannel, //
			ChannelAddress acknowledgeEmergencyStopChannel, //
			ChannelAddress bmsHardResetChannel, //
			ChannelAddress smokeDetectionChannel, //
			ChannelAddress smokeDetectionFailureChannel //
	) {

		/**
		 * Sets the config input-output channels as {@link ChannelAddress}.
		 *
		 * @param config the {@link Config}
		 * @return a record for ConfigChannels
		 * @throws OpenemsNamedException on error
		 */
		public static ParsedConfig from(Config config) throws OpenemsNamedException {
			return new ParsedConfig(//
					config.startStop(), //
					// Input Channels
					EMERGENCY_STOP_STATE.getAddress(), //
					SPD_TRIPPED.getAddress(), //
					FUSE_TRIPPED.getAddress(), //
					PSU_TRIPPED.getAddress(), //
					// Output Channels
					ACKNOWLEDGE_EMERGENCY_STOP.getAddress(), //
					BMS_HARD_RESET.getAddress(), //
					/**
					 * Get the Smoke detection channel only if it is installed
					 */
					config.isSmokeDetectionInstalled() ? SMOKE_DETECTION.getAddress() : null,
					/**
					 * Get the Smoke detection failure channel only if it is installed
					 */
					config.isSmokeDetectionInstalled() ? SMOKE_DETECTION_FAILURE.getAddress() : null//
			);
		}
	}

	/**
	 * Handles the State-Machine.
	 */
	private void handleStateMachine() {
		// Store the current State
		this._setStateMachine(this.stateMachine.getCurrentState());

		try {
			// Prepare Context
			var context = new Context(this, this.ess, calculateStartStop(this.getEsssList()),
					this.componentManager.getClock());
			this.stateMachine.run(context);
			this._setRunFailed(false);
		} catch (OpenemsNamedException e) {
			this._setRunFailed(true);
			this.logError(this.log, "StateMachine failed: " + e.getMessage());
		}
	}

	/**
	 * Calculate effective StartStop status of {@link SymmetricEss}.
	 *
	 * @param esss the list of {@link SymmetricEss}
	 * @return {@link StartStop} the start-stop
	 */
	private static StartStop calculateStartStop(List<SymmetricEss> esss) {
		final var startStoppableEss = esss.stream() //
				.filter(StartStoppable.class::isInstance) //
				.map(StartStoppable.class::cast) //
				.toList();

		final var essMap = startStoppableEss.stream() //
				.collect(groupingBy(StartStoppable::getStartStop));

		if (essMap.isEmpty()) {
			return StartStop.UNDEFINED;
		}
		if (!essMap.getOrDefault(StartStop.START, emptyList()).isEmpty()) {
			return StartStop.START;
		}
		if (!essMap.getOrDefault(StartStop.STOP, emptyList()).isEmpty()) {
			return StartStop.STOP;
		}
		return StartStop.UNDEFINED;
	}

	@Override
	public List<SymmetricEss> getEsssList() {
		var esss = new ArrayList<SymmetricEss>();
		// ESS is here the EssCluster
		if (this.ess instanceof MetaEss metaEss) {
			for (var essId : metaEss.getEssIds()) {
				try {
					SymmetricEss component = this.componentManager.getComponent(essId);
					esss.add(component);
				} catch (OpenemsNamedException e) {
					this.logError(this.log, e.getMessage());
				}
			}
		} else {
			// ESS is here the GenericManagedSymmetricEss
			esss.add(this.ess);
		}
		return esss;
	}

	/**
	 * Gets the channel value from given {@link ChannelAddress} and sets on the
	 * given method.
	 *
	 * @param channelAddress the channel value to be read from.
	 * @param channelId      the {@link SystemFeneconIndustrialL.ChannelId} to set
	 *                       the current value.
	 * @param invert         flag to invert the channel or not
	 */
	private void handleInputChannel(ChannelAddress channelAddress, SystemFeneconIndustrialL.ChannelId channelId,
			boolean invert) {
		try {
			Channel<Boolean> channel = this.componentManager.getChannel(channelAddress);
			var value = channel.value();
			value.ifPresent(t -> this.channel(channelId).setNextValue(invert != t));
		} catch (OpenemsNamedException e) {
			this.logError(this.log, e.getClass().getSimpleName() + ": " + e.getMessage());
		}
	}

	private void handleInputChannel(ChannelAddress channelAddress, SystemFeneconIndustrialL.ChannelId channelId) {
		this.handleInputChannel(channelAddress, channelId, false);
	}

	@Override
	protected ModbusProtocol defineModbusProtocol() {
		return new ModbusProtocol(this, //
				new FC2ReadInputsTask(4, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.SET_MONITOR_SWITCH, new CoilElement(4)), //
						new CoilElement(5), //
						m(SystemFeneconIndustrialL.ChannelId.COMPRESSOR_1_GENERAL_ALARM, new CoilElement(6)), //
						new CoilElement(7), //
						m(SystemFeneconIndustrialL.ChannelId.PUMP_RUNNING_STATE, new CoilElement(8)), //
						new CoilElement(9), new CoilElement(10), new CoilElement(11), new CoilElement(12),
						new CoilElement(13),
						m(SystemFeneconIndustrialL.ChannelId.COMPRESSOR_1_RUNNING_STATE, new CoilElement(14)), //
						new CoilElement(15), new CoilElement(16), new CoilElement(17), new CoilElement(18),
						new CoilElement(19), //
						m(SystemFeneconIndustrialL.ChannelId.COMPRESSOR_2_RUNNING_STATE, new CoilElement(20))), //
				new FC2ReadInputsTask(55, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.SYSTEM_WATER_SHORTAGE_ALARM, new CoilElement(55)), //
						new CoilElement(56), new CoilElement(57), new CoilElement(58), new CoilElement(59),
						new CoilElement(60), new CoilElement(61), new CoilElement(62), new CoilElement(63),
						new CoilElement(64), new CoilElement(65), new CoilElement(66), new CoilElement(67),
						new CoilElement(68), new CoilElement(69), new CoilElement(70), //
						m(SystemFeneconIndustrialL.ChannelId.COMPRESSOR_1_CONDENSING_PRESSURE_TOO_HIGH_ALARM,
								new CoilElement(71)), //
						new CoilElement(72), new CoilElement(73), new CoilElement(74), new CoilElement(75),
						new CoilElement(76), new CoilElement(77), new CoilElement(78), new CoilElement(79),
						new CoilElement(80), new CoilElement(81), new CoilElement(82), new CoilElement(83),
						new CoilElement(84), new CoilElement(85), //
						m(SystemFeneconIndustrialL.ChannelId.SET_ELECTRIC_HEATING_WORKING, new CoilElement(86))), //
				new FC2ReadInputsTask(141, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.COMPRESSOR_2_CONDENSING_PRESSURE_TOO_HIGH_ALARM,
								new CoilElement(141))), //
				new FC2ReadInputsTask(178, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.WATER_OUTLET_PRESSURE_HIGH_ALARM, new CoilElement(178)), //
						m(SystemFeneconIndustrialL.ChannelId.WATER_INLET_PRESSURE_WARNING, new CoilElement(179))), //
				new FC2ReadInputsTask(223, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.HEATER_RUNNING_STATE, new CoilElement(223)), //
						new CoilElement(224), //
						m(SystemFeneconIndustrialL.ChannelId.POWER_FAILURE_WARNING, new CoilElement(225))), //
				new FC2ReadInputsTask(391, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.COMPRESSOR_2_GENERAL_ALARM, new CoilElement(391))), //
				new FC3ReadRegistersTask(1, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.SET_COOLING_POINT, new UnsignedWordElement(1), //
								SCALE_FACTOR_MINUS_1), //
						new DummyRegisterElement(2, 4), //
						m(SystemFeneconIndustrialL.ChannelId.SET_PUMP_MANUAL_DEMAND_ENABLE, new UnsignedWordElement(5)), //
						new DummyRegisterElement(6, 11), //
						m(SystemFeneconIndustrialL.ChannelId.SET_RUNTIME_CONTROL_MODE, new UnsignedWordElement(12))), //
				new FC3ReadRegistersTask(370, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.SET_HEATING_POINT, new UnsignedWordElement(370), //
								SCALE_FACTOR_MINUS_1), //
						new DummyRegisterElement(371), //
						m(SystemFeneconIndustrialL.ChannelId.SET_WATER_OUTLET_PRESSURE, new UnsignedWordElement(372),
								MULTIPLY(10.0)), //
						m(SystemFeneconIndustrialL.ChannelId.SET_WATER_INLET_PRESSURE, new UnsignedWordElement(373),
								MULTIPLY(100.0)), //
						m(SystemFeneconIndustrialL.ChannelId.SET_PUMP_ROTATING_SPEED, new UnsignedWordElement(374), //
								SCALE_FACTOR_MINUS_1), //
						new DummyRegisterElement(375), //
						m(SystemFeneconIndustrialL.ChannelId.SET_BMS_MODE_CONTROL, new UnsignedWordElement(376)), //
						m(SystemFeneconIndustrialL.ChannelId.SET_MONITOR_AND_ISSUE_MAX_TEMP,
								new UnsignedWordElement(377), //
								SCALE_FACTOR_MINUS_1), //
						m(SystemFeneconIndustrialL.ChannelId.SET_MONITOR_AND_ISSUE_MIN_TEMP,
								new UnsignedWordElement(378), //
								SCALE_FACTOR_MINUS_1)), //
				new FC4ReadInputRegistersTask(0, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.COMPRESSOR_1_SYSTEM_WARNING, new UnsignedWordElement(0)), //
						new DummyRegisterElement(1, 67), //
						m(SystemFeneconIndustrialL.ChannelId.WATER_OUTLET_TEMP, new UnsignedWordElement(68), //
								SCALE_FACTOR_MINUS_1), //
						m(SystemFeneconIndustrialL.ChannelId.WATER_INLET_TEMP, new UnsignedWordElement(69), //
								SCALE_FACTOR_MINUS_1)), //

				new FC4ReadInputRegistersTask(172, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.WATER_OUTLET_PRESSURE, new UnsignedWordElement(172),
								MULTIPLY(100.0)),
						m(SystemFeneconIndustrialL.ChannelId.WATER_INLET_PRESSURE, new UnsignedWordElement(173),
								MULTIPLY(100.0))),
				new FC4ReadInputRegistersTask(390, Priority.LOW, //
						m(SystemFeneconIndustrialL.ChannelId.COMPRESSOR_2_SYSTEM_WARNING,
								new UnsignedWordElement(390))), //
				new FC5WriteCoilTask(4, //
						m(SystemFeneconIndustrialL.ChannelId.SET_MONITOR_SWITCH, new CoilElement(4))), //
				new FC5WriteCoilTask(86, //
						m(SystemFeneconIndustrialL.ChannelId.SET_ELECTRIC_HEATING_WORKING, new CoilElement(86))), //
				new FC6WriteRegisterTask(1, //
						m(SystemFeneconIndustrialL.ChannelId.SET_COOLING_POINT, new UnsignedWordElement(1), //
								SCALE_FACTOR_MINUS_1)), //
				new FC6WriteRegisterTask(5, //
						m(SystemFeneconIndustrialL.ChannelId.SET_PUMP_MANUAL_DEMAND_ENABLE,
								new UnsignedWordElement(5))), //
				new FC6WriteRegisterTask(12, //
						m(SystemFeneconIndustrialL.ChannelId.SET_RUNTIME_CONTROL_MODE, new UnsignedWordElement(12))), //
				new FC6WriteRegisterTask(370, //
						m(SystemFeneconIndustrialL.ChannelId.SET_HEATING_POINT, new UnsignedWordElement(370), //
								SCALE_FACTOR_MINUS_1)), //
				new FC6WriteRegisterTask(372, //
						m(SystemFeneconIndustrialL.ChannelId.SET_WATER_OUTLET_PRESSURE, new UnsignedWordElement(372),
								MULTIPLY(10.0))), //
				new FC6WriteRegisterTask(373, //
						m(SystemFeneconIndustrialL.ChannelId.SET_WATER_INLET_PRESSURE, new UnsignedWordElement(373),
								MULTIPLY(100.0))), //
				new FC6WriteRegisterTask(374, //
						m(SystemFeneconIndustrialL.ChannelId.SET_PUMP_ROTATING_SPEED, new UnsignedWordElement(374), //
								SCALE_FACTOR_MINUS_1)), //
				new FC6WriteRegisterTask(376, //
						m(SystemFeneconIndustrialL.ChannelId.SET_BMS_MODE_CONTROL, new UnsignedWordElement(376))), //
				new FC6WriteRegisterTask(377, //
						m(SystemFeneconIndustrialL.ChannelId.SET_MONITOR_AND_ISSUE_MAX_TEMP,
								new UnsignedWordElement(377), //
								SCALE_FACTOR_MINUS_1)), //
				new FC6WriteRegisterTask(378, //
						m(SystemFeneconIndustrialL.ChannelId.SET_MONITOR_AND_ISSUE_MIN_TEMP,
								new UnsignedWordElement(378), //
								SCALE_FACTOR_MINUS_1)) //
		);
	}

	/**
	 * Gets the channel value from given channel address.
	 *
	 * @return true if it's not null, or its defined and true.
	 */
	public boolean isInEmergencyStopState() {
		try {
			Channel<Boolean> channel = this.componentManager.getChannel(this.parsedConfig.emergencyStopStateChannel());
			return channel.value().orElse(false);
		} catch (Exception e) {
			this.logError(this.log, e.getClass().getSimpleName() + ": " + e.getMessage());
		}
		return false;
	}

	@Override
	public void setStartStop(StartStop value) {
		this.startStopTarget = value;
	}

	public StartStop getStartStopTarget() {
		return switch (this.parsedConfig.startStop()) {
		case AUTO -> this.startStopTarget;
		case START -> StartStop.START;
		case STOP -> StartStop.STOP;
		};
	}

	@Override
	public String debugLog() {
		return new StringBuilder() //
				.append(this.stateMachine.debugLog()) //
				.append("|")//
				.append("CoolingUnit: ")//
				.append(this.getSetRunTimeControlModeChannel().value().asEnum().toString()) //
				.toString();
	}

	@Override
	public void buildJsonApiRoutes(JsonApiBuilder builder) {
		JSCalendarApi.buildJsonApiRoutes(//
				builder, //
				JSCalendar.VOID_SERIALIZER, //
				() -> this.tasks, //
				() -> new JSCalendarApi.UpdateJsCalendarRecord(//
						this.cm, //
						this.componentManager, //
						this.servicePid(), //
						"restartTasks"//
				)//
		);
	}

	@Override
	public void acknowledgeEmergencyStop() {
		try {
			this.getWriteAcknowledgeChannel().setNextWriteValue(true);
		} catch (Exception e) {
			this.logError(this.log, e.getClass().getSimpleName() + ": " + e.getMessage());
		}
	}

	private final AtomicBoolean allowAcknowledge = new AtomicBoolean(false);

	private final ThrowingConsumer<Boolean, OpenemsNamedException> acknowledgeCallback = value -> {
		// TODO possible bug because of core.cycle, update accordingly
		if (value == null || !value) {
			this.allowAcknowledge.set(false);
		}
		this.allowAcknowledge.set(true);
	};

	private void handleAcknowledge() {
		try {
			if (!this.isInEmergencyStopState() && this.allowAcknowledge.get()) {
				this.getWriteAcknowledgeChannel().setNextWriteValue(false);
			}
		} catch (Exception e) {
			this.logError(this.log, e.getClass().getSimpleName() + ": " + e.getMessage());
		}
	}

	private void addAcknowledgeCallBack() {
		// TODO Would be better to keep IO as a @Reference.
		// See https://git.intranet.fenecon.de/FENECON/fems/pulls/799#issuecomment-23990
		try {
			this.getWriteAcknowledgeChannel().onSetNextWrite(this.acknowledgeCallback);
		} catch (Exception e) {
			this.logError(this.log, e.getClass().getSimpleName() + ": " + e.getMessage());
		}
	}

	private void removeAcknowledgeCallback() {
		if (this.parsedConfig == null) {
			return;
		}

		try {
			this.getWriteAcknowledgeChannel().getOnSetNextWrites().remove(this.acknowledgeCallback);
		} catch (Exception e) {
			this.logError(this.log, e.getClass().getSimpleName() + ": " + e.getMessage());
		}
	}

	/**
	 * Gets the started batteries.
	 *
	 * @return the list of started batteries.
	 */
	public List<Battery> getStartedBatteries() {
		return this.getMatchedBatteries(StartStoppable::isStarted);
	}

	/**
	 * Gets the batteries which has fault.
	 *
	 * @return the list of faulty batteries
	 */
	public List<Battery> getFaultBatteries() {
		return this.getMatchedBatteries(OpenemsComponent::hasFaults);
	}

	/**
	 * Returns a list of batteries where batteries matched with required conditions.
	 *
	 * @param method asked battery condition,e.g. {@link #isStarted()}
	 * @return List of {@link Battery}.
	 */
	private List<Battery> getMatchedBatteries(Predicate<Battery> method) {
		return this.batteries.stream()//
				.filter(method)//
				.toList();
	}

	private WriteChannel<Boolean> getWriteAcknowledgeChannel() throws Exception {
		try {
			return this.componentManager.getChannel(this.parsedConfig.acknowledgeEmergencyStopChannel());
		} catch (Exception e) {
			this.logError(this.log, e.getClass().getSimpleName() + ": " + e.getMessage());
			throw e;
		}
	}

	/**
	 * Gets the {@link ParsedConfig#bmsHardResetChannel}.
	 *
	 * @return the output channel {@link WriteChannel}
	 * @throws Exception on error
	 */
	public WriteChannel<Boolean> getWriteBmsHardResetChannel() throws Exception {
		try {
			return this.componentManager.getChannel(this.parsedConfig.bmsHardResetChannel());
		} catch (Exception e) {
			this.logError(this.log, e.getClass().getSimpleName() + ": " + e.getMessage());
			throw e;
		}
	}

	protected void updateCumulatedActiveTimeChannels() {
		final var compressor1RunningState = this.getCompressor1RunningState().orElse(false);
		final var compressor2RunningState = this.getCompressor2RunningState().orElse(false);
		final var heaterRunningState = this.getHeaterRunningState().orElse(false);
		final var pumpRunningState = this.getPumpRunningState().orElse(false);

		this.calculateCompressor1RunningTime.update(compressor1RunningState);
		this.calculateCompressor2RunningTime.update(compressor2RunningState);
		this.calculateCompressor1and2RunningTime.update(compressor1RunningState && compressor2RunningState);
		this.calculateHeaterRunningTime.update(heaterRunningState);
		this.calculatePumpRunningTime.update(pumpRunningState);
	}

	@Override
	public Timedata getTimedata() {
		return this.timedata;
	}

	@Override
	public List<Channel<?>> defineChannelsForErrorAcknowledge() {
		return List.of(//
				getModbusCommunicationFailedChannel(), //
				getRunFailedChannel() //
		);
	}

	private void handleRestartTasks() {
		if (this.tasks == null) {
			return;
		}
		var activeTask = this.tasks.getActiveOneTask();
		if (activeTask == null) {
			return;
		}
		this.stateMachine.forceNextState(BMS_RESET);
	}

	@Override
	public void activateBmsHardwareReset() {
		this.stateMachine.forceNextState(BMS_RESET);
	}

	@Override
	public void forceStateMachineUndefined() {
		this.stateMachine.forceNextState(UNDEFINED);
	}
}
