import { Injectable, inject } from "@angular/core";
import { TranslateService, TranslationObject } from "@ngx-translate/core";
import { Service } from "src/app/shared/service/service";
import { ChartConstants } from "src/app/shared/shared";
import { NavigationTour } from "src/app/shared/tour/navigation-tour";
import { TourStep } from "src/app/shared/tour/tour-step";
import { TutorialTargetId } from "src/app/shared/tour/tutorial-target-id";
import { LanguageKeyUnion } from "src/app/shared/type/language";
import { Role } from "src/app/shared/type/role";
import cz from "./i18n/cz.json";
import de from "./i18n/de.json";
import en from "./i18n/en.json";
import es from "./i18n/es.json";
import fr from "./i18n/fr.json";
import ja from "./i18n/ja.json";
import lt from "./i18n/lt.json";
import nl from "./i18n/nl.json";
import sv from "./i18n/sv.json";

// Loaded lazily when the tour starts (see theme.ts), together with the texts of its steps

/** Handbook links of the steps; the tour service replaces {language} with the docs language when the tour starts. */
const HANDBOOK_LINKS = {
    COCKPIT: "https://docs.fenecon.de/{language}/fems/fenecon_app/v202619/fenecon_app_monitoring.html#cockpit",
    SYSTEM_STATUS: "https://docs.fenecon.de/{language}/fems/fenecon_app/v202619/cockpit.html#system-status",
    ENERGY_JOURNEY: "https://docs.fenecon.de/{language}/fems/fenecon_app/v202619/fenecon_app_Energy_Journey.html",
    APP_CENTER: "https://docs.fenecon.de/{language}/fems/app_center/App_Center.html#app-center-functionality",
} as const;

const TRANSLATIONS: Record<LanguageKeyUnion, TranslationObject> = { cs: cz, de, en, es, fr, ja, lt, nl, sv };

/**
 * Builds the translated content sections used by the history tour step.
 *
 * @param translate Service used to resolve tour copy for the current language.
 * @returns The history introduction and series legend.
 */
function getHistoryContentBlocks(translate: TranslateService): NonNullable<TourStep["contentBlocks"]> {
    return [
        {
            text: translate.instant("NAVIGATION_TOUR.HISTORY_INTRO"),
        },
        {
            items: [
                {
                    text: translate.instant("NAVIGATION_TOUR.HISTORY_SERIES.PRODUCTION"),
                    color: ChartConstants.Colors.LIGHT_SKY_BLUE,
                },
                {
                    text: translate.instant("NAVIGATION_TOUR.HISTORY_SERIES.CHARGING"),
                    color: ChartConstants.Colors.GREEN,
                },
                {
                    text: translate.instant("NAVIGATION_TOUR.HISTORY_SERIES.DISCHARGING"),
                    color: ChartConstants.Colors.RED,
                },
                {
                    text: translate.instant("NAVIGATION_TOUR.HISTORY_SERIES.FEED_IN"),
                    color: ChartConstants.Colors.PURPLE,
                },
                {
                    text: translate.instant("NAVIGATION_TOUR.HISTORY_SERIES.GRID"),
                    color: ChartConstants.Colors.BLUE_GREY,
                },
                {
                    text: translate.instant("NAVIGATION_TOUR.HISTORY_SERIES.CONSUMPTION"),
                    color: ChartConstants.Colors.YELLOW,
                },
                {
                    text: translate.instant("NAVIGATION_TOUR.HISTORY_SERIES.STATE_OF_CHARGE"),
                    color: ChartConstants.Colors.LIGHT_GREY,
                },
            ],
        },
    ];
}

/**
 * Creates the tour steps for the mobile navigation layout.
 *
 * @param translate Service used to resolve tour copy for the current language.
 * @param canSetUpAlerting Whether the user can set up alerting, so the alerting step applies.
 * @returns The ordered mobile navigation tour steps.
 */
