import { TranslateService } from "@ngx-translate/core";
import { JsCalendar } from "src/app/shared/components/schedule/js-calendar-task";
import { Edge, EdgeConfig } from "src/app/shared/shared";
import { NavigationConstants, NavigationTree, } from "../../../../../shared/components/navigation/shared";

export namespace SharedSystemIndustrialL {
    export function getNavigationTree(
        translate: TranslateService,
        componentId: EdgeConfig.Component["id"],
    ): ConstructorParameters<typeof NavigationTree> | null {
        return new NavigationTree(
            componentId + "/industrial-l",
            { baseString: componentId + "/industrial-l" },
            { name: "battery-full-outline", color: "medium" },
            "FENECON Industrial L",
            "label",
            [
                new NavigationTree(
                    "schedule",
                    { baseString: "schedule" },
                    { name: "calendar-outline", color: "warning" },
                    translate.instant(
                        "EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.MAINTENANCE_WINDOW",
                    ),
                    "label",
                    [],
                    null,
                ),
                NavigationConstants.CommonNodes.INFO(translate, {
                    source: componentId,
                }),
            ],
            null,
        ).toConstructorParams();
    }

    export class IndustrialLPayload extends JsCalendar.BaseOpenEMSPayload {
        public override canWrite(edge: Edge | null): boolean {
            return false;
        }
    }
}
