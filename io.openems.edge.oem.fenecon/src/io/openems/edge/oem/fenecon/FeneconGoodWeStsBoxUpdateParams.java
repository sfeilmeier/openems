package io.openems.edge.oem.fenecon;

import org.osgi.service.component.annotations.Component;

import com.google.common.hash.HashCode;

import io.openems.common.session.Role;
import io.openems.edge.common.update.Updateable;
import io.openems.edge.goodwe.common.enums.GoodWeType;
import io.openems.edge.goodwe.stsbox.update.GoodWeStsBoxParams;
import io.openems.edge.goodwe.stsbox.update.GoodWeStsBoxUpdateParams;
import io.openems.edge.goodwe.stsbox.update.GoodWeStsBoxVersion;

@Component
public class FeneconGoodWeStsBoxUpdateParams implements GoodWeStsBoxUpdateParams {

	@Override
	public Updateable.UpdateableMetaInfo getMetaInfo() {
		return new Updateable.UpdateableMetaInfo("GoodWe Sts Box", "Update for GoodWe Sts Box", Role.ADMIN);
	}

	@Override
	public String getDownloadLocation(GoodWeStsBoxParams updateParams) {
		return String.format("https://fenecon.de/debian-test/goodweUpdate/%s/%s/sts.bin", updateParams.type(),
				updateParams.version());
	}

	@Override
	public GoodWeStsBoxParams getParams(GoodWeType goodWeType) {
		return switch (goodWeType) {
		case FENECON_50K -> new GoodWeStsBoxParams("goodwe50", "2026_02_10", new GoodWeStsBoxVersion(4, 409),
				HashCode.fromString("acdb8ec497d2bea3c9e2cbbac2768391f283a68972f1eecf8e0e9213f87cd3d5"));
		case FENECON_100K -> new GoodWeStsBoxParams("goodwe100", "2026_05_06", new GoodWeStsBoxVersion(1, 212),
				HashCode.fromString("bd1ba1bc4a726b9dff266121fa4bf1c1b4b426a71b792188e354393ffaced469"));
		case null, default -> null;
		};
	}

}
