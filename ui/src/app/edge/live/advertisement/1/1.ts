import { Component } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Advert1ModalComponent } from "./modal/modal";

@Component({
  selector: "advert-1",
  template: `
  <ion-grid style="font-size: small; text-align: center; width: 100%" class="ion-padding-left ion-padding-right">
    <ion-row class="ion-margin-left">
      <ion-col class="ion-padding ion-no-padding-top" [innerHTML]="'ADVERT.1.TEXT' | translate"></ion-col>
    </ion-row>

    <ion-row class="ion-padding-top ion-justify-content-center">
      <ion-button (click)="presentModal()" size="small" fill="outline" style="font-size: small;">
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
    private readonly modalController: ModalController
  ) { }

  protected async presentModal() {
    const modal = await this.modalController.create({
      component: Advert1ModalComponent,
    });
    return await modal.present();
  }
}
