import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { FlatWidgetButtonComponent } from "src/app/shared/components/flat/flat-widget-button/flat-widget-button";
import { SharedModule } from "src/app/shared/shared.module";
import { EnergyJourneySharedModule } from "../../shared/shared.module";
import { ElectricityPriceSelectionComponent } from "../electricity-price-choice/electricity-price-selection";
import { BatteryExtensionComponent } from "./battery-extension";
import { GridBuyChartComponent } from "./chart/gridBuy.chart";
import { DetailComponent } from "./details/details";

@NgModule({
    imports: [
        SharedModule,
        EnergyJourneySharedModule,
        IonicModule,
        FlatWidgetButtonComponent,
    ],
    declarations: [
        BatteryExtensionComponent,
        DetailComponent,
        ElectricityPriceSelectionComponent,
        GridBuyChartComponent,
    ],
    exports: [
        BatteryExtensionComponent,
        DetailComponent,
        ElectricityPriceSelectionComponent,
        GridBuyChartComponent,
    ],
})
export class BatteryExtensionModule { }

export type SimulationResult = {
    simulationData: {
        numberOfModules: number,
        gridBuy: number,
        gridBuyCosts: number,
        kWPeak: number,
        capacity: number,
    }[],
};
