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
  </ion-grid>
  `,
  standalone: false,
})
export class Advert1Component {

  constructor(
    protected readonly translate: TranslateService,
  ) { }
}
