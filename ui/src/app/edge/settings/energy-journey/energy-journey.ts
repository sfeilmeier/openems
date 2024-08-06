import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Edge, Permission, Service } from "src/app/shared/shared";
import { EnergyJourneyWidget } from "./energy-journey.module";

@Component({
  selector: 'energy-journey',
  templateUrl: './energy-journey.html',
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
      this.allowedWidgets = Permission.getAllowedEnergyJourneyWidgets(this.edge.firstSetupProtocol, this.translate);
    });
  }
}
