import { ChangeDetectionStrategy, Component, effect } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Service } from "src/app/shared/shared";

@Component({
    selector: "advert-1",
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
                    <ion-button routerLink="user" target="_blank" size="small" fill="outline" style="font-size: small;">
                        <span>{{ linkText | translate }}</span>
                    </ion-button>
                </ion-row>
            </ion-grid>
        }
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
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

            this.text = "ADVERT.1.TEXT";
            this.link = "ADVERT.1.LINK";
            this.linkText = "ADVERT.1.LINK_TEXT";
        });
    }
}
