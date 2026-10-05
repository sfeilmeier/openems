package io.openems.edge.system.fenecon.industrial.xl;

import static io.openems.common.session.Role.ADMIN;
import static io.openems.edge.common.channel.ChannelId.channelIdUpperToCamel;
import static io.openems.edge.common.channel.ChannelUtils.setValue;
import static io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State.UNDEFINED;
import static java.util.stream.Collectors.groupingBy;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Hashtable;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import java.util.stream.Stream;

import org.osgi.framework.ServiceRegistration;
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

import io.openems.common.channel.Debounce;
import io.openems.common.channel.Level;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.jsonrpc.serialization.EmptyObject;
import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.common.session.Role;
import io.openems.common.timedata.Timeout;
import io.openems.common.types.ChannelAddress;
import io.openems.common.types.OpenemsType;
import io.openems.edge.aircooling.blueeplus.BlueEPlus;
import io.openems.edge.battery.fenecon.f2b.cluster.common.BatteryFeneconF2bCluster;
import io.openems.edge.battery.fenecon.f2b.common.enums.F2bHardwareType;
import io.openems.edge.battery.fenecon.f2b.update.F2bUpdateable;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.common.channel.BooleanDoc;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.ChannelId.ChannelIdImpl;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.WriteChannel;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.AbstractOpenemsComponent;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.event.EdgeEventConstants;
import io.openems.edge.common.jsonapi.ComponentJsonApi;
import io.openems.edge.common.jsonapi.EdgeGuards;
import io.openems.edge.common.jsonapi.JsonApiBuilder;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.update.Updateable;
import io.openems.edge.ess.api.EssErrorAcknowledge;
import io.openems.edge.ess.api.MetaEss;
import io.openems.edge.ess.api.SymmetricEss;
import io.openems.edge.firealarmsystem.hekatron.HekatronB9X2;
import io.openems.edge.fluidcooling.hydac.Hydac;
import io.openems.edge.io.api.DigitalOutput;
import io.openems.edge.system.fenecon.industrial.enums.FluidCoolingMode;
import io.openems.edge.system.fenecon.industrial.jsonrpc.ErrorAcknowledgeRpc;
import io.openems.edge.system.fenecon.industrial.jsonrpc.SystemErrorAcknowledge;
import io.openems.edge.system.fenecon.industrial.xl.jsonrpc.BmsHardwareReset;
import io.openems.edge.system.fenecon.industrial.xl.jsonrpc.TestMode;
import io.openems.edge.system.fenecon.industrial.xl.jsonrpc.TestMode.TestAction;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.Context;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;
import io.openems.edge.system.fenecon.industrial.xl.temperature.JumoHydroTransS20;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "System.Fenecon.Industrial.Xl", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE //
)
@EventTopics({ //
		EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE //
})
public class SystemFeneconIndustrialXlImpl extends AbstractOpenemsComponent implements SystemFeneconIndustrialXl,
		OpenemsComponent, StartStoppable, EventHandler, ComponentJsonApi, ErrorAcknowledgeRpc {

	public static final EndpointRequestType<EmptyObject, EmptyObject> CLEAR_ERROR_REQUEST = EndpointRequestType
			.ofEmpty("clearErrorRequest");

	private static final F2bHardwareType F2B_HARDWARE_TYPE = F2bHardwareType.F2B_FM29_1V2;
	private final StateMachine stateMachine = new StateMachine(UNDEFINED);
	private final Logger log = LoggerFactory.getLogger(SystemFeneconIndustrialXlImpl.class);
	private final Timeout resetTimeout = Timeout.ofSeconds(5);
	private final List<BatteryFeneconF2bCluster> batteries = new ArrayList<>();

	private ServiceRegistration<Updateable> serviceRegistration;
	private StartStop startStopTarget = StartStop.UNDEFINED;
	private ChannelAddress outputSsiRunningFlashing = null;
	private ChannelAddress outputDisable24vF2b = null;
	private ChannelAddress outputSsiRunning = null;
	private ChannelAddress outputSsiWarning = null;
	private ChannelAddress outputSsiError = null;
	private boolean isResetRunning = false;
	private TestMode.Request request;
	private Config config;

	@Reference
	private ComponentManager componentManager;

	@Reference
	private ConfigurationAdmin cm;

	@Reference
	private SymmetricEss ess;

	@Reference(//
			policy = ReferencePolicy.DYNAMIC, //
			policyOption = ReferencePolicyOption.GREEDY, //
			cardinality = ReferenceCardinality.MULTIPLE, //
			target = "(enabled=true)")
	protected synchronized void addBattery(BatteryFeneconF2bCluster battery) {
		this.batteries.add(battery);
	}

	protected synchronized void removeBattery(BatteryFeneconF2bCluster battery) {
		this.batteries.remove(battery);
	}

	@Reference(policy = ReferencePolicy.DYNAMIC, //
			policyOption = ReferencePolicyOption.GREEDY, //
			cardinality = ReferenceCardinality.MANDATORY) //
	private volatile JumoHydroTransS20 temp;

	@Reference(policy = ReferencePolicy.DYNAMIC, //
			policyOption = ReferencePolicyOption.GREEDY, //
			cardinality = ReferenceCardinality.MANDATORY) //
	private volatile HekatronB9X2 fireAlarmSystem;

	@Reference(policy = ReferencePolicy.DYNAMIC, //
			policyOption = ReferencePolicyOption.GREEDY, //
			cardinality = ReferenceCardinality.MANDATORY) //
	private volatile BlueEPlus airCooling;

	@Reference(policy = ReferencePolicy.DYNAMIC, //
			policyOption = ReferencePolicyOption.GREEDY, //
			cardinality = ReferenceCardinality.MANDATORY) //
	private volatile Hydac fluidCooling;

	public SystemFeneconIndustrialXlImpl() {
		super(//
				OpenemsComponent.ChannelId.values(), //
				ModbusComponent.ChannelId.values(), //
				StartStoppable.ChannelId.values(), //
				SystemFeneconIndustrialXl.ChannelId.values() //
		);
		this.createInputChannels();
	}

	@Activate
	private void activate(ComponentContext context, Config config) throws OpenemsNamedException {
		super.activate(context, config.id(), config.alias(), config.enabled());
		this.serviceRegistration = context.getBundleContext().registerService(Updateable.class,
				new F2bUpdateable(this.batteries, F2B_HARDWARE_TYPE), new Hashtable<>());
		if (!this.applyConfig(config)) {
			return;
		}
	}

	@Modified
	private void modified(ComponentContext context, Config config) throws OpenemsNamedException {
		super.modified(context, config.id(), config.alias(), config.enabled());
		if (!this.applyConfig(config)) {
			return;
		}
	}

	private boolean applyConfig(Config config) throws OpenemsNamedException {
		this.config = config;
		this.outputDisable24vF2b = ChannelAddress.fromString("io0/DigitalOutputM3C2");
		this.outputSsiRunningFlashing = ChannelAddress.fromString("io0/DigitalOutputM3C3");
		this.outputSsiRunning = ChannelAddress.fromString("io0/DigitalOutputM3C4");
		this.outputSsiWarning = ChannelAddress.fromString("io0/DigitalOutputM3C5");
		this.outputSsiError = ChannelAddress.fromString("io0/DigitalOutputM3C6");
		if (Stream.of(//
				OpenemsComponent.updateReferenceFilter(this.cm, this.servicePid(), "ess", config.ess_id()), //
				OpenemsComponent.updateReferenceFilter(this.cm, this.servicePid(), "Battery", config.battery_ids()))
				.anyMatch(t -> t)) {
			return true;
		}
		return false;
	}

	private void handleFluidCoolingMode(FluidCoolingMode fluidCoolingMode) {
		try {
			switch (fluidCoolingMode) {
			case ENABLED -> this.fluidCooling.start();
			case DISABLED -> this.fluidCooling.stop();
			case AUTO -> {
				// The cooling unit is operating in its automatic mode; no additional action is
				// required
			}
			}
			setValue(this, SystemFeneconIndustrialXl.ChannelId.FLUID_COOLING_AUTO,
					fluidCoolingMode == FluidCoolingMode.AUTO);
		} catch (OpenemsNamedException e) {
			this.logError(this.log, "Could not set fluid cooling mode: " + e.getMessage());
		}
	}

	@Deactivate
	protected void deactivate() {
		super.deactivate();
		this.serviceRegistration.unregister();
	}

	@Override
	public void handleEvent(Event event) {
		if (!this.isEnabled()) {
			return;
		}
		switch (event.getTopic()) {
		case EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE -> {
			this.deactivateF2bHardwareReset();
			this.updateSystemStatusDisplay();
			this.updateInputChannelValues();
			this.updateCoolingTemperatureLimits();
			this.updateFireAlarmSystemChannels();
			this.updateSystemFailure();
			this.handleStateMachine();
			this.handleFluidCoolingMode(this.config.fluidCoolingMode());
		}
		}
	}

	private void updateSystemFailure() {
		var stateMachine = this.stateMachine.getCurrentState();
		if (stateMachine == State.GO_RUNNING//
				|| stateMachine == State.GO_STOPPED//
				|| stateMachine == State.RUNNING//
		) {
			final var fireAlarmTriggered = this.getSystemShutdownFaultChannel().value();
			final var serviceSwitchPressed = this.getServiceSwitchPressedInOperationChannel().value();
			final var unclearShutdown = this.getUnclearShutdownChannel().value();
			final var couplingSwitchDisabled = this.getCouplingSwitchFaultInOperationChannel().value();
			if (this.isStatusSysOff()//
					&& this.isSysServiceSwitchOn()//
					&& !fireAlarmTriggered.orElse(false)//
					&& !unclearShutdown.orElse(false)//
					&& !couplingSwitchDisabled.orElse(false)//
			) {
				this._setServiceSwitchPressedInOperation(true);
			}

			if (this.isStatusSysOff()//
					&& this.fireAlarmSystem.hasFaults()//
					&& !serviceSwitchPressed.orElse(false)//
					&& !unclearShutdown.orElse(false)//
					&& !couplingSwitchDisabled.orElse(false)//
			) {
				this._setSystemShutdownFault(true);
			}

			if (this.isStatusSysOff()//
					&& !this.fireAlarmSystem.hasFaults()//
					&& !this.isSysServiceSwitchOn()//
					&& !fireAlarmTriggered.orElse(false)//
					&& !serviceSwitchPressed.orElse(false)//
					&& !couplingSwitchDisabled.orElse(false)//
			) {
				this._setUnclearShutdown(true);
			}

			if (this.isCouplingSwitchOff()//
					&& !fireAlarmTriggered.orElse(false)//
					&& !serviceSwitchPressed.orElse(false)//
					&& !unclearShutdown.orElse(false)//
			) {
				this._setCouplingSwitchFaultInOperation(true);
			}
		}
	}

	/**
	 * Check if the coupling-switch switched off via customer interface.
	 *
	 * @return true for coupling-switch switched off
	 */
	public boolean isCouplingSwitchOff() {
		return this.isEnabled(SystemInputChannels.ENABLE_COUPLING_SWITCH).orElse(false);
	}

	/**
	 * Check if the system is in system off state.
	 *
	 * @return true for system off, false if system enabled
	 */
	public boolean isStatusSysOff() {
		return this.isEnabled(SystemInputChannels.STATUS_SYS_OFF).orElse(true);
	}

	/**
	 * Check if the system service required.
	 *
	 * @return true for service required, false for normal
	 */
	public boolean isSysServiceSwitchOn() {
		return this.isEnabled(SystemInputChannels.SYS_SERVICE_SWITCH).orElse(false);
	}

	/**
	 * Check if the coupling-switch switched off via customer interface.
	 *
	 * @return true for coupling-switch switched off
	 */
	public boolean isCouplingSwitchOffDefined() {
		return this.isEnabled(SystemInputChannels.ENABLE_COUPLING_SWITCH).isDefined();
	}

	/**
	 * Check if the system is in system off state.
	 *
	 * @return true for system off, false if system enabled
	 */
	public boolean isStatusSysOffDefined() {
		return this.isEnabled(SystemInputChannels.STATUS_SYS_OFF).isDefined();
	}

	/**
	 * Check if the system service required.
	 *
	 * @return true for service required, false for normal
	 */
	public boolean isSysServiceSwitchOnDefined() {
		return this.isEnabled(SystemInputChannels.SYS_SERVICE_SWITCH).isDefined();
	}

	/**
	 * Proof if the following preconditions met simultaneously.
	 *
	 * @return true if all preconditions fulfilled
	 */
	public boolean arePreconditionsFulfilled() {
		return !this.isSysServiceSwitchOn() //
				&& !this.isStatusSysOff() //
				&& !this.isCouplingSwitchOff() //
				&& !this.areAllEssInFailure();
	}

	private void updateCoolingTemperatureLimits() {
		try {
			setIfChanged(this.airCooling.getSetupStandardControlSetpointChannel(), this.config.airCoolingSetPoint());
		} catch (OpenemsNamedException e) {
			this.logWarn(this.log, "The cooling unit temperatures can not be updated" + e.getMessage());
		}
	}

	/**
	 * Handles the State-Machine.
	 */
	private void handleStateMachine() {
		// Store the current State
		this._setStateMachine(this.stateMachine.getCurrentState());

		// Initialize 'Start-Stop' Channel
		this._setStartStop(StartStop.UNDEFINED);

		var context = new Context(//
				this, //
				this.ess, //
				this.calculateStartStop(this.getEsssList()), //
				this.request, //
				this.outputSsiRunning, //
				this.outputSsiError, //
				this.outputSsiRunningFlashing, //
				this.outputSsiWarning, //
				this.fireAlarmSystem, //
				this.componentManager.getClock() //
		);

		// Prepare Context
		try {
			this.stateMachine.run(context);
			this._setRunFailed(false);
		} catch (OpenemsNamedException e) {
			this._setRunFailed(true);
			this.logError(this.log, "StateMachine failed: " + e.getMessage());
		}
	}

	private static <T> void setIfChanged(WriteChannel<T> channel, T value) throws OpenemsNamedException {
		if (Objects.equals(channel.value().get(), value)) {
			return;
		}
		channel.setNextWriteValue(value);
	}

	private static <T> void setIfChanged(Channel<T> channel, T value) throws OpenemsNamedException {
		if (Objects.equals(channel.value().get(), value)) {
			return;
		}
		channel.setNextValue(value);
	}

	/**
	 * Determines the effective {@link StartStop} state of the system based on the
	 * states of all {@link SymmetricEss} units.
	 *
	 * <p>
	 * <b>System START condition:</b>
	 * <ul>
	 * <li>All ESS units report {@code START}, or</li>
	 * <li>A combination of {@code START} and faulted ESS units (i.e., no ESS
	 * reports {@code STOP}, and no non-faulted ESS is {@code UNDEFINED}).</li>
	 * </ul>
	 *
	 * <p>
	 * <b>System STOP condition:</b>
	 * <ul>
	 * <li>All ESS units report {@code STOP}, or</li>
	 * <li>All ESS units are faulted, or</li>
	 * <li>A combination of {@code STOP} and faulted ESS units (i.e., no ESS reports
	 * {@code START}).</li>
	 * </ul>
	 *
	 * <p>
	 * If none of the above conditions apply, the system state is {@code UNDEFINED}.
	 *
	 * @param esss the list of ESS components
	 * @return the effective {@link StartStop} state of the system
	 */
	private StartStop calculateStartStop(List<SymmetricEss> esss) {
		var essMap = esss.stream()//
				.filter(StartStoppable.class::isInstance)//
				.map(StartStoppable.class::cast)//
				.collect(groupingBy(StartStoppable::getStartStop));

		if (essMap.isEmpty()) {
			return StartStop.UNDEFINED;
		}

		var faultedEssSize = esss.stream()//
				.filter(OpenemsComponent::hasFaults)//
				.toList().size();

		final var target = this.getStartStopTarget();
		final var startedEssSize = essMap.getOrDefault(StartStop.START, List.of()).size();
		if (target == StartStop.START && esss.size() == (startedEssSize + faultedEssSize)) {
			return StartStop.START;
		}
		final var stoppedEssSize = essMap.getOrDefault(StartStop.STOP, List.of()).size();
		if (target == StartStop.STOP && esss.size() == (stoppedEssSize + faultedEssSize)) {
			return StartStop.STOP;
		}

		return StartStop.UNDEFINED;
	}

	/**
	 * Gets the {@link SymmetricEss} list from {@link MetaEss}.
	 *
	 * @return the ess list
	 */
	public List<SymmetricEss> getEsssList() {
		var esss = new ArrayList<SymmetricEss>();
		// ESS is here the EssCluster
		if (this.ess instanceof MetaEss metaEss) {
			for (var essId : metaEss.getEssIds()) {
				try {
					SymmetricEss component = this.componentManager.getComponent(essId);
					esss.add(component);
				} catch (OpenemsNamedException e) {
					this.logError(this.log, "Could not find the ESS Component with ID: " + essId + e.getMessage());
				}
			}
		} else {
			// ESS is here the GenericManagedSymmetricEss
			esss.add(this.ess);
		}
		return esss;
	}

	/**
	 * Gets the list of configured {@link BatteryFeneconF2bCluster} batteries.
	 *
	 * @return {@link List} of {@link BatteryFeneconF2bCluster}
	 */
	public List<BatteryFeneconF2bCluster> getBatteries() {
		return this.batteries;
	}

	@Override
	public void setStartStop(StartStop value) {
		this.startStopTarget = value;
	}

	@Override
	public StartStop getStartStopTarget() {
		return switch (this.config.startStop()) {
		case AUTO -> this.startStopTarget;
		case START -> StartStop.START;
		case STOP -> StartStop.STOP;
		};
	}

	@Override
	public void buildJsonApiRoutes(JsonApiBuilder builder) {
		builder.handleRequest(new BmsHardwareReset(),
				endpoint -> endpoint.setGuards(EdgeGuards.roleIsAtleast(Role.INSTALLER)), //
				call -> {
					this.activateF2bHardwareReset();
					return EmptyObject.INSTANCE;
				});
		builder.handleRequest(new TestMode(), endpoint -> endpoint.setGuards(EdgeGuards.roleIsAtleast(Role.INSTALLER)), //
				call -> {
					final var nextRequest = call.getRequest();
					if (nextRequest.action() instanceof TestAction.Exit) {
						this.stateMachine.forceNextState(State.GO_STOPPED);
						return new TestMode.Response("Exiting test mode!", null, null);
					}

					if (this.request != null) {
						return new TestMode.Response(//
								"ignored", //
								"A test is already running: ", //
								this.request.action());
					}

					if (!this.isStopped() && !this.isIdle()) {
						return new TestMode.Response("Stop operation or Idle state required before proceeding!", null,
								null);
					}

					this.setTestRequestParams(call.getRequest());
					this.stateMachine.forceNextState(State.TEST_MODE_IDLE);
					return new TestMode.Response("started", null, this.request.action());
				});

		this.executeErrorAcknowledgeRpc(builder, new SystemErrorAcknowledge(), () -> {
			this.stateMachine.forceNextState(UNDEFINED);
			for (var ess : this.getEsssList()) {
				if (ess instanceof EssErrorAcknowledge genericEss) {
					genericEss.executeErrorAcknowledge();
				}
			}
		});

		builder.handleRequest(CLEAR_ERROR_REQUEST,
				endpoint -> endpoint.setGuards(EdgeGuards.roleIsAtleast(Role.INSTALLER)), //
				call -> {
					this.clearCoolingUnitErrors();
					return EmptyObject.INSTANCE;
				});
	}

	protected void clearCoolingUnitErrors() {
		this.fluidCooling.setClearError(true);
		this.logInfo(this.log, "Clearing Hydac Errors.");
		CompletableFuture.runAsync(() -> {
			this.fluidCooling.setClearError(false); //
			this.logInfo(this.log, "Clearing Hydac Errors done."); //
		}, CompletableFuture.delayedExecutor(5, TimeUnit.SECONDS));
	}

	private boolean isIdle() {
		return this.stateMachine.getCurrentState() == State.TEST_MODE_IDLE;
	}

	public void setTestRequestParams(TestMode.Request testRequestParams) {
		this.request = testRequestParams;
	}

	private void activateF2bHardwareReset() {
		// Block the second call, service people....
		if (this.isResetRunning) {
			return;
		}
		this.isResetRunning = true;
		this.setOutput(this.outputDisable24vF2b, true);
		this.resetTimeout.start(this.componentManager.getClock());
	}

	private void deactivateF2bHardwareReset() {
		if (this.isResetRunning && this.resetTimeout.elapsed(this.componentManager.getClock())) {
			this.setOutput(this.outputDisable24vF2b, false);
			this.isResetRunning = false;
		}
	}

	private void createInputChannels() {
		Arrays.stream(SystemInputChannels.values()).forEach(input -> {
			this.createInputChannel(input)//
					.onUpdate(newValue -> {
						Optional.ofNullable(input.getUpdateMethod())//
								.ifPresent(update -> update.accept(this));
					});
		});
	}

	private Channel<?> createInputChannel(SystemInputChannels input) {
		return input.getLevel() != null
				? this.createChannel(input.name(), input.getClazz(), input.getChannelKey(), input.getLevel(),
						input.getDebounceCycles(), input.getDebounceMode())
				: this.createChannel(input.name(), input.getClazz(), input.getChannelKey(), OpenemsType.BOOLEAN,
						input.getDebounceCycles(), input.getDebounceMode());
	}

	private void updateInputChannelValues() {
		for (var input : SystemInputChannels.values()) {
			Channel<Boolean> inputChannel = this.channel(channelIdUpperToCamel(input.name()));
			try {
				Channel<Boolean> channel = this.componentManager.getChannel(input.getAddress());
				var value = channel.value();
				if (!value.isDefined()) {
					inputChannel.setNextValue(null);
					continue;
				}
				final var result = value.get();
				inputChannel.setNextValue(input.isInvert() ? !result : result);
			} catch (IllegalArgumentException | OpenemsNamedException e) {
				inputChannel.setNextValue(null);
				continue;
			}
		}
	}

	private Channel<?> createChannel(String name, Class<?> clazz, String channelKey, Level level, int debounceCycles,
			Debounce debounceMode) {
		final io.openems.edge.common.channel.ChannelId channelId = debounceMode != null//
				? //
				new ChannelIdImpl(//
						name, //
						Doc.of(level)//
								.translationKey(clazz, channelKey))//
				: new ChannelIdImpl(//
						name, //
						Doc.of(level)//
								.debounce(debounceCycles, debounceMode)//
								.translationKey(clazz, channelKey));//
		return this.addChannel(channelId);
	}

	private Channel<?> createChannel(String name, Class<?> clazz, String channelKey, OpenemsType type,
			int debounceCycles, Debounce debounceMode) {
		final io.openems.edge.common.channel.ChannelId channelId = debounceMode != null//
				? //
				new ChannelIdImpl(//
						name, //
						Doc.of(type)//
								.translationKey(clazz, channelKey))//
				: new ChannelIdImpl(//
						name, //
						new BooleanDoc() //
								.debounce(debounceCycles, debounceMode)//
								.translationKey(clazz, channelKey));//
		return this.addChannel(channelId);
	}

	private void setUndefinedChannels(List<SystemInputChannels> inputs, List<Consumer<Boolean>> setters) {
		var hasNull = inputs.stream().map(this::isEnabled).noneMatch(Value::isDefined);
		setters.forEach(t -> t.accept(hasNull));
	}

	/**
	 * Proofs the input channels are defined and whether they are activated or not.
	 *
	 * @param input the IO mapped {@link SystemInputChannels}
	 * @return Boolean true-false if the value defined, or if the channel is not
	 *         defined null
	 */
	public Value<Boolean> isEnabled(SystemInputChannels input) {
		try {
			Channel<Boolean> channel = this.channel(channelIdUpperToCamel(input.name()));
			return channel.value();
		} catch (Exception e) {
			return null;
		}
	}

	protected void updateStatusSysOffChannels() {
		this.setUndefinedChannels(//
				List.of(SystemInputChannels.ENABLE_COUPLING_SWITCH, //
						SystemInputChannels.STATUS_SYS_OFF, //
						SystemInputChannels.SYS_SERVICE_SWITCH), //
				List.of(this::_setSystemSysOffUndefined, //
						this::_setSystemIosUndefined));//
	}

	protected void updateOverVoltageProtectionChannels() {
		this.setUndefinedChannels(//
				List.of(//
						SystemInputChannels.STATUS_SPD_CC_AC, //
						SystemInputChannels.STATUS_SPD_CCS, //
						SystemInputChannels.STATUS_SPD_INV, //
						SystemInputChannels.STATUS_SPD_CC_CI, //
						SystemInputChannels.STATUS_SPD_DC_BAT_1, //
						SystemInputChannels.STATUS_SPD_DC_BAT_2, //
						SystemInputChannels.STATUS_SPD_DC_BAT_3), //
				List.of(this::_setOverVoltageProtectionUndefined));
	}

	protected void updateDoorSwitchChannels() {
		this.setUndefinedChannels(//
				List.of(SystemInputChannels.STATUS_DOOR_CSYS, //
						SystemInputChannels.STATUS_DOOR_BAT_1, //
						SystemInputChannels.STATUS_DOOR_BAT_2, //
						SystemInputChannels.STATUS_DOOR_BAT_3), //
				List.of(this::_setDoorSwitchUndefined));
	}

	protected void updatePowerSupplyChannels() {
		this.setUndefinedChannels(//
				List.of(SystemInputChannels.BUFFERING_24V_F2B, //
						SystemInputChannels.STATUS_24V_PDU_CSYS, //
						SystemInputChannels.STATUS_24V_PDU_F2B_1, //
						SystemInputChannels.STATUS_24V_PDU_F2B_2, //
						SystemInputChannels.STATUS_24V_PDU_F2B_3, //
						SystemInputChannels.STATUS_24V_PSU_CSYS, //
						SystemInputChannels.STATUS_24V_PSU_F2B_1, //
						SystemInputChannels.STATUS_24V_PSU_F2B_2, //
						SystemInputChannels.STATUS_24V_PSU_F2B_3, //
						SystemInputChannels.STATUS_24V_UPS_CSYS, //
						SystemInputChannels.STATUS_24V_UPS_F2B_1, //
						SystemInputChannels.STATUS_24V_UPS_F2B_2, //
						SystemInputChannels.STATUS_24V_UPS_F2B_3 //
				), //
				List.of(this::_setPowerSupplyUndefined));
	}

	protected void updateNetworkDistributionChannels() {
		this.setUndefinedChannels(//
				List.of(SystemInputChannels.STATUS_SWITCH_F2B_1, //
						SystemInputChannels.STATUS_SWITCH_F2B_2, //
						SystemInputChannels.STATUS_SWITCH_F2B_3), //
				List.of(this::_setNetworkDistributionUndefined));
	}

	protected void updateContainerLightingChannels() {
		this.setUndefinedChannels(//
				List.of(SystemInputChannels.STATUS_LIGHTING), //
				List.of(this::_setContainerLightingUndefined));
	}

	protected void updateLeakMonitorChannels() {
		this.setUndefinedChannels(//
				List.of(SystemInputChannels.STATUS_LEAK_MONITOR_1, //
						SystemInputChannels.STATUS_LEAK_MONITOR_2), //
				List.of(this::_setLeakMonitorUndefined));
		final var leakMonitor1 = this.isEnabled(SystemInputChannels.STATUS_LEAK_MONITOR_1);
		final var leakMonitor2 = this.isEnabled(SystemInputChannels.STATUS_LEAK_MONITOR_2);
		this._setLeakMonitorFault(leakMonitor1.orElse(false) && leakMonitor2.orElse(false));
	}

	protected void updateSystemIosChannels() {
		this.setUndefinedChannels(//
				List.of(SystemInputChannels.STATUS_SYS_OFF, //
						SystemInputChannels.BUFFERING_24V_F2B, //
						SystemInputChannels.ENABLE_COUPLING_SWITCH//
				), //
				List.of(this::_setSystemIosUndefined));
	}

	private void updateSystemStatusDisplay() {
		this.setOutput(this.outputSsiWarning, this.hasWarnings());
		this.setOutput(this.outputSsiError, this.hasFaults());
		if (this.isStarted()) {
			this.setOutput(this.outputSsiRunning, true);
			this.setOutput(this.outputSsiRunningFlashing, false);
			return;
		}

		if (this.isStopped()) {
			this.setOutput(this.outputSsiRunning, false);
			this.setOutput(this.outputSsiRunningFlashing, false);
			return;
		}

		this.setOutput(this.outputSsiRunning, true);
		this.setOutput(this.outputSsiRunningFlashing, true);
	}

	/**
	 * Helper function to switch an output if it was not switched before.
	 *
	 * @param channelAddress the {@link DigitalOutput} channel address
	 * @param value          true to switch ON, false to switch OFF;
	 */
	public void setOutput(ChannelAddress channelAddress, boolean value) {
		if (channelAddress == null) {
			this.logWarn(this.log, "ChannelAddress is not defined yet");
			return;
		}
		try {
			WriteChannel<Boolean> channel = this.componentManager.getChannel(channelAddress);
			if (!channel.value().asOptional().equals(Optional.of(value))) {
				channel.setNextWriteValue(value);
			}
		} catch (IllegalArgumentException | OpenemsNamedException e) {
			this.logWarn(this.log,
					"Unable to update channel from ChannelAddress [" + channelAddress + "] " + e.getMessage());
		}
	}

	public List<BatteryFeneconF2bCluster> getBatteryClusters() {
		return this.batteries;
	}

	@Override
	public String debugLog() {
		return new StringBuilder() //
				.append(this.stateMachine.debugLog()) //
				.append("|Temperature:")//
				.append(this.temp.getTemperature())//
				.append("|Humidity:")//
				.append(this.temp.getRelativeHumidity())//
				.toString();
	}

	/**
	 * If all ess components are in error, then the storage system is in error.
	 *
	 * @return true if all esss are in error.
	 */
	public boolean areAllEssInFailure() {
		final var essList = this.getEsssList();
		return !essList.isEmpty()//
				&& essList.stream().allMatch(SymmetricEss::hasFaults);
	}

	/**
	 * Check if at least one ess components is in warning.
	 *
	 * @return true if at least one ess is in warning.
	 */
	public boolean isAtLeastOneEssInWarning() {
		return !this.getEsssList().isEmpty()//
				&& this.getEsssList().stream().anyMatch(SymmetricEss::hasWarnings);
	}

	/**
	 * Check if at least one ess components is in fault.
	 *
	 * @return true if at least one ess is in fault.
	 */
	public boolean isAtLeastOneEssInFault() {
		return !this.getEsssList().isEmpty()//
				&& this.getEsssList().stream().anyMatch(SymmetricEss::hasFaults);
	}

	/**
	 * Check if at least one ess components is not started.
	 *
	 * @return true if at least one ess is not started.
	 */
	public boolean isAtLeastOneEssNotStarted() {
		return !this.getEsssList().isEmpty()//
				&& this.getEsssList().stream()//
						.filter(StartStoppable.class::isInstance)//
						.map(StartStoppable.class::cast)//
						.anyMatch(t -> !t.isStarted());

	}

	/**
	 * Update the fire alarm system channels, ex; if the modbus connection between
	 * FEMS and fire alarm system interrupted.
	 */
	public void updateFireAlarmSystemChannels() {
		try {
			this._setFemsToFireAlarmSysCommunicationFailure(this.fireAlarmSystem.getModbusCommunicationFailed());
			setIfChanged(this.getFireAlarmSystemFaultChannel(), this.fireAlarmSystem.hasFaults());
			setIfChanged(this.getFireAlarmSystemWarningChannel(), this.fireAlarmSystem.hasWarnings());
		} catch (OpenemsNamedException e) {
			this.logWarn(this.log, "The cooling unit temperatures can not be updated" + e.getMessage());
		}
	}

	@Override
	public List<Channel<?>> defineChannelsForErrorAcknowledge() {
		var channels = new ArrayList<Channel<?>>(//
				List.of(//
						this.getLeakMonitorFaultChannel(), //
						this.getAllEssFaultSystemStartChannel(), //
						this.getAllEssFaultInOperationChannel() //
				));
		if (!this.isStatusSysOff()) {
			channels.add(this.getSystemShutdownFaultChannel());
			channels.add(this.getUnclearShutdownChannel());
			channels.add(this.getServiceSwitchPressedInOperationChannel());
		}
		if (!this.isCouplingSwitchOff()) {
			channels.add(this.getCouplingSwitchFaultInOperationChannel());
		}

		return channels;
	}

	@Override
	public void executeErrorAcknowledgeRpc(JsonApiBuilder builder,
			EndpointRequestType<EmptyObject, EmptyObject> request) {
		builder.handleRequest(request, endpoint -> endpoint.setGuards(EdgeGuards.roleIsAtleast(ADMIN)), //
				call -> {
					var channels = this.defineChannelsForErrorAcknowledge();
					channels.forEach(c -> c.setNextValue(null));
					this.getEsssList().forEach(ess -> {
						if (ess instanceof EssErrorAcknowledge genericEss) {
							genericEss.executeErrorAcknowledge();
						}
					});
					return EmptyObject.INSTANCE;
				});
	}
}