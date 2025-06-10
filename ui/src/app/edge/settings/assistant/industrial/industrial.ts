// @ts-strict-ignore
import { formatNumber } from "@angular/common";
import { Component } from "@angular/core";
import { LiveDataService } from "src/app/edge/live/livedataservice";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { Converter } from "src/app/shared/components/shared/converter";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { Filter } from "src/app/shared/components/shared/filter";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { ChannelAddress, CurrentData, Edge, EdgeConfig, Utils } from "src/app/shared/shared";
import { ClearTimeOutFailureRequest } from "./jsonrpc/clearTimeoutFailure";

@Component({
  selector: IndustrialServiceAssistantComponent.SELECTOR,
  templateUrl: "./industrial.html",
  providers: [{
    useClass: LiveDataService,
    provide: DataService,
  }],
  standalone: false,
})
export class IndustrialServiceAssistantComponent extends AbstractFlatWidget {

  private static readonly SELECTOR = "industrialserviceassistant";

  protected convertToGridMeterCategory: Converter;
  protected chargerComponents: EdgeConfig.Component[] = [];
  protected Filter = Filter;
  protected selectedBattery: EdgeConfig.Component;
  protected cellVoltageDifferences: { [batteryId: string]: number | null } = {};
  protected cellVoltageDifference: number | null = null;
  protected cellTemperatureDifference: number | null = null;
  protected batteries: EdgeConfig.Component[] = [];
  protected batteryInverters: EdgeConfig.Component[] = [];
  protected tower: { [batteryId: string]: { [id: string]: any } } = {};
  protected systemFeneconIndustrialL: { [id: string]: any } = {};
  protected CONVERT_TO_GRID_METER_CATEGORY = Converter.CONVERT_TO_GRID_METER_CATEGORY(this.translate);
  protected date: string = this.service?.historyPeriod?.value?.getText(this.translate, this.service) ?? "";
  protected currentEdge: Edge | null = null;

  private static getHeatingState(currentData: CurrentData): any {
    if (currentData.allComponents["system0/HeaterRunningState"] == 1) {
      return "HEATING";
    }

    if (currentData.allComponents["system0/Compressor1RunningState"] == 0 || currentData.allComponents["system0/Compressor2RunningState"] == 0) {
      return "COOLING";
    }
    return Converter.HIDE_VALUE(null);
  }

  private static getBatteryFirmwareString(currentData: CurrentData, batteryId: string, patchKey: string): any {
    return [
      currentData.allComponents[batteryId + "/SoftwareVersionMajor"],
      currentData.allComponents[batteryId + "/SoftwareVersionMinor"],
      currentData.allComponents[batteryId + "/" + patchKey],
    ].join(".");
  }


  protected override getChannelAddresses(): ChannelAddress[] {
    const channels: ChannelAddress[] = [
      new ChannelAddress("system0", "HeaterRunningState"),
      new ChannelAddress("system0", "Compressor1RunningState"),
      new ChannelAddress("system0", "Compressor2RunningState"),
    ];

    this.batteries = this.config.getComponentsByFactory("Battery.EnfasBms");
    for (const battery of this.batteries) {
      channels.push(
        new ChannelAddress(battery.id, "MaxCellVoltage"),
        new ChannelAddress(battery.id, "MinCellVoltage"),
        new ChannelAddress(battery.id, "PackShuntTemperature"),
      );
    }

    return channels;
  }

  protected override async afterIsInitialized(): Promise<void> {
    this.currentEdge = await this.service.getCurrentEdge();
    if (this.config?.components) {
      this.chargerComponents = Object.values(this.config.components)
        .filter(component =>
          component.factoryId === "GoodWe.Charger-PV1" ||
          component.factoryId === "GoodWe.Charger-PV2",
        );
    }

    this.batteryInverters = this.config.getComponentsImplementingNature("io.openems.edge.batteryinverter.api.ManagedSymmetricBatteryInverter");
    this.selectedBattery = this.batteries[0];

    const patchKey = this.currentEdge.isVersionAtLeast("2025.2.2")
      ? "SoftwareVersionPatch"
      : "SoftwareVersionPath";

    for (const battery of this.batteries) {
      const channelAddresses: ChannelAddress[] = [
        new ChannelAddress(battery.id, "SoftwareVersionMajor"),
        new ChannelAddress(battery.id, "SoftwareVersionMinor"),
        new ChannelAddress(battery.id, patchKey),
      ];

      const data = await (this.dataService as LiveDataService).subscribeAndGetFirstValidValueForChannels(channelAddresses, this.componentId);

      this.tower[battery.id] = {
        "Firmware": IndustrialServiceAssistantComponent.getBatteryFirmwareString(data, battery.id, patchKey),
      };
    }

  }


  protected override onCurrentData(currentData: CurrentData): void {
    for (const battery of this.batteries) {
      const batteryId = battery.id;
      this.cellVoltageDifferences[batteryId] = Utils.subtractSafely(
        currentData.allComponents[batteryId + "/MaxCellVoltage"],
        currentData.allComponents[batteryId + "/MinCellVoltage"],
      );
    }
    this.systemFeneconIndustrialL["HeatingState"] = IndustrialServiceAssistantComponent.getHeatingState(currentData);

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

  protected clear() {
    this.edge.sendRequest(
      this.websocket,
      new ComponentJsonApiRequest({ componentId: this.component.id, payload: new ClearTimeOutFailureRequest() }),
    );
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
}
