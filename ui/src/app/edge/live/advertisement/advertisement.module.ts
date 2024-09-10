import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";

import { TranslateService } from "@ngx-translate/core";
import tr from "src/app/edge/live/advertisement/shared/translation.json";
import { Language } from "src/app/shared/type/language";
import { EnergyJourneyAdvertComponent } from "./1/1";
import { AdvertisementComponent } from "./advertisement.component";

@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        AdvertisementComponent,
        EnergyJourneyAdvertComponent,
    ],
    exports: [
        AdvertisementComponent,
        EnergyJourneyAdvertComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdvertisementModule {

    constructor(private translate: TranslateService) {
        Language.setAdditionalTranslationFile(tr, translate).then(({ lang, translations, shouldMerge }) => {
            translate.setTranslation(lang, translations, shouldMerge);
        });
    }
}
