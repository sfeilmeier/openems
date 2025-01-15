import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Edge, EdgePermission, EnergyJourneyWidget, Service } from "src/app/shared/shared";

@Component({
  selector: "energy-journey",
  templateUrl: "./energy-journey.html",
  standalone: false,
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
