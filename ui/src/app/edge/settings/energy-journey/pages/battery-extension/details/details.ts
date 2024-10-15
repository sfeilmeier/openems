import { formatNumber } from "@angular/common";
import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { HistoryDataService } from "src/app/edge/history/historydataservice";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { Service, Utils } from "src/app/shared/shared";
import { environment } from "src/environments";
import { SimulationResult } from "../battery-extension.module";

type TableData = {
  gridSaving: string[],
  maxChargeDischargePowerIncrease: string[],
  totalChargeDischargePower: string[],
  capacityIncrease: string[],
  totalCapacity: string[],
  numberOfModulesDiff: string[],
};

@Component({
  selector: "battery-extension-detail",
  templateUrl: "./details.html",
  providers: [
    { provide: DataService, useClass: HistoryDataService },
  ],
  styles: [`
    .desktop-view {
      :is(ion-row) {
        ion-col:not(:first-child) {
          align-self: center !important;
          text-align: center !important;
          :not(:first-child) {
            :nth-child(odd) {
            }
          }
        }

        ion-col:first-child {
          width: calc(var(width) +5%);
          text-align: left !important;
        }
      }
    }

    .smartPhone-view {
      ion-row:not(:first-child):nth-child(odd) {
        background-color: rgba(var(--ion-color-light-rgb), 1);
      }

      :is(ion-row) {
        ion-col:not(:first-child) {
          text-align: left;
        }
        ion-col:first-child {
          align-self: center;
        }
      }
    }
    `],
})
export class DetailComponent implements OnInit, OnChanges {

  @Input({ required: true }) public simulatedData: SimulationResult = {
    simulationData: [],
    charge: 0,
    discharge: 0,
  };
  protected tableData: TableData | null = null;
  protected isSmartPhoneResolution: boolean = false;
  protected productLink: string = "#";
  private locale: string = "de";

  constructor(
    private service: Service,
  ) { }

  private static FORMAT_TO_INCREASE(value: number, locale: string): string {
    const _value = Utils.divideSafely(value, 1000);

    if (_value == null) {
      return "";
    }
    // TODO apply correct locale
    return "+ " + formatNumber(_value, locale, "1.0-2");
  }

  private static FORMAT_TO_TOTAL(value: number, label: string, locale: string): string {
    const _value = Utils.divideSafely(value, 1000);

    if (_value == null) {
      return "";
    }
    // TODO apply correct locale
    return "(= " + formatNumber(_value, locale, "1.0-2") + " " + label + ")";
  }

  private static FORMAT_EUROS(value: number | null, locale: string) {
    if (!value) {
      return "-";
    }
    return formatNumber(value, locale, "1.2-2");
  }

  ngOnInit() {
    this.isSmartPhoneResolution = this.service.isSmartphoneResolution;
    this.locale = this.service.translate.currentLang;
    this.productLink = this.getProductLink();
  }

  ngOnChanges() {
    this.tableData = this.simulatedData?.simulationData.reduce((arr: TableData, el, index) => {

      if (index === 0) {
        return arr;
      }

      arr.capacityIncrease.push(DetailComponent.FORMAT_TO_INCREASE(el.capacity - this.simulatedData?.simulationData[0].capacity, this.locale));
      arr.totalCapacity.push(DetailComponent.FORMAT_TO_TOTAL(el.capacity, "kWh", this.locale));
      arr.maxChargeDischargePowerIncrease.push(DetailComponent.FORMAT_TO_INCREASE(el.kWPeak - this.simulatedData?.simulationData[0].kWPeak, this.locale));
      arr.totalChargeDischargePower.push(DetailComponent.FORMAT_TO_TOTAL(el.kWPeak, "kW", this.locale));
      arr.gridSaving.push(DetailComponent.FORMAT_EUROS(Utils.divideSafely(Utils.subtractSafely(this.simulatedData.simulationData[0].gridBuyCosts, el.gridBuyCosts), 100), this.locale));
      arr.numberOfModulesDiff.push("+ " + (el.numberOfModules - this.simulatedData?.simulationData[0].numberOfModules));
      return arr;
    }, {
      capacityIncrease: [],
      gridSaving: [],
      maxChargeDischargePowerIncrease: [],
      numberOfModulesDiff: [],
      totalCapacity: [],
      totalChargeDischargePower: [],
    });
  }

  /**
   * Gets the url for the product based on the language selecetd.
   *
   * @returns the product url.
   */
  private getProductLink() {
    switch (this.locale) {
      case "en":
        return environment.links.ENERGY_JOURNEY.HOME_10.EN;
      default:
        return environment.links.ENERGY_JOURNEY.HOME_10.DE;
    }
  }
}
