import { Environment, Theme } from "src/environments";
import { OemMeta } from "./oem-meta";

export const theme: Omit<Environment, "url" | "backend" | "production" | "debugMode"> = {
    theme: "Heckert" as Theme,

    uiTitle: "Heckert Solar Symphon-E Online Monitoring",
    uiTitleShort: "Heckert",
    edgeShortName: "EMS",
    edgeLongName: "Heckert Solar Symphon-E",
    defaultLanguage: "de",

    // TODO
    docsUrlPrefix: "https://docs.fenecon.de/{language}/_/latest/fems/",
    PRODUCT_TYPES: () => null,
    ...OemMeta,
};
