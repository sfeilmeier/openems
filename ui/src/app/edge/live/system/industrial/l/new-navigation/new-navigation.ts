import { Component } from "@angular/core";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { LiveDataService } from "src/app/edge/live/livedataservice";
import { CommonUiModule } from "src/app/shared/common-ui.module";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { OeFormlyField, OeFormlyView, ViewContext, } from "src/app/shared/components/shared/oe-formly-component";
import { Edge, EdgePermission } from "src/app/shared/shared";
import { Language } from "src/app/shared/type/language";
import { Role } from "src/app/shared/type/role";
import { AbstractIndustrialComponent } from "../../AbstractIndustrialComponent";
import de from "../i18n/de.json";
import en from "../i18n/en.json";

@Component({
    selector: "oe-system-industrial-l",
    templateUrl:
        "../../../../../../shared/components/formly/formly-field-modal/template.html",
    providers: [{ provide: DataService, useClass: LiveDataService }],
    imports: [CommonUiModule, FormlyModule],
})
export class SystemIndustrialLComponent extends AbstractIndustrialComponent {
    protected override readonly factoryId = "System.Fenecon.Industrial.L";

    constructor() {
        super();
        Language.normalizeAdditionalTranslationFiles({ de: de, en: en }).then(
            (translations) => {
                for (const { lang, translation, shouldMerge } of translations) {
                    this.translate.setTranslation(
                        lang,
                        translation,
                        shouldMerge,
                    );
                }
            },
        );
    }

    public static getFormlyGeneralView(
        translate: TranslateService,
        edge: Edge,
        self: SystemIndustrialLComponent,
    ): OeFormlyView {
        const lines: OeFormlyField[] = self.createDefaultStartStop(translate);

        if (edge.roleIsAtLeast(Role.INSTALLER)) {
            self.addResetButton(
                lines,
                translate,
                self.bmsHardReset(),
                translate.instant(
                    "EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.BMS_HARD_RESET",
                ),
            );
        }

        if (
            EdgePermission.hasSystemErrorAcknowledge(edge) &&
            edge.roleIsAtLeast(Role.INSTALLER)
        ) {
            self.addResetButton(
                lines,
                translate,
                self.systemErrorAcknowledge(),
                translate.instant(
                    "EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.SYSTEM_ERROR_ACKNOWLEDGE_HEADER",
                ) +
                    " " +
                    translate.instant(
                        "EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.SYSTEM_ERROR_ACKNOWLEDGE_TEXT",
                    ),
            );
        }

        return {
            title: "FENECON Industrial L",
            helpKey: "REDIRECT.SYSTEM.INDUSTRIAL_L_MANUAL",
            lines: lines,
            component: self.component,
            edge,
        };
    }

    protected override generateView(viewContext: ViewContext): OeFormlyView {
        this.loadComponentFromViewContext(viewContext);
        return SystemIndustrialLComponent.getFormlyGeneralView(
            this.translate,
            viewContext.edge,
            this,
        );
    }
}
