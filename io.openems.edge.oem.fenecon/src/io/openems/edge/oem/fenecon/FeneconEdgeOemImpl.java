package io.openems.edge.oem.fenecon;

import static io.openems.common.OpenemsConstants.VERSION_DEV_BRANCH;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

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
			latestVersionUrl = "https://fenecon.de/fems-download-dev/" + devBranch + "/fems.version";
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

	private final Map<String, String> links = new ImmutableMap.Builder<String, String>()//
			.put("SwitchEvcsLink", "https://docs.fenecon.de/de/fems/change_log_beta_test/change_log_full.html") //
			.build();

	private final Map<String, String> appToWebsiteUrl = new ImmutableMap.Builder<String, String>() //
			// Products
			.put("App.FENECON.Home", "https://docs.fenecon.de/de/home/home_10-1_overview.html") //
			.put("App.FENECON.Home.20", "https://fenecon.de/fenecon-home-20-30") //
			.put("App.FENECON.Home.30", "https://fenecon.de/fenecon-home-20-30") //
			.put("App.FENECON.Home6", "https://fenecon.de/fenecon-home-6-10-15") //
			.put("App.FENECON.Home10.Gen2", "https://fenecon.de/fenecon-home-6-10-15") //
			.put("App.FENECON.Home15", "https://fenecon.de/fenecon-home-6-10-15") //
			.put("App.FENECON.Commercial.50.Gen3", "https://fenecon.de/fenecon-commercial-50") //
			.put("App.FENECON.Commercial.92", "https://fenecon.de/fenecon-commercial-92") //
			.put("App.FENECON.Commercial.100", "") //
			.put("App.FENECON.Commercial.92.ClusterMaster", "https://fenecon.de/fenecon-commercial-92") //
			.put("App.FENECON.Commercial.92.ClusterSlave", "https://fenecon.de/fenecon-commercial-92") //
			.put("App.FENECON.Industrial.L.ILK710", "https://fenecon.de/fenecon-industrial-l") //
			.put("App.FENECON.Industrial.S.ISK010", "https://fenecon.de/fenecon-industrial-s") //
			.put("App.FENECON.Industrial.S.ISK110", "https://fenecon.de/fenecon-industrial-s") //
			.put("App.FENECON.Industrial.S.ISK011", "https://fenecon.de/fenecon-industrial-s") //
			.put("App.FENECON.ProHybrid.10", "https://docs.fenecon.de/de/legacy.html#_2018") //
			.put("App.FENECON.ProHybrid.GW", "https://docs.fenecon.de/de/legacy.html#_2018") //

			// Basis-Apps
			.put("App.PvSelfConsumption.SelfConsumptionOptimization",
					"https://fenecon.de/fems-eigenverbrauchsoptimierung-hc") //
			.put("App.PvSelfConsumption.GridOptimizedCharge", "https://fenecon.de/fems-netzdienliche-beladung-hc") //
			.put("App.Api.ModbusTcp.ReadOnly", "https://fenecon.de/fems-modbus-tcp-lesend") //
			.put("App.Api.RestJson.ReadOnly", "https://fenecon.de/fems-rest-json-lesend") //

			// Allgemein
			.put("App.TimeOfUseTariff.LuoxEnergy", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.AncillaryCosts", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.Awattar", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.ENTSO-E", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.GroupeE", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.Hassfurt", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.OctopusGo", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.OctopusHeat", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.Stromdao", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.Swisspower", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.Tibber", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.TimeOfUseTariff.RabotCharge", "https://fenecon.de/fems-dynamischer-stromtarif") //
			.put("App.Meter.Socomec", "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler") //
			.put("App.Meter.CarloGavazzi", "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler") //
			.put("App.Meter.PqPlus", "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler") //
			.put("App.Meter.Janitza", "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler") //
			.put("App.Meter.Discovergy", "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler") //
			.put("App.Meter.PhoenixContact", "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler") //
			.put("App.Meter.Eastron", "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler") //
			.put("App.Meter.Kdk", "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler") //
			.put("App.Meter.Shelly", "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler") //
			.put("App.PvInverter.Fronius", "https://fenecon.de/fems-pv-wechselrichter") //
			.put("App.PvInverter.Kaco", "https://fenecon.de/fems-pv-wechselrichter") //
			.put("App.PvInverter.Kostal", "https://fenecon.de/fems-pv-wechselrichter") //
			.put("App.PvInverter.Sma", "https://fenecon.de/fems-pv-wechselrichter") //
			.put("App.PvInverter.SolarEdge", "https://fenecon.de/fems-pv-wechselrichter") //

			// Wärmemanagement
			.put("App.Heat.HeatPump", "https://fenecon.de/fems-power-to-heat") //
			.put("App.Heat.CHP", "https://fenecon.de/fems-power-to-heat") //
			.put("App.Heat.HeatingElement", "https://fenecon.de/fems-power-to-heat") //
			.put("App.Heat.Askoma.ReadOnly", "https://fenecon.de/fems-power-to-heat-lesend") //
			.put("App.Heat.MyPv.ReadOnly", "https://fenecon.de/fems-power-to-heat-lesend") //

			// E-Mobilität
			.put("App.Evcs.Keba", "https://fenecon.de/fems-ac-ladestation") //
			.put("App.Evse.ChargePoint.Keba", "https://fenecon.de/fems-ac-ladestation") //
			.put("App.Evcs.HardyBarth", "https://fenecon.de/fems-ac-ladestation") //
			.put("App.Evcs.Abl.ReadOnly", "https://fenecon.de/fems-ac-ladestation-lesend") //
			.put("App.Evcs.HardyBarth.ReadOnly", "https://fenecon.de/fems-ac-ladestation-lesend") //
			.put("App.Evcs.Keba.ReadOnly", "https://fenecon.de/fems-ac-ladestation-lesend") //
			.put("App.Evcs.Goe.ReadOnly", "https://fenecon.de/fems-ac-ladestation-lesend") //
			.put("App.Evcs.Heidelberg.ReadOnly", "https://fenecon.de/fems-ac-ladestation-lesend") //
			.put("App.Evcs.Mennekes.ReadOnly", "https://fenecon.de/fems-ac-ladestation-lesend") //
			.put("App.Evcs.Alpitronic", "https://fenecon.de/fems-dc-ladestation") //
			.put("App.Evcs.IesKeywatt", "https://fenecon.de/fems-dc-ladestation") //
			.put("App.Evcs.Cluster", "https://fenecon.de/fems-multiladepunkt-management") //

			// Lastspitzenkappung und atypische Netznutzung
			.put("App.PeakShaving.PeakShaving", "https://fenecon.de/fems-lastspitzenkappung") //
			.put("App.PeakShaving.PhaseAccuratePeakShaving", "https://fenecon.de/fems-phasengenaue-lastspitzenkappung") //
			.put("App.PeakShaving.TimeSlotPeakShaving", "https://fenecon.de/fems-hochlastzeitfenster") //

			// Laststeuerung
			.put("App.LoadControl.ThresholdControl", "https://fenecon.de/fems-schwellwertsteuerung") //
			.put("App.LoadControl.ManualRelayControl", "https://fenecon.de/fems-manuelle-relaissteuerung") //

			// Schnittstellen
			.put("App.Api.ModbusTcp.ReadWrite", "https://fenecon.de/fems-schreibzugriff-heimspeicher") //
			.put("App.Api.RestJson.ReadWrite", "https://fenecon.de/fems-schreibzugriff-heimspeicher") //
			.put("App.Hardware.KMtronic8Channel", "https://fenecon.de/fems-relainsboard-8kanal-tcp") //

			// Andere
			.put("App.System.Fenecon.Home", "") //
			.put("App.GridMeter.Janitza", "") //
			.put("App.GridMeter.GoodWe", "") //
			.put("App.GridMeter.Kdk", "") //
			.put("App.Cloud.EnerixControl", "") //
			.put("App.Cloud.Clever-PV", "") //
			.put("App.Api.ModbusRtu.ReadOnly", "") //
			.put("App.Api.ModbusRtu.ReadWrite", "") //
			.put("App.Timedata.InfluxDb", "") //
			.put("App.Evcs.Webasto.Next", "") //
			.put("App.Evcs.Webasto.Unite", "") //
			.put("App.Hardware.IoGpio", "") //
			.put("App.Evse.ElectricVehicle.Generic", "") //
			.put("App.Evse.Controller.Cluster", "") //
			.put("App.Ess.FixActivePower", "") //
			.put("App.Ess.FixStateOfCharge", "") //
			.put("App.Ess.PowerPlantController", "") //
			.put("App.Ess.PrepareBatteryExtension", "") //
			.put("App.Ess.Limiter14a", "") //
			.put("App.Ess.SohCycle", "") //
			.put("App.Prediction.Default", "") //
			.put("App.Prediction.UnmanagedConsumption", "") //

			// Hardware
			.put("App.OpenemsHardware.BeagleBoneBlack", "") //
			.put("App.OpenemsHardware.Compulab", "") //
			.put("App.OpenemsHardware.CM3", "") //
			.put("App.OpenemsHardware.CM4", "") //
			.put("App.OpenemsHardware.CM4Max", "") //
			.put("App.OpenemsHardware.CM4S", "") //
			.put("App.OpenemsHardware.CM4S.Gen2", "") //
			.build();

	@Override
	public String getLink(String key) {
		return this.links.get(key);
	}

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
		String[] apiKeys = { //
				"koAynywShAFEm8v", //
				"4CDCv1GPZv1quBe", //
				"Py1oBPk2zo4T9oo", //
		};
		int randomIndex = ThreadLocalRandom.current().nextInt(apiKeys.length);
		return apiKeys[randomIndex];
	}

	@Override
	public String getHardyBarthApiToken() {
		return "hjkerwrq4tdgSdtze4e4Vhffgjfurz664g_dwfjsd_fjfadhisaguzy8dgtuawftzfghJad1hvxy gaghDSJdfghjkerswhjk_ewrhjsdfg5hjkdfghuqwfgaeghjdHfhjvcxjkaqj_klhasklysAjkladsjlsa";
	}
}
