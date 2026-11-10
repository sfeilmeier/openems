import { formatNumber } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LiveDataService } from "src/app/edge/live/livedataservice";
import { SystemErrorAcknowledge } from "src/app/edge/live/system/industrial/jsonrpc/systemErrorAcknowledge";
import { ComponentsBaseModule } from "src/app/shared/components/components.module";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { PickdateComponentModule } from "src/app/shared/components/pickdate/pickdate.module";
import { Converter } from "src/app/shared/components/shared/converter";
import { Filter } from "src/app/shared/components/shared/filter";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { LiveDataServiceProvider } from "src/app/shared/provider/live-data-service-provider";
import { LocaleProvider } from "src/app/shared/provider/locale-provider";
import { ChannelAddress, CurrentData, Edge, EdgeConfig, EdgePermission, Utils } from "src/app/shared/shared";
import { ArrayUtils } from "src/app/shared/utils/array/array.utils";
import { AssertionUtils } from "src/app/shared/utils/assertions/assertions.utils";
import { CommonUiModule } from "../../../../shared/common-ui.module";
import { ChartComponent } from "./chart/chart";

@Component({
    selector: IndustrialServiceAssistantComponent.SELECTOR,
    templateUrl: "./industrial.html",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        CommonUiModule,
        ChartComponent,
        ComponentsBaseModule,
        LiveDataServiceProvider,
        LocaleProvider,
        PickdateComponentModule,
        FormsModule,
    ],
})
export class IndustrialServiceAssistantComponent extends AbstractFlatWidget {
    private static readonly SELECTOR = "industrialserviceassistant";

    protected chargerComponents: EdgeConfig.Component[] = [];
    protected Filter = Filter;
    protected selectedBattery: EdgeConfig.Component | null = null;
    protected cellVoltageDifferences: { [batteryId: string]: number | null } = {};
    protected cellVoltageDifference: number | null = null;
    protected cellTemperatureDifference: number | null = null;
    protected batteries: EdgeConfig.Component[] = [];
    protected esss: EdgeConfig.Component[] = [];
    protected batteryInverters: EdgeConfig.Component[] = [];
    protected tower: { [batteryId: string]: { [id: string]: string } } = {};
    protected systemFeneconIndustrialL: Record<string, string> = {};
    protected date: string = this.service?.historyPeriod?.value?.getText(this.translate, this.service) ?? "";
    protected currentEdge: Edge | null = null;
    protected canSeeSystemErrorAcknowledge: boolean = false;

    private static getBatteryFirmwareString(currentData: CurrentData, batteryId: string, patchKey: string): any {
        return [
            currentData.allComponents[batteryId + "/SoftwareVersionMajor"],
            currentData.allComponents[batteryId + "/SoftwareVersionMinor"],
            currentData.allComponents[batteryId + "/" + patchKey],
        ].join(".");
    }

    private static getHeatingState(currentData: CurrentData): any {
        if (currentData.allComponents["system0/HeaterRunningState"] == 1) {
            return "HEATING";
        }

        if (
            currentData.allComponents["system0/Compressor1RunningState"] == 0 ||
            currentData.allComponents["system0/Compressor2RunningState"] == 0
        ) {
            return "COOLING";
        }
        return Converter.HIDE_VALUE(null);
    }

    protected override async afterIsInitialized(): Promise<void> {
        this.currentEdge = await this.service.getCurrentEdge();
        AssertionUtils.assertIsDefined(this.config);
        if (this.config?.components) {
            this.chargerComponents = Object.values(this.config.components).filter(
                (component) =>
                    component.factoryId === "GoodWe.Charger-PV1" || component.factoryId === "GoodWe.Charger-PV2",
            );
        }

        this.batteryInverters = this.config.getComponentsImplementingNature(
            "io.openems.edge.batteryinverter.api.ManagedSymmetricBatteryInverter",
        );
        this.selectedBattery = this.batteries[0];

        for (const battery of this.batteries) {
            AssertionUtils.assertIsDefined(this.componentId);
            const data = await (this.dataService as LiveDataService).subscribeAndGetFirstValidValueForChannels(
                this.getSubscribeChannels(battery),
                this.componentId,
            );

            this.tower[battery.id] = {
                Firmware: IndustrialServiceAssistantComponent.getBatteryFirmwareString(
                    data,
                    battery.id,
                    this.getPatchKey(),
                ),
            };
        }
        this.canSeeSystemErrorAcknowledge = EdgePermission.hasSystemErrorAcknowledge(this.currentEdge);
    }

