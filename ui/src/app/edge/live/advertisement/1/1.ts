import { Component } from "@angular/core";

@Component({
  selector: "advert-1",
  template: `
  <ion-grid style="font-size: small; text-align: center; width: 100%" class="ion-padding">
    <ion-row>
      <ion-text class="ion-text-center" style="width: 100%" [innerHTML]="'ADVERT.1.TEXT' | translate">
      </ion-text>
    </ion-row>

    <!--<ion-row class="ion-padding-top ion-justify-content-center">
      <ion-button href="https://register.gotowebinar.com/register/3587213205947970905" target="_blank" size="small" fill="outline" style="font-size: small;" translate>
          ADVERT.1.BUTTON_LABEL
      </ion-button>
    </ion-row>-->

  </ion-grid>
  `,
  standalone: false,
})
export class TimeOfUseTariffAdvertComponent { }
