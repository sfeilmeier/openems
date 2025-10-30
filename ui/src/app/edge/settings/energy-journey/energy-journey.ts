import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { PipeComponentsModule } from "src/app/shared/pipe/pipe.module";
import { Edge, EdgePermission, EnergyJourneyWidget, Service } from "src/app/shared/shared";
import { CommonUiModule } from "../../../shared/common-ui.module";

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
    ) { }

    ngOnInit() {
        this.service.getCurrentEdge().then(edge => {
            this.edge = edge;
            this.allowedWidgets = EdgePermission.getAllowedEnergyJourneyWidgets(this.edge, this.translate); // TODO
        });
    }
}
