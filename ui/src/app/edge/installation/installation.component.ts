// @ts-strict-ignore
import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Edge, Logger, Service, Websocket } from "src/app/shared/shared";
import { AbstractIbn } from "./installation-systems/abstract-ibn";
import { View } from "./shared/enums";
import { IbnUtils } from "./shared/ibn.utils";
import { System, SystemId } from "./shared/system";

@Component({
    selector: InstallationComponent.SELECTOR,
    templateUrl: "./installation.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class InstallationComponent implements OnInit {
    private static readonly SELECTOR = "installation";

    /**
     * Fixed views shown before a product system has been selected. All specific IBN subclasses also begin their own
     * views[] with these same entries, so the view index remains stable when the ibn is first set at
     * ConfigurationSystem.
     */
    private static readonly STARTUP_VIEWS: View[] = [
        View.PreInstallation,
        View.PreInstallationUpdate,
        View.ConfigurationSystem,
    ];

    public readonly view = View;
    public readonly spinnerId = "installation-websocket-spinner";

    public readonly ibn = signal<AbstractIbn | null>(null);
    public readonly edge = signal<Edge | null>(null);

    public readonly currentView = computed(() => this.views()[this.viewIndex()] ?? View.PreInstallation);

    public readonly progressValue = computed(() => {
        const { index, viewCount } = this.viewMeta();
        return viewCount <= 1 ? 0 : index / (viewCount - 1);
    });

    public readonly progressText = computed(() => {
        const { index, viewCount, showViewCount } = this.viewMeta();
        return showViewCount
            ? this.translate.instant("INSTALLATION.STEP_FROM_TO", {
                  from: index + 1,
                  to: viewCount,
              })
            : this.translate.instant("INSTALLATION.STEP_TO", {
                  number: index + 1,
              });
    });

    /**
     * Copy of the views at the last navigation. {@link AbstractIbn.removeOrAddView} changes the ibn views in place,
     * which no signal would notice, so they are copied into this signal on every navigation.
     */
    private readonly views = signal<View[]>(InstallationComponent.STARTUP_VIEWS);
    private readonly viewIndex = signal<number>(0);

    private readonly viewMeta = computed(() => {
        const ibn = this.ibn();
        return {
            index: this.viewIndex(),
            viewCount: this.views().length,
            showViewCount: ibn !== null ? ibn.showViewCount : false,
        };
    });

    constructor(
        private service: Service,
        private router: Router,
        public websocket: Websocket,
        private translate: TranslateService,
        private logger: Logger,
    ) {}

    public ngOnInit(): void {
        this.service.currentPageTitle = "Installation";
        this.service.startSpinner(this.spinnerId);
        this.restoreSession();
    }

    /** Advances to the next view, optionally updating the active ibn. */
    public goToNextView(updatedIbn?: AbstractIbn): void {
        if (updatedIbn != null) {
            this.ibn.set(updatedIbn);
            IbnUtils.addIbnToSessionStorage(updatedIbn);
        }

        const displayedView = this.updateViewsAndLocateDisplayedView();
        if (displayedView.isLastView) {
            this.finishInstallation();
            return;
        }
        this.navigateTo(displayedView.index + 1);
    }

    /** Returns to the previous view. */
    public goToPreviousView(): void {
        const displayedView = this.updateViewsAndLocateDisplayedView();
        this.navigateTo(Math.max(0, displayedView.index - 1));
    }

    /** Stores the edge resolved by the pre-installation step. */
    public updateEdge(edge: Edge): void {
        this.edge.set(edge);
    }

    private restoreSession(): void {
        const storedIndex = sessionStorage?.viewIndex ? Number.parseInt(sessionStorage.viewIndex, 10) : 0;

        if (sessionStorage?.ibn) {
            const ibnString = JSON.parse(sessionStorage.getItem("ibn"));
            this.ibn.set(this.loadIbnFromSession(ibnString));
        }

        if (sessionStorage?.edge) {
            const edgeId = JSON.parse(sessionStorage.getItem("edge")).id;
            this.service
                .updateCurrentEdge(edgeId)
                .then((edge) => {
                    this.updateEdge(edge);
                    this.navigateTo(storedIndex);
                })
                .catch(() => this.navigateTo(0))
                .finally(() => this.service.stopSpinner(this.spinnerId));
        } else {
            this.navigateTo(storedIndex);
            this.service.stopSpinner(this.spinnerId);
        }
    }

    private loadIbnFromSession(ibnString: any): AbstractIbn | null {
        // The stored systemId comes from untrusted session storage; an unknown id (e.g. from an older UI version
        // after a SystemId was removed) degrades to the startup views instead of crashing the wizard.
        if (!System.isKnownSystemId(ibnString.systemId)) {
            return null;
        }
        const ibn = System.getSystemObjectFromSystemId(ibnString.systemId as SystemId, this.translate);

        ibn.showViewCount = ibnString.showViewCount ?? false;
        ibn.views = ibnString.views ?? [];
        ibn.customer = ibnString.customer ?? {};
        ibn.installer = ibnString.installer ?? {};
        ibn.location = ibnString.location ?? {};
        ibn.requiredControllerIds = ibnString.requiredControllerIds ?? [];
        ibn.lineSideMeterFuse = ibnString.lineSideMeterFuse ?? {};
        ibn.feedInLimitation = ibnString.feedInLimitation ?? {};
        ibn.serialNumbers = ibnString.serialNumbers ?? {};
        ibn.currentUserAlertingSettings = ibnString.currentUserAlertingSettings ?? {};
        ibn.populateFromData(ibnString);

        return ibn;
    }

    /**
     * Lets the ibn add or remove its optional views (e.g. depending on the country), then looks up where the displayed
     * view is now. Views may have been inserted or removed before it, so its position is searched instead of relying on
     * the stored index.
     */
    private updateViewsAndLocateDisplayedView(): { index: number; isLastView: boolean } {
        const shownView = this.currentView();
        const ibn = this.ibn();
        ibn?.removeOrAddView(this.edge());

        const views = ibn !== null ? ibn.views : InstallationComponent.STARTUP_VIEWS;
        const foundIndex = views.indexOf(shownView);
        const index = foundIndex !== -1 ? foundIndex : this.viewIndex();

        return {
            index,
            isLastView: shownView === View.Completion || index >= views.length - 1,
        };
    }

    /** Leaves the wizard to the online monitoring of the installed edge and clears the stored installation. */
    private finishInstallation(): void {
        const edgeId = this.edge()?.id;
        if (edgeId != null) {
            this.router.navigate(["device", edgeId]);
        } else {
            this.router.navigate(["/overview"]);
        }
        sessionStorage.clear();
    }

    private navigateTo(index: number): void {
        const ibn = this.ibn();
        const views = ibn !== null ? ibn.views : InstallationComponent.STARTUP_VIEWS;

        this.logger.debug(
            "View: " +
                Object.keys(View)[Object.values(View).indexOf(views[index])] +
                ", Edge: " +
                (this.edge()?.id ?? "") +
                ", SystemId: " +
                (ibn?.systemId ?? ""),
        );

        sessionStorage.setItem("viewIndex", index.toString());
        // A copy, as the ibn views are changed in place: setting the same array again would not notify
        this.views.set([...views]);
        this.viewIndex.set(index);
    }
}
