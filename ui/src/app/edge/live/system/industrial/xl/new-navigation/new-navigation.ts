import { Component, ChangeDetectionStrategy } from "@angular/core";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { LiveDataService } from "src/app/edge/live/livedataservice";
import { CommonUiModule } from "src/app/shared/common-ui.module";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { OeFormlyField, OeFormlyView, ViewContext } from "src/app/shared/components/shared/oe-formly-component";
import { Edge, EdgePermission } from "src/app/shared/shared";
import { Language } from "src/app/shared/type/language";
import { Role } from "src/app/shared/type/role";
import { AbstractIndustrialComponent } from "../../AbstractIndustrialComponent";
import cz from "../i18n/cz.json";
import de from "../i18n/de.json";
import en from "../i18n/en.json";
import es from "../i18n/es.json";
import fr from "../i18n/fr.json";
import ja from "../i18n/ja.json";
import lt from "../i18n/lt.json";
import nl from "../i18n/nl.json";

@Component({
    selector: "oe-system-industrial-xl",
    templateUrl: "../../../../../../shared/components/formly/formly-field-modal/template.html",
    providers: [{ provide: DataService, useClass: LiveDataService }],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonUiModule, FormlyModule],
})
export class SystemIndustrialXlComponent extends AbstractIndustrialComponent {
    protected override readonly factoryId = "System.Fenecon.Industrial.Xl";

    constructor() {
        super();
        Language.normalizeAdditionalTranslationFiles({
            cz: cz,
            de: de,
            en: en,
            es: es,
            fr: fr,
            ja: ja,
            lt: lt,
            nl: nl,
        }).then((translations) => {
            for (const { lang, translation, shouldMerge } of translations) {
                this.translate.setTranslation(lang, translation, shouldMerge);
            }
        });
    }

    public static getFormlyGeneralView(
        translate: TranslateService,
        edge: Edge,
        self: SystemIndustrialXlComponent,
    ): OeFormlyView {
        const lines: OeFormlyField[] = self.createDefaultStartStop(translate);

        if (edge.roleIsAtLeast(Role.INSTALLER)) {
            self.addResetButton(
                lines,
                translate,
                self.clearErrorRequest(),
                translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.CLEAR_COOLING_UNIT_ERRORS_HEADER") +
                    " " +
                    translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.CLEAR_COOLING_UNIT_ERRORS_TEXT"),
            );
        }

        if (EdgePermission.hasSystemErrorAcknowledge(edge) && edge.roleIsAtLeast(Role.INSTALLER)) {
            self.addResetButton(
                lines,
                translate,
                self.systemErrorAcknowledge(),
                translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.SYSTEM_ERROR_ACKNOWLEDGE_HEADER") +
                    " " +
                    translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.SYSTEM_ERROR_ACKNOWLEDGE_TEXT"),
            );
        }

        if (edge.roleIsAtLeast(Role.ADMIN)) {
            if (edge.roleIsAtLeast(Role.ADMIN)) {
                self.addExecuteButton(
                    lines,
                    translate,
                    self.f2bUpdate(),
                    translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.F2B_UPDATE_HEADER"),
                );

                self.addExecuteButton(
                    lines,
                    translate,
                    self.testModeEssTest(),
                    translate.instant("INDUSTRIAL_XL.TEST_MODE_ESS_TEST"),
                );

                self.addExecuteButton(
                    lines,
                    translate,
                    self.testModeManualBatteryStart(),
                    translate.instant("INDUSTRIAL_XL.TEST_MODE_MANUAL_BATTERY_START"),
                );

                self.addExecuteButton(
                    lines,
                    translate,
                    self.testModeLampTest(),
                    translate.instant("INDUSTRIAL_XL.TEST_MODE_LAMP_TEST"),
                );

                self.addExecuteButton(
                    lines,
                    translate,
                    self.testModeExit(),
                    translate.instant("INDUSTRIAL_XL.TEST_MODE_EXIT"),
                );
            }
        }

        return {
            title: "FENECON Industrial XL",
            helpKey: "REDIRECT.SYSTEM.INDUSTRIAL_XL_MANUAL",
            lines: lines,
            component: self.component,
            edge,
        };
    }

    protected override generateView(viewContext: ViewContext): OeFormlyView {
        this.loadComponentFromViewContext(viewContext);
        return SystemIndustrialXlComponent.getFormlyGeneralView(this.translate, viewContext.edge, this);
    }
}
