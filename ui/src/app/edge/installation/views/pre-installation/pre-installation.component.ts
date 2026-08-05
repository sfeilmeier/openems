// @ts-strict-ignore
import { Component, computed, EventEmitter, inject, OnInit, Output, ChangeDetectionStrategy, signal, } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { filter, take } from "rxjs/operators";
import { SumState } from "src/app/index/shared/sumState";
import { AddEdgeToUserRequest } from "src/app/shared/jsonrpc/request/addEdgeToUserRequest";
import { SubscribeEdgesRequest } from "src/app/shared/jsonrpc/request/subscribeEdgesRequest";
import { AddEdgeToUserResponse } from "src/app/shared/jsonrpc/response/addEdgeToUserResponse";
import { States } from "src/app/shared/ngrx-store/states";
import { UserService } from "src/app/shared/service/user.service";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";
import { environment } from "src/environments";

@Component({
    selector: PreInstallationComponent.SELECTOR,
    templateUrl: "./pre-installation.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class PreInstallationComponent implements OnInit {
    private static readonly SELECTOR = "pre-installation";

    @Output() public nextViewEvent = new EventEmitter();
    @Output() public edgeChange = new EventEmitter<Edge>();
    public edge: Edge;

    public form: FormGroup;
    public fields: FormlyFieldConfig[];
    public model;
    public isWaiting = signal<boolean>(false);
    public image: string;
    protected setupKey: string | null = null;
    protected validKey: boolean = true;
    protected isWebsocketConnected = computed(() => States.isAtLeast(this.websocket.state(), States.AUTHENTICATED));
    protected isAdmin = computed(() => this.userService.currentUser()?.isAtLeast(Role.ADMIN) ?? false);
    private userService = inject(UserService);

    constructor(
        private service: Service,
        public websocket: Websocket,
        private translate: TranslateService,
    ) {}

    public ngOnInit() {
        this.form = new FormGroup({});

        if (environment.theme === "Heckert") {
            this.image = "assets/img/Home-Typenschild-web.jpg";
        } else {
            this.image = "assets/img/Home-Commercial-Installer-Key.png";
        }
    }

    public onNextClicked() {
        this.isWaiting.set(true);

        this.websocket
            .sendStateFullRequest(new AddEdgeToUserRequest({ setupPassword: this.setupKey }))
            .then((response: AddEdgeToUserResponse) => {
                const edge = response.result.edge;
                const emsBoxSerialNumber: string = response.result.serialNumber;

                // Test if edge is online
                if (!edge.online) {
                    this.service.toast(
                        this.translate.instant("INSTALLATION.PRE_INSTALLATION.EDGE_OFFLINE", {
                            edgeShortName: environment.edgeShortName,
                        }),
                        "danger",
                    );
                    return;
                }

                // TODO either add lastmessage and role to response or call getEdgeRequest
                this.edge = new Edge(
                    edge.id,
                    edge.comment,
                    edge.producttype,
                    edge.version,
                    Role.INSTALLER,
                    edge.online,
                    null,
                    SumState.OK,
                    null,
                    null,
                );

                // Get metadata
                const metadata = this.service.metadata?.getValue();

                // Test if metadata is available
                if (!metadata) {
                    return;
                }

                // Add edge to metadata
                metadata.edges[edge.id] = this.edge;

                // Update metadata
                this.service.metadata.next({
                    user: metadata.user,
                    edges: metadata.edges,
                });

                this.service.metadata
                    .pipe(
                        filter((metadata) => metadata != null),
                        take(1),
                    )
                    .subscribe((metadata) => {
                        this.edge = metadata.edges[edge.id];
                    });

                // Add to session Storage.
                sessionStorage.setItem("edge", JSON.stringify(edge));
                this.service.currentEdge.set(this.edge);
                if (emsBoxSerialNumber) {
                    // Store Fems Box Serial number only if it is existing in Odoo.
                    sessionStorage.setItem("emsBoxSerialNumber", emsBoxSerialNumber);
                }

                // Start installation process
                this.service.toast(
                    this.translate.instant("INSTALLATION.PRE_INSTALLATION.INSTALLATION_SUCCESS", {
                        edgeId: this.edge.id,
                    }),
                    "success",
                );

                this.edgeChange.emit(this.edge);
                this.nextViewEvent.emit();
                this.websocket.sendStateFullRequest(new SubscribeEdgesRequest({ edges: [this.edge.id] }));
            })
            .catch((reason) => {
                this.service.toast(
                    this.translate.instant("INSTALLATION.PRE_INSTALLATION.AUTHENTICATION_FAILED"),
                    "danger",
                );
                this.validKey = false;
                console.log(reason);
            })
            .finally(() => {
                this.isWaiting.set(false);
            });
    }
}
