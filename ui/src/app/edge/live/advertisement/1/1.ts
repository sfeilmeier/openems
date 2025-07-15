import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "advert-1",
  template: `
  <ion-grid style="font-size: small; text-align: center; width: 100%" class="ion-padding">
    <ion-row>
      <ion-text class="ion-text-center" style="width: 100%" [innerHTML]="'ADVERT.1.TEXT' | translate">
      </ion-text>
    </ion-row>

    <ion-row class="ion-padding-top ion-justify-content-center">
        <ion-button [href]="'ADVERT.1.LINK' | translate" target="_blank" size="small" fill="outline" style="font-size: small;">
          <span translate>ADVERT.1.LINK_TEXT</span>
        </ion-button>
      </ion-row>
  </ion-grid>
  `,
  standalone: false,
})
export class Advert1Component {

  constructor(
    protected readonly translate: TranslateService,
  ) { }
}
