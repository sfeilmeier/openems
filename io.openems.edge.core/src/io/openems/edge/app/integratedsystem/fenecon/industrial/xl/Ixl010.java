package io.openems.edge.app.integratedsystem.fenecon.industrial.xl;

import static io.openems.common.utils.JsonUtils.toJsonArray;
import static io.openems.edge.app.common.props.CommonProps.alias;
import static io.openems.edge.app.common.props.CommonProps.defaultDef;
import static io.openems.edge.app.integratedsystem.fenecon.industrial.xl.FeneconIndustrialXlComponents.batteryFisker;
import static io.openems.edge.app.integratedsystem.fenecon.industrial.xl.FeneconIndustrialXlComponents.batteryInverter;
import static io.openems.edge.app.integratedsystem.fenecon.industrial.xl.FeneconIndustrialXlComponents.batteryf2bClusterSerial;
import static io.openems.edge.app.integratedsystem.fenecon.industrial.xl.FeneconIndustrialXlComponents.modbusExternal;
import static io.openems.edge.app.integratedsystem.fenecon.industrial.xl.FeneconIndustrialXlComponents.modbusToBattery;
import static io.openems.edge.app.integratedsystem.fenecon.industrial.xl.FeneconIndustrialXlComponents.modbusToBatteryInverter;
import static io.openems.edge.app.integratedsystem.fenecon.industrial.xl.FeneconIndustrialXlComponents.modbusToCoolingUnit;
import static io.openems.edge.app.integratedsystem.fenecon.industrial.xl.FeneconIndustrialXlComponents.modbusToIo;
import static io.openems.edge.app.integratedsystem.fenecon.industrial.xl.FeneconIndustrialXlComponents.power;
import static io.openems.edge.app.integratedsystem.fenecon.industrial.xl.FeneconIndustrialXlComponents.system;
import static io.openems.edge.core.appmanager.TranslationUtil.translate;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.IntStream;

import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.google.common.collect.Lists;
import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.function.ThrowingTriFunction;
import io.openems.common.session.Language;
import io.openems.common.session.Role;
import io.openems.common.types.EdgeConfig;
import io.openems.common.utils.JsonUtils;
import io.openems.edge.app.enums.MeterType;
import io.openems.edge.app.enums.OptionsFactory;
import io.openems.edge.app.integratedsystem.fenecon.industrial.xl.Ixl010.Property;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.core.appmanager.AbstractOpenemsApp;
import io.openems.edge.core.appmanager.AbstractOpenemsAppWithProps;
import io.openems.edge.core.appmanager.AppConfiguration;
import io.openems.edge.core.appmanager.AppDef;
import io.openems.edge.core.appmanager.AppManagerUtil;
import io.openems.edge.core.appmanager.ComponentUtil;
import io.openems.edge.core.appmanager.ConfigurationTarget;
import io.openems.edge.core.appmanager.OpenemsApp;
import io.openems.edge.core.appmanager.OpenemsAppCardinality;
import io.openems.edge.core.appmanager.OpenemsAppCategory;
import io.openems.edge.core.appmanager.OpenemsAppPermissions;
import io.openems.edge.core.appmanager.Type;
import io.openems.edge.core.appmanager.Type.Parameter.BundleParameter;
import io.openems.edge.core.appmanager.dependency.Tasks;
import io.openems.edge.core.appmanager.formly.JsonFormlyUtil;

@Component(name = "App.FENECON.Industrial.Xl.IXL010")
public class Ixl010 extends AbstractOpenemsAppWithProps<Ixl010, Property, BundleParameter> implements OpenemsApp {

	public enum Property implements Type<Property, Ixl010, BundleParameter> {
		ALIAS(alias()), //

