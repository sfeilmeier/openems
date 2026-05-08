package io.openems.edge.app.integratedsystem.fenecon.industrial.xl;

import static io.openems.edge.core.appmanager.TranslationUtil.translate;

import java.util.List;
import java.util.ResourceBundle;

import com.google.gson.JsonPrimitive;

import io.openems.common.types.EdgeConfig;
import io.openems.common.types.EdgeConfig.Component;
import io.openems.common.utils.JsonUtils;
import io.openems.edge.app.enums.Parity;
import io.openems.edge.core.appmanager.ConfigurationTarget;
import io.openems.edge.ess.power.api.SolverStrategy;

public final class FeneconIndustrialXlComponents {

	/**
	 * Creates a default FISKER battery component for a FENECON Industrial XL.
	 *
	 * @param bundle          the translation bundle
	 * @param batteryId       the id of the battery
	 * @param alias           the alias of the battery
	 * @param f2bBatteryId    the selection of the battery order
	 * @param modbusToBattery the id of the internal modbus bridge
	 * @param modbusUnitId    the modbus unit id of the battery
	 * @return the {@link Component}
	 */
	public static EdgeConfig.Component batteryFisker(//
			final ResourceBundle bundle, //
			final String batteryId, //
			final String alias, //
			final String f2bBatteryId, //
			final String modbusToBattery, //
			final int modbusUnitId //
	) {
		return new EdgeConfig.Component(batteryId, translate(bundle, "App.IntegratedSystem.batteryN.alias", alias),
				"Battery.Fenecon.F2B.Fisker", JsonUtils.buildJsonObject() //
						.addProperty("enabled", true) //
						.addProperty("startStop", "AUTO") //
						.addProperty("batteryId", f2bBatteryId) //
						.addProperty("modbus.id", modbusToBattery) //
						.addProperty("modbusUnitId", modbusUnitId) //
						.build());
	}

	/**
	 * Creates a default f2b serial battery cluster component for a FENECON
	 * Industrial XL.
	 *
	 * @param bundle     the translation bundle
	 * @param batteryId  the id of the battery
	 * @param alias      the alias of the battery
	 * @param batteryIds the ids of the batteries which are controlled by this
	 *                   cluster
	 * @return the {@link Component}
	 */
	public static EdgeConfig.Component batteryf2bClusterSerial(//
			final ResourceBundle bundle, //
			final String batteryId, //
			final String alias, //
			final List<String> batteryIds //
	) {
		return new EdgeConfig.Component(batteryId,
				translate(bundle, "App.IntegratedSystem.batterySerialClusterN.alias", alias),
				"Battery.Fenecon.F2B.Cluster.Serial", JsonUtils.buildJsonObject() //
						.addProperty("enabled", true) //
						.addProperty("startStop", "AUTO") //
						.add("battery.ids", batteryIds.stream() //
								.map(JsonPrimitive::new) //
								.collect(JsonUtils.toJsonArray())) //
						.build());
	}

	/**
	 * Creates a default battery-inverter component for a FENECON Industrial XL.
	 *
	 * @param bundle                  the translation bundle
	 * @param batteryInverterId       the id of the Battery-Inverter
	 * @param number                  the number of the Battery-Inverter
	 * @param modbusToBatteryInverter the modbus-id of the Battery-Inverter
	 * @return the {@link Component}
	 */
	public static EdgeConfig.Component batteryInverter(//
			final ResourceBundle bundle, //
			final String batteryInverterId, //
			final int number, //
			final String modbusToBatteryInverter //
	) {
		return new EdgeConfig.Component(batteryInverterId,
				translate(bundle, "App.IntegratedSystem.batteryInverterN.alias", number),
				"Battery-Inverter.Kaco.BlueplanetGridsave", //
				JsonUtils.buildJsonObject() //
						.addProperty("enabled", true) //
						.addProperty("activateWatchdog", true) //
						.addProperty("modbus.id", modbusToBatteryInverter) //
						.addProperty("startStop", "AUTO") //
						.build());
	}

