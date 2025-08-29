import { KeyValue } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BaseChartDirective } from "ng2-charts";
import { NgxSpinnerModule } from "ngx-spinner";
import { CommonUiModule } from "src/app/shared/common-ui.module";
import { AbstractHistoryChart } from "src/app/shared/components/chart/abstracthistorychart";
import { ChartComponentsModule } from "src/app/shared/components/chart/chart.module";
import { HistoryDataErrorModule } from "src/app/shared/components/history-data-error/history-data-error.module";
import { ChannelAddress, ChartConstants } from "src/app/shared/shared";
import { AssertionUtils } from "src/app/shared/utils/assertions/assertions.utils";
import { ChartAxis, HistoryUtils, YAxisType } from "src/app/shared/utils/utils";

export type HomeCellVoltageOptions = KeyValue<string, string | null> | null;
@Component({
    selector: "oe-reactive-power-chart",
    templateUrl: "../../../../../shared/components/chart/abstracthistorychart.html",
    imports: [
        BaseChartDirective,
        ReactiveFormsModule,
        CommonUiModule,
        ChartComponentsModule,
        HistoryDataErrorModule,
        NgxSpinnerModule,
    ],
})
export class ChartComponent extends AbstractHistoryChart {
    @Input() public componentId: string | null = null;

    public static getChartData(componentId: string | null): HistoryUtils.ChartData {
        AssertionUtils.assertIsDefined(componentId);
        return {
            input: [
                {
                    name: "ReactivePower",
                    powerChannel: new ChannelAddress(componentId, "ReactivePower"),
                },
                {
                    name: "ActivePower",
                    powerChannel: new ChannelAddress(componentId, "ActivePower"),
                },
                {
                    name: "ApparentPower",
                    powerChannel: new ChannelAddress(componentId, "ApparentPower"),
                },
            ],
            output: (data: HistoryUtils.ChannelData) => [{
                name: "ReactivePower",
                converter: () => data["ReactivePower"],
                color: ChartConstants.Colors.RED,
                yAxisId: ChartAxis.RIGHT,
            }, {
                name: "ActivePower",
                converter: () => data["ActivePower"],
                color: ChartConstants.Colors.BLUE,
            }, {
                name: "ApparentPower",
                converter: () => data["ApparentPower"],
                color: ChartConstants.Colors.PURPLE,
            }],
            tooltip: {
                formatNumber: ChartConstants.NumberFormat.ZERO_TO_TWO,
            },
            yAxes: [{
                unit: YAxisType.POWER,
                position: "left",
                yAxisId: ChartAxis.LEFT,
            },
            {
                unit: YAxisType.REACTIVE,
                position: "right",
                yAxisId: ChartAxis.RIGHT,
            }],
        };
    }

    protected override getChartData(): HistoryUtils.ChartData | null {
        return ChartComponent.getChartData(this.componentId);
    }
}
