import en from "@angular/common/locales/en";
import { Component, inject, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { IonicModule, ModalController } from "@ionic/angular";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { de } from "date-fns/locale";
import { NgxSpinnerModule } from "ngx-spinner";
import { PlatFormService } from "src/app/platform.service";
import { ComponentsBaseModule } from "src/app/shared/components/components.module";
import { FlatWidgetButtonComponent } from "src/app/shared/components/flat/flat-widget-button/flat-widget-button";
import { ModalComponentsModule } from "src/app/shared/components/modal/modal.module";
import { OeImageComponent } from "src/app/shared/components/oe-img/oe-img";

import { UserSettings } from "src/app/shared/jsonrpc/shared";
import { UserService } from "src/app/shared/service/user.service";
import { Edge, Service } from "src/app/shared/shared";
import { Language } from "src/app/shared/type/language";
import { StringUtils } from "src/app/shared/utils/string/string.utils";
import { environment } from "src/environments";
import { MarketingAnnualReviewButtonComponent } from "../button/button";

@Component({
    selector: "oe-wrap-up",
    templateUrl: "./wrap-up.html",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        IonicModule,
        ModalComponentsModule,
        TranslateModule,
        NgxSpinnerModule,
        MarketingAnnualReviewButtonComponent,
        ComponentsBaseModule,
    ],
})
export class WrapUpComponent implements OnInit {
    protected img: OeImageComponent["img"] | null = null;
    protected link: FlatWidgetButtonComponent["link"] | null = null;

    protected readonly modalCtrl = inject(ModalController);
    private readonly translate = inject(TranslateService);
    private readonly service = inject(Service);
    private readonly platformService = inject(PlatFormService);
    private readonly userService = inject(UserService);

    public static shouldShowPopover(edge: Edge, userService: UserService) {
        return (
            edge.shouldShowAnnualReviewPopover() &&
            StringUtils.isNotInArr(edge.id, userService.currentUser()?.getAnnualReviewFromSettings() ?? []) &&
            environment.theme === "FENECON"
        );
    }

    private static PREFIX: (edge: Edge | null) => string = (edge: Edge | null) =>
        edge == null ? "" : "popover-annual-review-" + edge.id;

    ngOnInit() {
        this.initializeTranslations();
        if (environment.theme !== "FENECON") {
            return;
        }
        this.img = {
            url: "assets/img/annual-review.svg",
            width: this.platformService.getDevice().isSmartphone() ? 70 : 40,
        };
    }

    protected async dismiss() {
        const edge = await this.service.getCurrentEdge();
        const user = this.userService.currentUser();
        this.userService.updateUserSettingsWithProperty(
            UserSettings.ANNUAL_REVIEW,
            Array.from(new Set([...(user?.getAnnualReviewFromSettings() ?? []), edge.id])),
        );
        localStorage.setItem(WrapUpComponent.PREFIX(edge), "true");
        this.modalCtrl.dismiss();
    }

    private initializeTranslations(): void {
        Language.normalizeAdditionalTranslationFiles({ de: de, en: en }).then((translations) => {
            for (const { lang, translation, shouldMerge } of translations) {
                this.translate.setTranslation(lang, translation, shouldMerge);
            }
        });
    }
}
