import { Component } from "@angular/core";

@Component({
  selector: "advert-1",
  template: `
  <ion-grid style="font-size: small; text-align: center; width: 100%" class="ion-padding">
    <ion-row>
      <ion-text class="ion-text-center" style="width: 100%" [innerHTML]="'ADVERT.1.TEXT' | translate">
      </ion-text>
    </ion-row>
    <ion-row class="ion-padding-top">
      <ion-text class="ion-text-center" style="width: 100%" [innerHTML]="'ADVERT.1.TEXT_2' | translate: {link: 'https://solar.htw-berlin.de/dein-stromspeicher-kann-mehr/'}">
      </ion-text>
    </ion-row>
  </ion-grid>
  `,
  standalone: false,
})
export class AdvertComponent { }
