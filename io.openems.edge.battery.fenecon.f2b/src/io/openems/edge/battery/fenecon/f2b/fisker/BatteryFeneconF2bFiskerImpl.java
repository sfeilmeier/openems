package io.openems.edge.battery.fenecon.f2b.fisker;

import static io.openems.common.jscalendar.JSCalendar.RecurrenceFrequency.DAILY;
import static io.openems.edge.battery.fenecon.f2b.fisker.enums.DtcFailure.getDtcFailures;
import static io.openems.edge.battery.fenecon.f2b.fisker.statemachine.StateMachine.State.UNDEFINED;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.ADD;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.MULTIPLY;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SCALE_FACTOR_1;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SCALE_FACTOR_MINUS_1;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SCALE_FACTOR_MINUS_2;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SET_NULL_FOR_DEFAULT;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SUBTRACT;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.chain;
import static io.openems.edge.common.channel.ChannelUtils.setValueIfNotRead;
import static io.openems.edge.common.event.EdgeEventConstants.TOPIC_CYCLE_AFTER_PROCESS_IMAGE;
import static io.openems.edge.common.event.EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE;
import static org.osgi.service.component.annotations.ReferenceCardinality.MANDATORY;
import static org.osgi.service.component.annotations.ReferenceCardinality.OPTIONAL;
import static org.osgi.service.component.annotations.ReferencePolicy.DYNAMIC;
import static org.osgi.service.component.annotations.ReferencePolicy.STATIC;
import static org.osgi.service.component.annotations.ReferencePolicyOption.GREEDY;

import java.time.Duration;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.stream.Stream;