	/**
	 * Creates a default external modbus component for a FENECON Industrial XL.
	 *
	 * @param bundle   the translation bundle
	 * @param t        the {@link ConfigurationTarget} of the current configuration
	 * @param modbusId the component id
	 * @return the {@link Component}
	 */
	public static EdgeConfig.Component modbusExternal(//
			final ResourceBundle bundle, //
			final ConfigurationTarget t, //
			final String modbusId //
	) {
		return new EdgeConfig.Component(modbusId, //
				translate(bundle, "App.IntegratedSystem.modbus2.alias"), "Bridge.Modbus.Serial",
				JsonUtils.buildJsonObject() //
						.addProperty("enabled", true) //
						.addProperty("baudRate", 38400) //
						.addProperty("databits", 8) //
						.addProperty("parity", Parity.NONE) //
						.addProperty("portName", "/dev/ttySC0") //
						.addProperty("stopbits", "ONE") //
						.onlyIf(t != ConfigurationTarget.VALIDATE, b -> {
							b.addProperty("invalidateElementsAfterReadErrors", 3) //
									.addProperty("logVerbosity", "NONE");
						}) //
						.build());
	}

	/**
	 * Creates a default modbus bridge to the cooling unit components for a FENECON
	 * Industrial XL.
	 *
	 * @param bundle         the translation bundle
	 * @param t              the {@link ConfigurationTarget} of the current
	 *                       configuration
	 * @param translateKey   the translation key of the bridge
	 * @param modbusIdSuffix the id suffix of the bridge
	 * @param ip             the modbus ip address of the device
	 * @return the {@link Component}
	 */
	public static EdgeConfig.Component modbusToCoolingUnit(//
			final ResourceBundle bundle, //
			final ConfigurationTarget t, //
			final String translateKey, //
			final String modbusIdSuffix, //
			final String ip //
	) {
		return new EdgeConfig.Component(modbusIdSuffix, translate(bundle, translateKey, modbusIdSuffix),
				"Bridge.Modbus.Tcp", //
				JsonUtils.buildJsonObject() //
						.addProperty("enabled", true) //
						.onlyIf(t != ConfigurationTarget.ADD, b -> {
							b.addProperty("invalidateElementsAfterReadErrors", 3) //
									.addProperty("logVerbosity", "NONE");
						}) //
						.addProperty("port", 502) //
						.addProperty("ip", ip) //
						.build());
	}

	/**
	 * Creates a default modbus tcp bridge component to a IO component for a FENECON
	 * Industrial XL.
	 *
	 * @param bundle         the translation bundle
	 * @param t              the {@link ConfigurationTarget} of the current
	 *                       configuration
	 * @param modbusIdSuffix the id suffix of the bridge
	 * @param ip             the modbus ip address of the device
	 * @return the {@link Component}
	 */
	public static EdgeConfig.Component modbusToIo(//
			final ResourceBundle bundle, //
			final ConfigurationTarget t, //
			final String modbusIdSuffix, //
			final String ip //
	) {
		return new EdgeConfig.Component(modbusIdSuffix,
				translate(bundle, "App.FENECON.Industrial.Xl.modbusToIo.alias", modbusIdSuffix), "Bridge.Modbus.Tcp", //
				JsonUtils.buildJsonObject() //
						.addProperty("enabled", true) //
						.onlyIf(t != ConfigurationTarget.VALIDATE, b -> {
							b.addProperty("invalidateElementsAfterReadErrors", 3) //
									.addProperty("logVerbosity", "NONE");
						}) //
						.addProperty("port", 502) //
						.addProperty("ip", ip) //
						.build());
	}

