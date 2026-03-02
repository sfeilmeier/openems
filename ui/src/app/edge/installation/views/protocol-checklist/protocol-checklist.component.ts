// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { AbstractCommercial92Ibn, BatteryTarget } from "../../installation-systems/commercial/commercial-92/abstract-commercial92";
import { CommercialCluster, GridSetting } from "../../shared/enums";
import { ComponentConfigurator, ConfigurationState, FunctionState } from "../configuration-execute/component-configurator";

@Component({
    selector: ProtocolChecklistComponent.SELECTOR,
    templateUrl: "./protocol-checklist.component.html",
    standalone: false,
})
export class ProtocolChecklistComponent implements OnInit {

    private static readonly SELECTOR = "protocol-checklist";

    @Input() public ibn: AbstractCommercial92Ibn;
    @Input() public edge: Edge;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent: EventEmitter<any> = new EventEmitter();

    protected forms: FormGroup[] = [];
    protected fields: FormlyFieldConfig[][] = [];
    protected models: any[] = [];

    protected isStartConfigurationDisabled: boolean[] = [];
    protected expandedSlaveIndex: number = 0; // Track which slave's checklist is expanded

    protected slavesConfiguring: (boolean | null)[] = [];
    protected isNextDisabled: boolean;
    protected numberOfSlaves: number = 1; // By default. '1' is applied for non cluster configuration as well.

    protected readonly timeoutInMinutes: number = ComponentConfigurator.DELAY_FUNCTION_TEST / 60 / 1000;
    private componentConfigurator: Promise<ComponentConfigurator>;

    constructor(
        private translate: TranslateService,
        private websocket: Websocket,
        private service: Service,
    ) { }

    protected get isWaiting(): boolean {
        return !(this.slavesConfiguring.length > 0 && this.slavesConfiguring.every(status => status === false));
    }

    public ngOnInit(): void {
        this.numberOfSlaves = this.ibn.numberOfSlaves;
        this.isNextDisabled = true;

        for (let i = 0; i < this.numberOfSlaves; i++) {
            this.forms[i] = new FormGroup({});
            this.fields[i] = this.getFields(i);
            this.models[i] = {};
            this.isStartConfigurationDisabled[i] = false;
            this.slavesConfiguring[i] = null;
        }
    }

    protected toggleExpansion(index: number) {
        this.expandedSlaveIndex = index;
    }

    /**
     * Starts the configuration based on the components selected.
    */
    protected async startConfiguration(slaveIndex: number) {
        this.ibn.batteryStartStopTarget = BatteryTarget.AUTO;
        this.isStartConfigurationDisabled[slaveIndex] = true;

        const stopOnRequest: Subject<void> = new Subject<void>();
        this.edge.getConfig(this.websocket).pipe(
            takeUntil(stopOnRequest),
            filter(config => config !== null),
        ).subscribe(async (config) => {
            stopOnRequest.next();
            stopOnRequest.complete();

            if (this.ibn.isClusterConfiguration) {
                // Fetch component configurator
                const edge: Edge = this.ibn.getEdge(slaveIndex);
                this.componentConfigurator = this.ibn.getComponentConfigurator(edge, config, this.websocket, this.service, CommercialCluster.SLAVE);
            } else {
                // Fetch component configurator
                this.componentConfigurator = this.ibn.getComponentConfigurator(this.edge, config, this.websocket);
            }

            const resolvedConfigurator = await this.componentConfigurator; // Wait for resolution
            this.slavesConfiguring[slaveIndex] = true;

            // Starts the configuration
            resolvedConfigurator.start().then(() => {
                this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.SUCCESSFULLY_CONFIGURED"), "success");
            }).catch((reason) => {
                console.log(reason);

                if (!resolvedConfigurator.allHaveConfigurationState(ConfigurationState.Configured)) {
                    this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.PARTIAL_CONFIGURATION"), "danger");
                    return;
                }

                if (!resolvedConfigurator.allHaveFunctionState(FunctionState.Ok)) {
                    this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.FUNCTION_TEST_ERROR"), "warning");
                    return;
                }
            }).finally(() => {
                this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.START_FUNCTION_TEST"), "warning", 5000);
                resolvedConfigurator.startFunctionTest(this.ibn).then(() => {
                    this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.FINISH_FUNCTION_TEST"), "success");
                    this.slavesConfiguring[slaveIndex] = false;

                    if (slaveIndex == (this.numberOfSlaves - 1)) {
                        this.isNextDisabled = false;
                    }
                });
            });
        });
    }

    protected onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    protected onNextClicked() {
        for (let i = 0; i < this.numberOfSlaves; i++) {
            if (this.forms[i].invalid) {
                return;
            }
        }
        this.ibn.checklist = this.models;
        this.nextViewEvent.emit(this.ibn);
    }

