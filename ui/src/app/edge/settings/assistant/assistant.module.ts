import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { ChartComponent } from "./home/chart/oe-cell-voltage.chart";
import { ChartComponent as ReactiveChartComponent } from "./home/chart/oe-reactive.chart";
import { HomeServiceAssistantComponent } from "./home/home";
import { ChartComponent as IndustrialChartComponent } from "./industrial/chart/chart";
import { IndustrialServiceAssistantComponent } from "./industrial/industrial";
import { PowerAssistantComponent } from "./powerassistant/powerassistant";

@NgModule({
  imports: [
    SharedModule,
    ReactiveChartComponent,
  ],
  declarations: [
    HomeServiceAssistantComponent,
    IndustrialServiceAssistantComponent,
    IndustrialChartComponent,
    ChartComponent,
    PowerAssistantComponent,
  ],
  exports: [
    HomeServiceAssistantComponent,
    IndustrialServiceAssistantComponent,
    ChartComponent,
    PowerAssistantComponent,
  ],
})
export class AssistantModule { }
