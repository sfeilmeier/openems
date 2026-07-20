import { KeyValue } from "@angular/common";
import { Component, Input, OnChanges, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ChartBaseModule } from "src/app/shared/chart-base.module";
import { AbstractHistoryChart } from "src/app/shared/components/chart/abstracthistorychart";
import { ChannelAddress } from "src/app/shared/shared";
import { ArrayUtils } from "src/app/shared/utils/array/array.utils";
import { ChartAxis, HistoryUtils, YAxisType } from "src/app/shared/utils/utils";
import { CommonUiModule } from "../../../../../shared/common-ui.module";

export type HomeCellVoltageOptions = KeyValue<string, string | null> | null;
@Component({
    selector: "oe-cell-voltage-chart",
    templateUrl: "../../../../../shared/components/chart/abstracthistorychart.html",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonUiModule, RouterModule, ChartBaseModule],
})
export class ChartComponent extends AbstractHistoryChart implements OnInit, OnChanges {
    @Input({ required: true }) public towerId: HomeCellVoltageOptions = null;
    @Input({ required: true }) public moduleId: HomeCellVoltageOptions = null;

    public static baseOutput = (data: HistoryUtils.ChannelData) => [
        {
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
    ];

    public static limits = (data: HistoryUtils.ChannelData): HistoryUtils.DisplayValue[] => [
        {
            name: "Obergrenze",
            converter: () => {
                return Array(288).fill(3.65);
            },
            color: "rgb(237, 28, 35)",
            borderDash: [10, 10],
            hideShadow: true,
        },
        {
            name: "Untergrenze 1",
            converter: () => {
                return Array(288).fill(3);
            },
            color: "rgb(178, 27, 69)",
            borderDash: [10, 10],
            hideShadow: true,
        },
        {
            name: "Untergrenze 2",
            converter: () => {
                return Array(288).fill(2.7);
            },
            color: "rgb(119, 26, 102)",
            borderDash: [10, 10],
            hideShadow: true,
        },
        {
            name: "Untergrenze 3",
            converter: () => {
                return Array(288).fill(2.5);
            },
            color: "rgb(59, 25, 136)",
            borderDash: [10, 10],
            hideShadow: true,
        },
        {
            name: "Untergrenze 4",
            converter: () => {
                return Array(288).fill(2.3);
            },
            color: "rgb(0, 24, 169)",
            borderDash: [10, 10],
            hideShadow: true,
        },
    ];

    public static getChartData(
        towerId: HomeCellVoltageOptions,
        moduleId: HomeCellVoltageOptions,
    ): HistoryUtils.ChartData {
        const inputAndOutput = ChartComponent.getInputAndOutput(towerId, moduleId);
        return {
            input: inputAndOutput.input,
            output: (data: HistoryUtils.ChannelData) => inputAndOutput.output(data),
            tooltip: {
                formatNumber: "1.0-2",
            },
            yAxes: [
                {
                    unit: YAxisType.VOLTAGE,
                    position: "left",
                    yAxisId: ChartAxis.LEFT,
                },
            ],
        };
    }

    public static getInputAndOutput(
        towerId: HomeCellVoltageOptions,
        moduleId: HomeCellVoltageOptions,
    ): Pick<HistoryUtils.ChartData, "input" | "output"> {
        if (!moduleId || moduleId.value === null || !towerId || towerId.value === null) {
            return {
                input: [
                    { name: "MinCellVoltage", powerChannel: ChannelAddress.fromString("battery0/MinCellVoltage") },
                    { name: "MaxCellVoltage", powerChannel: ChannelAddress.fromString("battery0/MaxCellVoltage") },
                ],
                output: (data: HistoryUtils.ChannelData) => [
                    ...ChartComponent.baseOutput(data),
                    ...ChartComponent.limits(data),
                ],
            };
        }

        const input: HistoryUtils.InputChannel[] = ArrayUtils.getArrayOfLength(14).map((el, i) => {
            const cellId: string = "0" + (i < 10 ? "0" : "") + i;
            return {
                name: "tower" + towerId.value + "cell" + i,
                powerChannel: new ChannelAddress(
                    "battery0",
                    `Tower${towerId.value}Module${moduleId.value}Cell${cellId}Voltage`,
                ),
            };
        });

        const output: (data: HistoryUtils.ChannelData) => HistoryUtils.DisplayValue[] = (data) => {
            const values: HistoryUtils.DisplayValue[] = [];
            for (let i = 0; i < 14; i++) {
                const cellId: string = "0" + (i < 10 ? "0" : "") + i;
                values.push({
                    name: `Cell${cellId}Voltage`,
                    converter: () => {
                        return data["tower" + towerId.value + "cell" + i];
                    },
                    color: "rgb(127,255,0)",
                });
            }
            return values;
        };

        return {
            input: input,
            output: (data: HistoryUtils.ChannelData) => [...output(data), ...ChartComponent.limits(data)],
        };
    }

    ngOnChanges() {
        if (
            (this.towerId?.value != null && this.moduleId?.value != null) ||
            (this.towerId?.value == null && this.moduleId?.value == null)
        ) {
            this.chartObject = this.getChartData();
            this.updateChart();
        }
    }

    protected override getChartData(): HistoryUtils.ChartData | null {
        return ChartComponent.getChartData(this.towerId, this.moduleId);
    }
}
