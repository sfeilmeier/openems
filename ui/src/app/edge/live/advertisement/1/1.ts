import { Component } from "@angular/core";

@Component({
  selector: "energy-journey-advert",
  template: `
   <ion-grid style="font-size: small; text-align: center; width: 100%; align-content: center">
      <ion-row >
        <ion-text class="ion-text-center" style="width: 100%">
        {{ "SETTINGS.ENERGY_JOURNEY.BATTERY_EXTENSION_TEXT" | translate }}
        </ion-text>
      </ion-row>
      <ion-row class="ion-padding-top ion-justify-content-center">
        <ion-button [routerLink]="['../settings/energyJourney']" size="small" fill="outline" style="font-size: small;">
          {{ "SETTINGS.ENERGY_JOURNEY.TO_THE_ANALYSIS" | translate }}
        </ion-button>
      </ion-row>
    </ion-grid>
  `,
})
export class EnergyJourneyAdvertComponent { }
