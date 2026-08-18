import { Component } from "@angular/core";

@Component({
    selector: "advert-1",
    template: `
        <ion-grid style="font-size: small; text-align: center; width: 100%" class="ion-padding-left ion-padding-right">
            <ion-row class="ion-margin-left">
                <ion-col class="ion-padding" [innerHTML]="'ADVERT.1.TEXT' | translate"></ion-col>
            </ion-row>

            <ion-row class="ion-padding-top ion-justify-content-space-around">
                <ion-button
                    [href]="'ADVERT.1.LINK_INSTAGRAM' | translate"
                    target="_blank"
                    size="small"
                    fill="outline"
                    style="font-size: small;"
                >
                    <span>{{ "ADVERT.1.LINK_TEXT_INSTAGRAM" | translate }}</span>
                </ion-button>
                <ion-button
                    [href]="'ADVERT.1.LINK_YOUTUBE' | translate"
                    target="_blank"
                    size="small"
                    fill="outline"
                    style="font-size: small;"
                >
                    <span>{{ "ADVERT.1.LINK_TEXT_YOUTUBE" | translate }}</span>
                </ion-button>
            </ion-row>
        </ion-grid>
    `,
    standalone: false,
})
export class Advert1Component {}
