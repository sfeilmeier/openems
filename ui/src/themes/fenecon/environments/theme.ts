import { TranslateService } from "@ngx-translate/core";
import { NavigationCard, NavigationCardActions } from "src/app/edge/live/navigation-info/navigation-info";
import { Filter } from "src/app/index/filter/filter.component";
import { User } from "src/app/shared/jsonrpc/shared";
import { provideNavigationTour } from "src/app/shared/tour/navigation-tour";
import { TutorialTargetId } from "src/app/shared/tour/tutorial-target-id";
import { Environment, Theme } from "src/environments";
import { OemMeta } from "./oem-meta";

export const theme: Omit<Environment, "url" | "backend" | "production" | "debugMode"> = {
    theme: "FENECON" as Theme,

    uiTitle: "FENECON Online-Monitoring",
    uiTitleShort: "FENECON",
    edgeShortName: "FEMS",
    edgeLongName: "FENECON",

    docsUrlPrefix: "https://docs.fenecon.de/{language}/_/latest/fems/",

    INFO_CARD: (translate: TranslateService, user: User, actions: NavigationCardActions): NavigationCard[] => {
        const cards: NavigationCard[] = [];

        if (actions.canStartNavigationTour) {
            cards.push({
                infoText: translate.instant("GUIDED_TOUR.NEW_UI_INFO"),
                iconName: "information-outline",
                contentText: translate.instant("GUIDED_TOUR.CHANGELOG"),
                buttonText: translate.instant("GUIDED_TOUR.BUTTON"),
                buttonIconName: "play-outline",
                buttonAction: actions.startNavigationTour,
                tutorialTargetId: TutorialTargetId.PROFILE_INFO,
            });
        }

        function hasPortalAccess(): boolean {
            if (user?.id === "intersolar@fenecon.de") {
                return true;
            }

            return user.settings?.hasPortalAccess ?? false;
        }

        if (hasPortalAccess()) {
            cards.push({
                infoText: translate.instant("MY_PORTAL.INFO"),
                iconUrl: "https://docs.fenecon.de/download/fenecon/de/my-fenecon/icon",
                contentText: translate.instant("MY_PORTAL.TICKET"),
                buttonText: translate.instant("MY_PORTAL.BUTTON"),
                buttonHref: "https://erp.fenecon.de/my",
                buttonIconName: "ticket-outline",
            });
        }
        return cards;
    },

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
    ENVIRONMENT_PROVIDERS: [
        provideNavigationTour({
            // Loaded on demand: a static import would evaluate application code before the environment exists
            load: () => import("../tour/navigation-tour").then((m) => m.FeneconNavigationTour),
            avatar: { name: "oe-fena", src: "icons/common/fena.svg" },
        }),
    ],
    ...OemMeta,
};