    protected areAllFieldsChecked(slaveIndex: number): boolean {
        return this.fields[slaveIndex].every(field => {
            const key = field.key as string;
            return !!this.models[slaveIndex][key];
        });
    }

    private getFields(index: number): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = [];

        fields.push({
            key: `connectInverter_${index}`,
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.CONNECT_INVERTER"),
                url: "assets/img/ibn/commercial-checklist/connect_network_cable.png",
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        fields.push({
            key: `ipAddress_${index}`,
            type: "multi-step",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.CHANGE_NETWORK_SETTINGS"),
                description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.NETWORK_SETTINGS_NOTE"),
                attributes: {
                    infoLine: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.NETWORK_SETTINGS_INFO"),
                },
                steps: [
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 1, totalStep: 3, description: "Ethernet-Einstellungen öffnen" }),
                        url: ["assets/img/ibn/commercial-checklist/ip_addr_step_1.png"],
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 2, totalStep: 3, description: "Ethernet-Einstellungen bearbeiten" }),
                        url: ["assets/img/ibn/commercial-checklist/ip_addr_step_2.png"],
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 3, totalStep: 3, description: "IP-Adresse speichern" }),
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.NETWORK_SETTINGS"),
                        url: ["assets/img/ibn/commercial-checklist/ip_addr_step_3.png"],
                    },
                ],
            },
        });

        fields.push({
            key: `url_${index}`,
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.IP_ADDRESS"),
                url: "assets/img/ibn/commercial-checklist/ip_address.png",
                description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.IP_ADDRESS_DESCRIPTION"),
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        fields.push({
            key: `enterPassword_${index}`,
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.ENTER_PASSWORD"),
                url: "assets/img/ibn/commercial-checklist/enter_password.png",
                description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.PASSWORD_DESCRIPTION"),
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        fields.push({
            key: `startConfiguration_${index}`,
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.START_CONFIGURATION"),
                url: "assets/img/ibn/commercial-checklist/start_configuration.png",
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        // Default VDE-AR-N 4105
        let gridSetting: GridSetting = GridSetting.VDE_4105;
        let voltageLimit: string = "600.0";
        let url: string[] = ["assets/img/ibn/commercial-checklist/step2.1.png", "assets/img/ibn/commercial-checklist/step2.2.png"];

        if (this.ibn.gridSetting && this.ibn.gridSetting === GridSetting.VDE_4110) { // Undefined for other countries
            gridSetting = GridSetting.VDE_4110;
            voltageLimit = "650.0";
            url = ["assets/img/ibn/commercial-checklist/step2_4110.png"];
        }

        fields.push({
            key: `multiStepField_${index}`,
            type: "multi-step",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.MULTI_STEP", { totalSteps: 8, listPosition: "F" }),
                steps: [
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 1, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_1") }),
                        url: ["assets/img/ibn/commercial-checklist/step1.png"],
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 2, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_2") }),
                        url: url,
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_2_DESCRIPTION", { gridSetting: gridSetting, voltageLimit: voltageLimit }),
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 3, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_3") }),
                        url: ["assets/img/ibn/commercial-checklist/step3.png"],
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_3_DESCRIPTION"),
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 4, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_4") }),
                        url: ["assets/img/ibn/commercial-checklist/step4.1.png", "assets/img/ibn/commercial-checklist/step4.2.png"],
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_4_DESCRIPTION"),
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 5, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_5") }),
                        url: ["assets/img/ibn/commercial-checklist/step5.png"],
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_5_DESCRIPTION"),
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 6, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_6") }),
                        url: ["assets/img/ibn/commercial-checklist/step6.png"],
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_6_DESCRIPTION"),
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 7, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_7") }),
                        url: ["assets/img/ibn/commercial-checklist/step7.png"],
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 8, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_8") }),
                        url: ["assets/img/ibn/commercial-checklist/step8.1.png", "assets/img/ibn/commercial-checklist/step8.2.png"],
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_8_DESCRIPTION"),
                    },
                ],
            },
        });

        fields.push({
            key: `minVoltage_${index}`,
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.MIN_VOLTAGE"),
                url: "assets/img/ibn/commercial-checklist/min_voltage.png",
                description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.MIN_VOLTAGE_DESCRIPTION", { voltageLimit: voltageLimit, gridSetting: gridSetting }),
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        fields.push({
            key: `powerControl_${index}`,
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.POWER_CONTROL"),
                url: "assets/img/ibn/commercial-checklist/power_control.png",
                description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.POWER_CONTROL_DESCRIPTION"),
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        return fields;
    }
}
