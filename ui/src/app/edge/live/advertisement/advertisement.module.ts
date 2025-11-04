import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import de from "src/app/edge/live/advertisement/i18n/de.json";
import en from "src/app/edge/live/advertisement/i18n/en.json";
import { SharedModule } from "src/app/shared/shared.module";
import { Language } from "src/app/shared/type/language";
import { Advert1Component } from "./1/1";
import { Advert1ModalComponent } from "./1/modal/modal";
import { AdvertisementComponent } from "./advertisement.component";

@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        AdvertisementComponent,
        Advert1Component,
        Advert1ModalComponent,
    ],
    exports: [
        AdvertisementComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdvertisementModule {

    constructor(private translate: TranslateService) {
        Language.normalizeAdditionalTranslationFiles({ de: de, en: en }).then((translations) => {
            for (const { lang, translation, shouldMerge } of translations) {
                translate.setTranslation(lang, translation, shouldMerge);
            }
        });
    }
}
