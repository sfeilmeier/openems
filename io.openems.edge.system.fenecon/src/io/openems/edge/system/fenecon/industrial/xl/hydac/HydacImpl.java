package io.openems.edge.system.fenecon.industrial.xl.hydac;

import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SCALE_FACTOR_1;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SCALE_FACTOR_MINUS_1;
import static io.openems.edge.bridge.modbus.api.ElementToChannelConverter.SCALE_FACTOR_MINUS_2;

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
import org.osgi.service.metatype.annotations.Designate;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.bridge.modbus.api.AbstractOpenemsModbusComponent;
import io.openems.edge.bridge.modbus.api.BridgeModbus;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.bridge.modbus.api.ModbusProtocol;
import io.openems.edge.bridge.modbus.api.element.BitsWordElement;
import io.openems.edge.bridge.modbus.api.element.CoilElement;
import io.openems.edge.bridge.modbus.api.element.DummyRegisterElement;
import io.openems.edge.bridge.modbus.api.element.SignedWordElement;
import io.openems.edge.bridge.modbus.api.element.UnsignedWordElement;
import io.openems.edge.bridge.modbus.api.task.FC16WriteRegistersTask;
import io.openems.edge.bridge.modbus.api.task.FC1ReadCoilsTask;
import io.openems.edge.bridge.modbus.api.task.FC3ReadRegistersTask;
import io.openems.edge.bridge.modbus.api.task.FC4ReadInputRegistersTask;
import io.openems.edge.bridge.modbus.api.task.FC5WriteCoilTask;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.taskmanager.Priority;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "FluidCooling.Hydac", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE //
)
public class HydacImpl extends AbstractOpenemsModbusComponent implements Hydac, OpenemsComponent, ModbusComponent {

	private static final int UNIT_ID = 1;

	@Override
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	protected void setModbus(BridgeModbus modbus) {
		super.setModbus(modbus);
	}

	public HydacImpl() {
		super(//
				OpenemsComponent.ChannelId.values(), //
				ModbusComponent.ChannelId.values(), //
				Hydac.ChannelId.values()//
		);
	}

	@Reference
	private ComponentManager componentManager;

	@Reference
	private ConfigurationAdmin cm;

	@Activate
	protected void activate(ComponentContext context, Config config) throws OpenemsNamedException {
		if (super.activate(context, config.id(), config.alias(), config.enabled(), UNIT_ID, this.cm, "Modbus",
				config.modbus_id())) {
			return;
		}
	}

	@Override
	@Deactivate
	protected void deactivate() {
		super.deactivate();
	}

