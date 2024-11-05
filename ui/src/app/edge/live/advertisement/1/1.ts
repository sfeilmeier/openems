import { Component } from "@angular/core";
import { Service } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";

@Component({
  selector: "time-of-use-tariff-advert",
  template: `
   <ion-grid style="font-size: small; text-align: center; width: 100%" class="ion-padding">
      <ion-row>
        <ion-text class="ion-text-center" style="width: 100%" *ngIf="isAtLeastInstaller, else ownerTemplate">
            Sie möchten gerne genauer erfahren, wie mit intelligenten, KI-basierten Prognosen dynamische Stromtarife optimal genutzt werden können und haben an unserem Webinar am 24.10. nicht teilgenommen? Kein Problem, sehen Sie sich <a href="https://attendee.gotowebinar.com/recording/539839761339461808">hier</a>
            einfach die Aufzeichnung des Online-Events an.
            <hr>
            Vielen Dank für Ihre rege Teilnahme und Ihr Feedback zum Webinar. Wir freuen uns, Sie beim nächsten Mal wieder begrüßen zu dürfen!
        </ion-text>
        <ng-template #ownerTemplate>
            <ion-text class="ion-text-center" style="width: 100%">
                Ab 2025 sind alle Energieversorger gesetzlich verpflichtet, dynamische Stromtarife anzubieten. Mit einem FENECON Stromspeicher und der FEMS App Dynamischer Stromtarif können Sie schon heute von diesen flexiblen Tarifen profitieren. Die App ermöglicht es Ihnen, zwischen verschiedenen Stromanbietern zu wählen und Ihre Energiekosten zu optimieren. Mit unserer Technologie können Sie die Energiewende aktiv mitgestalten!
                <hr>
                Alle Informationen rund um dynamische Stromtarife finden Sie <a href="https://fenecon.de/dynamische-stromtarife/">hier</a>.
            </ion-text>
        </ng-template>
    </ion-row>
    </ion-grid>
  `,
})
export class TimeOfUseTariffAdvertComponent {

  protected isAtLeastInstaller: boolean = false;

  constructor(private service: Service) {

    this.service.getCurrentEdge().then(edge => {
      this.isAtLeastInstaller = edge.roleIsAtLeast(Role.INSTALLER);
    });
  }
}
