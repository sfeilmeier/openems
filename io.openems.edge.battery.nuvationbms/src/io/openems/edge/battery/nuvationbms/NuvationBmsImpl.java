package io.openems.edge.battery.nuvationbms;

import static io.openems.edge.bridge.modbus.api.ElementToChannelConverters.DIRECT_1_TO_1;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverters.SCALE_FACTOR_MINUS_1;
import static io.openems.edge.common.event.EdgeEventConstants.TOPIC_CYCLE_AFTER_PROCESS_IMAGE;
import static io.openems.edge.common.event.EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE;
import static org.osgi.service.component.annotations.ConfigurationPolicy.REQUIRE;
import static org.osgi.service.component.annotations.ReferenceCardinality.MANDATORY;
import static org.osgi.service.component.annotations.ReferencePolicy.STATIC;
import static org.osgi.service.component.annotations.ReferencePolicyOption.GREEDY;

import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;

import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventHandler;
import org.osgi.service.event.propertytypes.EventTopics;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.common.channel.AccessMode;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.referencetarget.GenerateTargetsFromReferences;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.nuvationbms.statemachine.Context;
import io.openems.edge.battery.nuvationbms.statemachine.StateMachine;
import io.openems.edge.battery.nuvationbms.statemachine.StateMachine.State;
import io.openems.edge.battery.protection.BatteryVoltageProtection;
import io.openems.edge.battery.protection.BatteryVoltageProtectionLimits;
import io.openems.edge.battery.protection.BatteryVoltageProtectionLimits.BatteryVoltageSpecification;
import io.openems.edge.bridge.modbus.api.BridgeModbus;
import io.openems.edge.bridge.modbus.api.ElementToChannelConverter;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.bridge.modbus.sunspec.SunSpecPoint;
import io.openems.edge.bridge.modbus.sunspec.battery.AbstractSunSpecBattery;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.EnumWriteChannel;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.modbusslave.ModbusSlave;
import io.openems.edge.common.modbusslave.ModbusSlaveNatureTable;
import io.openems.edge.common.modbusslave.ModbusSlaveTable;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.taskmanager.Priority;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "Battery.Nuvationbms", //
		immediate = true, //
		configurationPolicy = REQUIRE)
