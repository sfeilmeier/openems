import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HistoryDataService } from "src/app/edge/history/historydataservice";
import { XAxisType } from "src/app/shared/components/chart/chart.constants";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { DataService } from "src/app/shared/components/shared/dataservice";

@Component({
  selector: "electricity-price-selection",
  templateUrl: "./electricity-price-selection.html",
  providers: [
    { provide: DataService, useClass: HistoryDataService },
  ],
  standalone: false,
})
export class ElectricityPriceSelectionComponent extends AbstractFlatWidget implements OnInit {

  protected readonly DEFAULT_ELECTRICITY_PRICE: number = 33;
  protected backUrl: string | null = null;

  protected readonly ChartOptionsType = XAxisType;
  protected override getFormGroup(): FormGroup {
    const electricityPrice = this.route.snapshot.queryParams["electricityPrice"] ?? null;
    const formGroup: FormGroup = this.formBuilder.group({
      electricityPrice: new FormControl(electricityPrice, {
        validators: [Validators.required, Validators.minLength(1), Validators.min(1)],
      }),
    });
    if (electricityPrice) {
      formGroup.controls["electricityPrice"].markAsDirty();
    }

    this.backUrl = `/device/${this.edge?.id}/settings/energyJourney`;
    return formGroup;
  }

  protected onNextClicked() {
    if (this.formGroup?.invalid) {
      this.service.toast(this.translate.instant("Edge.Network.mandatoryFields"), "danger");
      return;
    }

    this.router.navigate(
      ["../"],
      {
        relativeTo: this.route,
        queryParams: { electricityPrice: this.formGroup?.controls["electricityPrice"].value },
      });
  }
}
