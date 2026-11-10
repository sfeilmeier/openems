import { TranslateService } from "@ngx-translate/core";
import { NavigationCard } from "src/app/edge/live/navigation-info/navigation-info";
import { User } from "src/app/shared/jsonrpc/shared";
import { EdgeConfig } from "src/app/shared/shared";
import { Environment, Theme } from "src/environments";
import { OemMeta } from "./oem-meta";

export const theme: Omit<Environment, "url" | "backend" | "production" | "debugMode"> = {
    theme: "Heckert" as Theme,

    uiTitle: "Heckert Solar Symphon-E Online Monitoring",
    uiTitleShort: "Heckert",
    edgeShortName: "EMS",
    edgeLongName: "Heckert Solar Symphon-E",

    // TODO
    docsUrlPrefix: "https://docs.fenecon.de/{language}/_/latest/fems/",

    INFO_CARD: (translate: TranslateService, user: User): NavigationCard[] => {
        return [];
    },

    PRODUCT_TYPES: () => null,
    ENVIRONMENT_PROVIDERS: [],
    CLEANED_FACTORIES: (config: EdgeConfig): EdgeConfig["factories"] => config.factories,
    ...OemMeta,
};
