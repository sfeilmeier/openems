package io.openems.edge.system.fenecon.industrial.xl.firealarmsystem;

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
import io.openems.edge.bridge.modbus.api.element.DummyRegisterElement;
import io.openems.edge.bridge.modbus.api.task.FC3ReadRegistersTask;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.taskmanager.Priority;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "Firealarm.Hekatron.B2X2", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE //
)
public class HekatronB9X2Impl extends AbstractOpenemsModbusComponent
		implements HekatronB9X2, OpenemsComponent, ModbusComponent {

	private static final int UNIT_ID = 1;
	private Config config;

	@Reference
	private ConfigurationAdmin cm;

	@Override
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	protected void setModbus(BridgeModbus modbus) {
		super.setModbus(modbus);
	}

	public HekatronB9X2Impl() {
		super(//
				OpenemsComponent.ChannelId.values(), //
				ModbusComponent.ChannelId.values(), //
				HekatronB9X2.ChannelId.values() //
		);
	}

	@Activate
	private void activate(ComponentContext context, Config config) throws OpenemsNamedException {
		this.config = config;
		super.activate(context, config.id(), config.alias(), config.enabled(), UNIT_ID, this.cm, "Modbus",
				config.modbus_id());
	}

	@Deactivate
	protected void deactivate() {
		super.deactivate();
	}

	@Override
	protected ModbusProtocol defineModbusProtocol() {
		return switch (this.config.configVersion()) {
		case INDUSTRIAL_XL_V1 -> this.getIndustrialXlV1();
		case INDUSTRIAL_XL_V2 -> this.getIndustrialXlV2();
		};
	}

	private ModbusProtocol getIndustrialXlV1() {
		return new ModbusProtocol(this, //
				new FC3ReadRegistersTask(1, Priority.LOW, //
						m(new BitsWordElement(1, this) //
								.bit(2, HekatronB9X2.ChannelId.OPTICAL_SIGNAL_TRANSMITTER_SHUTDOWN) //
								.bit(3, HekatronB9X2.ChannelId.OPTICAL_SIGNAL_TRANSMITTER_ACTIVE)//
						), //
						m(new BitsWordElement(2, this) //
								.bit(2, HekatronB9X2.ChannelId.ACOUSTIC_SIGNAL_TRANSMITTER_SHUTDOWN) //
								.bit(3, HekatronB9X2.ChannelId.ACOUSTIC_SIGNAL_TRANSMITTER_ACTIVE)//
						), //
						m(new BitsWordElement(3, this) //
								.bit(2, HekatronB9X2.ChannelId.RELAY_ALARM_SHUTDOWN) //
								.bit(3, HekatronB9X2.ChannelId.RELAY_ALARM_ACTIVE)//
						), //
						m(new BitsWordElement(4, this) //
								.bit(2, HekatronB9X2.ChannelId.RELAY_MALFUNCTION_SHUTDOWN) //
								.bit(3, HekatronB9X2.ChannelId.RELAY_MALFUNCTION_ACTIVE)//
						), //
						m(new BitsWordElement(5, this) //
								.bit(2, HekatronB9X2.ChannelId.RELAY_CONTAINER_SHUTDOWN) //
								.bit(3, HekatronB9X2.ChannelId.RELAY_CONTAINER_ACTIVE)//
						), //
						new DummyRegisterElement(6, 14), //
						m(new BitsWordElement(15, this) //
								.bit(0, HekatronB9X2.ChannelId.DETECTOR_1_ALARM) //
								.bit(1, HekatronB9X2.ChannelId.DETECTOR_1_MALFUNCTION)//
								.bit(2, HekatronB9X2.ChannelId.DETECTOR_1_SHUTDOWN)//
						), //
						m(new BitsWordElement(16, this) //
								.bit(0, HekatronB9X2.ChannelId.DETECTOR_2_ALARM) //
								.bit(1, HekatronB9X2.ChannelId.DETECTOR_2_MALFUNCTION)//
								.bit(2, HekatronB9X2.ChannelId.DETECTOR_2_SHUTDOWN)//
						), //
						new DummyRegisterElement(17), //
						m(new BitsWordElement(18, this) //
								.bit(0, HekatronB9X2.ChannelId.CO_DETECTOR_ALARM) //
								.bit(1, HekatronB9X2.ChannelId.CO_DETECTOR_MALFUNCTION)//
								.bit(2, HekatronB9X2.ChannelId.CO_DETECTOR_SHUTDOWN)//
						)//
				));
	}

	private ModbusProtocol getIndustrialXlV2() {
		return new ModbusProtocol(this, //
				new FC3ReadRegistersTask(0, Priority.LOW, //
						m(new BitsWordElement(0, this) //
								.bit(0, HekatronB9X2.ChannelId.DETECTOR_1_ALARM) //
								.bit(1, HekatronB9X2.ChannelId.DETECTOR_1_MALFUNCTION)//
								.bit(2, HekatronB9X2.ChannelId.DETECTOR_1_SHUTDOWN)//
						), //
						m(new BitsWordElement(1, this) //
								.bit(0, HekatronB9X2.ChannelId.DETECTOR_2_ALARM) //
								.bit(1, HekatronB9X2.ChannelId.DETECTOR_2_MALFUNCTION)//
								.bit(2, HekatronB9X2.ChannelId.DETECTOR_2_SHUTDOWN)//
						), //
						new DummyRegisterElement(2, 3), //
						m(new BitsWordElement(4, this) //
								.bit(0, HekatronB9X2.ChannelId.CO_DETECTOR_ALARM) //
								.bit(1, HekatronB9X2.ChannelId.CO_DETECTOR_MALFUNCTION)//
								.bit(2, HekatronB9X2.ChannelId.CO_DETECTOR_SHUTDOWN)//
						), //
						new DummyRegisterElement(5, 10), //
						m(new BitsWordElement(11, this) //
								.bit(2, HekatronB9X2.ChannelId.OPTICAL_SIGNAL_TRANSMITTER_SHUTDOWN) //
								.bit(3, HekatronB9X2.ChannelId.OPTICAL_SIGNAL_TRANSMITTER_ACTIVE)//
						), //
						m(new BitsWordElement(12, this) //
								.bit(2, HekatronB9X2.ChannelId.ACOUSTIC_SIGNAL_TRANSMITTER_SHUTDOWN) //
								.bit(3, HekatronB9X2.ChannelId.ACOUSTIC_SIGNAL_TRANSMITTER_ACTIVE)//
						), //
						m(new BitsWordElement(13, this) //
								.bit(2, HekatronB9X2.ChannelId.PRE_ALARM_MESSAGE_DISABLED) //
								.bit(3, HekatronB9X2.ChannelId.PRE_ALARM)//
						), //
						m(new BitsWordElement(14, this) //
								.bit(2, HekatronB9X2.ChannelId.MAIN_ALARM_MESSAGE_DISABLED) //
								.bit(3, HekatronB9X2.ChannelId.MAIN_ALARM)//
						), //
						new DummyRegisterElement(15), //
						m(new BitsWordElement(16, this) //
								.bit(2, HekatronB9X2.ChannelId.RELAY_MALFUNCTION_SHUTDOWN) //
								.bit(3, HekatronB9X2.ChannelId.RELAY_MALFUNCTION_ACTIVE)//
						), //
						new DummyRegisterElement(17), //
						m(new BitsWordElement(18, this) //
								.bit(2, HekatronB9X2.ChannelId.RELAY_CONTAINER_SHUTDOWN) //
								.bit(3, HekatronB9X2.ChannelId.RELAY_CONTAINER_ACTIVE)//
						) //
				));
	}

}