function getNavigationTourMobile(translate: TranslateService, canSetUpAlerting: boolean): TourStep[] {
    return [
        {
            id: "navigation-intro",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.WELCOME"),
            text: translate.instant("NAVIGATION_TOUR.WELCOME_TEXT"),
            position: "center",
        },
        {
            id: TutorialTargetId.LIVE,
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.COCKPIT"),
            targets: [{ id: TutorialTargetId.ENERGY_MONITOR }, { id: TutorialTargetId.LIVE }],
            text: translate.instant("NAVIGATION_TOUR.COCKPIT_TEXT"),
            position: "auto",
            route: "/live",
            handbookUrl: HANDBOOK_LINKS.COCKPIT,
        },
        {
            id: "system-status",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.SYSTEM_STATUS"),
            targets: [{ id: TutorialTargetId.SYSTEM_STATUS }],
            text: translate.instant("NAVIGATION_TOUR.SYSTEM_STATUS"),
            position: "auto",
            route: "/live",
            handbookUrl: HANDBOOK_LINKS.SYSTEM_STATUS,
        },
        {
            id: "energy-journey",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.ENERGY_JOURNEY_MOBILE"),
            targets: [{ id: TutorialTargetId.ENERGY_JOURNEY }],
            text: translate.instant("NAVIGATION_TOUR.ENERGY_JOURNEY_TEXT"),
            position: "top",
            route: "/energy-journey",
            handbookUrl: HANDBOOK_LINKS.ENERGY_JOURNEY,
        },
        {
            id: "energy-journey-history",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.ENERGY_JOURNEY_MOBILE"),
            targets: [{ id: TutorialTargetId.HISTORY }],
            contentBlocks: [
                ...getHistoryContentBlocks(translate),
                {
                    heading: translate.instant("NAVIGATION_TOUR.TITLE.DOWNLOAD"),
                    text: translate.instant("NAVIGATION_TOUR.HISTORY_DOWNLOAD_TEXT"),
                },
            ],
            position: "auto",
            route: "/energy-journey",
            openParentAccordion: true,
        },
        {
            id: "favorites",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.FAVORITES"),
            targets: [{ id: TutorialTargetId.FAVORITES }],
            text: translate.instant("NAVIGATION_TOUR.FAVORITES_TEXT"),
            position: "auto",
        },
        {
            id: "appcenter",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.ENERGY_JOURNEY_MOBILE"),
            targets: [{ id: TutorialTargetId.APP_CENTER }],
            text: translate.instant("NAVIGATION_TOUR.ENERGY_JOURNEY_APPCENTER_TEXT"),
            position: "auto",
            route: "/energy-journey",
            handbookUrl: HANDBOOK_LINKS.APP_CENTER,
        },
        ...(canSetUpAlerting
            ? ([
                  {
                      id: "alerting",
                      version: "2026.11.1",
                      title: translate.instant("NAVIGATION_TOUR.TITLE.ALERTING"),
                      targets: [{ id: TutorialTargetId.PROFILE }],
                      text: translate.instant("NAVIGATION_TOUR.ALERTING_TEXT"),
                      position: "auto",
                      route: "/profile",
                  },
              ] satisfies TourStep[])
            : []),
    ];
}

/**
 * Creates the tour steps for the desktop navigation layout.
 *
 * @param translate Service used to resolve tour copy for the current language.
 * @param canSetUpAlerting Whether the user can set up alerting, so the alerting step applies.
 * @returns The ordered desktop navigation tour steps.
 */
