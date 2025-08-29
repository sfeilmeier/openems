import { NgModule } from "@angular/core";
import { SharedModule } from "src/app/shared/shared.module";
import { SoltaroCellChartComponent } from "./soltarosingle/cell-chart/chart.component";
import { SoltaroVersionBComponent } from "./soltarosingle/soltaroB.component";
import { SoltaroVersionCComponent } from "./soltarosingle/soltaroC.component";

@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        SoltaroCellChartComponent,
        SoltaroVersionBComponent,
        SoltaroVersionCComponent,
    ],
})
export class ServiceAssistantModule { }
