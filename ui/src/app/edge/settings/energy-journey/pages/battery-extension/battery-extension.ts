import { Component } from "@angular/core";
import { HistoryDataService } from "src/app/edge/history/historydataservice";
import { DataService } from "src/app/shared/components/shared/dataservice";

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { subDays, subYears } from "date-fns";
import { XAxisType } from "src/app/shared/components/chart/chart.constants";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { Converter } from "src/app/shared/components/shared/converter";
import { Formatter } from "src/app/shared/components/shared/formatter";
import { Currency } from "src/app/shared/shared";
import { DateUtils } from "src/app/shared/utils/date/dateutils";
import { SimulationRequest } from "../../simulationRequest";
import { SimulatedData } from "./battery-extension.module";
import { PossibleBatteryExtensionRequest } from "./battery-extension.request";
import { PossibleBatteryExtensionResponse } from "./battery-extension.response";

@Component({
  selector: 'battery-extension',
  templateUrl: './battery-extension.html',
  providers: [
    { provide: DataService, useClass: HistoryDataService },
  ],
})
export class BatteryExtensionComponent extends AbstractFlatWidget {

  protected readonly XAxisType = XAxisType;
  protected readonly CONVERT_TO_PRICE = this.convertToPrice(Currency.Unit.CENT);
  protected spinnerId: string = 'batteryExtensionSpinner';
  protected simulatedData: SimulatedData = { simulationData: [] };
  protected electricityPrice: number | null = null;
  protected chartTitle: string = 'Einsparung Strombezug in kWh';
  protected readonly fromDate: Date = subYears(subDays(new Date(), 1), 1);
  protected readonly toDate: Date = subDays(new Date(), 1);

  protected override afterIsInitialized(): void {
    const dateRange = DateUtils.toDateRange(this.fromDate, this.toDate, this.translate);

    if (!dateRange) {
      console.warn('Daterange not available, either fromDate or toDate are invalid');
      return;
    }
    this.chartTitle = 'Einsparung Strombezug in kWh (' + DateUtils.toDateRange(this.fromDate, this.toDate, this.translate) + ')';

    const electricityPrice = this.route?.snapshot?.queryParams['electricityPrice'] as number;

    if (!electricityPrice) {
      this.router.navigate(['../electricityPriceChoice'], { relativeTo: this.route });
      return;
    }
    this.getSimulatedData(electricityPrice);
  }

  protected async getSimulatedData(electricityPrice: number): Promise<void> {
    this.service.startSpinner(this.spinnerId);
    this.electricityPrice = electricityPrice;

    const edge = await this.service.getCurrentEdge();

    if (!edge) {
      this.service.toast('Edge not available', 'danger');
      return;
    }

    const result: PossibleBatteryExtensionResponse = await edge.sendRequest(this.websocket, new SimulationRequest({
      payload: new PossibleBatteryExtensionRequest(subYears(subDays(new Date(), 1), 1),
        subDays(new Date(), 1), electricityPrice),
    }));

    if (!result) {
      this.service.toast('Simulation not available', 'danger');
      return;
    }

    this.simulatedData = result.result as SimulatedData;
    this.service.stopSpinner(this.spinnerId);
  }

  protected override getFormGroup(): FormGroup {
    return this.formBuilder.group({
      electricityPrice: new FormControl(null, {
        validators: [Validators.required],
      }),
    });
  }

  private convertToPrice(currency: Currency.Unit) {
    return (raw: any): string => {
      return Converter.IF_NUMBER_OR_STRING(raw, value => {
        let _value: number | null = null;
        if (typeof value === 'string') {
          _value = parseInt(value);
        }

        if (!_value) {
          console.error("[Converter.CONVERT_PRICE_TO_READABLE] value could not pe parsed to int");
          return "-";
        }

        return Formatter.FORMAT_CURRENCY_PER_KWH(value, currency);
      });
    };
  }
}
