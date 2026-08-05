// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { filter, firstValueFrom, take } from "rxjs";
import { ExecuteSystemUpdate } from "src/app/edge/settings/system/executeSystemUpdate";
import { SumState } from "src/app/index/shared/sumState";
import { AddEdgeToUserRequest } from "src/app/shared/jsonrpc/request/addEdgeToUserRequest";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { SubscribeEdgesRequest } from "src/app/shared/jsonrpc/request/subscribeEdgesRequest";
import { AddEdgeToUserResponse } from "src/app/shared/jsonrpc/response/addEdgeToUserResponse";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";
import { environment } from "src/environments";
import { AbstractIbn } from "../../../installation-systems/abstract-ibn";
import { BatteryTarget } from "../../../installation-systems/commercial/commercial-92/abstract-commercial92";
import { Commercial92ClusterIbn } from "../../../installation-systems/commercial/commercial-92/commercial92-cluster";
import { CommercialCluster } from "../../../shared/enums";
import { IbnUtils } from "../../../shared/ibn.utils";
import { ComponentConfigurator, ConfigurationState } from "../../configuration-execute/component-configurator";
import { AuthenticateRemoteEdgeRequest } from "./authenticateToRemoteEdge";
import { GetConnectionState } from "./getConnectionState";

interface SlaveState {
    connected: boolean;
    displayLabel: string;
    configuring: boolean | null;
    configurationFailed: boolean | null;
    updateFinished: boolean | null;
    executeSystemUpdate: ExecuteSystemUpdate | null;
    setupKey: string;
    logMessage: string;
    validKey: boolean;
    edge: Edge | null;
    emsSerial: string | null;
}

