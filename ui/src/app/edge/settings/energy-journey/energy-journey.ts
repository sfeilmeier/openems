import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { NavigationTree } from "src/app/shared/components/navigation/shared";
import { PipeComponentsModule } from "src/app/shared/pipe/pipe.module";
import { Edge, EdgeConfig, EdgePermission, EnergyJourneyWidget, Service } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";
import { CommonUiModule } from "../../../shared/common-ui.module";
import { SharedAutarchy } from "../../live/common/autarchy/shared/shared";
import { SharedSelfConsumption } from "../../live/common/selfconsumption/shared/shared";

@Component({
    selector: "energy-journey",
    templateUrl: "./energy-journey.html",
    standalone: true,
    imports: [CommonUiModule, PipeComponentsModule, RouterModule],
})
export class EnergyJourneyComponent implements OnInit {
    protected edge: Edge | null = null;
    protected allowedWidgets: EnergyJourneyWidget[] = [];

    constructor(
        private service: Service,
        private translate: TranslateService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    public static getNavigationTree(edge: Edge, config: EdgeConfig, translate: TranslateService): NavigationTree {
        const children: NavigationTree[] = [];

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
                    "extension",
                    { baseString: "extension" },
                    { name: "oe-battery-extension" },
                    translate.instant("PAGE_HEADERS.ENERGY_JOURNEY"),
                    "label",
                    [],
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
            translate.instant("SETTINGS.ENERGY_JOURNEY.YOUR_ENERYJOURNEY"),
            "label",
            children,
            null,
            { showOrder: "LOW" },
        );
    }

    ngOnInit() {
        this.service.getCurrentEdge().then((edge) => {
            this.edge = edge;
            this.allowedWidgets = EdgePermission.getAllowedEnergyJourneyWidgets(
                this.edge,
                this.translate,
                this.router,
                this.route,
            ); // TODO
        });
    }
}