	@Override
	protected ModbusProtocol defineModbusProtocol() {
		return new ModbusProtocol(this, //
				new FC4ReadInputRegistersTask(1020, Priority.LOW, //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_TEMPERATURE, new SignedWordElement(1020),
								SCALE_FACTOR_MINUS_1), //
						new DummyRegisterElement(1021, 1022), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_FLOW, new UnsignedWordElement(1023), SCALE_FACTOR_1), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_CONDUCTANCE, new UnsignedWordElement(1024),
								SCALE_FACTOR_MINUS_1), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_TEMPERATURE_AMBIENT, new UnsignedWordElement(1025),
								SCALE_FACTOR_MINUS_1), //
						new DummyRegisterElement(1026, 1029), //
						m(new BitsWordElement(1030, this) //
								.bit(0, Hydac.ChannelId.CHILLER_READY) //
								.bit(1, Hydac.ChannelId.COOLING_REQUIRED) //
								.bit(2, Hydac.ChannelId.CHILLER_RUNNING) //
								.bit(3, Hydac.ChannelId.WARNING_ACTIVE) //
								.bit(4, Hydac.ChannelId.ALARM_ACTIVE) //
								.bit(5, Hydac.ChannelId.SYSTEM_ERROR) //
								.bit(6, Hydac.ChannelId.GATEWAY_ERROR) //
						), //
						m(new BitsWordElement(1031, this) //
								.bit(0, Hydac.ChannelId.COMPRESSOR) //
								.bit(1, Hydac.ChannelId.PUMP) //
								.bit(2, Hydac.ChannelId.HEATER) //
								.bit(3, Hydac.ChannelId.HGB_VALUE) //
								.bit(4, Hydac.ChannelId.FAN) //
								.bit(5, Hydac.ChannelId.DI_VALVE) //
						), //
						m(new BitsWordElement(1032, this) //
								.bit(0, Hydac.ChannelId.DRY_RUN) //
								.bit(1, Hydac.ChannelId.FLOW_ALARM) //
								.bit(2, Hydac.ChannelId.UNDER_TEMPERATURE_ALARM) //
								.bit(3, Hydac.ChannelId.OVER_TEMPERATURE_ALARM) //
						), //
						m(new BitsWordElement(1033, this) //
								.bit(0, Hydac.ChannelId.WATER_LEVEL_WARNING) //
								.bit(1, Hydac.ChannelId.FLOW_WARNING) //
								.bit(2, Hydac.ChannelId.UNDER_TEMPERATURE_WARNING) //
								.bit(3, Hydac.ChannelId.OVER_TEMPERATURE_WARNING) //
								.bit(3, Hydac.ChannelId.CONDUCTANCE_WARNING) //
						), //
						m(new BitsWordElement(1034, this) //
								.bit(0, Hydac.ChannelId.HIGH_PRESSURE_ALARM) //
								.bit(1, Hydac.ChannelId.LOW_PRESSURE_ALARM) //
								.bit(2, Hydac.ChannelId.FILTER_SPOILED) //
								.bit(3, Hydac.ChannelId.HOUSING_OPENED) //
						), //
						m(new BitsWordElement(1035, this) //
								.bit(0, Hydac.ChannelId.SENSOR_ERROR) //
								.bit(1, Hydac.ChannelId.MOTOR_PROTECTION_SWITCH_COMPRESSOR) //
								.bit(2, Hydac.ChannelId.MOTOR_PROTECTION_SWITCH_PUMP) //
								.bit(3, Hydac.ChannelId.MISCELLANEOUS_ALARM) //
								.bit(4, Hydac.ChannelId.MISCELLANEOUS_WARNING) //
								.bit(5, Hydac.ChannelId.FAN_ERROR) //
								.bit(6, Hydac.ChannelId.PHASE_ERROR) //
						) //
				), //
				new FC3ReadRegistersTask(2000, Priority.LOW, //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_SET_POINT, new SignedWordElement(2000),
								SCALE_FACTOR_MINUS_2), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_SET_POINT_OFFSET, new UnsignedWordElement(2001),
								SCALE_FACTOR_MINUS_2), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_FLOW_ALARM_SETPOINT, new UnsignedWordElement(2002),
								SCALE_FACTOR_MINUS_2), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_CONDUCTANCE_SETPOINT, new UnsignedWordElement(2003),
								SCALE_FACTOR_MINUS_2), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_CONTROL_MODE, new UnsignedWordElement(2004)), //
						new DummyRegisterElement(2005, 2010), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_SET_POINT_MIN, new UnsignedWordElement(2011),
								SCALE_FACTOR_MINUS_2), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_SET_POINT_MAX, new UnsignedWordElement(2012),
								SCALE_FACTOR_MINUS_2) //
				), //

				new FC16WriteRegistersTask(2000, //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_SET_POINT, new UnsignedWordElement(2000),
								SCALE_FACTOR_MINUS_2), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_SET_POINT_OFFSET, new UnsignedWordElement(2001))//
				), //

				new FC16WriteRegistersTask(2011, //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_SET_POINT_MIN, new UnsignedWordElement(2011)), //
						m(Hydac.ChannelId.COOLING_CIRCUIT_1_SET_POINT_MAX, new UnsignedWordElement(2012))//
				), //

				new FC1ReadCoilsTask(4100, Priority.LOW, //
						m(Hydac.ChannelId.CHILLER_ON, new CoilElement(4100))), //
				new FC1ReadCoilsTask(4101, Priority.LOW, //
						m(Hydac.ChannelId.CHILLER_OFF, new CoilElement(4101))), //
				new FC1ReadCoilsTask(4103, Priority.LOW, //
						m(Hydac.ChannelId.CLEAR_ERROR, new CoilElement(4103))), //

				new FC5WriteCoilTask(4100, //
						m(Hydac.ChannelId.CHILLER_ON, new CoilElement(4100))), //
				new FC5WriteCoilTask(4101, //
						m(Hydac.ChannelId.CHILLER_OFF, new CoilElement(4101))), //
				new FC5WriteCoilTask(4103, //
						m(Hydac.ChannelId.CLEAR_ERROR, new CoilElement(4103)))//
		);
	}

}