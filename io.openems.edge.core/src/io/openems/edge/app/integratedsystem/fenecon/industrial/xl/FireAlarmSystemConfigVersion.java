package io.openems.edge.app.integratedsystem.fenecon.industrial.xl;

import io.openems.common.session.Language;
import io.openems.edge.app.enums.TranslatableEnum;
import io.openems.edge.core.appmanager.AbstractOpenemsApp;
import io.openems.edge.core.appmanager.TranslationUtil;

public enum FireAlarmSystemConfigVersion implements TranslatableEnum {
	INDUSTRIAL_XL_V1("App.FENECON.Industrial.Xl.IXL010.fireAlarmSystemConfigVersion.industrialXlV1"), //
	INDUSTRIAL_XL_V2("App.FENECON.Industrial.Xl.IXL010.fireAlarmSystemConfigVersion.industrialXlV2"), //
	;

	private final String translationKey;

	private FireAlarmSystemConfigVersion(String translationKey) {
		this.translationKey = translationKey;
	}

	@Override
	public String getTranslation(Language l) {
		final var bundle = AbstractOpenemsApp.getTranslationBundle(l);
		return TranslationUtil.getTranslation(bundle, this.translationKey);
	}

}