    protected override onCurrentData(currentData: CurrentData): void {
        for (const battery of this.batteries) {
            const batteryId = battery.id;
            this.cellVoltageDifferences[batteryId] = Utils.subtractSafely(
                currentData.allComponents[batteryId + "/MaxCellVoltage"],
                currentData.allComponents[batteryId + "/MinCellVoltage"],
            );
        }

        this.systemFeneconIndustrialL["HeatingState"] =
            IndustrialServiceAssistantComponent.getHeatingState(currentData);

        const selectedbatteryId = this.selectedBattery?.id;
        this.cellVoltageDifference = Utils.subtractSafely(
            currentData.allComponents[selectedbatteryId + "/MaxCellVoltage"],
            currentData.allComponents[selectedbatteryId + "/MinCellVoltage"],
        );
        this.cellTemperatureDifference = Utils.subtractSafely(
            currentData.allComponents[selectedbatteryId + "/MaxCellTemperature"],
            currentData.allComponents[selectedbatteryId + "/MinCellTemperature"],
        );
    }

    protected override getChannelAddresses(): ChannelAddress[] {
        const channels: ChannelAddress[] = [
            new ChannelAddress("system0", "HeaterRunningState"),
            new ChannelAddress("system0", "Compressor1RunningState"),
            new ChannelAddress("system0", "Compressor2RunningState"),
        ];

        AssertionUtils.assertIsDefined(this.config);
        this.batteries = ArrayUtils.sortByTrailingNumber(
            this.config.getComponentsImplementingNature("io.openems.edge.battery.api.Battery"),
            (e: EdgeConfig.Component): string => {
                return e.id;
            },
        );
        for (const battery of this.batteries) {
            channels.push(
                new ChannelAddress(battery.id, "MaxCellVoltage"),
                new ChannelAddress(battery.id, "MinCellVoltage"),
                new ChannelAddress(battery.id, "PackShuntTemperature"),
            );
        }
        this.esss = this.config.getComponentsByFactory("Ess.Generic.ManagedSymmetric");

        return channels;
    }

    protected systemErrorAcknowledge() {
        this.esss.forEach((ess) => {
            AssertionUtils.assertIsDefined(this.edge);
            this.edge.sendRequest(
                this.websocket,
                new ComponentJsonApiRequest({ componentId: ess.id, payload: new SystemErrorAcknowledge() }),
            );
        });
    }

    protected VOLTAGE_TO_VOLT_WITH_3_DECIMALS: Converter = (raw): string => {
        return Converter.IF_NUMBER(raw, (value) => formatNumber(value, "de", "1.0-3") + " V");
    };

    protected VOLTAGE_IN_MILLI_VOLT_TO_VOLT_WITH_3_DECIMALS: Converter = (raw): string => {
        return Converter.IF_NUMBER(raw, (value) => formatNumber(value / 1000, "de", "1.0-3") + " V");
    };

    protected VOLTAGE_TO_MILLI_VOLT_WITH_3_DECIMALS: Converter = (raw): string => {
        return Converter.IF_NUMBER(raw, (value) => formatNumber(value, "de", "1.0-0") + " mV");
    };

    protected AMPERE_IN_MILLI_AMPERE_TO_AMPERE_WITH_3_DECIMALS: Converter = (raw): string => {
        return Converter.IF_NUMBER(raw, (value) => formatNumber(value / 1000, "de", "1.0-3") + " A");
    };
    private getSubscribeChannels(battery: EdgeConfig.Component) {
        return [
            new ChannelAddress(battery.id, "SoftwareVersionMajor"),
            new ChannelAddress(battery.id, "SoftwareVersionMinor"),
            new ChannelAddress(battery.id, this.getPatchKey()),
        ];
    }
    private getPatchKey() {
        AssertionUtils.assertIsDefined(this.currentEdge);
        return this.currentEdge.isVersionAtLeast("2025.2.2") ? "SoftwareVersionPatch" : "SoftwareVersionPath";
    }
}