function getNavigationTourDesktop(translate: TranslateService, canSetUpAlerting: boolean): TourStep[] {
    return [
        {
            id: "navigation-intro",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.WELCOME"),
            text: translate.instant("NAVIGATION_TOUR.WELCOME_TEXT"),
            position: "center",
            route: "/live",
            closeOpenedAccordions: true,
        },
        {
            id: TutorialTargetId.LIVE,
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.COCKPIT"),
            targets: [{ id: TutorialTargetId.ENERGY_MONITOR }, { id: TutorialTargetId.LIVE }],
            text: translate.instant("NAVIGATION_TOUR.COCKPIT_TEXT"),
            position: "right",
            route: "/live",
            closeAllAccordions: true,
            handbookUrl: HANDBOOK_LINKS.COCKPIT,
        },
        {
            id: "system-status",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.SYSTEM_STATUS"),
            targets: [{ id: TutorialTargetId.SYSTEM_STATUS }],
            text: translate.instant("NAVIGATION_TOUR.SYSTEM_STATUS"),
            position: "auto",
            route: "/live",
            handbookUrl: HANDBOOK_LINKS.SYSTEM_STATUS,
        },
        {
            id: "energy-journey",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.ENERGY_JOURNEY"),
            targets: [{ id: TutorialTargetId.ENERGY_JOURNEY }],
            text: translate.instant("NAVIGATION_TOUR.ENERGY_JOURNEY_TEXT"),
            position: "auto",
            openParentAccordion: true,
            handbookUrl: HANDBOOK_LINKS.ENERGY_JOURNEY,
        },
        {
            id: "energy-journey-history",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.HISTORY"),
            targets: [
                { id: TutorialTargetId.HISTORY },
                { id: TutorialTargetId.HISTORY_VIEW },
                { id: TutorialTargetId.HISTORY_VIEW_DATE_PICKER },
            ],
            contentBlocks: getHistoryContentBlocks(translate),
            position: "bottom",
            route: "/energy-journey/history",
            openParentAccordion: true,
        },
        {
            id: "history-export",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.DOWNLOAD"),
            targets: [{ id: TutorialTargetId.HISTORY_EXPORT }],
            text: translate.instant("NAVIGATION_TOUR.HISTORY_DOWNLOAD_TEXT"),
            position: "bottom",
            route: "/energy-journey/history",
            openParentAccordion: true,
        },
        {
            id: "appcenter",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.APPCENTER"),
            targets: [{ id: TutorialTargetId.APP_CENTER }, { id: TutorialTargetId.ENERGY_JOURNEY_APP_CENTER }],
            text: translate.instant("NAVIGATION_TOUR.ENERGY_JOURNEY_APPCENTER_TEXT"),
            position: "auto",
            openParentAccordion: true,
            route: "/energy-journey/appcenter",
            handbookUrl: HANDBOOK_LINKS.APP_CENTER,
        },
        {
            id: "favorites",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.FAVORITES"),
            targets: [{ id: TutorialTargetId.FAVORITES }],
            text: translate.instant("NAVIGATION_TOUR.FAVORITES_TEXT"),
            position: "auto",
            route: "/favorites",
            closeOpenedAccordions: true,
            openParentAccordion: true,
        },
        ...(canSetUpAlerting
            ? ([
                  {
                      id: "alerting",
                      version: "2026.11.1",
                      title: translate.instant("NAVIGATION_TOUR.TITLE.ALERTING"),
                      targets: [{ id: TutorialTargetId.PROFILE }, { id: TutorialTargetId.PROFILE_ALERTING }],
                      text: translate.instant("NAVIGATION_TOUR.ALERTING_TEXT"),
                      position: "auto",
                      route: "/profile/settings",
                      openParentAccordion: true,
                  },
              ] satisfies TourStep[])
            : []),
        {
            id: "restart-tutorial",
            version: "2026.11.1",
            title: translate.instant("NAVIGATION_TOUR.TITLE.RESTART_TUTORIAL"),
            targets: [{ id: TutorialTargetId.PROFILE }, { id: TutorialTargetId.PROFILE_INFO }],
            text: translate.instant("NAVIGATION_TOUR.RESTART_TUTORIAL"),
            position: "auto",
            route: "/profile/navigation-info",
        },
    ];
}

@Injectable()
export class FeneconNavigationTour implements NavigationTour {
    private readonly translate = inject(TranslateService);
    private readonly service = inject(Service);

    constructor() {
        // Registered before the steps are built, as they resolve their texts immediately
        for (const [language, translation] of Object.entries(TRANSLATIONS)) {
            this.translate.setTranslation(language, translation, true);
        }
    }

    public getDesktopSteps(): TourStep[] {
        return getNavigationTourDesktop(this.translate, this.canSetUpAlerting());
    }

    public getMobileSteps(): TourStep[] {
        return getNavigationTourMobile(this.translate, this.canSetUpAlerting());
    }

    /**
     * Alerting needs the OWNER role, matching the alerting card in the settings. The backend connection it also needs
     * is already required to start the tour.
     */
    private canSetUpAlerting(): boolean {
        return this.service.currentEdge()?.roleIsAtLeast(Role.OWNER) === true;
    }
}
