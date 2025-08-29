import { Component, Input, OnChanges } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormlyModule } from "@ngx-formly/core";
import { AbstractHistoryChart } from "src/app/shared/components/chart/abstracthistorychart";
import { ChartComponentsModule } from "src/app/shared/components/chart/chart.module";
import { ComponentsBaseModule } from "src/app/shared/components/components.module";
import { HistoryDataErrorModule } from "src/app/shared/components/history-data-error/history-data-error.module";
import { ChannelAddress, EdgeConfig, Utils } from "src/app/shared/shared";
import { ChartAxis, HistoryUtils, YAxisType } from "src/app/shared/utils/utils";
import { CommonUiModule } from "../../../../../shared/common-ui.module";

@Component({
  selector: "industrial_chart",
  templateUrl: "../../../../../shared/components/chart/abstracthistorychart.html",
  standalone: true,
  imports: [
    RouterModule,
    CommonUiModule,
    ComponentsBaseModule,
    ChartComponentsModule,
    FormlyModule,
    HistoryDataErrorModule,
  ],
})
export class ChartComponent extends AbstractHistoryChart implements OnChanges {
  @Input({ required: true }) public selectedBattery!: EdgeConfig.Component;

  ngOnChanges() {
    this.chartObject = this.getChartData();
    this.updateChart();
  }

  protected override getChartData(): HistoryUtils.ChartData {
    return {
      input:
        [{
          name: "MinCellVoltage",
          powerChannel: ChannelAddress.fromString(`${this.selectedBattery.id}/MinCellVoltage`),
        },
        {
          name: "MaxCellVoltage",
          powerChannel: ChannelAddress.fromString(`${this.selectedBattery.id}/MaxCellVoltage`),
        }],
      output: (data: HistoryUtils.ChannelData) => {
        return [{
          name: "Minimale Zellspannung",
          converter: () => {
            return data["MinCellVoltage"];
          },
          color: "rgb(127,255,0)",
        },
        {
          name: "Maximale Zellspannung",
          converter: () => {
            return data["MaxCellVoltage"];
          },
          color: "rgb(0,0,255)",
        },
        {
          name: "Spannungsdifferenz",
          converter: () => {
            const min = data["MinCellVoltage"];
            const max = data["MaxCellVoltage"];
            return max.map((el, i) => Utils.subtractSafely(el, min[i])) ?? null;
          },
          color: "rgb(0,255,255)",
        },
        {
          name: "Obergrenze",
          converter: () => {
            return Array(288).fill(4.109);
          },
          color: "rgb(237, 28, 35)",
          borderDash: [10, 10],
          hideShadow: true,
        },
        {
          name: "Untergrenze 1",
          converter: () => {
            return Array(288).fill(3.338);
          },
          color: "rgb(178, 27, 69)",
          borderDash: [10, 10],
          hideShadow: true,
        },
        ];
      },
      tooltip: {
        formatNumber: "1.0-2",
      },
      yAxes: [{
        unit: YAxisType.VOLTAGE,
        position: "left",
        yAxisId: ChartAxis.LEFT,
      }],
    };
  }
}