		FIREALARMSYSTEM_CONFIG_VERSION(AppDef.copyOfGeneric(defaultDef(), def -> def //
				.setTranslatedLabelWithAppPrefix(".fireAlarmSystemConfigVersion.label") //
				.setDefaultValue(FireAlarmSystemConfigVersion.INDUSTRIAL_XL_V1) //
				.setField(JsonFormlyUtil::buildSelectFromNameable, (app, property, l, parameter, field) -> {
					field.setOptions(OptionsFactory.of(FireAlarmSystemConfigVersion.class), l);
				}))), //
		;

		private final AppDef<? super Ixl010, ? super Property, ? super BundleParameter> def;

		private Property(AppDef<? super Ixl010, ? super Property, ? super BundleParameter> def) {
			this.def = def;
		}

		@Override
		public Type<Property, Ixl010, BundleParameter> self() {
			return this;
		}

		@Override
		public AppDef<? super Ixl010, ? super Property, ? super BundleParameter> def() {
			return this.def;
		}

		@Override
		public Function<GetParameterValues<Ixl010>, BundleParameter> getParamter() {
			return Parameter.functionOf(AbstractOpenemsApp::getTranslationBundle);
		}

	}

	private static final int NUMBER_OF_BATTERIES = 18;

	@Activate
	public Ixl010(//
			@Reference final ComponentManager componentManager, //
			final ComponentContext componentContext, //
			@Reference final ConfigurationAdmin cm, //
			@Reference final ComponentUtil componentUtil, //
			@Reference final AppManagerUtil appManagerUtil //
	) {
		super(componentManager, componentContext, cm, componentUtil);
	}

	@Override
	public OpenemsAppCategory[] getCategories() {
		return new OpenemsAppCategory[] { OpenemsAppCategory.INTEGRATED_SYSTEM };
	}

	@Override
	public OpenemsAppCardinality getCardinality() {
		return OpenemsAppCardinality.SINGLE_IN_CATEGORY;
	}

	@Override
	protected Ixl010 getApp() {
		return this;
	}

