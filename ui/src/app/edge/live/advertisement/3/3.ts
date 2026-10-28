import { ChangeDetectionStrategy, Component, effect } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Service } from "src/app/shared/shared";

@Component({
    selector: "advert-3",
    template: `
        @if (text && linkText) {
            <ion-grid
                style="font-size: small; text-align: center; width: 100%"
                class="ion-padding-left ion-padding-right"
            >
                <ion-row class="ion-margin-left">
                    <ion-col class="ion-padding" [innerHTML]="text | translate"></ion-col>
                </ion-row>
                <ion-row class="ion-padding-top ion-justify-content-center">
                    <span>{{ linkText | translate }}</span>
                </ion-row>
            </ion-grid>
        }
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class Advert3Component {
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

            this.text = "ADVERT.3.TEXT";
            this.link = "ADVERT.3.LINK";
            this.linkText = "ADVERT.3.LINK_TEXT";
        });
    }
}
