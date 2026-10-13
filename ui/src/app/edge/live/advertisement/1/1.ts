import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { MatomoTracker } from "ngx-matomo-client";
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
                    <ion-button
                        routerLink="user"
                        target="_blank"
                        size="small"
                        fill="outline"
                        style="font-size: small;"
                        (click)="navigateToLink('user')"
                    >
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
    private readonly matomo = inject(MatomoTracker, { optional: true });
    private readonly translate = inject(TranslateService);
    private readonly service = inject(Service);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    constructor() {
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
    protected async navigateToLink(routeString: string | null): Promise<void> {
        if (routeString != null) {
            this.matomo?.trackEvent("Advert", "button-click", routeString);
            this.router.navigate([routeString], { relativeTo: this.route });
        }
    }
}
