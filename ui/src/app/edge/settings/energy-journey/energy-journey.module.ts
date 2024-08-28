import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { EnergyJourneyComponent } from "./energy-journey";
import { BatteryExtensionModule } from "./pages/battery-extension/battery-extension.module";
import { EnergyJourneySharedModule } from "./shared/shared.module";

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
export class EnergyJourneyModule { }
