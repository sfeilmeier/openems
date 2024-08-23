// @ts-strict-ignore
import { Component, Input, OnChanges } from "@angular/core";
import { ChartAxis, HistoryUtils, Utils, YAxisTitle } from "src/app/shared/service/utils";
import { ChannelAddress } from "src/app/shared/shared";

import { AbstractHistoryChart } from "src/app/shared/components/chart/abstracthistorychart";
import { PropType } from "src/app/shared/service/defaulttypes";
import { SimulatedData } from "../battery-extension.module";
import { PossibleBatteryExtensionResponse } from "../battery-extension.response";

@Component({
  selector: "gridBuyChart",
  templateUrl: "../../../../../../shared/components/chart/abstracthistorychart.html",
})
export class GridBuyChartComponent extends AbstractHistoryChart implements OnChanges {

  @Input({ required: true }) public simulatedData: SimulatedData = { simulationData: [] };
  @Input({ required: true }) public fromDate: Date;
  @Input({ required: true }) public toDate: Date;

  public static getChartData(simulatedData: PossibleBatteryExtensionResponse["result"]["simulationData"]): HistoryUtils.ChartData {
    return {
      input: [
        {
          name: "GridBuyActiveEnergy",
          powerChannel: new ChannelAddress("_sum", "GridActivePower"),
          energyChannel: new ChannelAddress("_sum", "GridBuyActiveEnergy"),
        },
      ],
      output: () => {
        const displayData = [
          ...(simulatedData?.length > 0
            ? Object.entries(simulatedData)
              .reduce((arr: number[], [_name, _simulatedData], i) => {
                arr.push(_simulatedData.gridBuy);
                return arr;
              }, [])
            : []),
        ];
        return [
          <HistoryUtils.DisplayValue<HistoryUtils.DataLabelsCustomOptions>>{
            name: "Batteriemodul-Erweiterung",
            converter: () => {
              return displayData
                .map((el) => Utils.subtractSafely(displayData[0], Utils.divideSafely(el, 1)))
                .filter((_el, i) => i !== 0);
            },
            color: "rgb(54,174,209)",
            custom: {
              pluginType: "datalabels",
              datalabels: {
                displayUnit: "kWh",
              },
            },
          },
        ];
      },
      tooltip: {
        formatNumber: "1.0-0",
      },
      yAxes: [{
        unit: YAxisTitle.ENERGY,
        position: "left",
        yAxisId: ChartAxis.LEFT,
      }],
    };
  }

  private static getLabels(simulationData: PropType<SimulatedData, "simulationData">): string[] {
    return simulationData.reduce((arr: string[], el, index) => {
      if (index === 0) {
        return arr;
      }
      const diff = Utils.subtractSafely(el.numberOfModules, simulationData[0].numberOfModules);
      if (!diff) {
        return arr;
      }

      arr.push("+ " + diff + (diff === 1 ? " Modul" : " Module"));
      return arr;
    }, []);
  }

  ngOnChanges() {
    this.updateChart();
  }

  public override getChartData() {
    return GridBuyChartComponent.getChartData(this.simulatedData?.simulationData);
  }

  protected override beforeSetChartLabel(): void {
    this.labels = GridBuyChartComponent.getLabels(this.simulatedData.simulationData);
  }


  protected override loadChart(): void {
    this.labels = [];
    this.errorResponse = null;

    this.queryHistoricTimeseriesEnergyPerPeriod(this.fromDate, this.toDate)
      .then((energyPeriodResponse) => {
        this.chartType = "bar";
        this.chartObject = this.getChartData();
        const displayValues = AbstractHistoryChart.fillChart(this.chartType, this.chartObject, energyPeriodResponse);
        this.datasets = displayValues.datasets;
        this.legendOptions = displayValues.legendOptions;
        this.labels = displayValues.labels;
        this.beforeSetChartLabel();
        this.setChartLabel();
      });
  }
}
