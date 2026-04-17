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

import io.openems.common.oem.AppLink;
import io.openems.common.oem.OpenemsEdgeOem;
import io.openems.common.session.Language;
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

	private final Map<String, AppLink> appToWebsiteUrl = new ImmutableMap.Builder<String, AppLink>() //
			// Products
			.put("App.FENECON.Home", AppLink.create() //
					.addLink(Language.DE, "https://docs.fenecon.de/de/home/home_10-1_overview.html")//
					.addLink(Language.EN, "https://docs.fenecon.de/en/home/home_10-1_overview.html")) //
			.put("App.FENECON.Home.20", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-home-20-30/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-home-20-30/")) //
			.put("App.FENECON.Home.30", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-home-20-30/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-home-20-30/")) //
			.put("App.FENECON.Home6", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-home-6-10-15/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-home-6-10-15/")) //
			.put("App.FENECON.Home10.Gen2", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-home-6-10-15/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-home-6-10-15/")) //
			.put("App.FENECON.Home15", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-home-6-10-15/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-home-6-10-15/")) //
			.put("App.FENECON.Commercial.50.Gen3", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-commercial-50/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-commercial-50/")) //
			.put("App.FENECON.Commercial.92", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-commercial-92/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-commercial-92/")) //
			.put("App.FENECON.Commercial.100", AppLink.create() //
					.addLink(Language.DE, "https://www.fenecon.de/fenecon-commercial-100/") //
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-commercial-100/")) //
			.put("App.FENECON.Commercial.92.ClusterMaster", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-commercial-92/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-commercial-92/") //
			) //
			.put("App.FENECON.Commercial.92.ClusterSlave", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-commercial-92/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-commercial-92/") //
			) //
			.put("App.FENECON.Industrial.L.ILK710", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-industrial-l/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-industrial-l/")) //
			.put("App.FENECON.Industrial.S.ISK010", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-industrial-s/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-industrial-s/")) //
			.put("App.FENECON.Industrial.S.ISK110", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-industrial-s/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-industrial-s/")) //
			.put("App.FENECON.Industrial.S.ISK011", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fenecon-industrial-s/")
					.addLink(Language.EN, "https://www.fenecon.com/fenecon-industrial-s/")) //
			.put("App.FENECON.ProHybrid.10", AppLink.create() //
					.addLink(Language.DE, "https://docs.fenecon.de/de/legacy.html#_2018").emptyLink(Language.EN) //
			) //
			.put("App.FENECON.ProHybrid.GW", AppLink.create() //
					.addLink(Language.DE, "https://docs.fenecon.de/de/legacy.html#_2018").emptyLink(Language.EN) //
			) //
			.put("App.FENECON.ProHybrid.9.10", AppLink.create() //
					.addLink(Language.DE, "https://docs.fenecon.de/de/legacy.html#_2018").emptyLink(Language.EN) //
			) //
			.put("App.FENECON.Mini.ES.3.3", AppLink.create() //
					.addLink(Language.DE, "https://docs.fenecon.de/de/legacy.html#_2018").emptyLink(Language.EN) //
			) //
			.put("App.FENECON.Mini.ES.3.6", AppLink.create() //
					.addLink(Language.DE, "https://docs.fenecon.de/de/legacy.html#_2018").emptyLink(Language.EN) //
			) //

			// Basis-Apps
			.put("App.PvSelfConsumption.SelfConsumptionOptimization", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-eigenverbrauchsoptimierung-hc")
					.addLink(Language.EN, "https://www.fenecon.com/fems-self-consumption-optimization-hc/")) //
			.put("App.PvSelfConsumption.GridOptimizedCharge", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-netzdienliche-beladung-hc")
					.addLink(Language.EN, "https://www.fenecon.com/fems-grid-optimized-charging-hc/")) //
			.put("App.Api.ModbusTcp.ReadOnly", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-modbus-tcp-lesend")
					.addLink(Language.EN, "https://www.fenecon.com/fems-modbus-tcp-reading/")) //
			.put("App.Api.RestJson.ReadOnly", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-rest-json-lesend")
					.addLink(Language.EN, "https://www.fenecon.com/fems-rest-json-reading/")) //

			// Allgemein
			.put("App.TimeOfUseTariff.LuoxEnergy", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //
			.put("App.TimeOfUseTariff.AncillaryCosts", AppLink.create() //
					.addLink(Language.DE, "https://docs.fenecon.de/de/fems/fems-app/App_Zeitvariable_Netzentgelte.html")
					.addLink(Language.EN,
							"https://docs.fenecon.de/en/fems/fems-app/App_Zeitvariable_Netzentgelte.html")) //
			.put("App.TimeOfUseTariff.Awattar", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //
			.put("App.TimeOfUseTariff.ENTSO-E", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //
			.put("App.TimeOfUseTariff.GroupeE", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //
			.put("App.TimeOfUseTariff.Hassfurt", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //
			.put("App.TimeOfUseTariff.OctopusGo", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //
			.put("App.TimeOfUseTariff.OctopusHeat", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //
			.put("App.TimeOfUseTariff.Stromdao", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //
			.put("App.TimeOfUseTariff.Swisspower", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //
			.put("App.TimeOfUseTariff.Tibber", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //
			.put("App.TimeOfUseTariff.RabotCharge", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dynamischer-stromtarif")
					.addLink(Language.EN, "https://www.fenecon.com/fems-time-of-use-tariff")) //

			.put("App.Meter.Socomec", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler")
					.addLink(Language.EN, "https://www.fenecon.com/fems-production-and-consumption-meter")) //
			.put("App.Meter.CarloGavazzi", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler")
					.addLink(Language.EN, "https://www.fenecon.com/fems-production-and-consumption-meter")) //
			.put("App.Meter.PqPlus", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler")
					.addLink(Language.EN, "https://www.fenecon.com/fems-production-and-consumption-meter")) //
			.put("App.Meter.Janitza", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler")
					.addLink(Language.EN, "https://www.fenecon.com/fems-production-and-consumption-meter")) //
			.put("App.Meter.Discovergy", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler")
					.addLink(Language.EN, "https://www.fenecon.com/fems-production-and-consumption-meter")) //
			.put("App.Meter.PhoenixContact", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler")
					.addLink(Language.EN, "https://www.fenecon.com/fems-production-and-consumption-meter")) //
			.put("App.Meter.Eastron", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler")
					.addLink(Language.EN, "https://www.fenecon.com/fems-production-and-consumption-meter")) //
			.put("App.Meter.Kdk", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-erzeugungs-und-verbrauchszahler")
					.addLink(Language.EN, "https://www.fenecon.com/fems-production-and-consumption-meter")) //
			.put("App.Meter.Shelly", AppLink.create() //
					.addLink(Language.DE, "https://www.fenecon.de/fems-shelly-diy") //
					.addLink(Language.EN,
							"https://docs.fenecon.de/en/fems/fems-app/konfigurationsanleitungen/App_Shelly_Plug_S_Gen3.html")) //
			.put("App.Meter.Shelly.Meter", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.PvInverter.Fronius", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-pv-wechselrichter")
					.addLink(Language.EN, "https://www.fenecon.com/fems-pv-inverter")) //
			.put("App.PvInverter.Kaco", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-pv-wechselrichter")
					.addLink(Language.EN, "https://www.fenecon.com/fems-pv-inverter")) //
			.put("App.PvInverter.Kostal", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-pv-wechselrichter")
					.addLink(Language.EN, "https://www.fenecon.com/fems-pv-inverter")) //
			.put("App.PvInverter.Sma", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-pv-wechselrichter")
					.addLink(Language.EN, "https://www.fenecon.com/fems-pv-inverter")) //
			.put("App.PvInverter.SolarEdge", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-pv-wechselrichter")
					.addLink(Language.EN, "https://www.fenecon.com/fems-pv-inverter")) //

			// Wärmemanagement
			.put("App.Heat.HeatPump", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-power-to-heat")
					.addLink(Language.EN, "https://www.fenecon.com/fems-power-to-heat")) //
			.put("App.Heat.CHP", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-power-to-heat")
					.addLink(Language.EN, "https://www.fenecon.com/fems-power-to-heat")) //
			.put("App.Heat.HeatingElement", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-power-to-heat")
					.addLink(Language.EN, "https://www.fenecon.com/fems-power-to-heat")) //
			.put("App.Heat.Askoma", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-power-to-heat")
					.addLink(Language.EN, "https://www.fenecon.com/fems-power-to-heat")) //
			.put("App.Heat.Askoma.ReadOnly", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-power-to-heat-lesend")
					.addLink(Language.EN, "https://www.fenecon.com/fems-power-to-heat-reading")) //
			.put("App.Heat.MyPv.ReadOnly", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-power-to-heat-lesend")
					.addLink(Language.EN, "https://www.fenecon.com/fems-power-to-heat-reading")) //

			// E-Mobilität
			.put("App.Evcs.Keba", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-ac-ladestation")
					.addLink(Language.EN, "https://www.fenecon.com/fems-ac-charging-station")) //
			.put("App.Evse.ChargePoint.Keba", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-ac-ladestation")
					.addLink(Language.EN, "https://www.fenecon.com/fems-ac-charging-station")) //
			.put("App.Evse.ChargePoint.Mennekes", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-ac-ladestation")
					.addLink(Language.EN, "https://www.fenecon.com/fems-ac-charging-station")) //
			.put("App.Evcs.HardyBarth", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-ac-ladestation")
					.addLink(Language.EN, "https://www.fenecon.com/fems-ac-charging-station")) //
			.put("App.Evcs.Abl.ReadOnly", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-ac-ladestation-lesend")
					.addLink(Language.EN, "https://www.fenecon.com/fems-ac-charging-station-reading")) //
			.put("App.Evcs.HardyBarth.ReadOnly", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-ac-ladestation-lesend")
					.addLink(Language.EN, "https://www.fenecon.com/fems-ac-charging-station-reading")) //
			.put("App.Evcs.Keba.ReadOnly", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-ac-ladestation-lesend")
					.addLink(Language.EN, "https://www.fenecon.com/fems-ac-charging-station-reading")) //
			.put("App.Evcs.Goe.ReadOnly", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-ac-ladestation-lesend")
					.addLink(Language.EN, "https://www.fenecon.com/fems-ac-charging-station-reading")) //
			.put("App.Evcs.Heidelberg.ReadOnly", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-ac-ladestation-lesend")
					.addLink(Language.EN, "https://www.fenecon.com/fems-ac-charging-station-reading")) //
			.put("App.Evcs.Mennekes.ReadOnly", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-ac-ladestation-lesend")
					.addLink(Language.EN, "https://www.fenecon.com/fems-ac-charging-station-reading")) //
			.put("App.Evcs.Alpitronic", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dc-ladestation")
					.addLink(Language.EN, "https://www.fenecon.com/fems-dc-charging-station")) //
			.put("App.Evcs.IesKeywatt", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-dc-ladestation")
					.addLink(Language.EN, "https://www.fenecon.com/fems-dc-charging-station")) //
			.put("App.Evcs.Cluster", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-multiladepunkt-management") //
					.addLink(Language.EN, "https://www.fenecon.com/fems-multi-charging-point-management")) //

			// Lastspitzenkappung
			.put("App.PeakShaving.PeakShaving", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-lastspitzenkappung")
					.addLink(Language.EN, "https://www.fenecon.com/fems-peak-shaving")) //
			.put("App.PeakShaving.PhaseAccuratePeakShaving", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-phasengenaue-lastspitzenkappung")
					.addLink(Language.EN, "https://www.fenecon.com/fems-peak-shaving")) //
			.put("App.PeakShaving.TimeSlotPeakShaving", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-hochlastzeitfenster")
					.addLink(Language.EN, "https://www.fenecon.com/fems-peak-load-time-window")) //

			// Laststeuerung
			.put("App.LoadControl.ThresholdControl", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-schwellwertsteuerung")
					.addLink(Language.EN, "https://www.fenecon.com/fems-threshold-control")) //
			.put("App.LoadControl.ManualRelayControl", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-manuelle-relaissteuerung")
					.addLink(Language.EN, "https://www.fenecon.com/fems-manual-relay-control")) //

			// Schnittstellen
			.put("App.Api.ModbusTcp.ReadWrite", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-schreibzugriff-heimspeicher")
					.addLink(Language.EN, "https://www.fenecon.com/fems-write-access-home")) //
			.put("App.Api.RestJson.ReadWrite", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-schreibzugriff-heimspeicher")
					.addLink(Language.EN, "https://www.fenecon.com/fems-write-access-home")) //
			.put("App.Hardware.KMtronic8Channel", AppLink.create() //
					.addLink(Language.DE, "https://fenecon.de/fems-relainsboard-8kanal-tcp")
					.addLink(Language.EN, "https://www.fenecon.com/fems-relay-board-8-channel-tcp")) //

			// Andere
			.put("App.System.Fenecon.Home", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.GridMeter.Janitza", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.GridMeter.GoodWe", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.GridMeter.Kdk", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Cloud.EnerixControl", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Cloud.Clever-PV", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Api.ModbusRtu.ReadOnly", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Api.ModbusRtu.ReadWrite", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Timedata.InfluxDb", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Evcs.Webasto.Next", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Evcs.Webasto.Unite", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Hardware.IoGpio", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Evse.ElectricVehicle.Generic", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Evse.Controller.Cluster", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Ess.FixActivePower", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Ess.FixStateOfCharge", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Ess.PowerPlantController", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Ess.PrepareBatteryExtension", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Ess.Limiter14a", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Ess.SohCycle", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Prediction.Default", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.Prediction.UnmanagedConsumption", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //

			// Hardware
			.put("App.OpenemsHardware.BeagleBoneBlack", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.OpenemsHardware.Compulab", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.OpenemsHardware.CM3", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.OpenemsHardware.CM4", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.OpenemsHardware.CM4Max", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.OpenemsHardware.CM4S", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.put("App.OpenemsHardware.CM4S.Gen2", AppLink.create() //
					.emptyLink(Language.DE) //
					.emptyLink(Language.EN) //
			) //
			.build();

	@Override
	public String getLink(String key) {
		return this.links.get(key);
	}

	@Override
	public String getAppWebsiteUrl(String appId, Language language) {
		return OpenemsEdgeOem.getAppWebsiteUrlFromMap(this.appToWebsiteUrl, appId, language);
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
