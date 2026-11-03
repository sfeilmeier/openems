import { TranslateService } from "@ngx-translate/core";
import { JsCalendar } from "src/app/shared/components/schedule/js-calendar-task";
import { Edge, EdgeConfig } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";
import { NavigationConstants, NavigationTree } from "../../../../../shared/components/navigation/shared";

export namespace SharedSystemIndustrialL {
    export function getNavigationTree(
        translate: TranslateService,
        componentId: EdgeConfig.Component["id"],
        edge: Edge,
    ): ConstructorParameters<typeof NavigationTree> | null {
        return new NavigationTree(
            componentId + "/industrial-l",
            { baseString: componentId + "/industrial-l" },
            { name: "battery-full-outline", color: "medium" },
            "FENECON Industrial L",
            "label",
            [
                new NavigationTree(
                    componentId + "-schedule",
                    { baseString: "schedule" },
                    { name: "calendar-outline", color: "warning" },
                    translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.MAINTENANCE_WINDOW"),
                    "label",
                    [],
                    null,
                ),
                ...(edge.roleIsAtLeast(Role.ADMIN)
                    ? [
                          new NavigationTree(
                              componentId + "-serviceassistant",
                              { baseString: "service-assistant" },
                              { name: "stats-chart-outline", color: "primary" },
                              translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.SERVICE_ASSISTANT"),
                              "label",
                              [],
                              null,
                              { showOrder: "LOW", hideFavorite: true },
                          ),
                      ]
                    : []),
                NavigationConstants.CommonNodes.INFO(translate, componentId, {
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
