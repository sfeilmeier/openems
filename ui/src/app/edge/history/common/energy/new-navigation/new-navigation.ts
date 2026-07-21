import { Component, computed, inject } from "@angular/core";
import { CommonUiModule } from "src/app/shared/common-ui.module";
import { ComponentsBaseModule } from "src/app/shared/components/components.module";
import { FlatWidgetButtonComponent } from "src/app/shared/components/flat/flat-widget-button/flat-widget-button";

import { Service } from "src/app/shared/shared";
import { ChartComponent } from "../chart/chart";

@Component({
    selector: "oe-history",
    templateUrl: "./new-navigation.html",
    standalone: true,
    imports: [CommonUiModule, ComponentsBaseModule, ChartComponent, FlatWidgetButtonComponent],
})
export class HistoryChartComponent {
    protected readonly service = inject(Service);
    protected edge = computed(() => this.service.currentEdge());
}
