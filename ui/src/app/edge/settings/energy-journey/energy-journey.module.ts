import { NgModule } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { WeatherForecastApprovalComponent } from "src/app/shared/components/edge/popover/data-privacy/popover";
import czPopover from "src/app/shared/components/edge/popover/shared/i18n/cz.json";
import dePopover from "src/app/shared/components/edge/popover/shared/i18n/de.json";
import enPopover from "src/app/shared/components/edge/popover/shared/i18n/en.json";
import esPopover from "src/app/shared/components/edge/popover/shared/i18n/es.json";
import frPopover from "src/app/shared/components/edge/popover/shared/i18n/fr.json";
import jaPopover from "src/app/shared/components/edge/popover/shared/i18n/ja.json";
import nlPopover from "src/app/shared/components/edge/popover/shared/i18n/nl.json";
import { FlatWidgetButtonComponent } from "src/app/shared/components/flat/flat-widget-button/flat-widget-button";
import { SharedModule } from "src/app/shared/shared.module";
import { Language } from "src/app/shared/type/language";
import { BatteryExtensionModule } from "./pages/battery-extension/battery-extension.module";
import cz from "./shared/i18n/cz.json";
import de from "./shared/i18n/de.json";
import en from "./shared/i18n/en.json";
import es from "./shared/i18n/es.json";
import fr from "./shared/i18n/fr.json";
import ja from "./shared/i18n/ja.json";
import nl from "./shared/i18n/nl.json";
import { EnergyJourneySharedModule } from "./shared/shared.module";

@NgModule({
    imports: [
        SharedModule,
        BatteryExtensionModule,
        EnergyJourneySharedModule,
        FlatWidgetButtonComponent,
        WeatherForecastApprovalComponent,
    ],
    declarations: [],
    exports: [EnergyJourneySharedModule],
})
export class EnergyJourneyModule {
    constructor(private translate: TranslateService) {
        Language.normalizeAdditionalTranslationFiles({
            cz: czPopover,
            de: dePopover,
            en: enPopover,
            es: esPopover,
            fr: frPopover,
            ja: jaPopover,
            nl: nlPopover,
        }).then((translations) => {
            for (const { lang, translation, shouldMerge } of translations) {
                translate.setTranslation(lang, translation, shouldMerge);
            }
        });
        Language.normalizeAdditionalTranslationFiles({ cz: cz, de: de, en: en, es: es, fr: fr, ja: ja, nl: nl }).then(
            (translations) => {
                for (const { lang, translation, shouldMerge } of translations) {
                    translate.setTranslation(lang, translation, shouldMerge);
                }
            },
        );
    }
}
