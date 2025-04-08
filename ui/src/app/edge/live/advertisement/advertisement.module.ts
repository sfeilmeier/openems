import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import tr from "src/app/edge/live/advertisement/shared/translation.json";
import { SharedModule } from "src/app/shared/shared.module";
import { Language } from "src/app/shared/type/language";
import { AdvertComponent } from "./1/1";
import { AdvertisementComponent } from "./advertisement.component";

@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        AdvertisementComponent,
        AdvertComponent,
    ],
    exports: [
        AdvertisementComponent,
        AdvertComponent,
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
