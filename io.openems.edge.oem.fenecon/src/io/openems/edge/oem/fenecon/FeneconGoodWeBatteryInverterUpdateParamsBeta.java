package io.openems.edge.oem.fenecon;

import org.osgi.service.component.annotations.Component;

import io.openems.common.session.Role;
import io.openems.edge.common.update.Updateable;
import io.openems.edge.goodwe.common.enums.GoodWeType;
import io.openems.edge.goodwe.update.GoodWeBatteryInverterUpdateParams;
import io.openems.edge.goodwe.update.GoodWeUpdateParams;
import io.openems.edge.goodwe.update.GoodWeVersion;

@Component
public class FeneconGoodWeBatteryInverterUpdateParamsBeta implements GoodWeBatteryInverterUpdateParams {

	@Override
	public Updateable.UpdateableMetaInfo getMetaInfo() {
		return new Updateable.UpdateableMetaInfo("GoodWe BatteryInverter (BETA)", "Update for GoodWe", Role.ADMIN);
	}

	@Override
	public String getDspDownloadLocation(GoodWeUpdateParams updateParams) {
		return String.format("https://fenecon.de/debian-test/goodweUpdate/%s/%s/dsp.bin", updateParams.type(),
				updateParams.version());
	}

	@Override
	public String getArmDownloadLocation(GoodWeUpdateParams updateParams) {
		return String.format("https://fenecon.de/debian-test/goodweUpdate/%s/%s/arm.bin", updateParams.type(),
				updateParams.version());
	}

	@Override
	public GoodWeUpdateParams getParams(GoodWeType goodWeType) {
		return switch (goodWeType) {
		case UNDEFINED, GOODWE_10K_BT, GOODWE_8K_BT, GOODWE_5K_BT, GOODWE_10K_ET, GOODWE_8K_ET, GOODWE_5K_ET,
				FENECON_50K ->
			null;
		case FENECON_FHI_10_DAH -> new GoodWeUpdateParams("goodwe10", "2025_05_21", new GoodWeVersion(10, 0, 31, 0));
		case FENECON_FHI_20_DAH, FENECON_FHI_29_9_DAH ->
			new GoodWeUpdateParams("goodwe20_30", "2024_12_06", new GoodWeVersion(10, 0, 12, 0));
		case FENECON_GEN2_6K, FENECON_GEN2_10K, FENECON_GEN2_15K ->
			new GoodWeUpdateParams("goodweGen2", "2024_12_06", new GoodWeVersion(0, 2022, 6, 389));
		};
	}
}
