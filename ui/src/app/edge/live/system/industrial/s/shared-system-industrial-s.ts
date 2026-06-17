import { TranslateService } from "@ngx-translate/core";
import { EdgeConfig } from "src/app/shared/shared";
import { NavigationConstants, NavigationTree, } from "../../../../../shared/components/navigation/shared";

export namespace SharedSystemIndustrialS {
    export function getNavigationTree(
        translate: TranslateService,
        componentId: EdgeConfig.Component["id"],
    ): ConstructorParameters<typeof NavigationTree> | null {
        return new NavigationTree(
            componentId + "/industrial-s",
            { baseString: componentId + "/industrial-s" },
            { name: "battery-full-outline", color: "medium" },
            "FENECON Industrial S",
            "label",
            [
                NavigationConstants.CommonNodes.INFO(translate, {
                    source: componentId,
                }),
            ],
            null,
        ).toConstructorParams();
    }
}
