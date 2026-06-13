import { TranslateService } from "@ngx-translate/core";
import { EdgeConfig } from "src/app/shared/shared";
import { NavigationConstants, NavigationTree } from "../../../../../shared/components/navigation/shared";

export namespace SharedSystemIndustrialM {

    export function getNavigationTree(
        translate: TranslateService,
        componentId: EdgeConfig.Component["id"]
    ): ConstructorParameters<typeof NavigationTree> | null {

        return new NavigationTree(
            componentId + "/industrial-m",
            { baseString: componentId + "/industrial-m" },
            { name: "battery-full-outline", color: "medium" },
            "FENECON Industrial M",
            "label",
            [
                NavigationConstants.CommonNodes.INFO(
                    translate,
                    { source: componentId }
                ),
            ],
            null
        ).toConstructorParams();
    }
}
