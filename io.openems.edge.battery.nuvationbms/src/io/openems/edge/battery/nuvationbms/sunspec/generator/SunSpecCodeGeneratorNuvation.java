package io.openems.edge.battery.nuvationbms.sunspec.generator;

import java.io.File;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.ImmutableList;
import com.google.gson.JsonObject;

import io.openems.common.channel.AccessMode;
import io.openems.common.channel.Unit;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.bridge.modbus.sunspec.SunSpecModelType;
import io.openems.edge.bridge.modbus.sunspec.SunSpecPointCategory;
import io.openems.edge.bridge.modbus.sunspec.generator.AbstractSunSpecCodeGenerator;
import io.openems.edge.bridge.modbus.sunspec.generator.Model;
import io.openems.edge.bridge.modbus.sunspec.generator.Point;

/**
 * This tool converts SunSpec Json definitions to Java code suitable for the
 * OpenEMS SunSpec implementation.
 *
 */
public class SunSpecCodeGeneratorNuvation extends AbstractSunSpecCodeGenerator {

	private static final Logger log = LoggerFactory.getLogger(SunSpecCodeGeneratorNuvation.class);

	@Override
	protected String getOutFilePath() {
		return System.getProperty("user.dir")
				+ "\\src\\io\\openems\\edge\\battery\\nuvationbms\\sunspec\\generator\\NuvationSunSpecModel.java";
	}

	@Override
	protected String getSunSpecJsonPath() {
		final String jsonFileName = "model_803.json";
		var jsonFileUrl = SunSpecCodeGeneratorNuvation.class.getResource(jsonFileName);
		var folderPath = "";

		if (jsonFileUrl != null) {
			File jsonFile = new File(jsonFileUrl.getFile());
			folderPath = jsonFile.getParent();
			log.info("Folder Path: " + folderPath);
		} else {
			log.warn("JSON file not found in the package.");
		}
		return folderPath;
	}

	@Override
	protected Set<String> getIgnoreFiles() {
		return new HashSet<>(Arrays.asList(//
				"model_3.json", //
				"model_4.json", //
				"model_5.json", //
				"model_6.json", //
				"model_7.json", //
				"model_8.json", //
				"model_9.json", //
				"model_10.json", //
				"model_11.json", //
				"model_12.json", //
				"model_13.json", //
				"model_14.json", //
				"model_16.json", //
				"model_17.json", //
				"model_19.json", //
				"model_126.json", //
				"model_129.json", //
				"model_130.json", //
				"model_131.json", //
				"model_132.json", //
				"model_133.json", //
				"model_134.json", //
				"model_135.json", //
				"model_136.json", //
				"model_137.json", //
				"model_138.json", //
				"model_139.json", //
				"model_140.json", //
				"model_141.json", //
				"model_142.json", //
				"model_143.json", //
				"model_144.json", //
				"model_160.json", //
				"model_211.json", //
				"model_212.json", //
				"model_213.json", //
				"model_214.json", //
				"model_220.json", //
				"model_302.json", //
				"model_303.json", //
				"model_304.json", //
				"model_401.json", //
				"model_402.json", //
				"model_403.json", //
				"model_404.json", //
				"model_501.json", //
				"model_502.json", //
				"model_601.json", //
				// "model_803.json", //
				"model_804.json", //
				"model_805.json", //
				"model_806.json", //
				"model_807.json", //
				"model_808.json", //
				"model_809.json", //
				"model_63001.json", //
				"model_63002.json", //
				"model_64020.json" //
		));
	}

	@Override
	protected Model parseSunSpecModels(JsonObject sunSpecModels) throws OpenemsNamedException {
		return Model.fromJson(sunSpecModels);
	}

