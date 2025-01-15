// @ts-strict-ignore
import { formatNumber } from "@angular/common";
import { Component } from "@angular/core";
import { SelectCustomEvent } from "@ionic/angular";
import { LiveDataService } from "src/app/edge/live/livedataservice";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { Converter } from "src/app/shared/components/shared/converter";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { Filter } from "src/app/shared/components/shared/filter";
import { ChannelAddress, CurrentData, EdgeConfig, Utils } from "src/app/shared/shared";
import { ArrayUtils } from "src/app/shared/utils/array/array.utils";
import { HomeCellVoltageOptions } from "./chart/chart";

@Component({
  selector: HomeServiceAssistantComponent.SELECTOR,
  templateUrl: "./home.html",
  providers: [{
    useClass: LiveDataService,
    provide: DataService,
  }],
  standalone: false,
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
  }

  protected updateModuleNr(event: Event) {
    this.selectedModule = (event as SelectCustomEvent).target.value;
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
      ...(numberOfModules ? ArrayUtils.getArrayOfLength(numberOfModules).map(el => ({
        key: "Module" + el,
        value: el.toString(),
      }))
        : []));

    this.selectedModule = this.moduleOptions[0];
  }
}
