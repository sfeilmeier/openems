// @ts-strict-ignore
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnDestroy, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { distinctUntilChanged, map, skip } from "rxjs";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { States } from "src/app/shared/states/states";
import { MarketingAnnualReviewComponent } from "../shared/components/edge/popover/annual-review/popover";
import { WeatherForecastApprovalComponent } from "../shared/components/edge/popover/data-privacy/popover";
import { Pagination } from "../shared/service/pagination";
import { RouteService } from "../shared/service/route/route.service";
import { UserService } from "../shared/service/user.service";

/** This component is needed as a routing parent and acts as a transit station without being displayed. */
@Component({
    selector: "edge",
    template: `
        <ng-content></ng-content>
        <router-outlet id="content"></router-outlet>
    `,
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class EdgeComponent implements OnDestroy, OnInit {
    private latestIncident: { message: string | null; id: string } | null = null;
    private edge: Edge | null = null;
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private routeService: RouteService,
        private service: Service,
        private websocket: Websocket,
        private pagination: Pagination,
        private popoverCtrl: ModalController,
        private router: Router,
        private userService: UserService,
        private route: ActivatedRoute,
    ) {
        effect(async () => {
            const edge = this.service.currentEdge();
            const edgeId = this.routeService.getRouteParam<string>("edgeId");
            if (!edgeId || !edge || edge.id == this.edge?.id) {
                return;
            }
            this.edge = edge;

            this.handlePrivacyPopover(edge);
            this.handleAnnualReviewPopover(edge);
        });
    }

    /**
     * Shows weather forecast approval.
     *
     * @param modalCtrl The modal controller
     * @returns
     */
    public static async showPrivacyPolicyPopover(modalCtrl: ModalController) {
        const popover = await modalCtrl.create({
            component: WeatherForecastApprovalComponent,
        });

        await popover.present();
        return popover.onDidDismiss();
    }

    /**
     * Shows weather forecast approval.
     *
     * @param modalCtrl The modal controller
     */
    public static async showAnnualReviewPopover(modalCtrl: ModalController) {
        const popover = await modalCtrl.create({
            component: MarketingAnnualReviewComponent,
        });

        await popover.present();
        popover.onDidDismiss();
    }

    public async ngOnInit(): Promise<void> {
        this.route.paramMap
            .pipe(
                map((params) => params.get("edgeId")),
                distinctUntilChanged(),
                skip(1),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((edgeId) => {
                if (edgeId != null) {
                    void this.selectEdge(edgeId);
                }
            });
        const edgeId = this.route.snapshot.paramMap.get("edgeId");
        if (edgeId != null) {
            await this.selectEdge(edgeId);
        }
    }

    public ngOnDestroy(): void {
        this.service.currentEdge.set(null);
    }

    private async selectEdge(edgeId: string): Promise<void> {
        try {
            const edge = await this.service.updateCurrentEdge(edgeId);
            if (this.route.snapshot.paramMap.get("edgeId") !== edgeId) {
                return;
            }
            this.websocket.state.set(States.EDGE_SELECTED);
            await this.pagination.subscribeEdge(edge, this.websocket);
        } catch {
            if (this.route.snapshot.paramMap.get("edgeId") === edgeId) {
                await this.router.navigate(["index"]);
            }
        }
    }

    /**
     * Handles the privacy popover based on the user's choice.
     *
     * @param edge The edge
     */
    private async handlePrivacyPopover(edge: Edge): Promise<void> {
        const showPrivacyPolicyPopover = await edge.shouldShowPrivacyPolicyPopover(this.websocket);
        if (showPrivacyPolicyPopover == false) {
            return;
        }

        await EdgeComponent.showPrivacyPolicyPopover(this.popoverCtrl);
    }

    /**
     * Handles the privacy popover based on the user's choice.
     *
     * @param edge The edge
     */
    private async handleAnnualReviewPopover(edge: Edge): Promise<void> {
        const showPopover = MarketingAnnualReviewComponent.shouldShowPopover(edge, this.userService);

        if (showPopover == false) {
            return;
        }

        await EdgeComponent.showAnnualReviewPopover(this.popoverCtrl);
    }
}
