import { Component, effect, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { EdgeSettings } from "src/app/shared/components/edge/edge";
import { Service } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";
import { ObjectUtils } from "src/app/shared/utils/object/object.utils";

@Component({
    selector: "advert-1",
    template: `
    <ion-grid style="font-size: small; text-align: center; width: 100%" class="ion-padding-left ion-padding-right" *ngIf="text && linkText && link">
        <ion-row class="ion-margin-left">
            <ion-col class="ion-padding" [innerHTML]="text | translate"></ion-col>
        </ion-row>

        <ion-row class="ion-padding-top ion-justify-content-center">
            <ion-button [href]="link | translate" target="_blank" size="small" fill="outline" style="font-size: small;">
                <span>{{linkText}}</span>
            </ion-button>
        </ion-row>
    </ion-grid>
  `,
    standalone: false,
})
export class Advert1Component implements OnInit {

    protected text: string | null = null;
    protected linkText: string | null = null;
    protected link: string | null = null;

    constructor(
        protected readonly translate: TranslateService,
        private service: Service,
    ) {
        effect(() => {
            const edge = this.service.currentEdge();
            const uuid = ObjectUtils.getKeySafely(edge.settings, EdgeSettings.ANNUAL_REVIEW_2025) as (string | null);

            if (edge == null || uuid == null) {
                return;
            }

            this.text = edge.role === Role.INSTALLER ? "ADVERT.1.TEXT_INSTALLER" : "ADVERT.1.TEXT_OWNER";
            this.linkText = edge.role === Role.INSTALLER ? translate.instant("ADVERT.1.LINK_TEXT_INSTALLER") : translate.instant("ADVERT.1.LINK_TEXT_OWNER");
            this.link = edge.role === Role.INSTALLER ? translate.instant("ADVERT.1.LINK_INSTALLER") : translate.instant("ADVERT.1.LINK_OWNER", { uuid: uuid });
        });
    }

    ngOnInit() {
        this.service.getCurrentEdge();
    }
}