@Component({
    selector: ProtocolCommercialClusterSlaveInstallationComponent.SELECTOR,
    templateUrl: "./slave-installation.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ProtocolCommercialClusterSlaveInstallationComponent implements OnInit {
    private static readonly SELECTOR = "protocol-commercial-slave-installation";
    private static readonly TOAST_DURATION = 5_000;

    @Input() public ibn: Commercial92ClusterIbn;
    @Input() public edge: Edge;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<AbstractIbn>();

    protected slaveStates: SlaveState[] = [];
    private componentConfigurator: Promise<ComponentConfigurator>;

    constructor(
        private service: Service,
        private translate: TranslateService,
        private websocket: Websocket,
    ) {}

    protected get isNextDisabled(): boolean {
        const allConfigured = this.slaveStates.every(
            (state) =>
                // null has different meaning (not started), "false" is set only after configuring/ updating slave.
                state.configuring === false && state.configurationFailed === false,
        );

        return !allConfigured;
    }

    public ngOnInit(): void {
        // To update scheduler.
        this.ibn.setRequiredControllers();
        IbnUtils.addIbnToSessionStorage(this.ibn);

        this.initializeSlaveStates();
        this.requestSlaveStatuses();
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        this.slaveStates.forEach((slave) => {
            const edge: Edge = slave.edge;
            this.ibn.slaveEdges.push({
                id: edge.id,
                productType: edge.producttype,
                comment: edge.comment,
                version: edge.version,
            });

            this.ibn.emsBoxSerialNumbers.push(slave.emsSerial);
        });

        this.nextViewEvent.emit(this.ibn);
    }

    protected installSlave(index: number): void {
        this.resetSlaveState(index);
        this.updateSlaveState(index, {
            configuring: true,
            logMessage: this.translate.instant(
                "INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_INSTALLATION.LOG_MESSAGE.STARTING_AUTHENTICATION",
            ),
        });
        const state = this.slaveStates[index];
        this.websocket
            .sendStateFullRequest(new AddEdgeToUserRequest({ setupPassword: state.setupKey }))
            .then((response: AddEdgeToUserResponse) => this.handleSuccessfulInstallation(index, response))
            .catch((error) => this.handleInstallationFailure(index, error));
    }

    protected requestSlaveStatuses(): void {
        this.slaveStates.forEach((state, index) => {
            const bridgeId = `bridge${index + 1}`;

            this.edge
                .sendStateFullRequest(
                    this.websocket,
                    new ComponentJsonApiRequest({
                        componentId: bridgeId,
                        payload: new GetConnectionState.Request(),
                    }),
                )
                .then((response: GetConnectionState.Response) => {
                    this.updateSlaveConnectionState(index, response);
                })
                .catch((error) => {
                    this.handleStatusRequestError(index, error);
                });
        });
    }

    private updateSlaveConnectionState(index: number, response: GetConnectionState.Response): void {
        const connectionState = response.result.connectionState;
        const isConnected = connectionState === "CONNECTED" || connectionState === "AUTHENTICATING";
        this.updateSlaveState(index, {
            connected: isConnected,
            displayLabel: this.getConnectionStatusLabel(isConnected, connectionState),
        });
    }

    private handleStatusRequestError(index: number, error: any): void {
        this.handleErrorState(
            index,
            error,
            this.translate.instant(
                "INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_INSTALLATION.LOG_MESSAGE.SLAVE_STATUS_ERROR",
                { slaveNr: index + 1 },
            ),
        );
        console.error(error);
        this.updateSlaveState(index, {
            connected: false,
            displayLabel: this.translate.instant(
                "INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_INSTALLATION.CONNECTION_STATUS.NOT_FOUND",
            ),
        });
    }

    private async handleSuccessfulInstallation(index: number, response: AddEdgeToUserResponse): Promise<void> {
        const edge = response.result.edge;
        const state = this.slaveStates[index];

        this.updateSlaveState(index, {
            emsSerial: response.result.serialNumber,
        });

        if (!edge.online) {
            this.handleEdgeOffline(state);
            return Promise.resolve();
        }

        return this.processConnectedSlave(index, edge);
    }

    private async processConnectedSlave(index: number, edge: AddEdgeToUserResponse["result"]["edge"]) {
        const newEdge = new Edge(
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
        this.updateMetadata(newEdge);
        this.updateSlaveState(index, {
            edge: newEdge,
            logMessage: this.translate.instant(
                "INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_INSTALLATION.LOG_MESSAGE.AUTHENTICATION_SUCCESSFUL",
            ),
            validKey: true,
        });

        await this.websocket.sendStateFullRequest(new SubscribeEdgesRequest({ edges: [edge.id] }));
        await this.executeSystemUpdate(index);
        await this.authenticateBridge(index);
        await this.configureApp(index);
    }

    private updateMetadata(edge: Edge): void {
        const metadata = this.service.metadata?.getValue();
        if (!metadata) {
            return;
        }

        metadata.edges[edge.id] = edge;
        this.service.metadata.next({
            user: metadata.user,
            edges: metadata.edges,
        });
    }

    private async executeSystemUpdate(index: number): Promise<void> {
        const state = this.slaveStates[index];
        state.executeSystemUpdate = new ExecuteSystemUpdate(state.edge, this.websocket);

        return new Promise<void>((resolve) => {
            state.executeSystemUpdate.systemUpdateStateChange = (systemUpdateState) => {
                if (systemUpdateState.updated) {
                    state.updateFinished = true;
                    resolve();
                }
            };

            state.executeSystemUpdate.start().finally(() => {
                if (state.executeSystemUpdate.systemUpdateState.available) {
                    this.startSystemUpdate(index, state).then(resolve);
                } else {
                    resolve();
                }
            });
        });
    }

    private async startSystemUpdate(index: number, state: SlaveState): Promise<void> {
        return state.executeSystemUpdate.executeSystemUpdate().then((systemState) => {
            return new Promise<void>((resolve) => {
                if (systemState.unknown && state.executeSystemUpdate.canNotBeUpdated) {
                    state.updateFinished = false;
                    resolve(); // finish early if can't be updated
                } else {
                    setTimeout(() => {
                        state.logMessage = this.translate.instant(
                            "INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_INSTALLATION.LOG_MESSAGE.UPDATE_COMPLETED",
                        );
                        resolve();
                    }, 3000);
                }
            });
        });
    }

    private async authenticateBridge(index: number): Promise<void> {
        const state = this.slaveStates[index];
        return this.edge.sendStateFullRequest(
            this.websocket,
            new ComponentJsonApiRequest({
                componentId: `bridge${index + 1}`,
                payload: new AuthenticateRemoteEdgeRequest({
                    setupKey: state.setupKey,
                }),
            }),
        );
    }

    private async configureApp(index: number): Promise<void> {
        const state = this.slaveStates[index];
        try {
            const config = await firstValueFrom(
                state.edge.getConfig(this.websocket).pipe(
                    filter((c) => c !== null),
                    take(1),
                ),
            );

            this.ibn.batteryStartStopTarget = BatteryTarget.START;
            this.componentConfigurator = this.ibn.getComponentConfigurator(
                state.edge,
                config,
                this.websocket,
                this.service,
                CommercialCluster.SLAVE,
            );

            const configurator = await this.componentConfigurator;
            await configurator.start();
            this.handleConfigurationSuccess(index);

            if (configurator.allHaveConfigurationState(ConfigurationState.Configured)) {
                await this.executeFunctionTests(configurator, index);
            } else {
                this.handlePartialConfiguration(index);
            }
        } catch (error) {
            console.error("Function test failed:", error);
            this.handleErrorState(
                index,
                error,
                this.translate.instant(
                    "INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_INSTALLATION.LOG_MESSAGE.CONFIGURATION_FAILED",
                    { error: error?.error?.message || JSON.stringify(error) },
                ),
            );
        }
    }

    private handleConfigurationSuccess(index: number): void {
        this.service.toast(
            `Slave${index}: ${this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.SUCCESSFULLY_CONFIGURED")}`,
            "success",
        );
    }

    private handlePartialConfiguration(index: number): void {
        this.service.toast(
            this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.PARTIAL_CONFIGURATION"),
            "danger",
        );
        this.updateSlaveState(index, {
            logMessage: this.translate.instant(
                "INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_INSTALLATION.LOG_MESSAGE.PARTIALLY_CONFIGURED",
            ),
            configuring: false,
            configurationFailed: true,
        });
    }

    private async executeFunctionTests(configurator: ComponentConfigurator, index: number): Promise<void> {
        try {
            this.service.toast(
                this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.START_FUNCTION_TEST"),
                "warning",
                ProtocolCommercialClusterSlaveInstallationComponent.TOAST_DURATION,
            );

            await configurator.startFunctionTest(this.ibn);
            this.service.toast(
                this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.FINISH_FUNCTION_TEST"),
                "success",
            );
            this.updateSlaveState(index, {
                logMessage: this.translate.instant(
                    "INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_INSTALLATION.LOG_MESSAGE.CONFIGURED_SUCCESSFULLY",
                ),
                configuring: false,
            });
        } catch (error) {
            console.error("Function test failed:", error);
            this.handleErrorState(
                index,
                error,
                this.translate.instant(
                    "INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_INSTALLATION.LOG_MESSAGE.FUNCTION_TESTS_FAILED",
                    { error: error?.message || JSON.stringify(error) },
                ),
            );
        }
    }

    private handleInstallationFailure(index: number, error: any): void {
        this.service.toast(this.translate.instant("INSTALLATION.PRE_INSTALLATION.AUTHENTICATION_FAILED"), "danger");

        this.updateSlaveState(index, {
            logMessage: this.translate.instant("INSTALLATION.PRE_INSTALLATION.AUTHENTICATION_FAILED"),
            validKey: false,
            configuring: false,
            configurationFailed: true,
        });
        console.error(error);
    }

    private handleEdgeOffline(state: SlaveState): void {
        this.service.toast(
            this.translate.instant("INSTALLATION.PRE_INSTALLATION.EDGE_OFFLINE", {
                edgeShortName: environment.edgeShortName,
            }),
            "danger",
        );
        state.logMessage = this.translate.instant("INSTALLATION.PRE_INSTALLATION.AUTHENTICATION_FAILED");
        state.configuring = false;
        state.configurationFailed = true;
    }

    private initializeSlaveStates(): void {
        this.slaveStates = Array.from({ length: this.ibn.numberOfSlaves }, () => ({
            connected: false,
            displayLabel: this.getConnectionStatusLabel(false),
            configuring: null,
            configurationFailed: null,
            updateFinished: null,
            executeSystemUpdate: null,
            setupKey: "",
            logMessage: "",
            validKey: true,
            edge: null,
            emsSerial: null,
        }));
    }

    private resetSlaveState(index: number): void {
        this.slaveStates[index] = {
            ...this.slaveStates[index],
            configuring: false,
            configurationFailed: false,
            updateFinished: false,
            logMessage: "",
            validKey: true,
        };
    }

    // Helper to update slave state
    private updateSlaveState(index: number, updates: Partial<SlaveState>): void {
        this.slaveStates[index] = { ...this.slaveStates[index], ...updates };
    }

    // Unified error handler
    private handleErrorState(index: number, error: any, message: string): void {
        this.service.toast(message, "danger");
        this.updateSlaveState(index, {
            logMessage: message,
            configuring: false,
            configurationFailed: true,
        });
        console.error(error);
    }

    private getConnectionStatusLabel(connected: boolean, connectionState?: string): string {
        const validStates = ["CONNECTED", "AUTHENTICATING"];
        const statusKey =
            connectionState && validStates.includes(connectionState)
                ? connectionState
                : connected
                  ? "CONNECTED"
                  : "NOT_YET_CONNECTED";

        return this.translate.instant(
            `INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_INSTALLATION.CONNECTION_STATUS.${statusKey}`,
        );
    }
}
