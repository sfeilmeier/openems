import { NgModule } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { SharedModule } from "src/app/shared/shared.module";
import { Language } from "src/app/shared/type/language";
import { EnergyJourneyComponent } from "./energy-journey";
import { BatteryExtensionModule } from "./pages/battery-extension/battery-extension.module";
import { EnergyJourneySharedModule } from "./shared/shared.module";
import tr from "./shared/translation.json";


@NgModule({
  imports: [
    SharedModule,
    BatteryExtensionModule,
    EnergyJourneySharedModule,
  ],
  declarations: [
    EnergyJourneyComponent,
  ],
  exports: [
    EnergyJourneySharedModule,
  ],
})
export class EnergyJourneyModule {

  constructor(private translate: TranslateService) {
    Language.setAdditionalTranslationFile(tr, translate).then(({ lang, translations, shouldMerge }) => {
      translate.setTranslation(lang, translations, shouldMerge);
    });
  }
}
