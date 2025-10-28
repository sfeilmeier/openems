import { NgModule } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { FlatWidgetButtonComponent } from "src/app/shared/components/flat/flat-widget-button/flat-widget-button";
import { SharedModule } from "src/app/shared/shared.module";
import { Language } from "src/app/shared/type/language";
import { BatteryExtensionModule } from "./pages/battery-extension/battery-extension.module";
import de from "./shared/i18n/de.json";
import en from "./shared/i18n/en.json";
import { EnergyJourneySharedModule } from "./shared/shared.module";


@NgModule({
    imports: [
        SharedModule,
        BatteryExtensionModule,
        EnergyJourneySharedModule,
        FlatWidgetButtonComponent,
    ],
    declarations: [
    ],
    exports: [
        EnergyJourneySharedModule,
    ],
})
export class EnergyJourneyModule {

    constructor(private translate: TranslateService) {
        Language.normalizeAdditionalTranslationFiles({ de: de, en: en }).then((translations) => {
            for (const { lang, translation, shouldMerge } of translations) {
                translate.setTranslation(lang, translation, shouldMerge);
            }
        });
    }
}
