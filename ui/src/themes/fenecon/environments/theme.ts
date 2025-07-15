import { TranslateService } from "@ngx-translate/core";
import { Filter } from "src/app/index/filter/filter.component";
import { Theme } from "src/environments";
import { OemMeta } from "./oem-meta";

export const theme = {
    theme: "FENECON" as Theme,

    uiTitle: "FENECON Online-Monitoring",
    edgeShortName: "FEMS",
    edgeLongName: "FENECON",
    defaultLanguage: "de",

    docsUrlPrefix: "https://docs.fenecon.de/{language}/_/latest/fems/",

    PRODUCT_TYPES: (translate: TranslateService): Filter => (
        {
            placeholder: translate.instant("Index.TYPE"),
            category: "producttype",
            options: [
                {
                    name: "Home 6",
                    value: "home-6",
                },
                {
                    name: "Home 10",
                    value: "home",
                },
                {
                    name: "Home 10 (Gen2)",
                    value: "home-10",
                },
                {
                    name: "Home 20 & 30",
                    value: "Home 20 & 30",
                },
                {
                    name: "Home 15",
                    value: "home-15",
                },
                {
                    name: "Home 20",
                    value: "home-20",
                },
                {
                    name: "Home 30",
                    value: "home-30",
                },
                {
                    name: "Commercial 30",
                    value: "Commercial 30-Serie",
                },
                {
                    name: "Commercial 50",
                    value: "Commercial 50-Serie",
                },
                {
                    name: "Commercial 92",
                    value: "commercial-92",
                },
                {
                    name: "Commercial 92 Cluster",
                    value: "commercial-92-cluster",
                },
                {
                    name: "Commercial 92 Cluster Slave",
                    value: "commercial-92-cluster-slave",
                },
                {
                    name: "Industrial S",
                    value: "Industrial S",
                },
                {
                    name: "Industrial M",
                    value: "Industrial M",
                },
                {
                    name: "Industrial L",
                    value: "Industrial L",
                },
            ],
        }),
    ...OemMeta,
};
