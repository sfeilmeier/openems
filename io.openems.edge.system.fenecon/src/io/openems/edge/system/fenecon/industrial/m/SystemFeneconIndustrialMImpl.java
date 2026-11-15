package io.openems.edge.system.fenecon.industrial.m;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.groupingBy;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
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
import io.openems.common.types.ChannelAddress;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.common.channel.BooleanWriteChannel;
import io.openems.edge.common.component.AbstractOpenemsComponent;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.event.EdgeEventConstants;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.ess.api.MetaEss;
import io.openems.edge.ess.api.SymmetricEss;
import io.openems.edge.system.fenecon.industrial.m.enums.RequestStatus;
import io.openems.edge.system.fenecon.industrial.m.statemachine.Context;
import io.openems.edge.system.fenecon.industrial.m.statemachine.StateMachine;
import io.openems.edge.system.fenecon.industrial.m.statemachine.StateMachine.State;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "System.Fenecon.Industrial.M", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE //
)
@EventTopics({ //
		EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE, //
})
public class SystemFeneconIndustrialMImpl extends AbstractOpenemsComponent
		implements SystemFeneconIndustrialM, OpenemsComponent, StartStoppable, EventHandler {

	private static final int DEFAULT_MAX_CELL_TEMPERATURE = 0; // [°C]

	private final Logger log = LoggerFactory.getLogger(SystemFeneconIndustrialMImpl.class);
	private final StateMachine stateMachine = new StateMachine(State.UNDEFINED);

	private final List<Battery> batteries = new ArrayList<>();

	private Config config = null;
	private BooleanWriteChannel coolingUnitEnableChannel;
	private StartStop startStopTarget = StartStop.UNDEFINED;

	@Reference
	private ConfigurationAdmin cm;

	@Reference
	private ComponentManager componentManager;

	@Reference
	private SymmetricEss ess;

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

	public SystemFeneconIndustrialMImpl() {
		super(//
				OpenemsComponent.ChannelId.values(), //
				StartStoppable.ChannelId.values(), //
				SystemFeneconIndustrialM.ChannelId.values()//
		);
	}

	@Activate
	private void activate(ComponentContext context, Config config) throws OpenemsNamedException {
		super.activate(context, config.id(), config.alias(), config.enabled());
		if (!this.applyConfig(context, config)) {
			return;
		}
	}

	@Modified
	private void modified(ComponentContext context, Config config) throws OpenemsNamedException {
		super.modified(context, config.id(), config.alias(), config.enabled());
		if (!this.applyConfig(context, config)) {
			return;
		}
	}

	private boolean applyConfig(ComponentContext context, Config config) throws OpenemsNamedException {
		this.coolingUnitEnableChannel = this.componentManager
				.getChannel(ChannelAddress.fromString(config.coolingUnitEnable()));

		return Stream.of(//
				OpenemsComponent.updateReferenceFilter(this.cm, this.servicePid(), "ess", config.ess_id()), //
				OpenemsComponent.updateReferenceFilter(this.cm, this.servicePid(), "Battery", config.battery_ids()))
				.anyMatch(t -> t);

	}

	@Override
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
			try {
				this.handleStateMachine();
				this.applyBatteryCooling(this.batteries);
			} catch (Exception e) {
				this.logWarn(this.log, "Battery cooling can be applied" + e.getMessage());
			}
		}
		}
	}

	private List<SymmetricEss> getEsssList() {
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
	 * Calculate effective StartStop status of {@link SymmetricEss}.
	 *
	 * @param esss the list of {@link SymmetricEss}
	 * @return {@link StartStop} the start-stop
	 */
	private static StartStop calculateStartStop(List<SymmetricEss> esss) {
		final var essMap = esss.stream() //
				.filter(StartStoppable.class::isInstance) //
				.map(StartStoppable.class::cast) //
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

	/**
	 * Handles the State-Machine.
	 */
	private void handleStateMachine() {
		// Store the current State
		this._setStateMachine(this.stateMachine.getCurrentState());

		// Initialize 'Start-Stop' Channel
		this._setStartStop(StartStop.UNDEFINED);

		try {
			// Prepare Context
			var context = new Context(this, this.ess, calculateStartStop(this.getEsssList()));

			this.stateMachine.run(context);
			this._setRunFailed(false);
		} catch (OpenemsNamedException e) {
			this._setRunFailed(true);
			this.logError(this.log, "StateMachine failed: " + e.getMessage());
		}
	}

	@Override
	public void setStartStop(StartStop value) {
		this.startStopTarget = value;
	}

	/**
	 * Gets the target Start/Stop mode from config or StartStop-Channel.
	 *
	 * @return {@link StartStop}
	 */
	public StartStop getStartStopTarget() {
		return switch (this.config.startStop()) {
		case AUTO -> this.startStopTarget;
		case START -> StartStop.START;
		case STOP -> StartStop.STOP;
		};
	}

	private void applyBatteryCooling(List<Battery> batteries) throws Exception {
		var maxTemperatures = new ArrayList<Integer>();

		switch (this.config.coolingUnitMode()) {
		case DISABLED -> {
			this.coolingUnitEnableChannel.setNextWriteValue(false);
			this._setRequestStatus(RequestStatus.OFF);
		}
		case ENABLED -> {
			this.coolingUnitEnableChannel.setNextWriteValue(true);
			this._setRequestStatus(RequestStatus.ON);
		}
		case AUTO -> {
			for (var battery : batteries) {
				maxTemperatures.add(battery.isStarted() //
						? battery.getMaxCellTemperature().orElse(0)//
						: DEFAULT_MAX_CELL_TEMPERATURE);
			}

			var coolingType = this.config.coolingType();
			final var maxTemperature = Collections.max(maxTemperatures);
			final var requestStatus = this.getRequestStatus().asEnum();
			if (maxTemperature >= coolingType.upperThreshold && requestStatus == RequestStatus.OFF) {
				this.coolingUnitEnableChannel.setNextWriteValue(true);
				this._setRequestStatus(RequestStatus.ON);
				return;
			}

			if (maxTemperature <= coolingType.lowerThreshold && requestStatus == RequestStatus.ON) {
				this.coolingUnitEnableChannel.setNextWriteValue(false);
				this._setRequestStatus(RequestStatus.OFF);
				return;
			}
		}
		}
	}

	@Override
	public String debugLog() {
		return new StringBuilder() //
				.append(this.stateMachine.getCurrentState()) //
				.append("|")//
				.append("CoolingUnit: ")//
				.append(this.getRequestStatus().asOptionString()) //
				.toString();
	}

}
