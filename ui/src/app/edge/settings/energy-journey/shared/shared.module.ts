import { NgModule } from "@angular/core";
import { FlatWidgetButtonComponent } from "src/app/shared/components/flat/flat-widget-button/flat-widget-button";
import { SharedModule } from "src/app/shared/shared.module";
import { EnergyJourneyConstantLineComponent } from "./components/constant-line";
import { EnergyJourneyConstantsComponent } from "./components/constants";

@NgModule({
    imports: [
        SharedModule,
        FlatWidgetButtonComponent,
    ],
    declarations: [
        EnergyJourneyConstantsComponent,
        EnergyJourneyConstantLineComponent,
    ],
    exports: [
        EnergyJourneyConstantsComponent,
        EnergyJourneyConstantLineComponent,
    ],
})
export class EnergyJourneySharedModule { }
