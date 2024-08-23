import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";

import { ElectricityPriceSelectionComponent } from "../electricity-price-choice/electricity-price-selection";
import { BatteryExtensionComponent } from "./battery-extension";
import { GridBuyChartComponent } from "./chart/gridBuy.chart";
import { DetailComponent } from "./details/details";

@NgModule({
  imports: [
    SharedModule,
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

export type SimulatedData = {
  simulationData: {
    numberOfModules: number,
    gridBuy: number,
    gridBuyCosts: number,
    kWPeak: number,
    capacity: number,
  }[],
};
