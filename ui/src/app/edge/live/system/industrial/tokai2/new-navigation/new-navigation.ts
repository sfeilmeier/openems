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
    selector: "oe-system-industrial-tokai2",
    templateUrl:
        "../../../../../../shared/components/formly/formly-field-modal/template.html",
    providers: [{ provide: DataService, useClass: LiveDataService }],
    imports: [CommonUiModule, FormlyModule],
})
export class SystemIndustrialTokai2Component extends AbstractIndustrialComponent {
    protected override readonly factoryId = "System.Fenecon.Industrial.Tokai2";

    public static getFormlyGeneralView(
        translate: TranslateService,
        edge: Edge,
        self: SystemIndustrialTokai2Component,
    ): OeFormlyView {
        const lines: OeFormlyField[] = self.createDefaultStartStop(translate);

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
            title: "FENECON Industrial Tokai2",
            lines: lines,
            component: self.component,
            edge,
        };
    }

    protected override generateView(viewContext: ViewContext): OeFormlyView {
        this.loadComponentFromViewContext(viewContext);
        return SystemIndustrialTokai2Component.getFormlyGeneralView(
            this.translate,
            viewContext.edge,
            this,
        );
    }
}