	/**
	 * Creates a default modbus tcp bridge component to a battery for a FENECON
	 * Industrial XL.
	 *
	 * @param bundle         the translation bundle
	 * @param t              the {@link ConfigurationTarget} of the current
	 *                       configuration
	 * @param modbusIdSuffix the id suffix of the bridge
	 * @param alias          the alias of the bridge
	 * @param ip             the modbus ip address of the device
	 * @return the {@link Component}
	 */
	public static EdgeConfig.Component modbusToBattery(//
			final ResourceBundle bundle, //
			final ConfigurationTarget t, //
			final String modbusIdSuffix, //
			final String alias, //
			final String ip //
	) {
		return new EdgeConfig.Component(modbusIdSuffix,
				translate(bundle, "App.IntegratedSystem.modbusToBattery0.alias", alias), "Bridge.Modbus.Tcp", //
				JsonUtils.buildJsonObject() //
						.addProperty("enabled", true) //
						.onlyIf(t != ConfigurationTarget.VALIDATE, b -> {
							b.addProperty("invalidateElementsAfterReadErrors", 3) //
									.addProperty("logVerbosity", "NONE");
						}) //
						.addProperty("port", 502) //
						.addProperty("ip", ip) //
						.build());
	}

	/**
	 * Creates a default modbus bridge to a battery-inverter component for a FENECON
	 * Industrial XL.
	 *
	 * @param bundle         the translation bundle
	 * @param t              the {@link ConfigurationTarget} of the current
	 * @param modbusIdSuffix the id suffix of the bridge
	 * @param alias          the alias of the bridge
	 * @param ip             the modbus ip address of the device
	 * @return the {@link Component}
	 */
	public static EdgeConfig.Component modbusToBatteryInverter(//
			final ResourceBundle bundle, //
			final ConfigurationTarget t, //
			final String modbusIdSuffix, //
			final String alias, //
			final String ip //
	) {
		return new EdgeConfig.Component(modbusIdSuffix, translate(bundle, "App.IntegratedSystem.modbus1N.alias", alias),
				"Bridge.Modbus.Tcp", JsonUtils.buildJsonObject() //
						.addProperty("enabled", true) //
						.onlyIf(t != ConfigurationTarget.VALIDATE, b -> {
							b.addProperty("invalidateElementsAfterReadErrors", 3) //
									.addProperty("logVerbosity", "NONE");
						}) //
						.addProperty("port", 502) //
						.addProperty("ip", ip) //
						.build());
	}

	/**
	 * Creates a default system component for a FENECON Industrial XL.
	 *
	 * @param bundle            the translation bundle
	 * @param t                 the {@link ConfigurationTarget} of the current
	 *                          configuration
	 * @param essClusterId      the ess ids
	 * @param batteries         the battery ids
	 * @param tempSensorId      the tempSensor id
	 * @param fireAlarmSystemId the fire alarm system id
	 * @param airCoolingId      the air cooling id
	 * @param fluidCoolingId    the fluid cooling id
	 * @return the {@link Component}
	 */
	public static EdgeConfig.Component system(//
			final ResourceBundle bundle, //
			final ConfigurationTarget t, //
			final String essClusterId, //
			final List<String> batteries, //
			final String tempSensorId, //
			final String fireAlarmSystemId, //
			final String airCoolingId, //
			final String fluidCoolingId //
	) {
		return new EdgeConfig.Component("system0", "System Industrial XL (IXL010)", "System.Fenecon.Industrial.Xl", //
				JsonUtils.buildJsonObject() //
						.addProperty("enabled", true) //
						.addProperty("ess.id", essClusterId) //
						.add("battery.ids", batteries.stream() //
								.map(JsonPrimitive::new) //
								.collect(JsonUtils.toJsonArray())) //
						.addProperty("temp.id", tempSensorId) //
						.addProperty("fireAlarmSystem.id", fireAlarmSystemId) //
						.addProperty("airCooling.id", airCoolingId) //
						.addProperty("fluidCooling.id", fluidCoolingId) //
						.onlyIf(t == ConfigurationTarget.ADD, b -> {
							b.addProperty("startStop", "STOP");
						}) //
						.build());
	}

	/**
	 * Creates a default power component for a FENECON Industrial XL.
	 *
	 * @return the {@link Component}
	 */
	public static EdgeConfig.Component power() {
		return new EdgeConfig.Component("_power", "Ess.Power", "Ess.Power", //
				JsonUtils.buildJsonObject() //
						.addProperty("strategy", SolverStrategy.BALANCE) //
						.build());
	}

	private FeneconIndustrialXlComponents() {
	}

}
