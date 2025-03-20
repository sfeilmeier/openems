import { Component, effect, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { RefresherCustomEvent } from "@ionic/angular";
import { Subject } from "rxjs";
import { NavigationService, NavigationUtils } from "src/app/shared/components/navigation/navigation.component";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { Edge, EdgeConfig, EdgePermission, Service, Utils, Websocket, Widgets } from "src/app/shared/shared";
import { AdvertWidgets } from "src/app/shared/type/widget";
import { DateTimeUtils } from "src/app/shared/utils/datetime/datetime-utils";
import { StringUtils } from "src/app/shared/utils/string/string.utils";

@Component({
  selector: "live",
  templateUrl: "./live.component.html",
  standalone: false,
})
export class LiveComponent implements OnDestroy {

  @ViewChild("modal", { read: ElementRef }) public modal!: ElementRef;

  protected edge: Edge | null = null;
  protected config: EdgeConfig | null = null;
  protected widgets: Widgets | null = null;
  protected advertWidgets: AdvertWidgets | null = null;
  protected isModbusTcpWidgetAllowed: boolean = false;
  protected showRefreshDragDown: boolean = false;
  protected showNewFooter: boolean = false;

  private stopOnDestroy: Subject<void> = new Subject<void>();
  private interval: ReturnType<typeof setInterval> | undefined;

  constructor(
    private route: ActivatedRoute,
    public service: Service,
    protected utils: Utils,
    protected websocket: Websocket,
    private dataService: DataService,
    private router: Router,
    private navigationService: NavigationService,
  ) {

    router.events.subscribe(async event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        const topLevelSegment = url.split("/").pop();

        const some = await this.service.getConfig();
        const evse = some.widgets.list.filter(item => item.name == "Evse.Controller.Single");
        if (topLevelSegment != "live") {
          this.hideModal();
        } else {
          this.showNewFooter = evse?.length > 0;
        }
      }
    });
    effect(() => {
      const edge = this.service.currentEdge();
      this.edge = edge;
      this.isModbusTcpWidgetAllowed = EdgePermission.isModbusTcpApiWidgetAllowed(edge);

      this.service.getConfig().then(config => {
        this.config = config;
        this.widgets = config.widgets;
        this.advertWidgets = config.advertWidgets;
      });
      this.checkIfRefreshNeeded();
    });
  }

  async hideModal() {
    this.showNewFooter = false;
    if (this.modal) {
      await this.modal.nativeElement.dismiss(); // Properly dismiss the modal
      this.modal.nativeElement.remove(); // Remove from DOM safely
    }
  }

  public ionViewWillEnter() {
    if (this.widgets?.list) {
      this.showNewFooter = this.widgets?.list.filter(item => item.name == "Evse.Controller.Single")?.length > 0;
    }
  }

  public ionViewDidLeave() {
    this.hideModal();
  }


  ionViewWillLeave() {
    this.hideModal();
    this.ngOnDestroy();
  }


  public ngOnDestroy() {
    clearInterval(this.interval);
    this.stopOnDestroy.next();
    this.stopOnDestroy.complete();
  }

  protected handleRefresh: (ev: RefresherCustomEvent) => void = (ev: RefresherCustomEvent) => this.dataService.refresh(ev);

  protected checkIfRefreshNeeded() {
    this.interval = setInterval(async () => {

      if (this.edge?.isOnline === false) {
        this.showRefreshDragDown = false;
        return;
      }

      const lastUpdate: Date | null = this.dataService.lastUpdated();
      if (lastUpdate == null) {
        this.showRefreshDragDown = true;
        return;
      }
      this.showRefreshDragDown = DateTimeUtils.isDifferenceInSecondsGreaterThan(20, new Date(), lastUpdate);
    }, 5000);
  }

  /**
   * Remove this function after navigation is done
   *
   * @param link the link
   */
  protected routeTo(link: string) {
    this.showNewFooter = false;
    const currentNav = NavigationUtils.getNavigationTreeFromRouterLink(this.navigationService.wholeNavi(), link);
    const segments = StringUtils.splitBy(this.navigationService.currentUrl(), "/") ?? [];
    const segments2 = link.split("/");
    this.navigationService.currentNode.set(currentNav);
    this.router.navigate([...segments, ...segments2]);
  }
}