	@Override
	protected ThrowingTriFunction<ConfigurationTarget, Map<Property, JsonElement>, Language, AppConfiguration, OpenemsNamedException> appPropertyConfigurationFactory() {
		return (t, p, l) -> {
			final var bundle = AbstractOpenemsApp.getTranslationBundle(l);

			final var essClusterId = "ess0";
			final var modbusIdExternal = "modbus0";
			final var tempSensorId = "temp0";
			final var meterId = "meter1";
			final var ioId = "io0";
			final var modbusToIoId = "modbus1";
			final var modbusToIoIp = "172.23.21.6";
			final var modbusToAirCoolingId = "modbus2";
			final var airCoolingId = "airCooling0";
			final var airCoolingIp = "172.23.21.4";
			final var modbusToFluidCoolingId = "modbus3";
			final var fluidCoolingId = "fluidCooling0";
			final var fluidCoolingIp = "172.23.21.3";
			final var modbusToFireAlarmSystemId = "modbus4";
			final var fireAlarmSystemId = "fireAlarmSystem0";
			final var fireAlarmSystemIp = "172.23.21.5";
			final var fireAlarmSystemConfigVersion = this.getEnum(p, FireAlarmSystemConfigVersion.class,
					Property.FIREALARMSYSTEM_CONFIG_VERSION);

			final var components = Lists.newArrayList(//
					power(), //
					modbusExternal(bundle, t, modbusIdExternal), //
					new EdgeConfig.Component(tempSensorId, //
							translate(bundle, "App.IntegratedSystem.temperaturSensor.alias"), "Jumo.Hydro.Trans.S20", //
							JsonUtils.buildJsonObject() //
									.addProperty("enabled", true) //
									.addProperty("modbus.id", modbusIdExternal) //
									.addProperty("modbusUnitId", 1) //
									.build()), //
					new EdgeConfig.Component(meterId, //
							translate(bundle, "App.IntegratedSystem.consumptionMeter.alias"), "Meter.KDK.2PUCT", //
							JsonUtils.buildJsonObject() //
									.addProperty("modbus.id", modbusIdExternal) //
									.addProperty("modbusUnitId", 2) //
									.addProperty("type", MeterType.CONSUMPTION_METERED) //
									.addProperty("invert", false)//
									.build()), //
					modbusToIo(bundle, t, modbusToIoId, modbusToIoIp), //
					new EdgeConfig.Component(ioId, //
							translate(bundle, "App.IntegratedSystem.fieldBusCoupler.alias"), "IO.Weidmueller.UR20", //
							JsonUtils.buildJsonObject() //
									.addProperty("enabled", true) //
									.addProperty("modbus.id", modbusToIoId) //
									.addProperty("modbusUnitId", 1) //
									.build()), //
					modbusToCoolingUnit(bundle, t, "App.IntegratedSystem.modbusToAirCooling.alias",
							modbusToAirCoolingId, airCoolingIp), //
					new EdgeConfig.Component(airCoolingId, //
							translate(bundle, "App.IntegratedSystem.airCooling.alias"), "AirCooling.BlueEPlus", //
							JsonUtils.buildJsonObject() //
									.addProperty("enabled", true) //
									.addProperty("modbus.id", modbusToAirCoolingId) //
									.addProperty("modbusUnitId", 2) //
									.build()), //
					modbusToCoolingUnit(bundle, t, "App.IntegratedSystem.modbusToFluidCooling.alias",
							modbusToFluidCoolingId, fluidCoolingIp), //
					new EdgeConfig.Component(fluidCoolingId, //
							translate(bundle, "App.IntegratedSystem.fluidCooling.alias"), "FluidCooling.Hydac", //
							JsonUtils.buildJsonObject() //
									.addProperty("enabled", true) //
									.addProperty("modbus.id", modbusToFluidCoolingId) //
									.addProperty("modbusUnitId", 1) //
									.build()), //
					modbusToCoolingUnit(bundle, t, "App.IntegratedSystem.modbusToFireAlarmSystem.alias",
							modbusToFireAlarmSystemId, fireAlarmSystemIp), //
					new EdgeConfig.Component(fireAlarmSystemId, //
							translate(bundle, "App.IntegratedSystem.fireAlarmSystem.alias"), "Firealarm.Hekatron.B2X2", //
							JsonUtils.buildJsonObject() //
									.addProperty("enabled", true) //
									.addProperty("configVersion", fireAlarmSystemConfigVersion) //
									.addProperty("modbus.id", modbusToFireAlarmSystemId) //
									.addProperty("modbusUnitId", 1) //
									.build()), //
					new EdgeConfig.Component(essClusterId, //
							translate(bundle, "App.IntegratedSystem.essCluster0.alias"), "Ess.Cluster", //
							JsonUtils.buildJsonObject() //
									.addProperty("enabled", true) //
									.addProperty("startStop", "AUTO") //
									.add("ess.ids", IntStream.range(0, NUMBER_OF_BATTERIES) //
											.mapToObj(i -> new JsonPrimitive("ess" + (i + 1))) //
											.collect(toJsonArray())) //
									.build()), //
					system(bundle, t, essClusterId,
							List.of("battery1", "battery4", "battery7", "battery10", "battery13", "battery16",
									"battery19", "battery22", "battery25", "battery28", "battery31", "battery34",
									"battery37", "battery40", "battery43", "battery46", "battery49", "battery52"),
							tempSensorId, fireAlarmSystemId, airCoolingId, fluidCoolingId));

			var batteryNumber = 1;
			for (int i = 1; i <= NUMBER_OF_BATTERIES; i++) {
				final var batteryNumberSerial = batteryNumber++;
				final var batterySeriallId = "battery" + batteryNumberSerial;

				final var batteryNumber1 = batteryNumber++;
				final var batteryId1 = "battery" + batteryNumber1;

				final var batteryNumber2 = batteryNumber++;
				final var batteryId2 = "battery" + batteryNumber2;

				final var stringBased = batteryNumber / 3;
				final var essId = "ess" + stringBased;

				final var batteryModbusId = "modbus" + (30 + stringBased);
				final var batteryInverterId = "batteryInverter" + stringBased;
				final var modbusIndex = getInverterModbusId(stringBased);
				final String inverterModbusAlias = Integer.toString(modbusIndex);
				final var inverterModbusId = "modbus" + modbusIndex;
				final var inverterModbusIp = "172.23.21." + modbusIndex;
				var serialClusterLocation = BatteryLocation.from(batteryNumberSerial);
				var batteryModbusAlias = generateBatteryAlias(serialClusterLocation);
				components.add(batteryf2bClusterSerial(bundle, batterySeriallId, batteryModbusAlias,
						List.of(batteryId1, batteryId2)));

				var batteryLocation = BatteryLocation.from(batteryNumber1);
				components.add(modbusToBattery(bundle, t, batteryModbusId, batteryModbusAlias,
						generateBatteryModbusIp(batteryLocation)));
				components.add(batteryFisker(bundle, batteryId1, generateBatteryAlias(batteryLocation), "F2B_BATTERY_1",
						batteryModbusId, 1));

				batteryLocation = BatteryLocation.from(batteryNumber2);
				final var battery2Alias = generateBatteryAlias(batteryLocation);
				components.add(batteryFisker(bundle, batteryId2, battery2Alias, "F2B_BATTERY_2", batteryModbusId, 1));

				components.add(
						modbusToBatteryInverter(bundle, t, inverterModbusId, inverterModbusAlias, inverterModbusIp));

				components.add(batteryInverter(bundle, batteryInverterId, stringBased, inverterModbusId));

				components.add(new EdgeConfig.Component(essId, //
						translate(bundle, "App.IntegratedSystem.essN.alias", stringBased), //
						"Ess.Generic.ManagedSymmetric", JsonUtils.buildJsonObject() //
								.addProperty("enabled", true) //
								.addProperty("battery.id", batterySeriallId) //
								.addProperty("batteryInverter.id", batteryInverterId) //
								.addProperty("startStop", "AUTO") //
								.build()));
			}

			return AppConfiguration.create() //
					.addTask(Tasks.component(components)) //
					.build();
		};
	}

