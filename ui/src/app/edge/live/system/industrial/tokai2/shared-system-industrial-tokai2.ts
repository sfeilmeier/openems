import { TranslateService } from "@ngx-translate/core";
import { EdgeConfig } from "src/app/shared/shared";
import { NavigationTree } from "../../../../../shared/components/navigation/shared";

export namespace SharedSystemIndustrialTokai2 {
    export function getNavigationTree(
        translate: TranslateService,
        componentId: EdgeConfig.Component["id"],
    ): ConstructorParameters<typeof NavigationTree> | null {
        return new NavigationTree(
            componentId + "/industrial-tokai2",
            { baseString: componentId + "/industrial-tokai2" },
            { name: "battery-full-outline", color: "medium" },
            "FENECON Industrial Tokai2",
            "label",
            [],
            null,
        ).toConstructorParams();
    }
}