import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ConfigurationPolicy;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventHandler;
import org.osgi.service.event.propertytypes.EventTopics;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.common.channel.AccessMode;
import io.openems.common.channel.Level;
import io.openems.common.channel.Unit;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.jscalendar.JSCalendar;
import io.openems.common.jsonrpc.serialization.EmptyObject;
import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.common.session.Role;
import io.openems.common.types.OpenemsType;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.api.BatteryErrorAcknowledge;
import io.openems.edge.battery.fenecon.f2b.BatteryFeneconF2b;
import io.openems.edge.battery.fenecon.f2b.DeviceSpecificOnSetNextValueHandler;
import io.openems.edge.battery.fenecon.f2b.common.enums.F2bBatteryError;
import io.openems.edge.battery.fenecon.f2b.fisker.statemachine.Context;
import io.openems.edge.battery.fenecon.f2b.fisker.statemachine.StateMachine;
import io.openems.edge.battery.protection.BatteryProtection;
import io.openems.edge.battery.protection.BatteryVoltageProtection;
import io.openems.edge.bridge.modbus.api.AbstractOpenemsModbusComponent;
import io.openems.edge.bridge.modbus.api.BridgeModbus;
import io.openems.edge.bridge.modbus.api.ElementToChannelConverter;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.bridge.modbus.api.ModbusProtocol;
import io.openems.edge.bridge.modbus.api.ModbusProtocolBuilder;
import io.openems.edge.bridge.modbus.api.element.AbstractModbusElement;
import io.openems.edge.bridge.modbus.api.element.BitsWordElement;
import io.openems.edge.bridge.modbus.api.element.DummyRegisterElement;
import io.openems.edge.bridge.modbus.api.element.ModbusElement;
import io.openems.edge.bridge.modbus.api.element.SignedWordElement;
import io.openems.edge.bridge.modbus.api.element.StringWordElement;
import io.openems.edge.bridge.modbus.api.element.UnsignedDoublewordElement;
import io.openems.edge.bridge.modbus.api.element.UnsignedWordElement;
import io.openems.edge.bridge.modbus.api.task.FC16WriteRegistersTask;
import io.openems.edge.bridge.modbus.api.task.FC3ReadRegistersTask;
import io.openems.edge.bridge.modbus.api.task.FC6WriteRegisterTask;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.ChannelId.ChannelIdImpl;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.jsonapi.ComponentJsonApi;
import io.openems.edge.common.jsonapi.EdgeGuards;
import io.openems.edge.common.jsonapi.JsonApiBuilder;
import io.openems.edge.common.modbusslave.ModbusSlave;
import io.openems.edge.common.modbusslave.ModbusSlaveNatureTable;
import io.openems.edge.common.modbusslave.ModbusSlaveTable;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.taskmanager.Priority;
import io.openems.edge.common.type.TypeUtils;
import io.openems.edge.timedata.api.Timedata;
import io.openems.edge.timedata.api.TimedataProvider;
import io.openems.edge.timedata.api.utils.CalculateStateCounter;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "Battery.Fenecon.F2B.Fisker", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE //
)
@EventTopics({ //
		TOPIC_CYCLE_BEFORE_PROCESS_IMAGE, //
		TOPIC_CYCLE_AFTER_PROCESS_IMAGE //
})
public class BatteryFeneconF2bFiskerImpl extends AbstractOpenemsModbusComponent implements BatteryFeneconF2bFisker,
		BatteryFeneconF2b, ModbusComponent, OpenemsComponent, Battery, ModbusSlave, StartStoppable, EventHandler,
		ComponentJsonApi, BatteryErrorAcknowledge, BatteryVoltageProtection, TimedataProvider {

	public final CalculateStateCounter calculateCounter24h = new CalculateStateCounter(this,
			BatteryFeneconF2bFisker.ChannelId.COUNTER_24H);
	public final CalculateStateCounter calculateCounterLongTime = new CalculateStateCounter(this,
			BatteryFeneconF2bFisker.ChannelId.COUNTER_LONG_TIME);
	public final CalculateStateCounter calculateCounterLifeTime = new CalculateStateCounter(this,
			BatteryFeneconF2bFisker.ChannelId.COUNTER_LIFE_TIME);

	private static final ElementToChannelConverter SET_NULL_FOR_DEFAULT_0 = SET_NULL_FOR_DEFAULT(0x0);
	private static final ElementToChannelConverter SET_NULL_FOR_DEFAULT_1 = SET_NULL_FOR_DEFAULT(0x1);
	private static final ElementToChannelConverter SET_NULL_FOR_DEFAULT_FF = SET_NULL_FOR_DEFAULT(0xFF);
	private static final ElementToChannelConverter SET_NULL_FOR_DEFAULT_FFFF = SET_NULL_FOR_DEFAULT(0xFFFF);

	private static final int CAPACITY = 100_659; // [Wh] (113_100 * 89 %)
	private static final int CELL_VOLTAGE_REGISTER_OFFSET = 80;
	private static final int CELL_TEMPERATURE_REGISTER_OFFSET = 102;
	private static final int NUMBER_OF_VOLTAGE_CELLS = 102;
	private static final int NUMBER_OF_TEMPERATURE_CELLS = 15;
	private static final int CELL_TEMPERATURE_VALUE_OFFSET = 48;// [K]
	private static final int INNER_RESISTANCE = 100;
	private static final int COUNTER_WARNING_THRESHOLD = 2;
	private static final int COUNTER_FAULT_THRESHOLD = 10;

	private final Map<F2bBatteryError, Consumer<Boolean>> errorHandler = Map.of(//
			F2bBatteryError.NO_F2B_BATTERY_ERROR, //
			this::_setNoF2bError, //
			F2bBatteryError.HV_START_UP_ERROR_RESET_FAILED, //
			this::_setF2bErrorResetFailed, //
			F2bBatteryError.HV_START_UP_PRECHARGE_FAILED, //
			this::_setPrechargeFailed, //
			F2bBatteryError.HV_START_UP_ISOLATION_TEST_FAILED_RESISTANCE_TO_LOW, //
			this::_setIsolationTestFailedResistanceToLow, //
			F2bBatteryError.HV_START_UP_ISOLATION_TEST_FAILED_RESISTANCE_TO_HIGH, //
			this::_setIsolationTestFailedResistanceToHigh, //
			F2bBatteryError.HV_START_UP_ISOLATION_TEST_FAILED_BMS_HV_OFF_EMERGENCY, //
			this::_setIsolationTestFailedBmsHvOffEmergency, //
			F2bBatteryError.HV_ON_BMS_HAS_LEFT_HV_ACTIVE, //
			this::_setBmsHasLeftHvActive //
	);

	private static final Map<Integer, String> dtcFailures = getDtcFailures();

	private final AtomicReference<StartStop> startStopTarget = new AtomicReference<>(StartStop.UNDEFINED);
	private final Logger log = LoggerFactory.getLogger(BatteryFeneconF2bFiskerImpl.class);
	private final StateMachine stateMachine = new StateMachine(UNDEFINED);
	private Config config;
	private BatteryProtection batteryProtection;
	private boolean hvContactorUnlocked = true;
	private boolean previousBmsHasHvLeftActive = false;
	private JSCalendar.Tasks<Void> tasks;

	@Reference
	private ConfigurationAdmin cm;

	@Reference
	private ComponentManager componentManager;

	@Reference(policy = DYNAMIC, policyOption = GREEDY, cardinality = OPTIONAL)
	private volatile Timedata timedata = null;

	@Override
	@Reference(policy = STATIC, policyOption = GREEDY, cardinality = MANDATORY)
	protected void setModbus(BridgeModbus modbus) {
		super.setModbus(modbus);
	}

	public BatteryFeneconF2bFiskerImpl() {
		super(//
				OpenemsComponent.ChannelId.values(), //
				ModbusComponent.ChannelId.values(), //
				Battery.ChannelId.values(), //
				StartStoppable.ChannelId.values(), //
				BatteryProtection.ChannelId.values(), //
				BatteryFeneconF2b.ChannelId.values(), //
				BatteryVoltageProtection.ChannelId.values(), //
				BatteryErrorAcknowledge.ChannelId.values(), //
				BatteryFeneconF2bFisker.ChannelId.values() //
		);
		this._setInnerResistance(INNER_RESISTANCE);
	}

	@Activate
	private void activate(ComponentContext context, Config config) throws OpenemsException {
		this.config = config;

		// Initialize Battery-Protection
		this.batteryProtection = BatteryProtection.create(this) //
				.applyBatteryProtectionDefinition(new BatteryProtectionDefinition(), this.componentManager) //
				.build();

		if (super.activate(context, config.id(), config.alias(), config.enabled(), config.modbusUnitId(), this.cm,
				"Modbus", config.modbus_id())) {
			return;
		}

		this.tasks = JSCalendar.Tasks.<Void>create(this.componentManager.getClock())//
				.add(t -> t //
						.setStart(LocalTime.of(8, 0))//
						.setDuration(Duration.ofSeconds(1))//
						.addRecurrenceRule(rule -> rule.setFrequency(DAILY))) //
				.build();
	}

	@Override
	@Deactivate
	protected void deactivate() {
		super.deactivate();
	}

	/**
	 * Handles the State-Machine.
	 */
	private void handleStateMachine() {
		// Store the current State
		this._setStateMachine(this.stateMachine.getCurrentState());
		this._setStartStop(StartStop.UNDEFINED);
		var context = new Context(this, this.componentManager.getClock());
		try {
			this.stateMachine.run(context);
			this._setRunFailed(false);
		} catch (OpenemsNamedException e) {
			this._setRunFailed(false);
			this.logError(this.log, "StateMachine failed: " + e.getMessage());
		}
	}

	@Override
	protected ModbusProtocol defineModbusProtocol() {
		return switch (this.config.batteryId()) {
		case F2B_BATTERY_1 -> ModbusProtocolBuilder.create(this)//
				.addProtocol(this.hardwareReset())//
				.addProtocol(this.f2bParameters())//
				.addProtocol(this.batteryValues(100))//
				.addProtocol(this.cellValues(100))//
				.addProtocol(this.dtcList(100))//
				.build();
		case F2B_BATTERY_2 -> ModbusProtocolBuilder.create(this)//
				.addProtocol(this.hardwareReset())//
				.addProtocol(this.batteryValues(300))//
				.addProtocol(this.cellValues(300))//
				.addProtocol(this.dtcList(300))//
				.build();
		};
	}

	private ModbusProtocol hardwareReset() {
		return new ModbusProtocol(this, //
				new FC6WriteRegisterTask(1, //
						m(BatteryFeneconF2b.ChannelId.F2B_RESET, new UnsignedWordElement(1))));
	}

	private ModbusProtocol f2bParameters() {
		return new ModbusProtocol(this, //
				new FC3ReadRegistersTask(11, Priority.LOW, //
						m(BatteryFeneconF2b.ChannelId.F2B_HARDWARE_TYPE, new UnsignedWordElement(11)), //
						m(BatteryFeneconF2b.ChannelId.F2B_HARDWARE_SERIAL_NUMBER, new StringWordElement(12, 11)), //
						m(BatteryFeneconF2b.ChannelId.F2B_HARDWARE_PO_NUMBER, new UnsignedDoublewordElement(23)), //
						m(BatteryFeneconF2b.ChannelId.F2B_BOOTLOADER_MAIN_VERSION, new UnsignedWordElement(25)), //
						m(BatteryFeneconF2b.ChannelId.F2B_BOOTLOADER_SUB_VERSION, new UnsignedWordElement(26)), //
						m(BatteryFeneconF2b.ChannelId.F2B_BOOTLOADER_BUILD_DATE, new StringWordElement(27, 6)), //
						m(BatteryFeneconF2b.ChannelId.F2B_BOOTLOADER_BUILD_TIMESTAMP, new StringWordElement(33, 4)), //
						m(BatteryFeneconF2b.ChannelId.F2B_BOOTLOADER_FLASH_DATE, new StringWordElement(37, 6)), //
						m(BatteryFeneconF2b.ChannelId.F2B_BOOTLOADER_FLASH_TIMESTAMP, new StringWordElement(43, 4)), //
						m(BatteryFeneconF2b.ChannelId.F2B_APPLICATION_MAIN_VERSION, new UnsignedWordElement(47)), //
						m(BatteryFeneconF2b.ChannelId.F2B_APPLICATION_SUB_VERSION, new UnsignedWordElement(48)), //
						m(BatteryFeneconF2b.ChannelId.F2B_APPLICATION_BUILD_DATE, new StringWordElement(49, 6)), //
						m(BatteryFeneconF2b.ChannelId.F2B_APPLICATION_BUILD_TIMESTAMP, new StringWordElement(55, 4)), //
						m(BatteryFeneconF2b.ChannelId.F2B_APPLICATION_FLASH_DATE, new StringWordElement(59, 6)), //
						m(BatteryFeneconF2b.ChannelId.F2B_APPLICATION_FLASH_TIMESTAMP, new StringWordElement(65, 4))//
				)//
		);
	}

	private ModbusProtocol dtcList(int offset) {
		return new ModbusProtocol(this, //
				new FC3ReadRegistersTask(offset + 70, Priority.LOW, //
						m(BatteryFeneconF2bFisker.ChannelId.DTC_1, new UnsignedWordElement(offset + 70)), //
						m(BatteryFeneconF2bFisker.ChannelId.DTC_2, new UnsignedWordElement(offset + 71)), //
						m(BatteryFeneconF2bFisker.ChannelId.DTC_3, new UnsignedWordElement(offset + 72)), //
						m(BatteryFeneconF2bFisker.ChannelId.DTC_4, new UnsignedWordElement(offset + 73)), //
						m(BatteryFeneconF2bFisker.ChannelId.DTC_5, new UnsignedWordElement(offset + 74)), //
						m(BatteryFeneconF2bFisker.ChannelId.DTC_6, new UnsignedWordElement(offset + 75)), //
						m(BatteryFeneconF2bFisker.ChannelId.DTC_7, new UnsignedWordElement(offset + 76)), //
						m(BatteryFeneconF2bFisker.ChannelId.DTC_8, new UnsignedWordElement(offset + 77)), //
						m(BatteryFeneconF2bFisker.ChannelId.DTC_9, new UnsignedWordElement(offset + 78)), //
						m(BatteryFeneconF2bFisker.ChannelId.DTC_10, new UnsignedWordElement(offset + 79)) //
				)//
		);
	}

	private ModbusProtocol cellValues(int offset) {
		var ameVolt = this.generateCellTasks(NUMBER_OF_VOLTAGE_CELLS, offset + CELL_VOLTAGE_REGISTER_OFFSET, "_VOLTAGE",
				Unit.MILLIVOLT, chain(SET_NULL_FOR_DEFAULT_FFFF, SCALE_FACTOR_MINUS_1));
		var ameTemp = this.generateCellTasks(NUMBER_OF_TEMPERATURE_CELLS,
				offset + CELL_VOLTAGE_REGISTER_OFFSET + CELL_TEMPERATURE_REGISTER_OFFSET, "_TEMPERATURE",
				Unit.DEGREE_CELSIUS, chain(SET_NULL_FOR_DEFAULT_FF, SUBTRACT(CELL_TEMPERATURE_VALUE_OFFSET)));

		final var ameSum = Stream.concat(Arrays.stream(ameVolt), Arrays.stream(ameTemp)).toArray(ModbusElement[]::new);
		return new ModbusProtocol(this, //
				new FC3ReadRegistersTask(offset + CELL_VOLTAGE_REGISTER_OFFSET, Priority.LOW, ameSum));
	}

	private ModbusProtocol batteryValues(int offset) {
		return new ModbusProtocol(this, //
				new FC16WriteRegistersTask(offset + 1, //
						m(BatteryFeneconF2bFisker.ChannelId.CONTROL_REQUEST, new UnsignedWordElement(offset + 1)), //
						m(BatteryFeneconF2bFisker.ChannelId.ERROR_RESET_REQUEST, new UnsignedWordElement(offset + 2))), //

				new FC3ReadRegistersTask(offset + 10, Priority.HIGH, //
						m(BatteryFeneconF2bFisker.ChannelId.ACTUAL_STATE, new UnsignedWordElement(offset + 10)), //
						m(BatteryFeneconF2bFisker.ChannelId.ACTUAL_SUB_STATE_HV_START_UP,
								new UnsignedWordElement(offset + 11)), //
						m(BatteryFeneconF2bFisker.ChannelId.F2B_BATTERY_ERROR, new UnsignedWordElement(offset + 12)), //
						m(BatteryFeneconF2bFisker.ChannelId.CRC_NO_FAILED_MSGS, new UnsignedWordElement(offset + 13)), //
						m(BatteryFeneconF2bFisker.ChannelId.CAN_NO_FAILED_MSGS, new UnsignedWordElement(offset + 14)), //
						m(BatteryFeneconF2bFisker.ChannelId.DEBUG_1, new UnsignedWordElement(offset + 15)), //
						m(BatteryFeneconF2bFisker.ChannelId.DEBUG_2, new UnsignedWordElement(offset + 16)), //
						m(BatteryFeneconF2bFisker.ChannelId.DEBUG_3, new UnsignedWordElement(offset + 17)), //
						m(BatteryFeneconF2bFisker.ChannelId.DEBUG_4, new UnsignedWordElement(offset + 18)), //
						m(BatteryFeneconF2bFisker.ChannelId.DEBUG_5, new UnsignedWordElement(offset + 19)), //
						m(BatteryFeneconF2bFisker.ChannelId.DEBUG_6, new UnsignedWordElement(offset + 20)), //
						m(BatteryFeneconF2bFisker.ChannelId.DEBUG_7, new UnsignedWordElement(offset + 21)), //
						m(BatteryFeneconF2bFisker.ChannelId.DEBUG_8, new UnsignedWordElement(offset + 22)), //
						m(BatteryFeneconF2bFisker.ChannelId.DEBUG_9, new UnsignedWordElement(offset + 23)), //
						m(BatteryFeneconF2bFisker.ChannelId.DEBUG_10, new UnsignedWordElement(offset + 24)), //
						new DummyRegisterElement(offset + 25, offset + 29), //
						m(new SignedWordElement(offset + 30))
								.m(BatteryFeneconF2bFisker.ChannelId.CURRENT_HIGH_RESOLUTION,
										chain(SET_NULL_FOR_DEFAULT_FFFF, MULTIPLY(5), SCALE_FACTOR_1))
								.m(Battery.ChannelId.CURRENT,
										chain(SET_NULL_FOR_DEFAULT_FFFF, MULTIPLY(5), SCALE_FACTOR_MINUS_2)//
								).build(), //
						m(Battery.ChannelId.VOLTAGE, new UnsignedWordElement(offset + 31),
								chain(SET_NULL_FOR_DEFAULT_FFFF, SCALE_FACTOR_MINUS_2)), //
						m(BatteryFeneconF2bFisker.ChannelId.DISCHARGE_LIMIT_CURRENT,
								new UnsignedWordElement(offset + 32),
								chain(SET_NULL_FOR_DEFAULT_0, MULTIPLY(2), SCALE_FACTOR_MINUS_2)), //
						m(BatteryFeneconF2bFisker.ChannelId.CHARGE_LIMIT_CURRENT, new UnsignedWordElement(offset + 33),
								chain(SET_NULL_FOR_DEFAULT_0, MULTIPLY(2), SCALE_FACTOR_MINUS_2)), //

						m(new SignedWordElement(offset + 34))
								.m(Battery.ChannelId.DISCHARGE_MIN_VOLTAGE,
										chain(MULTIPLY(2), SCALE_FACTOR_MINUS_2, SUBTRACT(10)))
								.m(BatteryVoltageProtection.ChannelId.BVP_DISCHARGE_BMS,
										chain(MULTIPLY(2), SCALE_FACTOR_MINUS_2)//
								).build(), //
						m(new SignedWordElement(offset + 35))
								.m(Battery.ChannelId.CHARGE_MAX_VOLTAGE,
										chain(MULTIPLY(2), SCALE_FACTOR_MINUS_2, ADD(10)))
								.m(BatteryVoltageProtection.ChannelId.BVP_CHARGE_BMS,
										chain(MULTIPLY(2), SCALE_FACTOR_MINUS_2, SUBTRACT(4))//
								).build(), //
						m(BatteryFeneconF2bFisker.ChannelId.AVERAGE_CELL_TEMPERATURE,
								new UnsignedWordElement(offset + 36), chain(SET_NULL_FOR_DEFAULT_FF, SUBTRACT(48))), //
						m(BatteryFeneconF2bFisker.ChannelId.DIFFERENCE_CELL_TEMPERATURE,
								new UnsignedWordElement(offset + 37), SET_NULL_FOR_DEFAULT_FF), //
						m(Battery.ChannelId.MAX_CELL_TEMPERATURE, new UnsignedWordElement(offset + 38),
								chain(SET_NULL_FOR_DEFAULT_FF, SUBTRACT(48))), //
						m(Battery.ChannelId.MIN_CELL_TEMPERATURE, new UnsignedWordElement(offset + 39),
								chain(SET_NULL_FOR_DEFAULT_FF, SUBTRACT(48))), //
						m(BatteryFeneconF2bFisker.ChannelId.THERMAL_MANAGEMENT_REQUIRED,
								new UnsignedWordElement(offset + 40)), //
						m(Battery.ChannelId.MAX_CELL_VOLTAGE, new UnsignedWordElement(offset + 41),
								chain(SET_NULL_FOR_DEFAULT_FFFF, SCALE_FACTOR_MINUS_1)), //
						m(Battery.ChannelId.MIN_CELL_VOLTAGE, new UnsignedWordElement(offset + 42),
								chain(SET_NULL_FOR_DEFAULT_FFFF, SCALE_FACTOR_MINUS_1)), //
						m(BatteryFeneconF2bFisker.ChannelId.AVERAGE_CELL_VOLTAGE, new UnsignedWordElement(offset + 43),
								chain(SET_NULL_FOR_DEFAULT_FFFF, SCALE_FACTOR_MINUS_1)), //
						m(BatteryFeneconF2bFisker.ChannelId.T30C_VOLTAGE, new UnsignedWordElement(offset + 44),
								SET_NULL_FOR_DEFAULT_FFFF), //
						m(BatteryFeneconF2bFisker.ChannelId.ACTUAL_CAPACITY, new UnsignedWordElement(offset + 45),
								chain(SET_NULL_FOR_DEFAULT_FFFF, SCALE_FACTOR_MINUS_2)), //
						m(Battery.ChannelId.SOC, new UnsignedWordElement(offset + 46), SET_NULL_FOR_DEFAULT_FF), //
						m(Battery.ChannelId.SOH, new UnsignedWordElement(offset + 47), SET_NULL_FOR_DEFAULT_FF), //
						m(BatteryFeneconF2bFisker.ChannelId.TOTAL_VOLTAGE_LOAD_END,
								new UnsignedWordElement(offset + 48),
								chain(SET_NULL_FOR_DEFAULT_FFFF, MULTIPLY(2), SCALE_FACTOR_MINUS_2)), //
						m(BatteryFeneconF2bFisker.ChannelId.BALANCING_STATUS, new UnsignedWordElement(offset + 49),
								SET_NULL_FOR_DEFAULT_1), //
						m(BatteryFeneconF2bFisker.ChannelId.BDU_STATUS, new UnsignedWordElement(offset + 50)), //
						m(BatteryFeneconF2bFisker.ChannelId.OPERATING_STATES, new UnsignedWordElement(offset + 51)), //
						m(BatteryFeneconF2bFisker.ChannelId.BMS_STATE_MACHINE, new UnsignedWordElement(offset + 52),
								SET_NULL_FOR_DEFAULT_1), //
						m(BatteryFeneconF2bFisker.ChannelId.INSULATION_RESISTANCE_NEG_POLE_GND,
								new UnsignedWordElement(offset + 53), SET_NULL_FOR_DEFAULT_FFFF), //
						m(BatteryFeneconF2bFisker.ChannelId.RELATIVE_INSULATION_RESISTANCE_NEG_POLE_GND,
								new UnsignedWordElement(offset + 54), SET_NULL_FOR_DEFAULT_FFFF), //
						m(BatteryFeneconF2bFisker.ChannelId.INSULATION_RESISTANCE_POS_POLE_GND,
								new UnsignedWordElement(offset + 55), SET_NULL_FOR_DEFAULT_FFFF), //
						m(BatteryFeneconF2bFisker.ChannelId.RELATIVE_INSULATION_RESISTANCE_POS_POLE_GND,
								new UnsignedWordElement(offset + 56), SET_NULL_FOR_DEFAULT_FFFF), //
						m(new BitsWordElement(offset + 57, this)//
								.bit(0, BatteryFeneconF2bFisker.ChannelId.CAT0)//
								.bit(1, BatteryFeneconF2bFisker.ChannelId.CAT1)//
								.bit(2, BatteryFeneconF2bFisker.ChannelId.CAT2)//
								.bit(3, BatteryFeneconF2bFisker.ChannelId.CAT3)//
								.bit(4, BatteryFeneconF2bFisker.ChannelId.CAT4)//
								.bit(5, BatteryFeneconF2bFisker.ChannelId.CAT5)//
								.bit(6, BatteryFeneconF2bFisker.ChannelId.CAT6)//
								.bit(7, BatteryFeneconF2bFisker.ChannelId.CAT7)//
								.bit(8, BatteryFeneconF2bFisker.ChannelId.CAT8)//
						), //
						m(BatteryProtection.ChannelId.BP_DISCHARGE_BMS, new UnsignedWordElement(offset + 58),
								chain(SET_NULL_FOR_DEFAULT_0, MULTIPLY(5), SCALE_FACTOR_MINUS_2)), //
						m(BatteryProtection.ChannelId.BP_CHARGE_BMS, new UnsignedWordElement(offset + 59),
								chain(SET_NULL_FOR_DEFAULT_0, MULTIPLY(5), SCALE_FACTOR_MINUS_2)), //
						m(BatteryFeneconF2bFisker.ChannelId.PLT_CHARGE_MAX_CURRENT,
								new UnsignedWordElement(offset + 60),
								chain(SET_NULL_FOR_DEFAULT_0, MULTIPLY(5), SCALE_FACTOR_MINUS_2)), //
						m(BatteryFeneconF2bFisker.ChannelId.PMLT_CHARGE_MAX_CURRENT,
								new UnsignedWordElement(offset + 61),
								chain(SET_NULL_FOR_DEFAULT_0, MULTIPLY(5), SCALE_FACTOR_MINUS_2)), //
						m(BatteryFeneconF2bFisker.ChannelId.CHARGE_MAX_CURRENT_TIME_UNTIL_CHANGE,
								new UnsignedWordElement(offset + 62), SET_NULL_FOR_DEFAULT_0) //
				));
	}

	/**
	 * Generates read tasks for the battery cell voltages and temperatures.
	 * 
	 * @param numberOfCells  number of voltage or temperature cells.
	 * @param registerOffset start address offset.
	 * @param prefix         channel identifier to generate a channel for cell task.
	 *                       e.g. "_VOLTAGE"
	 * @param unit           value unit e.g Unit.MILLIVOLT
	 * @param converter      to scale factors to be applied to the result.
	 * @return {@link AbstractModbusElement} a created map by register and channel
	 *         for {@link ModbusProtocol} task.
	 */
	private ModbusElement[] generateCellTasks(int numberOfCells, int registerOffset, String prefix, Unit unit,
			ElementToChannelConverter converter) {
		var ame = new ModbusElement[numberOfCells];
		for (var num = 0; num < numberOfCells; num++) {
			// Create Temperature Channel
			var channelId = new ChannelIdImpl(//
					getSingleCellPrefix(num + 1, prefix), //
					Doc.of(OpenemsType.INTEGER).unit(unit));
			addChannel(channelId);
			var uwe = new UnsignedWordElement(num + registerOffset);
			ame[num] = m(channelId, uwe, converter); //
		}
		return ame;
	}

	private static String getSingleCellPrefix(int num, String prefix) {
		return "CELL_" + prefix + String.format("%03d", num);
	}

	private io.openems.edge.common.channel.ChannelId generateDtcChannelId(String id, String prefix) {
		final io.openems.edge.common.channel.ChannelId channelId = new ChannelIdImpl(//
				id + "_WARNING", //
				Doc.of(Level.WARNING)//
						.text(prefix));
		try {
			// Check if the channel is already defined
			this.channel(channelId);
		} catch (IllegalArgumentException e) {
			addChannel(channelId);
		}
		return channelId;
	}

	protected synchronized void updateDtcFailure(String id, int value) {
		var description = dtcFailures.get(value);
		var text = description != null //
				? description //
				: "Unknown DTC Code (" + value + ")";
		var channelId = this.generateDtcChannelId(id, text);
		if (value != 0) {
			this.channel(channelId).setNextValue(true);
			return;
		}
		removeChannel(this.channel(channelId));
	}

	@Override
	public void setStartStop(StartStop value) {
		this.startStopTarget.set(value);
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
	public String debugLog() {
		return Battery.generateDebugLog(this, this.stateMachine);
	}

	@Override
	public ModbusSlaveTable getModbusSlaveTable(AccessMode accessMode) {
		return new ModbusSlaveTable(//
				OpenemsComponent.getModbusSlaveNatureTable(accessMode), //
				Battery.getModbusSlaveNatureTable(accessMode), //
				ModbusSlaveNatureTable.of(BatteryFeneconF2bFisker.class, accessMode, 100) //
						.build());
	}

	@Override
	public void handleEvent(Event event) {
		if (!this.isEnabled()) {
			return;
		}
		switch (event.getTopic()) {
		case TOPIC_CYCLE_BEFORE_PROCESS_IMAGE -> {
			this.batteryProtection.apply();
			this.handleStateMachine();
			this.handleErrorCounting();
			this._setModbusCommunicationToFemsFailed(this.getModbusCommunicationFailed());
			this.handleRestartTasks();
			this.handleCapacity();
		}
		}
	}

	private void handleCapacity() {
		setValueIfNotRead(this, Battery.ChannelId.CAPACITY, this.isStarted() ? CAPACITY : 0);
	}

	@Override
	public void buildJsonApiRoutes(JsonApiBuilder builder) {
		builder.handleRequest(new ErrorResetRequest(), endpoint -> {
			endpoint.setGuards(EdgeGuards.roleIsAtleast(Role.INSTALLER));
		}, call -> {
			this.setErrorResetRequest(true);
			return EmptyObject.INSTANCE;
		});//
		builder.handleRequest(new HardwareResetRequest(), endpoint -> {
			endpoint.setGuards(EdgeGuards.roleIsAtleast(Role.INSTALLER));
		}, call -> {
			this.setF2bReset(true);
			return EmptyObject.INSTANCE;
		});
		builder.handleRequest(EndpointRequestType.ofEmpty("resetCounter24hRequest"),
				endpoint -> endpoint.setGuards(EdgeGuards.roleIsAtleast(Role.INSTALLER)), //
				call -> {
					this.calculateCounter24h.resetCounter();
					return EmptyObject.INSTANCE;
				});
		builder.handleRequest(EndpointRequestType.ofEmpty("resetCounterLongTimeRequest"),
				endpoint -> endpoint.setGuards(EdgeGuards.roleIsAtleast(Role.INSTALLER)), //
				call -> {
					this.calculateCounterLongTime.resetCounter();
					return EmptyObject.INSTANCE;
				});
	}

	@Override
	public void setHvContactorUnlocked(boolean value) {
		this.hvContactorUnlocked = value;
	}

	@Override
	public boolean isHvContactorUnlocked() {
		return this.hvContactorUnlocked;
	}

	@Override
	public DeviceSpecificOnSetNextValueHandler<? extends BatteryFeneconF2b> getDeviceSpecificOnSetNextValueHandler() {
		return null;
	}

	protected synchronized void updateBatteryFaultChannels() {
		final var f2bBatteryErrorChannel = this.channel(BatteryFeneconF2bFisker.ChannelId.F2B_BATTERY_ERROR);
		final var f2bBatteryError = f2bBatteryErrorChannel.value();
		if (!f2bBatteryError.isDefined()) {
			return;
		}
		if (f2bBatteryError.asEnum() != F2bBatteryError.NO_F2B_BATTERY_ERROR) {
			this.errorHandler.get(f2bBatteryError.asEnum()).accept(true);
			return;
		}
		this.errorHandler.entrySet().stream()//
				.filter(entry -> entry.getKey() != F2bBatteryError.NO_F2B_BATTERY_ERROR)
				.forEach(entry -> entry.getValue().accept(false));
	}

	@Override
	public List<Channel<?>> defineBatteryErrorAcknowledgeChannels() {
		try {
			this.setErrorResetRequest(true);
		} catch (OpenemsNamedException e) {
			this.logWarn(this.log, "Unable to reset F2B Failure!" + e.getMessage());
		}
		return List.of(//
				this.getTimeoutStartBatteryChannel(), //
				this.getTimeoutStopBatteryChannel(), //
				this.getModbusCommunicationToFemsFailedChannel()//
		);
	}

	/**
	 * Handles the error counting when the BMS leaves the HV active state.
	 * 
	 * <p>
	 * If the BMS has left the HV active state, the following counters are updated:
	 * <ul>
	 * <li>24-hour counter</li>
	 * <li>Long-time counter</li>
	 * <li>Lifetime counter</li>
	 * </ul>
	 * Based on the counter values, warning and fault states are evaluated.
	 */
	public void handleErrorCounting() {
		final var bmsHasLeftHvActive = this.getBmsHasLeftHvActiveChannel().value().orElse(false);
		var isActive = bmsHasLeftHvActive & !this.previousBmsHasHvLeftActive;
		this.calculateCounter24h.update(isActive);
		this.calculateCounterLongTime.update(isActive);
		this.calculateCounterLifeTime.update(isActive);
		this.previousBmsHasHvLeftActive = bmsHasLeftHvActive;
		var counter24h = this.getCounter24h().orElse(0);
		var counterLongTime = this.getCounterLongTime().orElse(0);
		this._setCounter24hWarning(counter24h == COUNTER_WARNING_THRESHOLD);
		this._setCounter24hFault(counter24h > COUNTER_WARNING_THRESHOLD);
		this._setCounterLongTimeWarning(TypeUtils.isBetween(counterLongTime, 5, 10));
		this._setCounterLongTimeFault(counterLongTime > COUNTER_FAULT_THRESHOLD);
	}

	private void handleRestartTasks() {
		if (this.tasks == null) {
			return;
		}
		var activeTask = this.tasks.getActiveOneTask();
		if (activeTask == null) {
			return;
		}
		this._setCounter24h(0);
		this.calculateCounter24h.resetCounter();
	}

	protected synchronized void triggerF2bReset() {
		final var counter24h = this.getCounter24h().orElse(0);
		final var bmsHasLeftHvActive = this.getBmsHasLeftHvActiveChannel().value().orElse(false);
		if (bmsHasLeftHvActive && counter24h < 3) {
			try {
				this.setErrorResetRequest(true);
				this.setF2bReset(true);
			} catch (OpenemsNamedException e) {
				this.logError(this.log, "Trigger F2B Reset failed: " + e.getMessage());
			}
		}
	}

	@Override
	public Timedata getTimedata() {
		return this.timedata;
	}

}