	private record BatteryLocation(int batteryNumber, int towerId, int stringId, int batteryId) {
		public static BatteryLocation from(int batteryNumber) {
			final var towerId = (batteryNumber - 1) / NUMBER_OF_BATTERIES + 1;
			final var string = (batteryNumber - 1) % NUMBER_OF_BATTERIES;
			final var stringId = string / 3 + 1;
			final var batteryId = string % 3;
			return new BatteryLocation(batteryNumber, towerId, stringId, batteryId);
		}
	}

	private static String generateBatteryAlias(BatteryLocation location) {
		if (location.batteryId() == 0) {
			return String.format("Tower %d String %d", location.towerId(), location.stringId());
		}
		return String.format("Tower %d String %d Battery %d", location.towerId(), location.stringId(),
				location.batteryId());
	}

	private static String generateBatteryModbusIp(BatteryLocation loc) {
		return "172.23." + (21 + loc.towerId()) + "." + (30 + loc.stringId());
	}

	private static int getInverterModbusId(int inverterIndex) {
		var baseId = 10;
		var modbusId = baseId + inverterIndex;
		if (modbusId >= 20) {
			modbusId++;
		}
		return modbusId;
	}

	@Override
	public OpenemsAppPermissions getAppPermissions() {
		return OpenemsAppPermissions.create() //
				.setCanSee(Role.INSTALLER) //
				.setCanDelete(Role.INSTALLER) //
				.build();
	}

	@Override
	protected Property[] propertyValues() {
		return Property.values();
	}

}