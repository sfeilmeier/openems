import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { EnergyJourneyConstantLineComponent } from "./components/constant-line";
import { EnergyJourneyConstantsComponent } from "./components/constants";

@NgModule({
    imports: [
        SharedModule,
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
