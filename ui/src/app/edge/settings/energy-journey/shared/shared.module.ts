import { NgModule } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { SharedAutarchy } from "src/app/edge/live/common/autarchy/shared/shared";
import { SharedSelfConsumption } from "src/app/edge/live/common/selfconsumption/shared/shared";
import { FlatWidgetButtonComponent } from "src/app/shared/components/flat/flat-widget-button/flat-widget-button";
import { NavigationTree, NavigationId } from "src/app/shared/components/navigation/shared";
import { Edge, EdgeConfig, EdgePermission } from "src/app/shared/shared";
import { SharedModule } from "src/app/shared/shared.module";
import { Role } from "src/app/shared/type/role";
import { EnergyJourneyConstantLineComponent } from "./components/constant-line";
import { EnergyJourneyConstantsComponent } from "./components/constants";

@NgModule({
    imports: [SharedModule, FlatWidgetButtonComponent],
    declarations: [EnergyJourneyConstantsComponent, EnergyJourneyConstantLineComponent],
    exports: [EnergyJourneyConstantsComponent, EnergyJourneyConstantLineComponent],
})
export class EnergyJourneySharedModule {}

export namespace EnergyJourneyShared {
    export function getNavigationTree(edge: Edge, config: EdgeConfig, translate: TranslateService): NavigationTree {
        const children: NavigationTree[] = [
            new NavigationTree(
                NavigationId.HISTORY,
                { baseString: "history" },
                { name: "stats-chart-outline" },
                translate.instant("GENERAL.HISTORY"),
                "label",
                [
                    new NavigationTree(
                        "export",
                        { baseString: "export" },
                        { name: "download-outline" },
                        translate.instant("EDGE.CONFIG.INDEX.EXPORT"),
                        "label",
                        [],
                        null,
                    ),
                ],
                null,
                { showOrder: "HIGH" },
            ),
        ];

        if (edge.roleIsAtLeast(Role.OWNER)) {
            children.push(
                new NavigationTree(
                    "appcenter",
                    { baseString: "appcenter" },
                    { name: "add-outline" },
                    "AppCenter",
                    "label",
                    [
                        new NavigationTree(
                            "single",
                            { baseString: "single" },
                            { name: "add-outline" },
                            translate.instant("EDGE.CONFIG.APP.APP_DETAILS"),
                            "label",
                            [
                                new NavigationTree(
                                    "install",
                                    { baseString: "install" },
                                    { name: "add-outline" },
                                    translate.instant("EDGE.CONFIG.APP.CREATE_APP"),
                                    "label",
                                    [],
                                    null,
                                    { showOrder: "HIDE" },
                                ),
                                new NavigationTree(
                                    "update",
                                    { baseString: "update" },
                                    { name: "add-outline" },
                                    translate.instant("EDGE.CONFIG.APP.MODIFY_APP"),
                                    "label",
                                    [],
                                    null,
                                    { showOrder: "HIDE" },
                                ),
                            ],
                            null,
                            { showOrder: "HIDE" },
                        ),
                    ],
                    null,
                ),
            );
        }

        // Show Autarchy and Self-Consumption only for systems with Producers
        if (config.hasProducer()) {
            children.push(
                new NavigationTree(...SharedAutarchy.getNavigationTree(translate)),
                new NavigationTree(...SharedSelfConsumption.getNavigationTree(translate)),
            );
        }

        if (EdgePermission.isEnergyJourneyAllowed(edge)) {
            children.push(
                new NavigationTree(
                    "index",
                    { baseString: "index" },
                    { name: "oe-battery-extension" },
                    translate.instant("PAGE_HEADERS.ENERGY_JOURNEY"),
                    "label",
                    [
                        new NavigationTree(
                            "battery-extension",
                            { baseString: "battery-extension" },
                            { name: "oe-battery-extension" },
                            translate.instant("PAGE_HEADERS.ENERGY_JOURNEY"),
                            "label",
                            [],
                            null,
                            { showOrder: "HIDE" },
                        ),
                        new NavigationTree(
                            "electricityPriceChoice",
                            { baseString: "electricity-price-choice" },
                            { name: "oe-battery-extension" },
                            translate.instant("PAGE_HEADERS.ENERGY_JOURNEY"),
                            "label",
                            [],
                            null,
                            { showOrder: "HIDE" },
                        ),
                    ],
                    null,
                ),
            );
        }

        if (edge?.settings && "annual_review_2025" in edge.settings) {
            children.push(
                new NavigationTree(
                    "wrap-up",
                    { baseString: "wrap-up" },
                    { name: "oe-wrap-up" },
                    translate.instant("PAGE_HEADERS.WRAP_UP_2025"),
                    "label",
                    [],
                    null,
                ),
            );
        }

        return new NavigationTree(
            "energy-journey",
            { baseString: "energy-journey" },
            { name: "oe-energy-journey" },
            "Energy Journey",
            "label",
            children,
            null,
        );
    }
}