@EventTopics({ //
		TOPIC_CYCLE_BEFORE_PROCESS_IMAGE, //
		TOPIC_CYCLE_AFTER_PROCESS_IMAGE, //
})
@GenerateTargetsFromReferences("Modbus")
public class NuvationBmsImpl extends AbstractSunSpecBattery implements NuvationBms, Battery, ModbusComponent,
		EventHandler, ModbusSlave, OpenemsComponent, StartStoppable, BatteryVoltageProtection {

	private static final int READ_FROM_MODBUS_BLOCK = 0;
	private static final int INNER_RESISTANCE = 150; // [mOhm]
	private static final int CALIBRATION_THRESHOLD = 10; // any jump more then 10 percent, set a warning.
	private static final List<SunSpecModelEntry> ACTIVE_MODELS = List.of(
			SunSpecModelEntry.create(NuvationSunSpecModel.S_801) //
					.setPriority(Priority.HIGH) //
					.setRequired(true) //
					.build(), //
			SunSpecModelEntry.create(NuvationSunSpecModel.S_802) //
					.setPriority(Priority.HIGH) //
					.setRequired(true) //
					.build(), //
			SunSpecModelEntry.create(NuvationSunSpecModel.S_803) //
					.setPriority(Priority.HIGH) //
					.setRequired(true) //
					.build() //
	);

	private final BatteryVoltageProtectionLimits<NuvationBmsImpl> voltageProtectionLimits;
	private final StateMachine stateMachine = new StateMachine(State.UNDEFINED);
	private final Logger log = LoggerFactory.getLogger(NuvationBmsImpl.class);
	private final AtomicReference<StartStop> startStopTarget = new AtomicReference<>(StartStop.UNDEFINED);

	private Config config = null;

	@Reference
	private ConfigurationAdmin cm;

	@Reference
	private ComponentManager componentManager;

	@Override
	@Reference(//
			policy = STATIC, policyOption = GREEDY, cardinality = MANDATORY, //
			target = "(&(id=${config.modbus_id})(enabled=true))")
	protected void setModbus(BridgeModbus modbus) {
		super.setModbus(modbus);
	}

	public NuvationBmsImpl() {
		super(//
				ACTIVE_MODELS, //
				OpenemsComponent.ChannelId.values(), //
				ModbusComponent.ChannelId.values(), //
				Battery.ChannelId.values(), //
				StartStoppable.ChannelId.values(), //
				BatteryVoltageProtection.ChannelId.values(), //
				NuvationBms.ChannelId.values() //
		);
		this._setInnerResistance(INNER_RESISTANCE);
		this.voltageProtectionLimits = new BatteryVoltageProtectionLimits<>(getBatteryVoltageSpecification(), this);
	}

	@Activate
	private void activate(ComponentContext context, Config config) throws OpenemsException {
		this.config = config;
		super.activate(context, config.id(), config.alias(), config.enabled(), config.modbusUnitId(),
				READ_FROM_MODBUS_BLOCK);
	}

	@Override
	@Deactivate
	protected void deactivate() {
		super.deactivate();
	}

	@Override
	public ModbusSlaveTable getModbusSlaveTable(AccessMode accessMode) {
		return new ModbusSlaveTable(//
				OpenemsComponent.getModbusSlaveNatureTable(accessMode), //
				Battery.getModbusSlaveNatureTable(accessMode), //
				ModbusSlaveNatureTable.of(NuvationBms.class, accessMode, 100) //
						.build());
	}

	@Override
	public String debugLog() {
		return Battery.generateDebugLog(this, this.stateMachine);
	}

	@Override
	public void handleEvent(Event event) {
		if (!this.isEnabled()) {
			return;
		}
		switch (event.getTopic()) {
		case TOPIC_CYCLE_BEFORE_PROCESS_IMAGE -> {
			if (this.isSunSpecInitializationCompleted() && this.areRequiredModelsRead()) {
				this.voltageProtectionLimits.updateLimits();
			}
		}
		case TOPIC_CYCLE_AFTER_PROCESS_IMAGE -> this.handleStateMachine();
		}
	}

	/**
	 * Handles the State-Machine.
	 */
	private void handleStateMachine() {
		this._setStateMachine(this.stateMachine.getCurrentState());

		// Initialize 'Start-Stop' Channel
		this._setStartStop(StartStop.UNDEFINED);

		try {
			var context = new Context(this, this.componentManager.getClock());

			// Call the StateMachine
			this.stateMachine.run(context);
			this._setRunFailed(false);

		} catch (OpenemsNamedException e) {
			this._setRunFailed(true);
			this.logError(this.log, "StateMachine failed: " + e.getMessage());
		}
	}

	/**
	 * Maps a SunSpecPoint's channel to a target channel by applying a conversion
	 * function.
	 * 
	 * <p>
	 * This method retrieves the {@link Channel} associated with the given
	 * {@link SunSpecPoint}. If the channel exists, it registers a listener using
	 * {@code onSetNextValue}, which converts each received value using the provided
	 * {@link ElementToChannelConverter} and updates the specified target channel.
	 * </p>
	 * 
	 * @param targetChannel The {@link io.openems.edge.common.channel.ChannelId} of
	 *                      the target channel where the converted values will be
	 *                      set.
	 * @param converter     The {@link ElementToChannelConverter} responsible for
	 *                      transforming the SunSpecPoint value into a format
	 *                      suitable for the target channel.
	 * @param point         The {@link SunSpecPoint} whose channel is being mapped
	 *                      to the target channel.
	 * 
	 * @see #getSunSpecChannel(SunSpecPoint)
	 * @see Channel#onSetNextValue(Consumer)
	 */
	protected void mapPointToChannel(io.openems.edge.common.channel.ChannelId targetChannel,
			ElementToChannelConverter converter, SunSpecPoint point) {
		try {
			var channel = this.getSunSpecChannelOrError(point);
			channel.onSetNextValue(value -> {
				var convertedValue = converter.elementToChannel(value.get());
				this.channel(targetChannel).setNextValue(convertedValue);
			});
		} catch (OpenemsException e) {
			this.logError(this.log, "Failed to map point to channel: " + e.getMessage());
		}
	}

	/**
	 * Mark SunSpec initialization completed; this takes some time at startup. Set
	 * all the channels from the Battery api.
	 */
	@Override
	protected void onSunSpecInitializationCompleted() {

		if (!this.areRequiredModelsRead()) {
			this.reinitializeSunSpecChannels();
			return;
		}

		this.mapPointToChannel(//
				Battery.ChannelId.SOC, //
				DIRECT_1_TO_1, //
				NuvationSunSpecModel.S801.SO_C);

		this.registerSocJumps(NuvationSunSpecModel.S801.SO_C);

		this.mapPointToChannel(//
				Battery.ChannelId.CAPACITY, //
				DIRECT_1_TO_1, //
				NuvationSunSpecModel.S801.W_H_RTG);

		this.mapPointToChannel(//
				Battery.ChannelId.SOH, //
				DIRECT_1_TO_1, //
				NuvationSunSpecModel.S802.SO_H);

		this.mapPointToChannel(//
				Battery.ChannelId.VOLTAGE, //
				DIRECT_1_TO_1, //
				NuvationSunSpecModel.S802.VOL);

		this.mapPointToChannel(//
				Battery.ChannelId.CHARGE_MAX_CURRENT, //
				DIRECT_1_TO_1, //
				NuvationSunSpecModel.S802.MAX_BAT_A_CHA);

		this.mapPointToChannel(//
				Battery.ChannelId.DISCHARGE_MAX_CURRENT, //
				DIRECT_1_TO_1, //
				NuvationSunSpecModel.S802.MAX_BAT_A_DISCHA);

		this.mapPointToChannel(//
				Battery.ChannelId.CURRENT, //
				SCALE_FACTOR_MINUS_1, //
				NuvationSunSpecModel.S803.B_TOT_D_C_CUR);

		this.mapPointToChannel(//
				Battery.ChannelId.MAX_CELL_TEMPERATURE, //
				DIRECT_1_TO_1, //
				NuvationSunSpecModel.S803.B_MAX_MOD_TMP);

		this.mapPointToChannel(//
				Battery.ChannelId.MIN_CELL_TEMPERATURE, //
				DIRECT_1_TO_1, //
				NuvationSunSpecModel.S803.B_MIN_MOD_TMP);

		this.mapPointToChannel(//
				Battery.ChannelId.MAX_CELL_VOLTAGE, //
				DIRECT_1_TO_1, //
				NuvationSunSpecModel.S803.B_MAX_CELL_VOL);

		this.mapPointToChannel(//
				Battery.ChannelId.MIN_CELL_VOLTAGE, //
				DIRECT_1_TO_1, //
				NuvationSunSpecModel.S803.B_MIN_CELL_VOL);

	}

	/**
	 * If the battery's state of charge (SoC) fluctuates, calibration is active.
	 * This occurs when the battery is first initialized and requires a full charge
	 * and discharge cycle before SoC calculation begins. During this period, SoC
	 * calibration remains active.
	 *
	 * @param soC the Soc value from the battery
	 */
	private void registerSocJumps(NuvationSunSpecModel.S801 soC) {
		this.getSunSpecChannel(soC)//
				.ifPresent(ch -> ch.onChange((oldValue, newValue) -> {
					if (!oldValue.isDefined() || !newValue.isDefined()) {
						this._setSocCalibrationActive(false);
						return;
					}
					var oldSoc = (float) oldValue.get();
					var newSoc = (float) newValue.get();
					var isCalibrationActive = Math.abs(newSoc - oldSoc) > CALIBRATION_THRESHOLD;
					this._setSocCalibrationActive(isCalibrationActive);
				}));
	}

	/**
	 * Gets the Battery State.
	 * 
	 * @return {@link NuvationSunSpecModel.S802BatSt}
	 */
	public NuvationSunSpecModel.S802BatSt getBatteryState() {
		return this.getSunSpecChannel(NuvationSunSpecModel.S802.BAT_ST) //
				.map(c -> (NuvationSunSpecModel.S802BatSt) c.value().asEnum()) //
				.orElse(NuvationSunSpecModel.S802BatSt.UNDEFINED);
	}

	/**
	 * Sets the Battery Operation State.
	 * 
	 * @param setOp {@link NuvationSunSpecModel.S802BSetOperation }
	 */
	public void setBatteryOperation(NuvationSunSpecModel.S802BSetOperation setOp) {
		var channel = this.<EnumWriteChannel>getSunSpecChannel(NuvationSunSpecModel.S802.B_SET_OPERATION).orElse(null);
		if (channel == null) {
			return;
		}
		try {
			channel.setNextWriteValue(setOp);
		} catch (OpenemsNamedException e) {
			this.log.info("Cannot Set the Battery operation to : " + setOp.getName());
		}
	}

	@Override
	public void setStartStop(StartStop value) {
		if (this.startStopTarget.getAndSet(value) != value) {
			// Set only if value changed
			this.stateMachine.forceNextState(State.UNDEFINED);
		}
	}

	/**
	 * Gets the target Start/Stop mode from config or StartStop-Channel.
	 *
	 * @return {@link StartStop}
	 */
	public StartStop getStartStopTarget() {
		return switch (this.config.startStop()) {
		case AUTO -> this.startStopTarget.get();
		case START -> StartStop.START;
		case STOP -> StartStop.STOP;
		};
	}

	private static BatteryVoltageSpecification getBatteryVoltageSpecification() {
		final var cells = 18;
		final var modules = 16;
		final var maximumCellVoltageLimit = 4180;
		final var minimumCellVoltageLimit = 3000;
		final var maximumCellVoltageOperationLimit = 4083;
		final var minimumCellVoltageOperationLimit = 3386;
		final var maximumChargeVoltage = 1176; // cells * modules * maximumCellVoltageOperationLimit mv
		final var minimumDischargeVoltage = 975; // cells * modules * minimumCellVoltageOperationLimit mv

		return new BatteryVoltageSpecification(cells, modules, maximumCellVoltageLimit, minimumCellVoltageLimit,
				maximumCellVoltageOperationLimit, minimumCellVoltageOperationLimit, maximumChargeVoltage,
				minimumDischargeVoltage);
	}

}
