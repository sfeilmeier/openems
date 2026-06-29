package io.openems.edge.battery.wuerthbms;

import static io.openems.common.types.OpenemsType.BOOLEAN;
import static io.openems.common.types.OpenemsType.INTEGER;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.DIRECT_1_TO_1;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SCALE_FACTOR_MINUS_1;
import static io.openems.edge.common.event.EdgeEventConstants.TOPIC_CYCLE_AFTER_PROCESS_IMAGE;
import static io.openems.edge.common.event.EdgeEventConstants.TOPIC_CYCLE_BEFORE_PROCESS_IMAGE;
import static org.osgi.service.component.annotations.ConfigurationPolicy.REQUIRE;
import static org.osgi.service.component.annotations.ReferenceCardinality.MANDATORY;
import static org.osgi.service.component.annotations.ReferencePolicy.STATIC;
import static org.osgi.service.component.annotations.ReferencePolicyOption.GREEDY;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
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
import io.openems.common.channel.Unit;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.types.OpenemsType;
import io.openems.common.utils.FunctionUtils;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.api.BatteryErrorAcknowledge;
import io.openems.edge.battery.protection.BatteryProtection;
import io.openems.edge.battery.protection.BatteryVoltageProtection;
import io.openems.edge.battery.protection.BatteryVoltageProtectionLimits;
import io.openems.edge.battery.protection.BatteryVoltageProtectionLimits.BatteryVoltageSpecification;
import io.openems.edge.battery.wuerthbms.statemachine.Context;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine.State;
import io.openems.edge.bridge.modbus.api.AbstractOpenemsModbusComponent;
import io.openems.edge.bridge.modbus.api.BridgeModbus;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.bridge.modbus.api.ModbusProtocol;
import io.openems.edge.bridge.modbus.api.element.BitsWordElement;
import io.openems.edge.bridge.modbus.api.element.DummyRegisterElement;
import io.openems.edge.bridge.modbus.api.element.ModbusElement;
import io.openems.edge.bridge.modbus.api.element.SignedWordElement;
import io.openems.edge.bridge.modbus.api.element.UnsignedWordElement;
import io.openems.edge.bridge.modbus.api.task.FC16WriteRegistersTask;
import io.openems.edge.bridge.modbus.api.task.FC3ReadRegistersTask;
import io.openems.edge.bridge.modbus.api.task.FC4ReadInputRegistersTask;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.ChannelId.ChannelIdImpl;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.internal.OpenemsTypeDoc;
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
		name = "Battery.WuerthBms", //
		immediate = true, //
		configurationPolicy = REQUIRE)
@EventTopics({ //
		TOPIC_CYCLE_BEFORE_PROCESS_IMAGE, //
		TOPIC_CYCLE_AFTER_PROCESS_IMAGE })
