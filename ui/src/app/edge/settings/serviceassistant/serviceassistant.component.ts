// @ts-strict-ignore
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Edge, EdgeConfig, Service, Websocket } from "../../../shared/shared";

interface MyEdgeConfigComponent extends EdgeConfig.Component {
  isClicked?: boolean,
}

@Component({
  selector: ServiceAssistantComponent.SELECTOR,
  templateUrl: "./serviceassistant.component.html",
  standalone: false,
})
export class ServiceAssistantComponent implements OnInit {

  private static readonly SELECTOR = "serviceAssistant";

  public readonly spinnerId = "serviceAssistant";
  public readonly serviceAssistantSpinnerId: string = "ServiceAssistantSpinner";

  public batteries: MyEdgeConfigComponent[];
  public edge: Edge;
  public config: EdgeConfig;

  constructor(
    private route: ActivatedRoute,
    public service: Service,
    public websocket: Websocket,
  ) { }

  ngOnInit() {
    this.service.startSpinner(this.serviceAssistantSpinnerId);
    this.service.getCurrentEdge().then(edge => {
      this.edge = edge;

      this.service.getConfig().then(config => {
        this.config = config;
        this.batteries = config.getComponentsImplementingNature("io.openems.edge.battery.api.Battery");
      });
      this.service.stopSpinner(this.serviceAssistantSpinnerId);
    });
  }

}
