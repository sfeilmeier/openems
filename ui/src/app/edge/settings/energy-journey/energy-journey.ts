import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { NavigationTree } from "src/app/shared/components/navigation/shared";
import { PipeComponentsModule } from "src/app/shared/pipe/pipe.module";
import { Edge, EdgePermission, EnergyJourneyWidget, Service } from "src/app/shared/shared";
import { CommonUiModule } from "../../../shared/common-ui.module";
import { SharedAutarchy } from "../../live/common/autarchy/shared/shared";
import { SharedSelfConsumption } from "../../live/common/selfconsumption/shared/shared";

@Component({
    selector: "energy-journey",
    templateUrl: "./energy-journey.html",
    standalone: true,
    imports: [
        CommonUiModule,
        PipeComponentsModule,
        RouterModule,
    ],
})
export class EnergyJourneyComponent implements OnInit {

    protected edge: Edge | null = null;
    protected allowedWidgets: EnergyJourneyWidget[] = [];

    constructor(
        private service: Service,
        private translate: TranslateService,
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    public static getNavigationTree(translate: TranslateService): NavigationTree {
        return new NavigationTree("energy-journey", { baseString: "energy-journey" }, { name: "oe-energy-journey" }, translate.instant("SETTINGS.ENERGY_JOURNEY.YOUR_ENERYJOURNEY"), "label", [
            new NavigationTree("appcenter", { baseString: "appcenter" }, { name: "add-outline" }, "AppCenter", "label", [], null),
            new NavigationTree(...SharedAutarchy.getNavigationTree(translate)),
            new NavigationTree(...SharedSelfConsumption.getNavigationTree(translate)),
            new NavigationTree("extension", { baseString: "extension" }, { name: "oe-battery-extension" }, "Batterieerweiterungsrechner", "label", [], null),
            new NavigationTree("wrap-up", { baseString: "wrap-up" }, { name: "oe-wrap-up" }, "Dein Wrap up 2025", "label", [], null)],
        null, { showOrder: "LOW" });
    }

    ngOnInit() {
        this.service.getCurrentEdge().then(edge => {
            this.edge = edge;
            this.allowedWidgets = EdgePermission.getAllowedEnergyJourneyWidgets(this.edge, this.translate, this.router, this.route); // TODO
        });
    }
}