public class WuerthBmsImpl extends AbstractOpenemsModbusComponent
		implements WuerthBms, ModbusComponent, OpenemsComponent, Battery, BatteryErrorAcknowledge,
		BatteryVoltageProtection, EventHandler, ModbusSlave, StartStoppable {

	public record BatteryValues(int soc, int voltage, int chargeMaxVoltage, int dischargeMinVoltage) {
	}

	private static final int INNER_RESISTANCE = 150; // [mOhm]
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

	@Reference(policy = STATIC, policyOption = GREEDY, cardinality = MANDATORY)
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
				BatteryErrorAcknowledge.ChannelId.values(), //
				StartStoppable.ChannelId.values(), //
				BatteryProtection.ChannelId.values(), //
				BatteryVoltageProtection.ChannelId.values(), //
				WuerthBms.ChannelId.values() //
		);
		this.getModbusCommunicationFailedChannel()
				.onChange((ignore, value) -> this.setModbusCommunicationToFemsFailed(value.orElse(false)));
		this.registerResetBatteryListeners();
		this._setCapacity(CAPACITY);
		this._setInnerResistance(INNER_RESISTANCE);
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
		case TOPIC_CYCLE_BEFORE_PROCESS_IMAGE -> {
			this.batteryProtection.apply();
			this.updateVoltageProtectionLimits();
		}
		case TOPIC_CYCLE_AFTER_PROCESS_IMAGE -> this.handleStateMachine();
		}
	}

	private void handleStateMachine() {
		this.channel(WuerthBms.ChannelId.STATE_MACHINE).setNextValue(this.stateMachine.getCurrentState());
		this._setStartStop(StartStop.UNDEFINED);

		try {
			var context = new Context(this, this.componentManager.getClock());

			this.stateMachine.run(context);
			this.channel(WuerthBms.ChannelId.RUN_FAILED).setNextValue(false);

		} catch (OpenemsNamedException e) {
			this.channel(WuerthBms.ChannelId.RUN_FAILED).setNextValue(true);
			this.logError(this.log, "StateMachine failed: " + e.getMessage());
		}
	}

	@Override
	protected ModbusProtocol defineModbusProtocol() {
		final var baseWrite = 40000; // Base Register Address for Write-Registers
		return new ModbusProtocol(this, //
				new FC4ReadInputRegistersTask(30000, Priority.HIGH, //
						m(WuerthBms.ChannelId.RELAY_FEEDBACK_0_AUX_0, new UnsignedWordElement(30000)),
						m(WuerthBms.ChannelId.RELAY_FEEDBACK_0_AUX_1, new UnsignedWordElement(30001)),
						m(WuerthBms.ChannelId.SYSTEM_GLOBAL_STATE, new UnsignedWordElement(30002)),
						m(WuerthBms.ChannelId.PRECHARGE_ENERGY, new UnsignedWordElement(30003), SCALE_FACTOR_MINUS_1),
						m(WuerthBms.ChannelId.SYSTEM_CONTACTOR_STATE, new UnsignedWordElement(30004)),
						m(WuerthBms.ChannelId.SYSTEM_BALANCING_STATE, new UnsignedWordElement(30005)),
						m(WuerthBms.ChannelId.RELAY_FEEDBACK_1_AUX_0, new UnsignedWordElement(30006)),
						m(WuerthBms.ChannelId.RELAY_FEEDBACK_1_AUX_1, new UnsignedWordElement(30007)),
						m(Battery.ChannelId.CURRENT, new SignedWordElement(30008)),
						m(WuerthBms.ChannelId.PACK_SHUNT_TEMPERATURE, new UnsignedWordElement(30009), //
								SCALE_FACTOR_MINUS_1), //
						m(Battery.ChannelId.VOLTAGE, new UnsignedWordElement(30010), SCALE_FACTOR_MINUS_1), //
						m(WuerthBms.ChannelId.PACK_LIMIT_MAX_BATTERY_VOLTAGE, new UnsignedWordElement(30011)), //
						m(BatteryProtection.ChannelId.BP_CHARGE_BMS, new UnsignedWordElement(30012)),
						m(WuerthBms.ChannelId.CELL_VOLT_PLAUSIBILITY, new UnsignedWordElement(30013)),
						m(BatteryProtection.ChannelId.BP_DISCHARGE_BMS, new UnsignedWordElement(30014)),
						m(WuerthBms.ChannelId.STACK_CELLS_PLAUSIBILITY, new UnsignedWordElement(30015)),
						m(WuerthBms.ChannelId.PACK_LIMIT_MIN_BATTERY_VOLTAGE, new UnsignedWordElement(30016)), //
						m(new UnsignedWordElement(30017)) //
								.m(WuerthBms.ChannelId.PACK_STATE_SOC, DIRECT_1_TO_1) //
								.m(Battery.ChannelId.SOC, SCALE_FACTOR_MINUS_1) //
								.build(), //
						m(Battery.ChannelId.SOH, new UnsignedWordElement(30018)),
						m(WuerthBms.ChannelId.PACK_STATE_ENERGY, new UnsignedWordElement(30019)),
						m(WuerthBms.ChannelId.PACK_VOLTAGE, new UnsignedWordElement(30020), SCALE_FACTOR_MINUS_1), //
						m(WuerthBms.ChannelId.PACK_HIGH_VOLTAGE_PLUS, new UnsignedWordElement(30021), //
								SCALE_FACTOR_MINUS_1), //
						new DummyRegisterElement(30022), // not implemented by Würth
						m(WuerthBms.ChannelId.SW_VERSION_MAJOR, new UnsignedWordElement(30023)), //
						m(WuerthBms.ChannelId.SW_VERSION_MINOR, new UnsignedWordElement(30024)), //
						m(WuerthBms.ChannelId.SW_VERSION_PATCH, new UnsignedWordElement(30025)), //
						m(WuerthBms.ChannelId.COM_LAST_FAILED_CSC, new UnsignedWordElement(30026)), //
						m(WuerthBms.ChannelId.STRING_MODULE_COUNT, new UnsignedWordElement(30027)), //
						m(WuerthBms.ChannelId.KL_30, new UnsignedWordElement(30028)), //
						m(WuerthBms.ChannelId.KL_30C, new UnsignedWordElement(30029)), //
						m(WuerthBms.ChannelId.CELL_OPEN_WIRE_DETECTION, new UnsignedWordElement(30030)), //
						m(WuerthBms.ChannelId.CSC_OPEN_WIRE_DETECTION, new UnsignedWordElement(30031)), //
						m(WuerthBms.ChannelId.CVCM_FAULT_CASE, new UnsignedWordElement(30032)), //
						m(WuerthBms.ChannelId.PACK_REMAINING_CAPACITY, new UnsignedWordElement(30033)), //
						m(WuerthBms.ChannelId.CONTACTOR_SOH, new UnsignedWordElement(30034)), //
						m(WuerthBms.ChannelId.DIAG_LAST_FAILED_CSC, new UnsignedWordElement(30035)), //
						m(WuerthBms.ChannelId.LATENT_LAST_FAILED_CSC, new UnsignedWordElement(30036)), //
						m(WuerthBms.ChannelId.SHUTDOWN_PATH_CAUSE, new UnsignedWordElement(30037)), //
						m(WuerthBms.ChannelId.START_UP_PATH_FAILED_AT, new UnsignedWordElement(30038)), //
						m(WuerthBms.ChannelId.PACK_CURRENT_MA, new SignedWordElement(30039)), //
						m(WuerthBms.ChannelId.AVG_CELL_VOLTAGE_STRING, new UnsignedWordElement(30040)), //
						m(Battery.ChannelId.MAX_CELL_VOLTAGE, new UnsignedWordElement(30041)), //
						m(Battery.ChannelId.MIN_CELL_VOLTAGE, new UnsignedWordElement(30042)), //
						m(WuerthBms.ChannelId.AVG_TEMPERATURE_STRING, new UnsignedWordElement(30043)), //
						m(Battery.ChannelId.MAX_CELL_TEMPERATURE, new UnsignedWordElement(30044)), //
						m(Battery.ChannelId.MIN_CELL_TEMPERATURE, new UnsignedWordElement(30045)), //
						new DummyRegisterElement(30046), //
						m(new BitsWordElement(30047, this) //
								.bit(0, WuerthBms.ChannelId.CELL_OT_CUTOFF) //
								.bit(1, WuerthBms.ChannelId.CELL_OT_MAX) //
								.bit(2, WuerthBms.ChannelId.CELL_OT_WARN) //
								.bit(3, WuerthBms.ChannelId.CELL_OV_CUTOFF) //
								.bit(4, WuerthBms.ChannelId.CELL_OV_MAX) //
								.bit(5, WuerthBms.ChannelId.CELL_OV_WARN) //
								.bit(6, WuerthBms.ChannelId.CELL_UT_CUTOFF) //
								.bit(7, WuerthBms.ChannelId.CELL_UT_MAX) //
								.bit(8, WuerthBms.ChannelId.CELL_UT_WARN) //
								.bit(9, WuerthBms.ChannelId.CELL_UV_CUTOFF) //
								.bit(10, WuerthBms.ChannelId.CELL_UV_MAX) //
								.bit(11, WuerthBms.ChannelId.CELL_UV_WARN) //
								.bit(12, WuerthBms.ChannelId.COMMUNICATION_ERROR) //
								.bit(13, WuerthBms.ChannelId.CONT_NEGATIVE_ERR) //
								.bit(14, WuerthBms.ChannelId.CONT_POSITIVE_ERR) //
								.bit(15, WuerthBms.ChannelId.CURRENT_OC_CHARGE)), //

						m(new BitsWordElement(30048, this) //
								.bit(0, WuerthBms.ChannelId.CURRENT_OC_DISCHARGE) //
								.bit(1, WuerthBms.ChannelId.CURRENT_MEASURE_ERROR) //
								.bit(2, WuerthBms.ChannelId.INSULATION_ERROR) //
								.bit(3, WuerthBms.ChannelId.VOLT_PLAUSIBILITY_ERROR) //
								.bit(4, WuerthBms.ChannelId.SOC_ERROR) //
								.bit(5, WuerthBms.ChannelId.SOH_ERROR) //
								.bit(6, WuerthBms.ChannelId.STRING_CONNECTED) //
								.bit(7, WuerthBms.ChannelId.TEMP_DIFFERENCE_ERROR) //
								.bit(8, WuerthBms.ChannelId.BALANCING_ERROR) //
								.bit(9, WuerthBms.ChannelId.SOC_HIGH_ERROR) //
								.bit(10, WuerthBms.ChannelId.SOC_RECALIBRATION_WARNING) //
								.bit(11, WuerthBms.ChannelId.SYSTEM_LOCK_STATUS) //
								.bit(12, WuerthBms.ChannelId.SHUTDOWN_PATH_ACTIVE) //
								.bit(13, WuerthBms.ChannelId.MCU_EVENT_DIE_TEMP) //
								.bit(14, WuerthBms.ChannelId.SHUNT_OVERTEMPERATURE) //
								.bit(15, WuerthBms.ChannelId.PRECHARGE_FAILED)), //

						m(new BitsWordElement(30049, this) //
								.bit(0, WuerthBms.ChannelId.KL_30_C_FAULT) //
								.bit(1, WuerthBms.ChannelId.SHUNT_CALIBRATION_ERROR) //
								.bit(2, WuerthBms.ChannelId.SET_IP_FAIL) //
								.bit(3, WuerthBms.ChannelId.FEEDBACK_BROKEN) //
								.bit(4, WuerthBms.ChannelId.PRECHARGE_ENERGY_MAX) //
								.bit(5, WuerthBms.ChannelId.CONTACTOR_SOH_WARNING)) //
				), //

				new FC4ReadInputRegistersTask(33000, Priority.LOW, //
						m(WuerthBms.ChannelId.CFG_MODULE_CNT, new SignedWordElement(33000)), //
						m(WuerthBms.ChannelId.CFG_CELL_CNT, new SignedWordElement(33001)), //
						m(WuerthBms.ChannelId.CFG_TEMP_SENS_CNT, new SignedWordElement(33002)), //
						m(WuerthBms.ChannelId.CFG_TEMP_SENS_CNT_PER_MODULE, new SignedWordElement(33003)), //
						m(WuerthBms.ChannelId.CFG_CSC_PER_MODULE, new SignedWordElement(33004)), //
						m(WuerthBms.ChannelId.CFG_CSC_CELL_CSC_CNT, new SignedWordElement(33005)), //
						m(WuerthBms.ChannelId.CFG_CSC_TEMP_SENS_CSC, new SignedWordElement(33006)), //
						m(WuerthBms.ChannelId.CFG_CSC_TEMP_SENSORS, new SignedWordElement(33007)), //
						m(WuerthBms.ChannelId.CFG_CSC_TEMP_T4, new UnsignedWordElement(33008)), //
						m(WuerthBms.ChannelId.CFG_CSC_NTC_RNTC, new UnsignedWordElement(33009)), //
						m(WuerthBms.ChannelId.CFG_CSC_NTC_REFTEMP, new UnsignedWordElement(33010)), //
						m(WuerthBms.ChannelId.CFG_CSC_NTC_REFRES, new UnsignedWordElement(33011)), //
						m(WuerthBms.ChannelId.CFG_CSC_NTC_BETA, new UnsignedWordElement(33012)), //
						m(WuerthBms.ChannelId.CFG_CSC_NTC_CHANNELS, new UnsignedWordElement(33013)), //
						m(WuerthBms.ChannelId.CFG_BATT_CAPACITY_AH, new UnsignedWordElement(33014)), //
						m(WuerthBms.ChannelId.CFG_BATT_RELAX_PERIOD_MIN, new UnsignedWordElement(33015)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_SAFE_OV_V, new UnsignedWordElement(33016)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_OV_V, new UnsignedWordElement(33017)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_WARN_OV_V, new UnsignedWordElement(33018)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_SAFE_UV_V, new UnsignedWordElement(33019)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_UV_V, new UnsignedWordElement(33020)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_WARN_UV_V, new UnsignedWordElement(33021)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_VOLTAGE_FTTI_MS, new UnsignedWordElement(33022)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_SAFE_VOLTAGE_FTTI_MS, new UnsignedWordElement(33023)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_SAFETY_TEMP_MAX, new UnsignedWordElement(33024)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_OPERATION_TEMP_MAX, new UnsignedWordElement(33025)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_WARN_TEMP_MAX, new UnsignedWordElement(33026)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_SAFETY_TEMP_MIN, new UnsignedWordElement(33027)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_OPERATION_TEMP_MIN, new UnsignedWordElement(33028)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_WARN_TEMP_MIN, new UnsignedWordElement(33029)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_CUTOFF_TEMPERATURE_FTTI_MS, new UnsignedWordElement(33030)), //
						m(WuerthBms.ChannelId.CFG_BATT_CELL_SAFE_TEMPERATURE_FTTI_MS, new UnsignedWordElement(33031)), //
						m(WuerthBms.ChannelId.CFG_BATT_STRING_MIN_V, new UnsignedWordElement(33032)), //
						m(WuerthBms.ChannelId.CFG_BATT_STRING_MAX_V, new UnsignedWordElement(33033)), //
						m(WuerthBms.ChannelId.CONTACTOR_SOH_MIN_WARNING, new UnsignedWordElement(33034)), //
						m(WuerthBms.ChannelId.SOC_MIN_WARNING, new UnsignedWordElement(33035)), //
						m(WuerthBms.ChannelId.CONTACTOR_FEEDBACK_VOLTAGE_TOLERANCE, new UnsignedWordElement(33036)), //
						new DummyRegisterElement(33037), // not implemented by Würth
						m(WuerthBms.ChannelId.PRECHARGE_MAX_POWER_DISSIPATION_J, new UnsignedWordElement(33038)), //
						new DummyRegisterElement(33039), // not implemented by Würth
						m(WuerthBms.ChannelId.CFG_CHARGE_CURRENT_LIMIT_TOLERANCE_A, new UnsignedWordElement(33040)), //
						m(WuerthBms.ChannelId.CFG_SHUNT_TEMPERATURE_HIGH, new UnsignedWordElement(33041)), //
						m(WuerthBms.ChannelId.CFG_BALANCE_ACTIVATE, new UnsignedWordElement(33042)), //
						m(WuerthBms.ChannelId.CFG_BALANCING_ACTIVATE_MV, new UnsignedWordElement(33043)), //
						m(WuerthBms.ChannelId.CFG_BALANCING_DEACTIVE_MV, new UnsignedWordElement(33044)), //
						m(WuerthBms.ChannelId.CFG_BALANCING_MIN_CELL_VOLTAGE_MV, new UnsignedWordElement(33045)), //
						new DummyRegisterElement(33046), // not implemented by Würth
						m(WuerthBms.ChannelId.CFG_BATT_PLAUS_THRESHOLD_PERCENT, new UnsignedWordElement(33047)), //
						new DummyRegisterElement(33048), // not implemented by Würth
						m(WuerthBms.ChannelId.CFG_BMS_IDLE_CURRENT_ABS_MA, new UnsignedWordElement(33049)), //
						m(WuerthBms.ChannelId.CFG_BMS_MAXIMUM_SOC, new UnsignedWordElement(33050)), //
						m(WuerthBms.ChannelId.CFG_BMS_MINIMUM_SOC, new UnsignedWordElement(33051)), //
						m(WuerthBms.ChannelId.CFG_PRECHARGE_ACTIVE_CURRENT_MA, new UnsignedWordElement(33052)), //
						m(WuerthBms.ChannelId.CFG_PRECHARGE_RESISTOR_OHMS, new UnsignedWordElement(33053)), //
						new DummyRegisterElement(33054, 33058), // not implemented by Würth
						m(WuerthBms.ChannelId.CFG_PRECHARGE_THRESHOLD, new UnsignedWordElement(33059)), //
						new DummyRegisterElement(33060), // not implemented by Würth
						m(WuerthBms.ChannelId.CFG_PRECHARGE_TIMEOUT, new UnsignedWordElement(33061)), //
						m(WuerthBms.ChannelId.CFG_CONTACTOR_NEGATIVE_TIMEOUT, new UnsignedWordElement(33062)), //
						m(WuerthBms.ChannelId.CFG_CONTACTOR_POSITIVE_TIMEOUT, new UnsignedWordElement(33063)), //
						m(WuerthBms.ChannelId.CFG_CONTACTOR_UNDERLOAD_CURRENT, new UnsignedWordElement(33064)), //
						new DummyRegisterElement(33065, 33067), // not implemented by Würth
						m(WuerthBms.ChannelId.CFG_PRECHARGE_ONBOARD, new UnsignedWordElement(33068)), //
						m(WuerthBms.ChannelId.CFG_CONTACTOR_ACTIVATION_TIME_MS, new UnsignedWordElement(33069)), //
						new DummyRegisterElement(33070, 33073), // not implemented by Würth
						m(WuerthBms.ChannelId.TEMPDEP_CURRENT_MONITOR_ACTIVE, new UnsignedWordElement(33074)), //
						m(WuerthBms.ChannelId.TEMPDEP_CURRENT_SHUNT_TOL_ERROR_PERC, new UnsignedWordElement(33075)), //
						m(WuerthBms.ChannelId.TEMPDEP_CURRENT_LTC_MEAS_ERROR_PERC, new UnsignedWordElement(33076)), //
						m(WuerthBms.ChannelId.TEMPDEP_CURRENT_SHUNT_MAX_ERROR_PERC, new UnsignedWordElement(33077)), //
						m(WuerthBms.ChannelId.TEMPDEP_CURRENT_OVERCURRENT_SHUTDOWN_MS, new UnsignedWordElement(33078)), //
						m(WuerthBms.ChannelId.OVER_CURRENT_COMPARATOR_ACTIVE, new UnsignedWordElement(33079)), //
						m(WuerthBms.ChannelId.OVER_CURRENT_CURRENT_LIMIT_A, new UnsignedWordElement(33080)), //
						m(WuerthBms.ChannelId.OVER_CURRENT_COMPARATOR_LIMIT_MV, new UnsignedWordElement(33081)), //
						m(WuerthBms.ChannelId.OVER_CURRENT_OVERCURRENT_SAFETY_MS, new UnsignedWordElement(33082)), //
						m(WuerthBms.ChannelId.CELL_MONITORING_DIAG_FTTI_MS, new UnsignedWordElement(33083)), //
						new DummyRegisterElement(33084), // not implemented by Würth
						m(WuerthBms.ChannelId.DIE_TEMP_LIMIT_WARNING_LOWER_DEGC, new UnsignedWordElement(33085)), //
						m(WuerthBms.ChannelId.DIE_TEMP_LIMIT_WARNING_UPPER_DEGC, new UnsignedWordElement(33086)), //
						m(WuerthBms.ChannelId.DIE_TEMP_LIMIT_SAFETY_LOWER_DEGC, new UnsignedWordElement(33087)), //
						m(WuerthBms.ChannelId.DIE_TEMP_LIMIT_SAFETY_UPPER_DEGC, new UnsignedWordElement(33088)), //
						m(WuerthBms.ChannelId.DIE_TEMP_LIMIT_SMU_LOWER_DEGC, new UnsignedWordElement(33089)), //
						m(WuerthBms.ChannelId.DIE_TEMP_LIMIT_SMU_UPPER_DEGC, new UnsignedWordElement(33090)), //
						m(WuerthBms.ChannelId.CSC_VOLTAGE_MEASUREMENT_ERROR_COMBINED_MV,
								new UnsignedWordElement(33091)), //
						m(WuerthBms.ChannelId.CSC_TEMPERATURE_MEASUREMENT_ERROR_COMBINED_DEGC,
								new UnsignedWordElement(33092)), //
						m(WuerthBms.ChannelId.CSC_VOLTAGE_MEASUREMENT_PLAUSIBILITY_THRESHOLD_MV,
								new UnsignedWordElement(33093)), //
						m(WuerthBms.ChannelId.CSC_STACK_VS_SUM_PLAUSIBILITY_THRESHOLD_MV,
								new UnsignedWordElement(33094)), //
						m(WuerthBms.ChannelId.CSC_ALLOWED_COM_RETRIES, new UnsignedWordElement(33095)), //
						m(WuerthBms.ChannelId.CSC_CELLBALANCINGTIME_PER_DIAG_CYCLE_MS, new UnsignedWordElement(33096)), //
						m(WuerthBms.ChannelId.BMS_CONTACTOR_INVERTED, new UnsignedWordElement(33097)), //
						m(WuerthBms.ChannelId.RELAY_AUX0_OPEN_MV, new UnsignedWordElement(33098)), //
						m(WuerthBms.ChannelId.RELAY_AUX1_OPEN_MV, new UnsignedWordElement(33099)), //
						m(WuerthBms.ChannelId.RELAY_AUX0_CLOSED_MV, new UnsignedWordElement(33100)), //
						m(WuerthBms.ChannelId.RELAY_AUX1_CLOSED_MV, new UnsignedWordElement(33101)), //
						m(WuerthBms.ChannelId.RELAY_AUX_DEVIATION_MAX_MV, new UnsignedWordElement(33102)), //
						m(WuerthBms.ChannelId.WEBCM_DEV_ACTIVATE_BALANCING, new UnsignedWordElement(33103)), //
						m(WuerthBms.ChannelId.WEBCM_DEV_ACTIVATE_ALLRUNTIME_CHECKS, new UnsignedWordElement(33104)), //
						m(WuerthBms.ChannelId.WEBCM_DEV_ACTIVATE_RANGE_CHECKS, new UnsignedWordElement(33105)), //
						m(WuerthBms.ChannelId.TEST_WEOS_DEACTIVATE_AREA_CHECK, new UnsignedWordElement(33106)), //
						m(WuerthBms.ChannelId.TEST_WEOS_DEACTIVATE_BUS_MPU, new UnsignedWordElement(33107)), //
						m(WuerthBms.ChannelId.TEST_WEOS_ALL_CORE0_TASKS_PRIVILEGED, new UnsignedWordElement(33108)), //
						m(WuerthBms.ChannelId.OV_CUTOFF_MIN_TEMP, new UnsignedWordElement(33109)), //
						m(WuerthBms.ChannelId.OV_CUTOFF_MAX_TEMP, new UnsignedWordElement(33110)), //
						m(WuerthBms.ChannelId.UV_CUTOFF_MIN_TEMP, new UnsignedWordElement(33111)), //
						m(WuerthBms.ChannelId.UV_CUTOFF_MAX_TEMP, new UnsignedWordElement(33112)), //
						m(WuerthBms.ChannelId.OV_SAFE_MIN_TEMP, new UnsignedWordElement(33113)), //
						m(WuerthBms.ChannelId.OV_SAFE_MAX_TEMP, new UnsignedWordElement(33114)), //
						m(WuerthBms.ChannelId.UV_SAFE_MIN_TEMP, new UnsignedWordElement(33115)), //
						m(WuerthBms.ChannelId.UV_SAFE_MAX_TEMP, new UnsignedWordElement(33116)), //
						m(WuerthBms.ChannelId.CURRENT_CHARGE_MIN_TEMP, new UnsignedWordElement(33117)), //
						m(WuerthBms.ChannelId.CURRENT_CHARGE_MAX_TEMP, new UnsignedWordElement(33118)), //
						m(WuerthBms.ChannelId.CURRENT_DISCHARGE_MIN_TEMP, new UnsignedWordElement(33119)), //
						m(WuerthBms.ChannelId.CURRENT_DISCHARGE_MAX_TEMP, new UnsignedWordElement(33120)), //
						m(WuerthBms.ChannelId.CFG_OVERCURRENT_SAFE_STATE, new UnsignedWordElement(33121)), //
						m(WuerthBms.ChannelId.CFG_OVER_CURRENT_SAFE_STATE_THRESHOLD, new UnsignedWordElement(33122)), //
						m(WuerthBms.ChannelId.CFG_PRECHARGE_MAX_ENERGY_WS, new UnsignedWordElement(33123),
								SCALE_FACTOR_MINUS_1) //
				), //

				new FC4ReadInputRegistersTask(33200, Priority.LOW, //
						m(WuerthBms.ChannelId.SOC_MIN, new SignedWordElement(33200)), //
						m(WuerthBms.ChannelId.SOC_MAX, new SignedWordElement(33201)), //
						m(WuerthBms.ChannelId.LOCK_STATUS_CRC_MSB, new SignedWordElement(33202)), //
						m(WuerthBms.ChannelId.LOCK_STATUS_CRC_LSB, new SignedWordElement(33203)) //
				),

				new FC16WriteRegistersTask(baseWrite, //
						m(WuerthBms.ChannelId.COMMAND_STATE_REQUEST, new UnsignedWordElement(baseWrite)), //
						new DummyRegisterElement(40001, 40004), //
						m(WuerthBms.ChannelId.COMMAND_RESET_1, new UnsignedWordElement(baseWrite + 5)), //
						m(WuerthBms.ChannelId.COMMAND_RESET_2, new UnsignedWordElement(baseWrite + 6)), //
						m(WuerthBms.ChannelId.COMMAND_ALIVE_COUNTER, new UnsignedWordElement(baseWrite + 7)), //
						m(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_MSB, new UnsignedWordElement(baseWrite + 8)), //
						m(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_LSB, new UnsignedWordElement(baseWrite + 9)), //
						m(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_CRC_MSB,
								new UnsignedWordElement(baseWrite + 10)), //
						m(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_CRC_LSB,
								new UnsignedWordElement(baseWrite + 11)), //
						new DummyRegisterElement(40012, 40013), //
						m(WuerthBms.ChannelId.REGULATION_REMAINING_CAPACITY, new UnsignedWordElement(baseWrite + 14)), //
						m(WuerthBms.ChannelId.REGULATION_REMAINING_POWER_CAPABILITY,
								new UnsignedWordElement(baseWrite + 15)), //
						m(WuerthBms.ChannelId.REGULATION_ROUND_TRIP_EFFICIENCY,
								new UnsignedWordElement(baseWrite + 16)), //
						m(WuerthBms.ChannelId.REGULATION_SELF_DISCHARGING_RATE,
								new UnsignedWordElement(baseWrite + 17)), //
						m(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_IN_MSB,
								new UnsignedWordElement(baseWrite + 18)), //
						m(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_IN_LSB,
								new UnsignedWordElement(baseWrite + 19)), //
						m(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_OUT_MSB,
								new UnsignedWordElement(baseWrite + 20)), //
						m(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_OUT_LSB,
								new UnsignedWordElement(baseWrite + 21)), //
						m(WuerthBms.ChannelId.REGULATION_NUM_CHARGE_DISCHARGE_CYCLES,
								new UnsignedWordElement(baseWrite + 22)), //
						m(WuerthBms.ChannelId.SHUNT_CALIBRATION_MSB, new UnsignedWordElement(baseWrite + 23)), //
						m(WuerthBms.ChannelId.SHUNT_CALIBRATION_LSB, new UnsignedWordElement(baseWrite + 24)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET0, new UnsignedWordElement(baseWrite + 25)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET1, new UnsignedWordElement(baseWrite + 26)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET2, new UnsignedWordElement(baseWrite + 27)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET3, new UnsignedWordElement(baseWrite + 28)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET4, new UnsignedWordElement(baseWrite + 29)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET5, new UnsignedWordElement(baseWrite + 30)), //
						m(WuerthBms.ChannelId.IP_BYTE0, new UnsignedWordElement(baseWrite + 31)), //
						m(WuerthBms.ChannelId.IP_BYTE1, new UnsignedWordElement(baseWrite + 32)), //
						m(WuerthBms.ChannelId.IP_BYTE2, new UnsignedWordElement(baseWrite + 33)), //
						m(WuerthBms.ChannelId.IP_BYTE3, new UnsignedWordElement(baseWrite + 34)), //
						m(WuerthBms.ChannelId.GW_BYTE0, new UnsignedWordElement(baseWrite + 35)), //
						m(WuerthBms.ChannelId.GW_BYTE1, new UnsignedWordElement(baseWrite + 36)), //
						m(WuerthBms.ChannelId.GW_BYTE2, new UnsignedWordElement(baseWrite + 37)), //
						m(WuerthBms.ChannelId.GW_BYTE3, new UnsignedWordElement(baseWrite + 38)), //
						m(WuerthBms.ChannelId.HW_SERIAL_NUMBER_CODE_0, new UnsignedWordElement(baseWrite + 39)), //
						m(WuerthBms.ChannelId.HW_SERIAL_NUMBER_CODE_1, new UnsignedWordElement(baseWrite + 40)), //
						m(WuerthBms.ChannelId.HW_SERIAL_NUMBER_CODE_2, new UnsignedWordElement(baseWrite + 41)), //
						m(WuerthBms.ChannelId.HW_SERIAL_NUMBER_LETTER, new UnsignedWordElement(baseWrite + 42)), //
						m(WuerthBms.ChannelId.COMMAND_SOH_RESET, new UnsignedWordElement(baseWrite + 43)), //
						m(WuerthBms.ChannelId.COMMAND_SOH_HIGH_RESOLUTION_LSB, new UnsignedWordElement(baseWrite + 44)), //
						m(WuerthBms.ChannelId.COMMAND_SOH_HIGH_RESOLUTION_MSB, new UnsignedWordElement(baseWrite + 45)) //
				),

				new FC3ReadRegistersTask(baseWrite, Priority.LOW, //
						m(WuerthBms.ChannelId.COMMAND_STATE_REQUEST, new UnsignedWordElement(baseWrite)), //
						new DummyRegisterElement(40001, 40004), // not implemented by Würth
						m(WuerthBms.ChannelId.COMMAND_RESET_1, new UnsignedWordElement(baseWrite + 5)), //
						m(WuerthBms.ChannelId.COMMAND_RESET_2, new UnsignedWordElement(baseWrite + 6)), //
						m(WuerthBms.ChannelId.COMMAND_ALIVE_COUNTER, new UnsignedWordElement(baseWrite + 7)), //
						m(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_MSB, new UnsignedWordElement(baseWrite + 8)), //
						m(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_LSB, new UnsignedWordElement(baseWrite + 9)), //
						m(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_CRC_MSB,
								new UnsignedWordElement(baseWrite + 10)), //
						m(WuerthBms.ChannelId.COMMAND_RESET_SYSTEM_LOCK_CRC_LSB,
								new UnsignedWordElement(baseWrite + 11)), //
						new DummyRegisterElement(40012, 40013), // not implemented by Würth
						m(WuerthBms.ChannelId.REGULATION_REMAINING_CAPACITY, new UnsignedWordElement(baseWrite + 14)), //
						m(WuerthBms.ChannelId.REGULATION_REMAINING_POWER_CAPABILITY,
								new UnsignedWordElement(baseWrite + 15)), //
						m(WuerthBms.ChannelId.REGULATION_ROUND_TRIP_EFFICIENCY,
								new UnsignedWordElement(baseWrite + 16)), //
						m(WuerthBms.ChannelId.REGULATION_SELF_DISCHARGING_RATE,
								new UnsignedWordElement(baseWrite + 17)), //
						m(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_IN_MSB,
								new UnsignedWordElement(baseWrite + 18)), //
						m(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_IN_LSB,
								new UnsignedWordElement(baseWrite + 19)), //
						m(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_OUT_MSB,
								new UnsignedWordElement(baseWrite + 20)), //
						m(WuerthBms.ChannelId.REGULATION_ENERGY_THROUGHPUT_OVERALL_OUT_LSB,
								new UnsignedWordElement(baseWrite + 21)), //
						m(WuerthBms.ChannelId.REGULATION_NUM_CHARGE_DISCHARGE_CYCLES,
								new UnsignedWordElement(baseWrite + 22)), //
						new DummyRegisterElement(baseWrite + 23, baseWrite + 24), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET0, new UnsignedWordElement(baseWrite + 25)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET1, new UnsignedWordElement(baseWrite + 26)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET2, new UnsignedWordElement(baseWrite + 27)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET3, new UnsignedWordElement(baseWrite + 28)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET4, new UnsignedWordElement(baseWrite + 29)), //
						m(WuerthBms.ChannelId.MAC_ADDRESS_OCTET5, new UnsignedWordElement(baseWrite + 30)), //
						m(WuerthBms.ChannelId.IP_BYTE0, new UnsignedWordElement(baseWrite + 31)), //
						m(WuerthBms.ChannelId.IP_BYTE1, new UnsignedWordElement(baseWrite + 32)), //
						m(WuerthBms.ChannelId.IP_BYTE2, new UnsignedWordElement(baseWrite + 33)), //
						m(WuerthBms.ChannelId.IP_BYTE3, new UnsignedWordElement(baseWrite + 34)), //
						m(WuerthBms.ChannelId.GW_BYTE0, new UnsignedWordElement(baseWrite + 35)), //
						m(WuerthBms.ChannelId.GW_BYTE1, new UnsignedWordElement(baseWrite + 36)), //
						m(WuerthBms.ChannelId.GW_BYTE2, new UnsignedWordElement(baseWrite + 37)), //
						m(WuerthBms.ChannelId.GW_BYTE3, new UnsignedWordElement(baseWrite + 38)), //
						m(WuerthBms.ChannelId.HW_SERIAL_NUMBER_CODE_0, new UnsignedWordElement(baseWrite + 39)), //
						m(WuerthBms.ChannelId.HW_SERIAL_NUMBER_CODE_1, new UnsignedWordElement(baseWrite + 40)), //
						m(WuerthBms.ChannelId.HW_SERIAL_NUMBER_CODE_2, new UnsignedWordElement(baseWrite + 41)), //
						m(WuerthBms.ChannelId.HW_SERIAL_NUMBER_LETTER, new UnsignedWordElement(baseWrite + 42)), //
						m(WuerthBms.ChannelId.COMMAND_SOH_RESET, new UnsignedWordElement(baseWrite + 43)), //
						m(WuerthBms.ChannelId.COMMAND_SOH_HIGH_RESOLUTION_LSB, new UnsignedWordElement(baseWrite + 44)), //
						m(WuerthBms.ChannelId.COMMAND_SOH_HIGH_RESOLUTION_MSB, new UnsignedWordElement(baseWrite + 45)) //
				));
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
	 * Removes all dynamically generated channels that start with "MODULE", to avoid
	 * duplicates or outdated entries.
	 */
	private void clearOldDynamicChannels() {
		for (var channel : new ArrayList<>(this.channels())) {
			if (channel.channelId().name().startsWith("MODULE")) {
				if (this.removeChannel(channel)) {
					this.log.debug("Removed Würth channel {}", channel.channelId());
				}
			}
		}
	}

	private BatteryVoltageSpecification getBatteryVoltageSpecification() {
		final var cells = this.getCfgCellCnt().get() + this.getCfgCscCellCscCnt().get();
		final var modules = this.getCfgModuleCnt().get();
		final var maximumCellVoltageLimit = this.getCfgBattCellCutoffOvV().get();
		final var minimumCellVoltageLimit = this.getCfgBattCellCutoffUvV().get();
		final var maximumCellVoltageOperationLimit = 4130;
		final var minimumCellVoltageOperationLimit = 3250;
		final var maximumChargeVoltage = 967;
		final var minimumDischargeVoltage = 760;
		return new BatteryVoltageSpecification(cells, modules, maximumCellVoltageLimit, minimumCellVoltageLimit,
				maximumCellVoltageOperationLimit, minimumCellVoltageOperationLimit, maximumChargeVoltage,
				minimumDischargeVoltage);
	}

	protected void initializeDynamicChannels() {
		if (!this.areCellsAndModulesDefined()) {
			return;
		}
		this.clearOldDynamicChannels();
		final DynamicChannel[] dynamicChannels = { //
				new DynamicChannel("AVG_CELL_VOLTAGE", Unit.MILLIVOLT), //
				new DynamicChannel("MAX_CELL_VOLTAGE", Unit.MILLIVOLT), //
				new DynamicChannel("MIN_CELL_VOLTAGE", Unit.MILLIVOLT), //
				new DynamicChannel("AVG_TEMPERATURE", Unit.DEGREE_CELSIUS), //
				new DynamicChannel("MAX_TEMPERATURE", Unit.DEGREE_CELSIUS), //
				new DynamicChannel("MIN_TEMPERATURE", Unit.DEGREE_CELSIUS), //
				new DynamicChannel("SOH", Unit.PERCENT), //
				new DynamicChannel("STATE_ENERGY", Unit.KILOWATT_HOURS), //
				new DynamicChannel("REMAINING_CAPACITY", Unit.NONE) //
		};

		this.initializeDynamicModuleChannels(30100, dynamicChannels);
		this.initializeDynamicCellChannels(30460);

	}

	/**
	 * Method to dynamically create the module channels.
	 *
	 * @param startAddress    the start address of the register range.
	 * @param dynamicChannels the channels which are dynamically created. See
	 *                        {@link DynamicChannel}.
	 */
	protected void initializeDynamicModuleChannels(int startAddress, DynamicChannel[] dynamicChannels) {
		final int numberOfModules = this.getCfgModuleCnt().get();
		List<ModbusElement> elements = new ArrayList<>();
		int address = startAddress;

		for (int moduleIndex = 0; moduleIndex < numberOfModules; moduleIndex++) {
			for (DynamicChannel channel : dynamicChannels) {
				String channelId = "MODULE_" + moduleIndex + "_" + channel.suffix();

				elements.add(m(this.generateModuleChannel(channelId, INTEGER, c -> c.unit(channel.unit())),
						new UnsignedWordElement(address++)));
			}
		}
		this.addModbusTask(startAddress, Priority.HIGH, elements.toArray(ModbusElement[]::new));
	}

	/**
	 * Method to dynamically crate cell channels.
	 *
	 * @param baseCellElementAddress the start address of the register range.
	 */
	protected void initializeDynamicCellChannels(int baseCellElementAddress) {
		final int temperatureSensors = this.getCfgTempSensCntPerModule().get();
		final int modules = this.getCfgModuleCnt().get();
		final int cells = this.getCfgCellCnt().get() + this.getCfgCscCellCscCnt().get();
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

	private void addModbusTask(int baseCellElementAddress, Priority priority, ModbusElement... elements) {
		this.getModbusProtocol()//
				.addTask(new FC4ReadInputRegistersTask(baseCellElementAddress, priority, elements));
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

	private ChannelIdImpl generateModuleChannel(String channelIdSuffix, OpenemsType openemsType) {
		return this.generateModuleChannel(channelIdSuffix, openemsType, FunctionUtils::doNothing);
	}

	/**
	 * Checks whether every module and cell count channel has received data. This
	 * method is called before dynamically creating channels in order to avoid
	 * NullPointerExceptions and incorrect channel counts.
	 *
	 * @return true if all required channels have been defined
	 */
	private boolean areCellsAndModulesDefined() {
		return getCfgModuleCnt().isDefined()//
				&& getCfgCellCnt().isDefined()//
				&& getCfgCscCellCscCnt().isDefined()//
				&& getCfgBattCellCutoffOvV().isDefined()//
				&& getCfgBattCellCutoffUvV().isDefined()//
				&& getCfgTempSensCntPerModule().isDefined()//
				&& getCfgTempSensCnt().isDefined();//
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
		this.addModbusTask(startAddress, Priority.LOW, elements.toArray(ModbusElement[]::new));
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
			elements.add(m(this.generateModuleChannel("MODULE_" + moduleIndex + "_CELL_" + i + "_BALANCE", BOOLEAN),
					new UnsignedWordElement(startAddress + i)));
		}
		this.addModbusTask(startAddress, Priority.LOW, elements.toArray(ModbusElement[]::new));
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
		this.addModbusTask(startAddress, Priority.LOW, elements.toArray(ModbusElement[]::new));
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
		this.addModbusTask(startAddress, Priority.LOW, elements.toArray(ModbusElement[]::new));
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
			elements.add(m(this.generateModuleChannel("MODULE_" + moduleIndex + "_LOCK_STATUS_TEMPERATURE_CSC" + i,
					INTEGER, c -> c.unit(Unit.DEGREE_CELSIUS)), new UnsignedWordElement(startAddress + i)));
		}
		this.addModbusTask(startAddress, Priority.LOW, elements.toArray(ModbusElement[]::new));
	}

	/**
	 * On BMS startup, relevant channels for voltage protection are undefined. Thus,
	 * it is set after a few cycles.
	 */
	private void ensureVoltageProtectionLimits() {
		if (this.voltageProtectionLimits == null && this.areCellsAndModulesDefined()) {
			this.voltageProtectionLimits = new BatteryVoltageProtectionLimits<>(this.getBatteryVoltageSpecification(),
					this);
		}
	}

	/**
	 * Updates the voltage protection limit. Assures that the variable is not null.
	 */
	private void updateVoltageProtectionLimits() {
		this.ensureVoltageProtectionLimits();
		if (this.voltageProtectionLimits != null) {
			this.voltageProtectionLimits.updateLimits();
		}
	}

	@Override
	public List<Channel<?>> defineBatteryErrorAcknowledgeChannels() {
		return List.of(//
				this.getModbusCommunicationFailedChannel(), //
				this.getTimeoutStartBatteryChannel(), this.getTimeoutStopBatteryChannel());
	}
}