	/**
	 * Run this method to start the code generator.
	 *
	 * @param args not supported
	 * @throws Exception on error
	 */
	public static void main(String[] args) throws Exception {
		var generator = new SunSpecCodeGeneratorNuvation();
		var models = generator.parseSunSpecFiles();

		ImmutableList<Point> points = ImmutableList.of(
				new Point("DERTyp", 1, 2, "ENUM16", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "Distributed Energy Resource Type",
						"Type of distributed energy resource device."),
				new Point("WHRtg", 1, 3, "UINT16", Optional.of("WHRtg_SF"), Unit.CUMULATED_WATT_HOURS,
						AccessMode.READ_ONLY, true, SunSpecPointCategory.SETTING, new Point.Symbol[0],
						"Nameplate Energy Capacity", "Nameplate energy capacity in DC watt-hours."),
				new Point("WMaxChaRte", 1, 4, "UINT16", Optional.of("WMaxChaDisCha_SF"), Unit.WATT,
						AccessMode.READ_ONLY, true, SunSpecPointCategory.SETTING, new Point.Symbol[0],
						"Nameplate Max Charge Rate", "Maximum rate of energy transfer into the storage device."),
				new Point("WMaxDisChaRte", 1, 5, "UINT16", Optional.of("WMaxChaDisCha_SF"), Unit.WATT,
						AccessMode.READ_ONLY, true, SunSpecPointCategory.SETTING, new Point.Symbol[0],
						"Nameplate Max Discharge Rate", "Maximum rate of energy transfer out of the storage device."),
				new Point("DisChaRte", 1, 6, "UINT16", Optional.of("DisChaRte_SF"), Unit.PERCENT, AccessMode.READ_ONLY,
						false, SunSpecPointCategory.MEASUREMENT, new Point.Symbol[0], "Self Discharge Rate",
						"Self discharge rate. Percentage of capacity (WHRtg) discharged per day."),
				new Point("SoCNpMaxPct", 1, 7, "UINT16", Optional.of("SoC_SF"), Unit.PERCENT, AccessMode.READ_ONLY,
						false, SunSpecPointCategory.SETTING, new Point.Symbol[0], "Nameplate Max SoC",
						"Manufacturer maximum state of charge, expressed as a percentage."),
				new Point("SoCNpMinPct", 1, 8, "UINT16", Optional.of("SoC_SF"), Unit.PERCENT, AccessMode.READ_ONLY,
						false, SunSpecPointCategory.SETTING, new Point.Symbol[0], "Nameplate Min SoC",
						"Manufacturer minimum state of charge, expressed as a percentage."),
				new Point("MaxRsvPct", 1, 9, "UINT16", Optional.of("SoC_SF"), Unit.PERCENT, AccessMode.READ_WRITE,
						false, SunSpecPointCategory.SETTING, new Point.Symbol[0], "Maximum Reserve Percent",
						"Setpoint for maximum reserve for storage as a percentage of the nominal maximum storage."),
				new Point("MinRsvPct", 1, 10, "UINT16", Optional.of("SoC_SF"), Unit.PERCENT, AccessMode.READ_WRITE,
						false, SunSpecPointCategory.SETTING, new Point.Symbol[0], "Minimum Reserve Percent",
						"Setpoint for minimum reserve for storage as a percentage of the nominal maximum storage."),
				new Point("SoC", 1, 11, "UINT16", Optional.of("SoC_SF"), Unit.PERCENT, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.MEASUREMENT, new Point.Symbol[0], "State of Charge",
						"State of charge, expressed as a percentage."),
				new Point("ChaSt", 1, 12, "ENUM16", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, false,
						SunSpecPointCategory.STATUS, new Point.Symbol[0], "ChaSt",
						"Charge status of storage device. Enumerated value."),
				new Point("LocRemCtl", 1, 13, "ENUM16", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.CONTROL, new Point.Symbol[0], "Control Mode",
						"DER control mode. Enumeration."),
				new Point("Evt", 1, 14, "BITFIELD32", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.EVENT, new Point.Symbol[0], "Event Bitfield",
						"Bitmask value. Event fields."),
				new Point("DERHb", 1, 16, "UINT16", Optional.empty(), Unit.NONE, AccessMode.READ_WRITE, false,
						SunSpecPointCategory.STATUS, new Point.Symbol[0], "Distributed Energy Resource Heartbeat",
						"Value is incremented every second with periodic resets to zero."),
				new Point("ControllerHb", 1, 17, "UINT16", Optional.empty(), Unit.NONE, AccessMode.READ_WRITE, false,
						SunSpecPointCategory.STATUS, new Point.Symbol[0], "Controller Heartbeat",
						"Value is incremented every second with periodic resets to zero."),
				new Point("DERAlarmReset", 1, 18, "UINT16", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, false,
						SunSpecPointCategory.CONTROL, new Point.Symbol[0], "Alarm Reset",
						"Used to reset any latched alarms. 1 = Reset."),
				new Point("WHRtg_SF", 1, 19, "SUNSSF", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.SETTING, new Point.Symbol[0], "", "Scale factor for energy capacity."),
				new Point("WMaxChaDisCha_SF", 1, 20, "SUNSSF", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.SETTING, new Point.Symbol[0], "",
						"Scale factor for maximum charge and discharge rate."),
				new Point("DisChaRte_SF", 1, 21, "SUNSSF", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, false,
						SunSpecPointCategory.SETTING, new Point.Symbol[0], "", "Scale factor for self discharge rate."),
				new Point("SoC_SF", 1, 22, "SUNSSF", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.SETTING, new Point.Symbol[0], "",
						"Scale factor for state of charge values."),
				new Point("PAD", 1, 23, "PAD", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "", "Padding"));

		models.add(new Model(801, //
				22, //
				"ID", //
				"Energy Storage Base Model", //
				"", //
				points, //
				SunSpecModelType.STORAGE //
		));

		points = ImmutableList.of(//
				new Point("BatTyp", 1, 2, "ENUM16", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "Battery Type",
						"Type of battery. Enumeration."),
				new Point("BatSt", 1, 3, "ENUM16", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "State of the Battery Bank",
						"State of the battery bank. Enumeration."),
				new Point("CycleCt", 2, 4, "UINT32", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, false,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "Cycle Count",
						"Number of cycles executed in the battery."),
				new Point("SoH", 1, 6, "UINT16", Optional.of("SoH_SF"), Unit.PERCENT, AccessMode.READ_ONLY, false,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "State of Health",
						"Percentage of battery life remaining."),
				new Point("Evt1", 2, 7, "BITFIELD32", Optional.empty(), Unit.PERCENT, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "Battery Event 1 Bitfield",
						"Alarms and warnings. Bit flags."),
				new Point("Evt2", 2, 9, "BITFIELD32", Optional.empty(), Unit.PERCENT, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "Battery Event 2 Bitfield",
						"Alarms and warnings. Bit flags."),
				new Point("Vol", 1, 11, "UINT16", Optional.of("Vol_SF"), Unit.VOLT, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "External Battery Voltage", "DC Bus Voltage"),
				new Point("MaxBatACha", 1, 12, "UINT16", Optional.of("MaxBatA_SF"), Unit.AMPERE, AccessMode.READ_ONLY,
						true, SunSpecPointCategory.NONE, new Point.Symbol[0], "Max Charge Current",
						"Instantaneous maximum DC charge current."),
				new Point("MaxBatADischa", 1, 13, "UINT16", Optional.of("MaxBatA_SF"), Unit.AMPERE,
						AccessMode.READ_ONLY, true, SunSpecPointCategory.NONE, new Point.Symbol[0],
						"Max Discharge Current", "Instantaneous maximum DC discharge current."),
				new Point("BatReqPCSSt", 1, 14, "ENUM16", Optional.empty(), Unit.PERCENT, AccessMode.READ_ONLY, false,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "PCS State Request",
						"Request from battery to start or stop the PCS. Enumeration."),
				new Point("BatReqW", 1, 15, "INT16", Optional.of("BatReqW_SF"), Unit.WATT, AccessMode.READ_ONLY, false,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "Battery Power Request",
						"AC Power requested by battery."),
				new Point("BSetOperation", 1, 16, "ENUM16", Optional.empty(), Unit.NONE, AccessMode.READ_WRITE, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "Set Operation",
						"Instruct the battery bank to perform an operation such as connecting. Enumeration."),
				new Point("BSetPCSState", 1, 17, "ENUM16", Optional.empty(), Unit.NONE, AccessMode.READ_WRITE, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "PCS State", "PCS State"),
				new Point("SoH_SF", 1, 18, "SUNSSF", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, false,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "", "Scale factor for State of Health."),
				new Point("Vol_SF", 1, 19, "SUNSSF", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "", "Scale factor for DC Bus Voltage."),
				new Point("MaxBatA_SF", 1, 20, "SUNSSF", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, true,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "",
						"Scale factor for instantaneous DC charge/discharge current."),
				new Point("BatReqW_SF", 1, 21, "SUNSSF", Optional.empty(), Unit.NONE, AccessMode.READ_ONLY, false,
						SunSpecPointCategory.NONE, new Point.Symbol[0], "", "Scale factor for AC power request."));

		models.add(new Model(802, //
				20, //
				"ID", //
				"Battery Base Model", //
				"", //
				points, //
				SunSpecModelType.STORAGE //
		));

		generator.writeSunSpecModelJavaFile(models);
	}

}