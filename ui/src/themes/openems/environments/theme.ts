import { TranslateService } from "@ngx-translate/core";
import { NavigationCard } from "src/app/edge/live/navigation-info/navigation-info";
import { User } from "src/app/shared/jsonrpc/shared";
import { Environment, Theme } from "src/environments";
import { OemMeta } from "./oem-meta";

export const theme: Omit<Environment, "url" | "backend" | "production" | "debugMode"> = {
    theme: "OpenEMS" as Theme,

    uiTitle: "OpenEMS UI",
    uiTitleShort: "OpenEMS",
    edgeShortName: "OpenEMS",
    edgeLongName: "Open Energy Management System",

    docsUrlPrefix: "https://github.com/OpenEMS/openems/blob/develop/",

    INFO_CARD: (translate: TranslateService, user: User): NavigationCard[] => {
        return [];
    },

    PRODUCT_TYPES: () => null,
    ENVIRONMENT_PROVIDERS: [],
    ...OemMeta,
};
