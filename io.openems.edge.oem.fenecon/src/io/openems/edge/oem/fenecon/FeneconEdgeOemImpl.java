package io.openems.edge.oem.fenecon;

import static io.openems.common.OpenemsConstants.VERSION_DEV_BRANCH;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Map;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.ImmutableMap;

import io.openems.common.oem.OpenemsEdgeOem;
import io.openems.common.utils.StringUtils;

@Component
public class FeneconEdgeOemImpl implements OpenemsEdgeOem {

	private static final Logger LOG = LoggerFactory.getLogger(FeneconEdgeOemImpl.class);

	private final String manufacturerEmsSerialNumber;

	@Activate
	public FeneconEdgeOemImpl() {
		this.manufacturerEmsSerialNumber = readManufacturerEmsSerialNumber();
	}

	@Override
	public String getManufacturer() {
		return "FENECON GmbH";
	}

	@Override
	public String getManufacturerModel() {
		return "FEMS";
	}

	@Override
	public String getManufacturerOptions() {
		return "";
	}

	@Override
	public String getManufacturerVersion() {
		return "";
	}

	@Override
	public String getManufacturerSerialNumber() {
		return "";
	}

	@Override
	public String getManufacturerEmsSerialNumber() {
		return this.manufacturerEmsSerialNumber;
	}

	@Override
	public String getInfluxdbTag() {
		return "fems";
	}

	@Override
	public String getBackendApiUrl() {
		return "wss://www1.fenecon.de:443/openems-backend2";
	}

	@Override
	public SystemUpdateParams getSystemUpdateParams() {
		return getSystemUpdateParams(VERSION_DEV_BRANCH);
	}

	protected static SystemUpdateParams getSystemUpdateParams(String devBranch) {
		final String latestVersionUrl;
		final String updateScriptParams;
		if (devBranch == null || devBranch.isBlank()) {
			latestVersionUrl = "https://fenecon.de/fems-download/fems-latest.version";
			updateScriptParams = "";
		} else {
			latestVersionUrl = "https://dev.intranet.fenecon.de/" + devBranch + "/fems.version";
			updateScriptParams = "-fb \"" + devBranch + "\"";
		}

		return new SystemUpdateParams(//
				"fems", //
				latestVersionUrl, //
				"https://fenecon.de/fems-tools/update-fems.sh", //
				updateScriptParams);
	}

	protected static String readManufacturerEmsSerialNumber() {
		String mesn = "";
		try {
			mesn = InetAddress.getLocalHost().getHostName();
		} catch (UnknownHostException uhe) {
			LOG.error("Unable get hostname via DNS-Lookup: " + uhe.getMessage());
		}
		return StringUtils.toShortString(mesn, 32);
	}

