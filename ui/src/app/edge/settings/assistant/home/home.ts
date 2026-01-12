// @ts-strict-ignore
import { formatNumber } from "@angular/common";
import { Component } from "@angular/core";
import { SelectCustomEvent } from "@ionic/angular";
import { ComponentsBaseModule } from "src/app/shared/components/components.module";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { PickdateComponentModule } from "src/app/shared/components/pickdate/pickdate.module";
import { Converter } from "src/app/shared/components/shared/converter";
import { Filter } from "src/app/shared/components/shared/filter";
import { SetChannelValueRequest } from "src/app/shared/jsonrpc/request/setChannelValueRequest";
import { LiveDataServiceProvider } from "src/app/shared/provider/live-data-service-provider";
import { LocaleProvider } from "src/app/shared/provider/locale-provider";
import { ChannelAddress, CurrentData, EdgeConfig, Utils } from "src/app/shared/shared";
import { ArrayUtils } from "src/app/shared/utils/array/array.utils";
import { CommonUiModule } from "../../../../shared/common-ui.module";
import { AssistantEdgePermission } from "../permission";
import { ChartComponent as CellVoltageChart, HomeCellVoltageOptions } from "./chart/oe-cell-voltage.chart";
import { ChartComponent as ReactiveChart } from "./chart/oe-reactive.chart";

@Component({
    selector: HomeServiceAssistantComponent.SELECTOR,
    templateUrl: "./home.html",
    standalone: true,
    imports: [
        CommonUiModule,
        CellVoltageChart,
        ReactiveChart,
        PickdateComponentModule,
        LiveDataServiceProvider,
        LocaleProvider,
        ComponentsBaseModule,
    ],
})
export class HomeServiceAssistantComponent extends AbstractFlatWidget {

    private static readonly SELECTOR = "homeserviceassistant";

    public chargerComponents: EdgeConfig.Component[] = [];
    public Filter = Filter;
    public convertToGridMeterCategory: Converter;

    protected cellVoltageDifference: number | null = null;
    protected cellTemperatureDifference: number | null = null;
    protected date: string = this.service?.historyPeriod?.value?.getText(this.translate, this.service) ?? "";
    protected CONVERT_TO_GRID_METER_CATEGORY = Converter.CONVERT_TO_GRID_METER_CATEGORY(this.translate);
    protected readonly options: [];
    protected selectedTower: HomeCellVoltageOptions = null;
    protected selectedModule: HomeCellVoltageOptions = null;
    protected towerOptions: HomeCellVoltageOptions[] = [{
        key: "Gesamt",
        value: null,
    }];
    protected moduleOptions: HomeCellVoltageOptions[] = [{
        key: "Gesamt",
        value: null,
    }];

    protected isReactiveChartAllowed: boolean = false;

    protected override afterIsInitialized() {
        if (this.config?.components) {
            this.chargerComponents = Object.values(this.config.components)
                .filter(component => [
                    "GoodWe.Charger-PV1",
                    "GoodWe.Charger-PV2",
                    "GoodWe.Charger.Two-String",
                    "GoodWe.Charger.Mppt.Two-String",
                ].some(factoryId => factoryId === component.factoryId));

            this.setTowerModuleOptions();
        }

        this.isReactiveChartAllowed = AssistantEdgePermission.isReactiveChartAllowed(this.edge);
    }

    protected override getChannelAddresses(): ChannelAddress[] {
        return [
            new ChannelAddress("battery0", "MaxCellVoltage"),
            new ChannelAddress("battery0", "MinCellVoltage"),
            new ChannelAddress("battery0", "MinCellTemperature"),
            new ChannelAddress("battery0", "MinCellTemperature"),
            new ChannelAddress("battery0", "NumberOfTowers"),
            new ChannelAddress("battery0", "NumberOfModulesPerTower"),
        ];
    }

    protected override onCurrentData(currentData: CurrentData): void {
        this.cellVoltageDifference = Utils.subtractSafely(currentData.allComponents["battery0/MaxCellVoltage"], currentData.allComponents["battery0/MinCellVoltage"]);
        this.cellTemperatureDifference = Utils.subtractSafely(currentData.allComponents["battery0/MaxCellTemperature"], currentData.allComponents["battery0/MinCellTemperature"]);
    }

    protected VOLTAGE_TO_VOLT_WITH_3_DECIMALS: Converter = (raw): string => {
        return Converter.IF_NUMBER(raw, value => formatNumber(value, "de", "1.0-3") + " V");
    };

    protected VOLTAGE_IN_MILLI_VOLT_TO_VOLT_WITH_3_DECIMALS: Converter = (raw): string => {
        return Converter.IF_NUMBER(raw, value =>
            formatNumber(Utils.divideSafely(value, 1000), "de", "1.0-3") + " V");
    };

    protected VOLTAGE_TO_MILLI_VOLT_WITH_3_DECIMALS: Converter = (raw): string => {
        return Converter.IF_NUMBER(raw, value =>
            formatNumber(value, "de", "1.0-0") + " mV");
    };

    protected AMPERE_IN_MILLI_AMPERE_TO_AMPERE_WITH_3_DECIMALS: Converter = (raw): string => {
        return Converter.IF_NUMBER(raw, value =>
            formatNumber(Utils.divideSafely(value, 1000), "de", "1.0-3") + " A",
        );
    };

    protected updateTowerNr(event: Event) {
        this.selectedTower = (event as SelectCustomEvent).target.value;
        this.addSerialNumbersToModules();
    }

    protected updateModuleNr(event: Event) {
        this.selectedModule = (event as SelectCustomEvent).target.value;
    }

    protected reset() {
        this.edge.sendRequest(
            this.service.websocket,
            new SetChannelValueRequest({
                componentId: "batteryInverter0",
                channelId: "FactorySetting",
                value: 1,
            }));
    }

    private async addSerialNumbersToModules() {

        const moduleOptions = [];
        this.moduleOptions.forEach(({ key, value: moduleNr }) => {
            if (!moduleNr) {
                return;
            }

            const channel = new ChannelAddress("battery0", `Tower${this.selectedTower.value}Module${moduleNr}SerialNumber`);
            this.subscribeAndGetFirstValidValueForChannel(channel).then((channelValue) => {
                moduleOptions.push({
                    key: key + " - " + channelValue,
                    value: moduleNr,
                });
            });
        });

        this.moduleOptions = moduleOptions;
    }

    private async setTowerModuleOptions() {
        const battery = Object.values(this.config.components).find(el => el.factoryId === "Battery.Fenecon.Home");
        if (!battery) {
            return;
        }

        const numberOfTowers = await this.getFirstValidValueForChannel(new ChannelAddress(battery.id, "NumberOfTowers"));
        this.towerOptions.push(
            ...(numberOfTowers ? ArrayUtils.getArrayOfLength(numberOfTowers).map(el => ({
                key: "Tower" + el,
                value: el.toString(),
            }))
                : []));
        this.selectedTower = this.towerOptions[0];

        const numberOfModules = await this.getFirstValidValueForChannel(new ChannelAddress(battery.id, "NumberOfModulesPerTower"));
        this.moduleOptions.push(
            ...(numberOfModules ? ArrayUtils.getArrayOfLength(numberOfModules).map(el => {
                return {
                    key: "Module" + el,
                    value: el.toString(),
                };
            })
                : []));

        this.selectedModule = this.moduleOptions[0];
    }

}
