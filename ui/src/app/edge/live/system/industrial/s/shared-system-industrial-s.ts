import { TranslateService } from "@ngx-translate/core";
import { Edge, EdgeConfig } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";
import { NavigationConstants, NavigationTree } from "../../../../../shared/components/navigation/shared";

export namespace SharedSystemIndustrialS {
    export function getNavigationTree(
        translate: TranslateService,
        componentId: EdgeConfig.Component["id"],
        edge: Edge,
    ): ConstructorParameters<typeof NavigationTree> | null {
        return new NavigationTree(
            componentId + "/industrial-s",
            { baseString: componentId + "/industrial-s" },
            { name: "battery-full-outline", color: "medium" },
            "FENECON Industrial S",
            "label",
            [
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
}