	private final Map<String, String> appToWebsiteUrl = new ImmutableMap.Builder<String, String>() //
			.put("App.FENECON.Home", "https://fenecon.de/fenecon-home-10/") //
			.put("App.FENECON.Home.20", "https://fenecon.de/fenecon-home-20-30/") //
			.put("App.FENECON.Home.30", "https://fenecon.de/fenecon-home-20-30/") //
			.put("App.FENECON.Home6", "https://fenecon.de/fenecon-home-6-10-15/") //
			.put("App.FENECON.Home10.Gen2", "https://fenecon.de/fenecon-home-6-10-15/") //
			.put("App.FENECON.Home15", "https://fenecon.de/fenecon-home-6-10-15/") //
			.put("App.FENECON.Commercial.92", "https://fenecon.de/fenecon-commercial-92/") //
			.put("App.FENECON.Commercial.92.ClusterMaster", "") //
			.put("App.FENECON.Commercial.92.ClusterSlave", "") //
			.put("App.FENECON.Industrial.L.ILK710", "https://fenecon.de/fenecon-industrial-l/") //
			.put("App.FENECON.Industrial.S.ISK010", "https://fenecon.de/fenecon-industrial-s/") //
			.put("App.FENECON.Industrial.S.ISK110", "https://fenecon.de/fenecon-industrial-s/") //
			.put("App.FENECON.Industrial.S.ISK011", "https://fenecon.de/fenecon-industrial-s/") //
			.put("App.TimeOfUseTariff.Awattar", "https://fenecon.de/fenecon-fems/fems-app-dynamischer-stromtarif/") //
			.put("App.TimeOfUseTariff.ENTSO-E", "https://fenecon.de/fenecon-fems/fems-app-dynamischer-stromtarif/") //
			.put("App.TimeOfUseTariff.GroupeE", "https://fenecon.de/fenecon-fems/fems-app-dynamischer-stromtarif/") //
			.put("App.TimeOfUseTariff.Hassfurt", "https://fenecon.de/fenecon-fems/fems-app-dynamischer-stromtarif/") //
			.put("App.TimeOfUseTariff.OctopusGo", "https://fenecon.de/fenecon-fems/fems-app-dynamischer-stromtarif/") //
			.put("App.TimeOfUseTariff.OctopusHeat", "https://fenecon.de/fenecon-fems/fems-app-dynamischer-stromtarif/") //
			.put("App.TimeOfUseTariff.Stromdao", "https://fenecon.de/fenecon-fems/fems-app-dynamischer-stromtarif/") //
			.put("App.TimeOfUseTariff.Swisspower", "https://fenecon.de/fenecon-fems/fems-app-dynamischer-stromtarif/") //
			.put("App.TimeOfUseTariff.Tibber", "https://fenecon.de/fenecon-fems/fems-app-dynamischer-stromtarif/") //
			.put("App.TimeOfUseTariff.RabotCharge", "https://fenecon.de/fenecon-fems/fems-app-dynamischer-stromtarif/") //
			// TODO add website when available
			.put("App.Cloud.EnerixControl", "") //
			.put("App.Cloud.Clever-PV", "") //
			// TODO folgende URLs sind veraltet
			.put("App.Api.ModbusTcp.ReadOnly", "https://fenecon.de/produkte/fems/fems-app-modbus-tcp-lesend/") //
			.put("App.Api.ModbusTcp.ReadWrite", "https://fenecon.de/produkte/fems/fems-app-modbus-tcp-schreibzugriff/") //
			.put("App.Api.ModbusRtu.ReadOnly", "") //
			.put("App.Api.ModbusRtu.ReadWrite", "") //
			.put("App.Api.RestJson.ReadOnly", "https://fenecon.de/produkte/fems/fems-app-rest-json-lesend/") //
			.put("App.Api.RestJson.ReadWrite", "https://fenecon.de/fenecon-fems/fems-app-rest-json-schreibzugriff/") //
			.put("App.Timedata.InfluxDb", "")
			.put("App.Evcs.Alpitronic", "https://fenecon.de/fenecon-fems/fems-app-dc-ladestation/") //
			.put("App.Evcs.Cluster", "https://fenecon.de/produkte/fems/fems-app-multiladepunkt-management/") //
			.put("App.Evcs.HardyBarth", "https://fenecon.de/fenecon-fems/fems-app-ac-ladestation/") //
			.put("App.Evcs.HardyBarth.ReadOnly", "https://fenecon.de/fenecon-fems/fems-app-ac-ladestation-lesend/") //
			.put("App.Evcs.IesKeywatt", "https://fenecon.de/fenecon-fems/fems-app-dc-ladestation/") //
			.put("App.Evcs.Keba", "https://fenecon.de/fenecon-fems/fems-app-ac-ladestation/") //
			.put("App.Evcs.Keba.ReadOnly", "https://fenecon.de/fenecon-fems/fems-app-ac-ladestation-lesend/") //
			.put("App.Evcs.Goe.ReadOnly", "https://fenecon.de/fenecon-fems/fems-app-ac-ladestation-lesend/") //
			.put("App.Evcs.Heidelberg.ReadOnly", "https://fenecon.de/fenecon-fems/fems-app-ac-ladestation-lesend/") //
			.put("App.Evcs.Mennekes.ReadOnly", "https://fenecon.de/fenecon-fems/fems-app-ac-ladestation-lesend/") //
			.put("App.Evcs.Webasto.Next", "") //
			.put("App.Evcs.Webasto.Unite", "") //
			.put("App.Hardware.IoGpio", "") //
			.put("App.Evse.ElectricVehicle.Generic", "") //
			.put("App.Evse.ChargePoint.Keba", "https://fenecon.de/fenecon-fems/fems-app-ac-ladestation/") //
			.put("App.Evse.Controller.Cluster", "") //
			.put("App.Hardware.KMtronic8Channel", "https://fenecon.de/produkte/fems/fems-relais/") //
			.put("App.Heat.HeatPump", "https://fenecon.de/fenecon-fems/fems-app-power-to-heat/") //
			.put("App.Heat.CHP", "https://fenecon.de/fenecon-fems/fems-app-power-to-heat/") //
			.put("App.Heat.HeatingElement", "https://fenecon.de/fenecon-fems/fems-app-power-to-heat/") //
			.put("App.Heat.Askoma.ReadOnly", "https://fenecon.de/fenecon-fems/fems-app-power-to-heat/") //
			.put("App.Heat.MyPv.ReadOnly", "https://fenecon.de/fenecon-fems/fems-app-power-to-heat/") //
			.put("App.PvSelfConsumption.GridOptimizedCharge",
					"https://fenecon.de/produkte/fems/fems-app-netzdienliche-beladung/") //
			.put("App.PvSelfConsumption.SelfConsumptionOptimization",
					"https://fenecon.de/produkte/fems/fems-app-eigenverbrauchsoptimierung/") //
			.put("App.LoadControl.ManualRelayControl",
					"https://fenecon.de/produkte/fems/fems-app-manuelle-relaissteuerung/") //
			.put("App.LoadControl.ThresholdControl", "https://fenecon.de/produkte/fems/fems-app-schwellwert-steuerung/") //
			// TODO URL veraltet
			.put("App.Meter.Socomec", "https://fenecon.de/produkte/fems/fems-app-socomec-zaehler/") //
			.put("App.Meter.CarloGavazzi", "https://fenecon.de/fenecon-fems/fems-app-erzeugungs-und-verbrauchszaehler/") //
			.put("App.Meter.PqPlus", "") //
			.put("App.Meter.Janitza", "https://fenecon.de/fenecon-fems/fems-app-erzeugungs-und-verbrauchszaehler/") //
			.put("App.Meter.Discovergy", "")//
			.put("App.Meter.PhoenixContact", "")//
			.put("App.Meter.Eastron", "https://fenecon.de/fenecon-fems/fems-app-erzeugungs-und-verbrauchszaehler/")//
			.put("App.Meter.Kdk", "https://fenecon.de/fenecon-fems/fems-app-erzeugungs-und-verbrauchszaehler/")//
			.put("App.PvInverter.Fronius", "https://fenecon.de/fenecon-fems/fems-app-pv-wechselrichter/") //
			.put("App.PvInverter.Kaco", "https://fenecon.de/fenecon-fems/fems-app-pv-wechselrichter/") //
			.put("App.PvInverter.Kostal", "https://fenecon.de/fenecon-fems/fems-app-pv-wechselrichter/") //
			.put("App.PvInverter.Sma", "https://fenecon.de/fenecon-fems/fems-app-pv-wechselrichter/") //
			.put("App.PvInverter.SolarEdge", "https://fenecon.de/fenecon-fems/fems-app-pv-wechselrichter/") //
			.put("App.PeakShaving.PeakShaving", "https://fenecon.de/fenecon-fems/fems-app-lastspitzenkappung/") //
			.put("App.PeakShaving.PhaseAccuratePeakShaving",
					"https://fenecon.de/fenecon-fems/fems-app-phasengenaue-lastspitzenkappung/") //
			.put("App.PeakShaving.TimeSlotPeakShaving", "https://fenecon.de/fenecon-fems/fems-app-hochlastzeitfenster/") //
			.put("App.OpenemsHardware.BeagleBoneBlack", "") //
			.put("App.OpenemsHardware.Compulab", "") //
			.put("App.OpenemsHardware.CM3", "") //
			.put("App.OpenemsHardware.CM4", "") //
			.put("App.OpenemsHardware.CM4Max", "") //
			.put("App.OpenemsHardware.CM4S", "") //
			.put("App.OpenemsHardware.CM4S.Gen2", "") //
			.put("App.Ess.FixActivePower", "") //
			.put("App.Ess.FixStateOfCharge", "") //
			.put("App.Ess.PowerPlantController", "") //
			.put("App.Ess.PrepareBatteryExtension", "") //
			.put("App.Ess.Limiter14a", "") //
			.build();

	@Override
	public String getAppWebsiteUrl(String appId) {
		return this.appToWebsiteUrl.get(appId);
	}

	@Override
	public String getKacoBlueplanetHybrid10IdentKey() {
		return "0xbddb2f76e47cf6e7";
	}

	@Override
	public String getEntsoeToken() {
		return "29ea7484-f60c-421a-b312-9db19dfd930a";
	}

	@Override
	public OAuthClientRegistration getRabotChargeCredentials() {
		return new OAuthClientRegistration("partner-fenecon", "DUwekm35VOoAURcbFhi7pU3PcEb21A8xbSHvHiONXz");
	}

	@Override
	public String getOpenCageApiKey() {
		return "84da209777eb42648ab80a68a2618423";
	}

	@Override
	public String getOpenMeteoApiKey() {
		return "1xngdTs5XQvhKhQh";
	}
}
