import { Component } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { Service } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";
import { ModalComponent } from "./modal/modal";

@Component({
    selector: "time-of-use-tariff-advert",
    template: `
   <ion-grid style="font-size: small; text-align: center; width: 100%" class="ion-padding">
      <ion-row>
        <ion-text class="ion-text-center" style="width: 100%" *ngIf="isAtLeastInstaller, else ownerTemplate">
            Seien Sie dabei und melden Sie sich jetzt für unser Webinar zum Thema Dynamische Stromtarife an! Am 24. Oktober 2024 erklären Jan Thäter und Daniel Miedl von FENECON, welche Chancen sich durch die dynamischen Stromtarife ab dem 01. Januar 2025 für Sie ergeben. Erfahren Sie, wie FENECON Stromspeicher und die FEMS App Dynamische Stromtarife Ihren Kunden helfen, von diesen Tarifen maximal zu profitieren.
        </ion-text>

        <ng-template #ownerTemplate>
            <ion-text class="ion-text-center" style="width: 100%">
                Der Beta-Test unserer FEMS App Dynamischer Stromtarif zur optimalen Nutzung dynamischer Stromtarife ist nun abgeschlossen. Vielen Dank an alle Teilnehmer! Ihre Rückmeldungen helfen uns, die App noch besser zu machen. Nähere Informationen zum Thema dynamische Stromtarife folgen in Kürze.
            </ion-text>
        </ng-template>
    </ion-row>
    <ion-row class="ion-padding-top ion-justify-content-center" *ngIf="isAtLeastInstaller">
      <ion-button (click)="presentModal()" size="small" fill="outline" style="font-size: small;">
        zur Anmeldung
      </ion-button>
    </ion-row>
    </ion-grid>
  `,
})
export class TimeOfUseTariffAdvertComponent {

    protected isAtLeastInstaller: boolean = false;

    constructor(private service: Service, private modalController: ModalController) {

        this.service.getCurrentEdge().then(edge => {
            this.isAtLeastInstaller = edge.roleIsAtLeast(Role.INSTALLER);
        });
    }

    protected async presentModal() {
        const modal = await this.modalController.create({
            component: ModalComponent,
        });
        return await modal.present();
    }
}
