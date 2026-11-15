package io.openems.edge.system.fenecon.industrial.m.external.coolingunit;

import java.util.List;
import java.util.OptionalInt;
import java.util.concurrent.CopyOnWriteArrayList;

import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ConfigurationPolicy;
import org.osgi.service.component.annotations.Deactivate;
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
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.batteryinverter.refu.store88k.BatteryInverterRefuStore88k;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.WriteChannel;
import io.openems.edge.common.component.AbstractOpenemsComponent;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.event.EdgeEventConstants;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "System.Fenecon.Industrial.M.Airconditioning", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE //
)
@EventTopics({ //
		EdgeEventConstants.TOPIC_CYCLE_AFTER_PROCESS_IMAGE, //
})
public class AirconditioningImpl extends AbstractOpenemsComponent
		implements Airconditioning, OpenemsComponent, EventHandler {

	private final Logger log = LoggerFactory.getLogger(AirconditioningImpl.class);
	private Config config;

	private ChannelAddress bmwCoolingUnitChannelAddress;
	private ChannelAddress airconditioningChannelAddress;

	private final List<BatteryInverterRefuStore88k> batteryInverters = new CopyOnWriteArrayList<>();

	public AirconditioningImpl() {
		super(//
				OpenemsComponent.ChannelId.values(), //
				BatteryInverterRefuStore88k.ChannelId.values(), //
				Airconditioning.ChannelId.values()//
		);
	}

	@Reference
	private ComponentManager componentManager;

	@Reference
	private ConfigurationAdmin cm;

	@Reference(//
			policy = ReferencePolicy.DYNAMIC, //
			policyOption = ReferencePolicyOption.GREEDY, //
			cardinality = ReferenceCardinality.MULTIPLE, //
			target = "(&(enabled=true)(!(service.factoryPid=Battery-Inverter.Refu.REFUstore88k)))")
	protected synchronized void addBatteryInverter(BatteryInverterRefuStore88k batteryInverter) {
		this.batteryInverters.add(batteryInverter);
	}

	protected synchronized void removeBatteryInverter(BatteryInverterRefuStore88k batteryInverter) {
		this.batteryInverters.remove(batteryInverter);
	}

	@Activate
	protected void activate(ComponentContext context, Config config) throws OpenemsNamedException {
		this.config = config;
		super.activate(context, config.id(), config.alias(), config.enabled());

		this.bmwCoolingUnitChannelAddress = ChannelAddress.fromString(config.coolingUnitInput());
		this.airconditioningChannelAddress = ChannelAddress.fromString(config.coolingUnitOutput());

		// update filter for 'BatteryInverters'
		if (OpenemsComponent.updateReferenceFilter(this.cm, this.servicePid(), "BatteryInverter",
				config.batteryInverters())) {
			return;
		}
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
		case EdgeEventConstants.TOPIC_CYCLE_AFTER_PROCESS_IMAGE:
			try {
				this.runAirConditioning();
			} catch (OpenemsNamedException e) {
				e.printStackTrace();
			}
			break;

		}
	}

	private void runAirConditioning() throws OpenemsNamedException {

		// Get the value of the BMW cooling unit IO
		Channel<Boolean> bmwCoolingChannel = this.componentManager.getChannel(this.bmwCoolingUnitChannelAddress);
		boolean isBmwCoolingUnitOn = bmwCoolingChannel.value().getOrError();

		// Get the Max temp for the battery Inverters
		var maxTempOfInverters = this.getMaxTemp();
		var tempCrossedThreshold = false;

		if (maxTempOfInverters.isPresent()) {
			this.setMaxBatteryInverterTemp(maxTempOfInverters.getAsInt());
			tempCrossedThreshold = maxTempOfInverters.getAsInt() > this.config.thresholdTemperature();

		}

		this.setValve(isBmwCoolingUnitOn || tempCrossedThreshold);
	}

	/**
	 * Helper function to switch an output if it was not switched before.
	 *
	 * @param value true to switch ON, false to switch OFF;
	 * @throws OpenemsNamedException    on error
	 * @throws IllegalArgumentException on error
	 */
	private void setValve(Boolean value) throws IllegalArgumentException, OpenemsNamedException {

		try {
			WriteChannel<Boolean> airConditioningChannel = this.componentManager
					.getChannel(this.airconditioningChannelAddress);
			var airconditioningValueOpt = airConditioningChannel.value().asOptional();
			if (!airconditioningValueOpt.isPresent() || airconditioningValueOpt.get() != value) {
				this.logInfo(this.log, "Set output [" + airConditioningChannel.address() + "] " + value + ".");
				airConditioningChannel.setNextWriteValue(value);
			}
		} catch (OpenemsException e) {
			this.logError(this.log,
					"Unable to set output: [" + this.airconditioningChannelAddress + "] " + e.getMessage());
		}
	}

	/**
	 * Return the Max temperature for the list of battery inverters.
	 * 
	 * @return OptionalInt of max temperature.
	 */
	private OptionalInt getMaxTemp() {
		return this.batteryInverters.stream()//
				.filter(bi -> bi.getInverterTemperature().isDefined())//
				.mapToInt(bi -> bi.getInverterTemperature().get())//
				.max();
	}

}