import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { SharedModule } from "src/app/shared/shared.module";
import { Language } from "src/app/shared/type/language";
import { Advert1Component } from "./1/1";
import { Advert2Component } from "./2/2";
import { Advert3Component } from "./3/3";
import { AdvertisementComponent } from "./advertisement.component";
import cz from "./i18n/cz.json";
import de from "./i18n/de.json";
import en from "./i18n/en.json";
import es from "./i18n/es.json";
import fr from "./i18n/fr.json";
import ja from "./i18n/ja.json";
import lt from "./i18n/lt.json";
import nl from "./i18n/nl.json";
import sv from "./i18n/sv.json";

@NgModule({
    imports: [SharedModule],
    declarations: [AdvertisementComponent, Advert1Component, Advert2Component, Advert3Component],
    exports: [AdvertisementComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdvertisementModule {
    constructor(private translate: TranslateService) {
        Language.normalizeAdditionalTranslationFiles({
            cz: cz,
            de: de,
            en: en,
            es: es,
            fr: fr,
            ja: ja,
            lt: lt,
            nl: nl,
            sv: sv,
        }).then((translations) => {
            for (const { lang, translation, shouldMerge } of translations) {
                translate.setTranslation(lang, translation, shouldMerge);
            }
        });
    }
}
