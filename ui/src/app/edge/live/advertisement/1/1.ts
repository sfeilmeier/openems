import { Component } from "@angular/core";

@Component({
  selector: "energy-journey-advert",
  template: `
   <ion-grid style="font-size: small; text-align: center; width: 100%">
      <ion-row >
        <ion-text class="ion-text-center" style="width: 100%">
        Ihr System ist seit mehr
        als einem Jahr in Betrieb. Analysieren Sie hier, wie sich eine
        Batterieerweiterung ausgewirkt hätte.
        </ion-text>
      </ion-row>
      <ion-row class="ion-padding-top ion-justify-content-center">
        <ion-button [routerLink]="['../settings/energyJourney']" size="small" fill="outline" style="font-size: small;">
          zur Analyse
        </ion-button>
      </ion-row>
    </ion-grid>
  `,
})
export class EnergyJourneyAdvertComponent { }
