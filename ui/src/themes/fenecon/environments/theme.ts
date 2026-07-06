import { TranslateService } from "@ngx-translate/core";
import { Filter } from "src/app/index/filter/filter.component";
import { Theme } from "src/environments";
import { OemMeta } from "./oem-meta";

export const theme = {
    theme: "FENECON" as Theme,

    uiTitle: "FENECON Online-Monitoring",
    uiTitleShort: "FENECON",
    edgeShortName: "FEMS",
    edgeLongName: "FENECON",

    docsUrlPrefix: "https://docs.fenecon.de/{language}/_/latest/fems/",

    PRODUCT_TYPES: (translate: TranslateService): Filter => ({
        multiple: true,
        placeholder: translate.instant("INDEX.TYPE"),
        category: "producttype",
        options: [
            {
                name: "Home 6",
                option: { value: "home-6" },
            },
            {
                name: "Home 10",
                option: { value: "home" },
            },
            {
                name: "Home 10 (Gen2)",
                option: { value: "home-10" },
            },
            {
                name: "Home 20 & 30",
                option: { value: "Home 20 & 30" },
            },
            {
                name: "Home 15",
                option: { value: "home-15" },
            },
            {
                name: "Home 20",
                option: { value: "home-20" },
            },
            {
                name: "Home 30",
                option: { value: "home-30" },
            },
            {
                name: "Commercial 30",
                option: { value: "Commercial 30-Serie" },
            },
            {
                name: "Commercial 50",
                option: { value: "Commercial 50-Serie" },
            },
            {
                name: "Commercial 50 (Gen3)",
                option: { value: "Commercial-50-gen-3" },
            },
            {
                name: "Commercial 92",
                option: { value: "commercial-92" },
            },
            {
                name: "Commercial 92 Cluster",
                option: { value: "commercial-92-cluster" },
            },
            {
                name: "Commercial 92 Cluster Slave",
                option: { value: "commercial-92-cluster-slave" },
            },
            {
                name: "Commercial 100",
                option: { value: "commercial-100" },
            },
            {
                name: "Industrial S",
                option: { value: "Industrial S" },
            },
            {
                name: "Industrial M",
                option: { value: "Industrial M" },
            },
            {
                name: "Industrial L",
                option: { value: "Industrial L" },
            },
            {
                name: "Industrial XL",
                option: { value: "industrial-xl" },
            },
        ],
    }),
    ...OemMeta,
};
