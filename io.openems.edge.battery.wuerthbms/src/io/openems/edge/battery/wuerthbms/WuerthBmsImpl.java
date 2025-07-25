package io.openems.edge.battery.wuerthbms;

import static io.openems.common.types.OpenemsType.INTEGER;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.function.Supplier;

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

import io.openems.common.channel.AccessMode;
import io.openems.common.channel.Unit;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.types.OpenemsType;
import io.openems.common.types.OptionsEnum;
import io.openems.common.types.SemanticVersion;
import io.openems.common.utils.FunctionUtils;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.protection.BatteryProtection;
import io.openems.edge.battery.protection.BatteryVoltageProtection;
import io.openems.edge.battery.protection.BatteryVoltageProtectionLimits;
import io.openems.edge.battery.protection.BatteryVoltageProtectionLimits.BatteryVoltageSpecification;
import io.openems.edge.battery.wuerthbms.enums.CellBalancingState;
import io.openems.edge.battery.wuerthbms.enums.FirmwareVersion;
import io.openems.edge.battery.wuerthbms.statemachine.Context;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine.State;
import io.openems.edge.battery.wuerthbms.version.WuerthVersion109Protocol;
import io.openems.edge.bridge.modbus.api.AbstractOpenemsModbusComponent;
import io.openems.edge.bridge.modbus.api.BridgeModbus;
import io.openems.edge.bridge.modbus.api.ElementToChannelConverter;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.bridge.modbus.api.ModbusProtocol;
import io.openems.edge.bridge.modbus.api.element.ModbusElement;
import io.openems.edge.bridge.modbus.api.element.UnsignedWordElement;
import io.openems.edge.bridge.modbus.api.task.FC4ReadInputRegistersTask;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.ChannelId.ChannelIdImpl;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.internal.OpenemsTypeDoc;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.event.EdgeEventConstants;
import io.openems.edge.common.modbusslave.ModbusSlave;
import io.openems.edge.common.modbusslave.ModbusSlaveNatureTable;
import io.openems.edge.common.modbusslave.ModbusSlaveTable;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.taskmanager.Priority;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "Battery.WuerthBms", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE)
@EventTopics({ //
		EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE, //
		EdgeEventConstants.TOPIC_CYCLE_AFTER_PROCESS_IMAGE //
})
public class WuerthBmsImpl extends AbstractOpenemsModbusComponent implements WuerthBms, ModbusComponent,
		OpenemsComponent, Battery, BatteryVoltageProtection, EventHandler, ModbusSlave, StartStoppable {

	public record BatteryValues(int soc, int voltage, int chargeMaxVoltage, int dischargeMinVoltage) {
	}

	private static final SemanticVersion OUTDATED_VERSION = new SemanticVersion(1, 0, 9);
	private static final int MAX_16BIT_UNSIGNED_INT = 65535;
	private static final int CAPACITY = 161_100; // [Wh]

	private final Logger log = LoggerFactory.getLogger(WuerthBmsImpl.class);
	private final AtomicReference<StartStop> startStopTarget = new AtomicReference<>(StartStop.UNDEFINED);
	private final AtomicBoolean allowBatteryReset = new AtomicBoolean(true);
	private final StateMachine stateMachine = new StateMachine(State.UNDEFINED);
	private BatteryVoltageProtectionLimits<WuerthBmsImpl> voltageProtectionLimits;

	private Config config = null;
	private BatteryProtection batteryProtection = null;

	@Reference
	private ConfigurationAdmin cm;

	@Reference
	private ComponentManager componentManager;

	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	protected void setModbus(BridgeModbus modbus) {
		super.setModbus(modbus);
	}

	/**
	 * Record for dynamically generated channels. Can be extended in future (e.g.
	 * text, listener).
	 *
	 * @param suffix the name of the channel in UPPERCASE_UNDERSCORE
	 * @param unit   the unit.
	 */
	public record DynamicChannel(String suffix, Unit unit) {
	}

	public WuerthBmsImpl() {
		super(//
				OpenemsComponent.ChannelId.values(), //
				ModbusComponent.ChannelId.values(), //
				Battery.ChannelId.values(), //
				StartStoppable.ChannelId.values(), //
				BatteryProtection.ChannelId.values(), //
				BatteryVoltageProtection.ChannelId.values(), //
				WuerthBms.ChannelId.values() //
		);
		this.registerResetBatteryListeners();
		this._setCapacity(CAPACITY);
	}

	@Activate
	private void activate(ComponentContext context, Config config) throws OpenemsException {
		this.config = config;
		if (super.activate(context, config.id(), config.alias(), config.enabled(), config.modbusUnitId(), this.cm,
				"Modbus", config.modbus_id())) {
			return;
		}
		this.batteryProtection = BatteryProtection.create(this)//
				.applyBatteryProtectionDefinition(new WuerthBatteryProtectionDefinition(), this.componentManager)
				.build();
	}

	@Modified
	private void modified(ComponentContext context, Config config) throws OpenemsException {
		this.config = config;
		if (super.modified(context, config.id(), config.alias(), config.enabled(), config.modbusUnitId(), this.cm,
				"Modbus", config.modbus_id())) {
			return;
		}
		this.batteryProtection = BatteryProtection.create(this)//
				.applyBatteryProtectionDefinition(new WuerthBatteryProtectionDefinition(), this.componentManager)
				.build();
	}

	@Deactivate
	protected void deactivate() {
		super.deactivate();
	}

	@Override
	public String debugLog() {
		return Battery.generateDebugLog(this, this.stateMachine);
	}

	@Override
	public void setStartStop(StartStop value) {
		if (this.startStopTarget.getAndSet(value) != value) {
			// Set only if value changed
			this.stateMachine.forceNextState(State.UNDEFINED);
		}
	}

	@Override
	public StartStop getStartStopTarget() {
		return switch (this.config.startStop()) {
		case AUTO -> this.startStopTarget.get();
		case START -> StartStop.START;
		case STOP -> StartStop.STOP;
		};
	}

	@Override
	public ModbusSlaveTable getModbusSlaveTable(AccessMode accessMode) {
		return new ModbusSlaveTable(//
				OpenemsComponent.getModbusSlaveNatureTable(accessMode), //
				Battery.getModbusSlaveNatureTable(accessMode), //
				ModbusSlaveNatureTable.of(WuerthBms.class, accessMode, 100) //
						.build());
	}

	@Override
	public void handleEvent(Event event) {
		if (!this.isEnabled()) {
			return;
		}

		switch (event.getTopic()) {
		case EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE -> {
			this.batteryProtection.apply();
			if (this.voltageProtectionLimits != null) {
				this.voltageProtectionLimits.updateLimits();
			}
		}
		case EdgeEventConstants.TOPIC_CYCLE_AFTER_PROCESS_IMAGE -> this.handleStateMachine();
		}
	}

	/**
	 * Handles the State-Machine.
	 */
	private void handleStateMachine() {
		this.channel(WuerthBms.ChannelId.STATE_MACHINE).setNextValue(this.stateMachine.getCurrentState());

		// Initialize 'Start-Stop' Channel
		this._setStartStop(StartStop.UNDEFINED);

		try {
			var context = new Context(this, this.componentManager.getClock());

			// Call the StateMachine
			this.stateMachine.run(context);
			this.channel(WuerthBms.ChannelId.RUN_FAILED).setNextValue(false);

		} catch (OpenemsNamedException e) {
			this.channel(WuerthBms.ChannelId.RUN_FAILED).setNextValue(true);
			this.logError(this.log, "StateMachine failed: " + e.getMessage());
		}
	}

	@Override
	protected ModbusProtocol defineModbusProtocol() {
		return switch (this.config.version()) {
		case WUERTH_VERSION_1_0_9 -> WuerthVersion109Protocol.getProtocol(this);
		};
	}

	protected synchronized void updateSoc(Value<Integer> batSoc) {
		if (!batSoc.isDefined()) {
			return;
		}
		var value = batSoc.get();
		if (value == MAX_16BIT_UNSIGNED_INT) {
			this._setSoc(null);
			return;
		}
		// limit to 0 - 100 %
		value = Math.max(0, Math.min(100, value));

		if (value == 96) {
			value = 95;
		}
		if (value == 4) {
			value = 5;
		}
		this._setSoc(value);
	}

	/**
	 * Helper Method that handles a software version check. Sets
	 * {@link WuerthBms.ChannelId#SOFTWARE_VERSION_OUTDATED}
	 */
	public void updateSoftwareVersionOutdated() {
		this._setSoftwareVersionOutdated(//
				isSoftwareOutdated(//
						this::getSoftwareVersionMajor, //
						this::getSoftwareVersionMinor, //
						this::getSoftwareVersionPatch));
	}

	/**
	 * Checks if the Software Version provided by Suppliers is Outdated.
	 *
	 * @param valMajor {@link Supplier} for major Software Version
	 * @param valMinor {@link Supplier} for minor Software Version
	 * @param valPatch {@link Supplier} for patch Software Version
	 * @return is software outdated
	 */
	public static boolean isSoftwareOutdated(Supplier<Value<Integer>> valMajor, //
			Supplier<Value<Integer>> valMinor, //
			Supplier<Value<Integer>> valPatch) {
		Value<Integer> major = valMajor.get();
		Value<Integer> minor = valMinor.get();
		Value<Integer> patch = valPatch.get();

		if (major.isDefined() && minor.isDefined() && patch.isDefined()) {
			SemanticVersion version = new SemanticVersion(major.get(), minor.get(), patch.get());
			return !version.isAtLeast(OUTDATED_VERSION);
		}
		return false;
	}

	protected void initializeDynamicChannels() {
		if (!this.areCellsAndModulesDefined()) {
			return;
		}
		if (this.config.version() == FirmwareVersion.WUERTH_VERSION_1_0_9) {
			final DynamicChannel[] params = { //
					new DynamicChannel("AVG_CELL_VOLTAGE", Unit.VOLT), //
					new DynamicChannel("MAX_CELL_VOLTAGE", Unit.VOLT), //
					new DynamicChannel("MIN_CELL_VOLTAGE", Unit.VOLT), //
					new DynamicChannel("AVG_TEMPERATURE", Unit.DEGREE_CELSIUS), //
					new DynamicChannel("MAX_TEMPERATURE", Unit.DEGREE_CELSIUS), //
					new DynamicChannel("MIN_TEMPERATURE", Unit.DEGREE_CELSIUS), //
					new DynamicChannel("SOH", Unit.PERCENT), //
					new DynamicChannel("STATE_ENERGY", Unit.WATT_HOURS), //
					new DynamicChannel("REMAINING_CAPACITY", Unit.AMPERE_HOURS) };
			this.initializeDynamicModuleChannels(30040, params);
			this.initializeDynamicCellChannels(30409);
			this.registerCellVoltageListeners();
			this.registerCellTemperatureListeners();
		}
	}

	/**
	 * Method to dynamically create the module channels.
	 * 
	 * @param startAddress    the start address of the register range.
	 * @param dynamicChannels the channels which are dynamically created. See
	 *                        {@link DynamicChannel}.
	 */
	protected void initializeDynamicModuleChannels(int startAddress, DynamicChannel[] dynamicChannels) {
		final int numberOfModules = this.getStringModuleCount().get();
		List<ModbusElement> elements = new ArrayList<>();
		int address = startAddress;

		for (int moduleIndex = 0; moduleIndex < numberOfModules; moduleIndex++) {
			for (DynamicChannel channel : dynamicChannels) {
				String channelId = "MODULE_" + moduleIndex + "_" + channel.suffix();

				elements.add(m(this.generateModuleChannel(channelId, INTEGER, c -> c.unit(channel.unit())),
						new UnsignedWordElement(address++)));
			}
		}

		this.addModbusTask(startAddress, elements.toArray(ModbusElement[]::new));
	}

	/**
	 * Method to dynamically crate cell channels.
	 * 
	 * @param baseCellElementAddress the start address of the register range.
	 */
	protected void initializeDynamicCellChannels(int baseCellElementAddress) {
		final int temperatureSensors = getNumberOfTemperatureSensorsPerModule().get();
		final int modules = getNumberOfModules().get();
		final int cells = getNumberOfCells().get() + getNumberOfCellsCsc().get();
		if (this.config.version() == FirmwareVersion.WUERTH_VERSION_1_0_9) {
			for (int moduleIndex = 0; moduleIndex < modules; moduleIndex++) {
				int offset = baseCellElementAddress + (moduleIndex * 63);
				this.addVoltageChannels(moduleIndex, offset, cells);
				this.addBalanceChannels(moduleIndex, offset + 28, cells);
				this.addTemperatureChannels(moduleIndex, offset + 56, temperatureSensors);
			}

			for (int moduleIndex = 0; moduleIndex < modules; moduleIndex++) {
				int offset = 33204 + (moduleIndex * 35);
				this.addLockVoltageChannels(moduleIndex, offset, cells);
				this.addLockTemperatureChannels(moduleIndex, offset + 28, temperatureSensors);
			}
		}
	}

	/**
	 * Registers listeners for 'onChange' event of any MODULE_X_MIN_CELL_VOLTAGE and
	 * MODULE_X_MAX_CELL_VOLTAGE to update the total 'MinCellVoltage' and
	 * 'MaxCellVoltage' Channels.
	 */
	public void registerCellVoltageListeners() {
		this.getDynamicChannelsByName("MAX_CELL_VOLTAGE") //
				.forEach(c -> c.onChange((a, b) -> this.updateMaxCellVoltage()));

		this.getDynamicChannelsByName("MIN_CELL_VOLTAGE") //
				.forEach(c -> c.onChange((a, b) -> this.updateMinCellVoltage()));
	}

	/**
	 * Called at 'onChange' event of any MODULE_X_MAX_CELL_VOLTAGE channel. Updates
	 * the total 'MaxCellVoltage' Channel.
	 */
	private void updateMaxCellVoltage() {
		this.getDynamicChannelsByName("MAX_CELL_VOLTAGE").stream() //
				.filter(c -> c.getNextValue().get() != null)//
				.map(c -> (int) c.getNextValue().get())//
				.max(Comparator.naturalOrder())//
				.ifPresentOrElse(//
						this::_setMaxCellVoltage, //
						() -> this._setMaxCellVoltage(null)//
				);
	}

	/**
	 * Called at 'onChange' event of any MODULE_X_MIN_CELL_VOLTAGE channel. Updates
	 * the 'MinCellVoltage' Channel.
	 */
	private void updateMinCellVoltage() {
		this.getDynamicChannelsByName("MIN_CELL_VOLTAGE").stream() //
				.filter(c -> c.getNextValue().get() != null)//
				.map(c -> (int) c.getNextValue().get())//
				.min(Comparator.naturalOrder())//
				.ifPresentOrElse(//
						this::_setMinCellVoltage, //
						() -> this._setMinCellVoltage(null)//
				);
	}

	private void registerResetBatteryListeners() {
		final var channel = this.getResetBatteryCommandChannel();
		channel.onSetNextWrite(value -> {
			this.logInfo(this.log, "[ " + channel.address() + " ] was changed to " + value);
			if (value == null || !value) {
				this.allowBatteryReset.set(true);

			} else if (this.allowBatteryReset.get()) {
				this.allowBatteryReset.set(false);
				this.stateMachine.forceNextState(State.RESET_BATTERY);
			}
		});
	}

	/**
	 * Registers listeners for 'onChange' event of any MODULE_X_MIN_TEMPERATURE and
	 * MODULE_X_MAX_TEMPERATURE to update the total 'MinCellTemperature' and
	 * 'MaxCellTemperature' Channels.
	 */
	public void registerCellTemperatureListeners() {
		this.getDynamicChannelsByName("MAX_TEMPERATURE") //
				.forEach(c -> c.onChange((a, b) -> this.updateMaxCellTemperature()));

		this.getDynamicChannelsByName("MIN_TEMPERATURE") //
				.forEach(c -> c.onChange((a, b) -> this.updateMinCellTemperature()));
	}

	/**
	 * Called at 'onChange' event of any MODULE_X_MAX_TEMPERATURE channel. Updates
	 * the total 'MaxCellTemperature' Channel.
	 */
	private void updateMaxCellTemperature() {
		this.getDynamicChannelsByName("MAX_TEMPERATURE").stream() //
				.filter(c -> c.getNextValue().get() != null)//
				.map(c -> (int) c.getNextValue().get())//
				.max(Comparator.naturalOrder())//
				.ifPresentOrElse(//
						this::_setMaxCellTemperature, //
						() -> this._setMaxCellTemperature(null)//
				);
	}

	/**
	 * Called at 'onChange' event of any MODULE_X_MIN_TEMPERATURE channel. Updates
	 * the 'MinCellTemperature' Channel.
	 */
	private void updateMinCellTemperature() {
		this.getDynamicChannelsByName("MIN_TEMPERATURE").stream() //
				.filter(c -> c.getNextValue().get() != null)//
				.map(c -> (int) c.getNextValue().get())//
				.min(Comparator.naturalOrder())//
				.ifPresentOrElse(//
						this::_setMinCellTemperature, //
						() -> this._setMinCellTemperature(null)//
				);
	}

	/**
	 * Returns a list of dynamically created channels. For example, in Würth version
	 * 1.0.9, module channels follow the format: ModuleXChannelName.
	 *
	 * @param channelSuffix the suffix of the channel, e.g., "MAX_CELL_VOLTAGE".
	 * @return a list of matching channel addresses.
	 */
	private List<Channel<?>> getDynamicChannelsByName(String channelSuffix) {
		return this.channels().stream() //
				.filter(c -> c.channelId().name().startsWith("MODULE")//
						&& c.channelId().name().endsWith(channelSuffix))
				.toList(); //
	}

	private void addModbusTask(int baseCellElementAddress, ModbusElement... elements) {
		this.getModbusProtocol()//
				.addTask(new FC4ReadInputRegistersTask(baseCellElementAddress, Priority.LOW, elements));
	}

	private ChannelIdImpl generateModuleChannel(String channelName, OpenemsType openemsType,
			Consumer<OpenemsTypeDoc<?>> additionalDocConfig) {
		final var doc = Doc.of(openemsType);
		if (additionalDocConfig != null) {
			additionalDocConfig.accept(doc);
		}
		var channelId = new ChannelIdImpl(channelName, doc);
		this.addChannel(channelId);
		return channelId;
	}

	private ChannelIdImpl generateModuleChannel(String channelName, OptionsEnum[] optionsEnum) {
		final var doc = Doc.of(optionsEnum);
		var channelId = new ChannelIdImpl(channelName, doc);
		this.addChannel(channelId);
		return channelId;
	}

	private ChannelIdImpl generateModuleChannel(String channelIdSuffix, OpenemsType openemsType) {
		return this.generateModuleChannel(channelIdSuffix, openemsType, FunctionUtils::doNothing);
	}

	/**
	 * Maps the given {@link io.openems.edge.common.channel.ChannelId} to the
	 * provided {@link ModbusElement}. This method utilizes the internal {@code m()}
	 * method to perform the actual mapping and returns the result.
	 *
	 * @param <T>       the type of the element that extends {@link ModbusElement}.
	 * @param channelId the identifier of the channel to map the element to.
	 * @param element   the Modbus element to be mapped.
	 * @return the mapped element of type {@code T}.
	 */
	public <T extends ModbusElement> T map(io.openems.edge.common.channel.ChannelId channelId, T element) {
		return m(channelId, element);
	}

	/**
	 * Maps the given {@link io.openems.edge.common.channel.ChannelId} to the
	 * provided {@link ModbusElement} along with the
	 * {@link ElementToChannelConverter}. This method utilizes the internal
	 * {@code m()} method to perform the actual mapping and returns the result.
	 *
	 * @param <T>       the type of the element that extends {@link ModbusElement}.
	 * @param channelId the identifier of the channel to map the element to.
	 * @param element   the Modbus element to be mapped.
	 * @param converter The {@link ElementToChannelConverter}
	 * @return the mapped element of type {@code T}.
	 */
	public <T extends ModbusElement> T map(io.openems.edge.common.channel.ChannelId channelId, T element,
			ElementToChannelConverter converter) {
		return m(channelId, element, converter);
	}

	/**
	 * Checks whether every module and cell count channel has received data. This
	 * method is called before dynamically creating channels in order to avoid
	 * NullPointerExceptions and incorrect channel counts.
	 *
	 * @return true if all required channels have been defined
	 */
	private boolean areCellsAndModulesDefined() {
		return getNumberOfModules().isDefined()//
				&& getNumberOfCells().isDefined()//
				&& getNumberOfCellsCsc().isDefined()//
				&& getNumberOfTemperatureSensorsPerModule().isDefined()//
				&& getNumberOfTemperatureSensors().isDefined();//
	}

	/**
	 * Dynamically creates voltage channels and adds them to the current register
	 * block as an FC4ReadInputRegistersTask.
	 *
	 * @param moduleIndex  the index of the current module
	 * @param startAddress the starting register address of the current block
	 * @param cells        the number of cells in the module
	 */
	private void addVoltageChannels(int moduleIndex, int startAddress, int cells) {
		List<ModbusElement> elements = new ArrayList<>();
		for (int i = 0; i < cells; i++) {
			elements.add(m(this.generateModuleChannel("MODULE_" + moduleIndex + "_CELL_" + i + "_VOLTAGE", INTEGER,
					c -> c.unit(Unit.MILLIVOLT)), new UnsignedWordElement(startAddress + i)));
		}
		this.addModbusTask(startAddress, elements.toArray(ModbusElement[]::new));
	}

	/**
	 * Dynamically creates balance channels and adds them to the current register
	 * block as an FC4ReadInputRegistersTask.
	 *
	 * @param moduleIndex  the index of the current module
	 * @param startAddress the starting register address of the current block
	 * @param cells        the number of cells in the module
	 */
	private void addBalanceChannels(int moduleIndex, int startAddress, int cells) {
		List<ModbusElement> elements = new ArrayList<>();
		for (int i = 0; i < cells; i++) {
			elements.add(m(this.generateModuleChannel("MODULE_" + moduleIndex + "_CELL_" + i + "_BALANCE",
					CellBalancingState.values()), new UnsignedWordElement(startAddress + i)));
		}
		this.addModbusTask(startAddress, elements.toArray(ModbusElement[]::new));
	}

	/**
	 * Dynamically creates temperature channels and adds them to the current
	 * register block as an FC4ReadInputRegistersTask.
	 *
	 * @param moduleIndex  the index of the current module
	 * @param startAddress the starting register address of the current block
	 * @param sensors      the number of temperature sensors in the module
	 */
	private void addTemperatureChannels(int moduleIndex, int startAddress, int sensors) {
		List<ModbusElement> elements = new ArrayList<>();
		for (int i = 0; i < sensors; i++) {
			elements.add(m(this.generateModuleChannel("MODULE_" + moduleIndex + "_TEMPSENSE_" + i, INTEGER,
					c -> c.unit(Unit.DEGREE_CELSIUS)), new UnsignedWordElement(startAddress + i)));
		}
		this.addModbusTask(startAddress, elements.toArray(ModbusElement[]::new));
	}

	/**
	 * Dynamically creates lock voltage channels and adds them to the current
	 * register block as an FC4ReadInputRegistersTask.
	 *
	 * @param moduleIndex  the index of the current module
	 * @param startAddress the starting register address of the current block
	 * @param cells        the number of cells in the module
	 */
	private void addLockVoltageChannels(int moduleIndex, int startAddress, int cells) {
		List<ModbusElement> elements = new ArrayList<>();
		for (int i = 0; i < cells; i++) {
			elements.add(
					m(this.generateModuleChannel("MODULE_" + moduleIndex + "_LOCK_STATUS_VOLTAGE_CSC" + i, INTEGER),
							new UnsignedWordElement(startAddress + i)));
		}
		this.addModbusTask(startAddress, elements.toArray(ModbusElement[]::new));
	}

	/**
	 * Dynamically creates lock temperature channels and adds them to the current
	 * register block as an FC4ReadInputRegistersTask.
	 *
	 * @param moduleIndex  the index of the current module
	 * @param startAddress the starting register address of the current block
	 * @param sensors      the number of temperature sensors in the module
	 */
	private void addLockTemperatureChannels(int moduleIndex, int startAddress, int sensors) {
		List<ModbusElement> elements = new ArrayList<>();
		for (int i = 0; i < sensors; i++) {
			elements.add(
					m(this.generateModuleChannel("MODULE_" + moduleIndex + "_LOCK_STATUS_TEMPERATURE_CSC" + i, INTEGER),
							new UnsignedWordElement(startAddress + i)));
		}
		this.addModbusTask(startAddress, elements.toArray(ModbusElement[]::new));
	}

	protected void setBatteryVoltageProtection() {
		if (this.areCellsAndModulesDefined()) {
			this.voltageProtectionLimits = new BatteryVoltageProtectionLimits<>(this.getBatteryVoltageSpecification(),
					this);
		}
	}

	private BatteryVoltageSpecification getBatteryVoltageSpecification() {
		final var cells = this.getNumberOfCells().get() + this.getNumberOfCellsCsc().get();
		final var modules = this.getNumberOfModules().get();
		final var maximumCellVoltageLimit = 4175;
		final var minimumCellVoltageLimit = 3143;
		final var maximumCellVoltageOperationLimit = 4130;
		final var minimumCellVoltageOperationLimit = 3250;
		final var maximumChargeVoltage = 964;
		final var minimumDischargeVoltage = 763;
		return new BatteryVoltageSpecification(cells, modules, maximumCellVoltageLimit, minimumCellVoltageLimit,
				maximumCellVoltageOperationLimit, minimumCellVoltageOperationLimit, maximumChargeVoltage,
				minimumDischargeVoltage);
	}

}
