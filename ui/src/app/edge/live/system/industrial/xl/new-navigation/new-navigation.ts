import { Component } from "@angular/core";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { LiveDataService } from "src/app/edge/live/livedataservice";
import { CommonUiModule } from "src/app/shared/common-ui.module";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { OeFormlyField, OeFormlyView, ViewContext, } from "src/app/shared/components/shared/oe-formly-component";
import { Edge, EdgePermission } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";
import { AbstractIndustrialComponent } from "../../AbstractIndustrialComponent";

@Component({
    selector: "oe-system-industrial-xl",
    templateUrl:
        "../../../../../../shared/components/formly/formly-field-modal/template.html",
    providers: [{ provide: DataService, useClass: LiveDataService }],
    imports: [CommonUiModule, FormlyModule],
})
export class SystemIndustrialXlComponent extends AbstractIndustrialComponent {
    protected override readonly factoryId = "System.Fenecon.Industrial.Xl";

    public static getFormlyGeneralView(
        translate: TranslateService,
        edge: Edge,
        self: SystemIndustrialXlComponent,
    ): OeFormlyView {
        const lines: OeFormlyField[] = self.createDefaultStartStop(translate);

        if (edge.roleIsAtLeast(Role.INSTALLER)) {
            self.addActionButton(
                lines,
                translate,
                self.clearErrorRequest(self),
                translate.instant(
                    "EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.CLEAR_COOLING_UNIT_ERRORS_HEADER",
                ) +
                    " " +
                    translate.instant(
                        "EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.CLEAR_COOLING_UNIT_ERRORS_TEXT",
                    ),
            );
        }

        if (
            EdgePermission.hasSystemErrorAcknowledge(edge) &&
            edge.roleIsAtLeast(Role.INSTALLER)
        ) {
            self.addActionButton(
                lines,
                translate,
                self.systemErrorAcknowledge(self),
                translate.instant(
                    "EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.SYSTEM_ERROR_ACKNOWLEDGE_HEADER",
                ) +
                    " " +
                    translate.instant(
                        "EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.SYSTEM_ERROR_ACKNOWLEDGE_TEXT",
                    ),
            );
        }

        if (edge.roleIsAtLeast(Role.ADMIN)) {
            lines.push(
                { type: "horizontal-line" },
                {
                    type: "button-from-form-control-line",
                    button: {
                        icon: {
                            name: "send-outline",
                            color: "primary",
                            size: "small",
                        },
                        name: translate.instant(
                            "EDGE.INDEX.WIDGETS.SYSTEM.EXECUTE",
                        ),
                        value: true,
                        callback: self.f2bUpdate(self),
                    },
                    name: translate.instant(
                        "EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.F2B_UPDATE_HEADER",
                    ),
                },
            );
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
        return SystemIndustrialXlComponent.getFormlyGeneralView(
            this.translate,
            viewContext.edge,
            this,
        );
    }
}
