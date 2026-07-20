import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { CommonUiModule } from "src/app/shared/common-ui.module";
import { ComponentsBaseModule } from "src/app/shared/components/components.module";
import { PipeComponentsModule } from "src/app/shared/pipe/pipe.module";
import { Edge, EdgePermission, EnergyJourneyWidget, Service } from "src/app/shared/shared";

@Component({
    selector: "oe-energy-journey",
    templateUrl: "./energy-journey.html",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonUiModule, PipeComponentsModule, RouterModule, ComponentsBaseModule],
})
export class EnergyJourneyLiveComponent implements OnInit {
    protected edge: Edge | null = null;
    protected allowedWidgets: EnergyJourneyWidget[] = [];

    constructor(
        private readonly service: Service,
        private readonly translate: TranslateService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
    ) {}

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
