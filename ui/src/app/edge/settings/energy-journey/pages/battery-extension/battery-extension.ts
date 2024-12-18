import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { subDays, subYears } from "date-fns";
import { HistoryDataService } from "src/app/edge/history/historydataservice";
import { XAxisType } from "src/app/shared/components/chart/chart.constants";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { DateUtils } from "src/app/shared/utils/date/dateutils";
import { environment } from "src/environments";
import { SimulationRequest } from "../../simulationRequest";
import { SimulationResult } from "./battery-extension.module";
import { PossibleBatteryExtensionRequest } from "./battery-extension.request";
import { PossibleBatteryExtensionResponse } from "./battery-extension.response";

@Component({
  selector: "battery-extension",
  templateUrl: "./battery-extension.html",
  providers: [
    { provide: DataService, useClass: HistoryDataService },
  ],
  styles: [`
    :host{
      oe-flat-widget > ion-card > ion-item > ion-label{
        white-space: initial !important;
        text-align: center;
      }
    }
  `],
  standalone: false,
})
export class BatteryExtensionComponent extends AbstractFlatWidget {

  protected readonly XAxisType = XAxisType;
  protected spinnerId: string = "batteryExtensionSpinner";
  protected simulatedData: SimulationResult = {
    simulationData: [],
    charge: 0,
    discharge: 0,
  };
  protected electricityPrice: number | null = null;
  protected chartTitle: string | null = null;
  protected constantsDescription: string | null = null;
  protected readonly fromDate: Date = subYears(subDays(new Date(), 1), 1);
  protected readonly toDate: Date = subDays(new Date(), 1);

  private static getHome10Label(): null | string {
    switch (environment.theme) {
      case "FENECON": return "Home";
      case "Heckert": return "Symphon-E";
      default:
        return null;
    }
  }

  ionViewWillEnter(): void {
    this.electricityPrice = this.route?.snapshot?.queryParams["electricityPrice"] as number;
    this.getSimulatedData(this.electricityPrice);
  }

  protected override afterIsInitialized(): void {
    const dateRange = DateUtils.toDateRange(this.fromDate, this.toDate, this.translate);
    this.constantsDescription = this.translate.instant("SETTINGS.ENERGY_JOURNEY.CONSTANTS_DESCRIPTION", { theme: environment.theme, label: BatteryExtensionComponent.getHome10Label() });

    if (!dateRange) {
      console.warn("Daterange not available, either fromDate or toDate are invalid");
      return;
    }
    this.chartTitle = this.translate.instant("SETTINGS.ENERGY_JOURNEY.GRID_CONSUMPTION_TITLE", { date: DateUtils.toDateRange(this.fromDate, this.toDate, this.translate) });

    this.electricityPrice = this.route?.snapshot?.queryParams["electricityPrice"] as number;

    if (!this.electricityPrice) {
      this.router.navigate(["../electricityPriceChoice"], { relativeTo: this.route });
      return;
    }
    this.getSimulatedData(this.electricityPrice);
  }

  protected async getSimulatedData(electricityPrice: number): Promise<void> {
    this.service.startSpinner(this.spinnerId);
    this.electricityPrice = electricityPrice;

    const edge = await this.service.getCurrentEdge();

    if (!edge) {
      this.service.toast("Edge not available", "danger");
      return;
    }

    const result: PossibleBatteryExtensionResponse = await edge.sendRequest(this.websocket, new SimulationRequest({
      payload: new PossibleBatteryExtensionRequest(subYears(subDays(new Date(), 1), 1),
        subDays(new Date(), 1), electricityPrice),
    }));

    if (!result) {
      this.service.toast("Simulation not available", "danger");
      return;
    }

    this.simulatedData = result.result as SimulationResult;
    this.service.stopSpinner(this.spinnerId);
  }

  protected override getFormGroup(): FormGroup {
    return this.formBuilder.group({
      electricityPrice: new FormControl(null, {
        validators: [Validators.required],
      }),
    });
  }

}
