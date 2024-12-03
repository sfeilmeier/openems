import { Component } from "@angular/core";

@Component({
  selector: "time-of-use-tariff-advert",
  template: `
   <ion-grid style="font-size: small; text-align: center; width: 100%" class="ion-padding">
      <ion-row>
        <ion-text class="ion-text-center" style="width: 100%" [innerHTML]="'ADVERT.TIME_OF_USE.TEXT' | translate">
        </ion-text>
    </ion-row>
    </ion-grid>
  `,
})
export class TimeOfUseTariffAdvertComponent { }
