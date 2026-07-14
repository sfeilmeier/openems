import { Component, effect } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Service } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";

@Component({
    selector: "advert-1",
    template: `
        <ion-grid
            style="font-size: small; text-align: center; width: 100%"
            class="ion-padding-left ion-padding-right"
            *ngIf="text && linkText"
        >
            <ion-row class="ion-margin-left">
                <ion-col class="ion-padding" [innerHTML]="text | translate"></ion-col>
            </ion-row>

            <ion-row class="ion-padding-top ion-justify-content-center">
                <ion-button
                    [href]="link | translate"
                    target="_blank"
                    size="small"
                    fill="outline"
                    style="font-size: small;"
                >
                    <span>{{ linkText | translate }}</span>
                </ion-button>
            </ion-row>
        </ion-grid>
    `,
    standalone: false,
})
export class Advert1Component {
    protected text: string | null = null;
    protected linkText: string | null = null;
    protected link: string | null = null;

    constructor(
        protected readonly translate: TranslateService,
        private service: Service,
    ) {
        effect(() => {
            const edge = this.service.currentEdge();

            if (edge == null) {
                return;
            }

            if (edge.roleIsAtLeast(Role.INSTALLER)) {
                this.text = "ADVERT.1.TEXT_INSTALLER";
                this.link = "ADVERT.1.LINK_INSTALLER";
                this.linkText = "ADVERT.1.LINK_TEXT_INSTALLER";
                return;
            }

            this.text = "ADVERT.1.TEXT_OWNER";
            this.link = "ADVERT.1.LINK_OWNER";
            this.linkText = "ADVERT.1.LINK_TEXT_OWNER";
        });
    }
}
