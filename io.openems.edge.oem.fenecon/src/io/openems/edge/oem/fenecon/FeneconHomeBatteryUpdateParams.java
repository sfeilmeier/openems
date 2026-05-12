package io.openems.edge.oem.fenecon;

import org.osgi.service.component.annotations.Component;

import com.google.common.hash.HashCode;

import io.openems.common.session.Role;
import io.openems.edge.battery.fenecon.home.BatteryFeneconHomeHardwareType;
import io.openems.edge.battery.fenecon.home.TwoPartVersion;
import io.openems.edge.battery.fenecon.home.update.BatteryFeneconHomeUpdateParams;
import io.openems.edge.common.update.Updateable;

@Component
public class FeneconHomeBatteryUpdateParams implements BatteryFeneconHomeUpdateParams {
	@Override
	public Updateable.UpdateableMetaInfo getMetaInfo() {
		return new Updateable.UpdateableMetaInfo("Fenecon Home Battery", "Update for Fenecon Home Battery", Role.ADMIN);
	}

	@Override
	public String getArmDownloadLocation(UpdateParams updateParams) {
		return "https://fenecon.de/fems-tools/atlUpdate/%s/atl.bin".formatted(updateParams.storageName());
	}

	@Override
	public UpdateParams getParams(BatteryFeneconHomeHardwareType hardwareType) {
		return switch (hardwareType) {
		case BATTERY_52 -> new UpdateParams("25_11_03", TwoPartVersion.fromString("1.7"),
				HashCode.fromString("ac0791294e88d12b8fff1f13af15d30b1b647c553fb97d48c1a9ebb55585f48d"));
		case BATTERY_64 -> new UpdateParams("2025_06_18", TwoPartVersion.fromString("1.2"),
				HashCode.fromString("66b79c57566b57243ebcc62e67a8349288a7656e6f6d33739b548e75caef3e9e"));
		};
	}
}
