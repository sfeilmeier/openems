// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { BatteryTarget, Commercial92Ibn, GridSetting } from "../../installation-systems/commercial/commercial-92/commercial92";
import { ComponentConfigurator, ConfigurationState, FunctionState } from "../configuration-execute/component-configurator";

@Component({
    selector: ProtocolChecklistComponent.SELECTOR,
    templateUrl: "./protocol-checklist.component.html",
    standalone: false,
})
export class ProtocolChecklistComponent implements OnInit {

    private static readonly SELECTOR = "protocol-checklist";
    private static readonly MULTI_STEP_FIELD = "multiStepField";
    private static readonly IP_ADDR = "ipAddress";

    @Input() public ibn: Commercial92Ibn;
    @Input() public edge: Edge;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent: EventEmitter<any> = new EventEmitter();

    protected form: FormGroup;
    protected fields: FormlyFieldConfig[];
    protected model;
    protected componentConfigurator: ComponentConfigurator;
    protected isWaiting = false;
    protected isNextDisabled: boolean;
    protected allFieldsChecked: boolean = false;
    protected isStartConfigurationDisabled: boolean = false;
    protected readonly timeoutInMinutes: number = ComponentConfigurator.DELAY_FUNCTION_TEST / 60 / 1000;

    constructor(
        private translate: TranslateService,
        private websocket: Websocket,
        private service: Service,
    ) { }


    public ngOnInit(): void {
        this.form = new FormGroup({});
        this.fields = this.getFields();
        this.model = this.ibn.checklist;
        this.isNextDisabled = true;
    }

    /**
     * Starts the configuration based on the components selected.
    */
    public startConfiguration() {
        this.ibn.batteryStartStopTarget = BatteryTarget.AUTO;
        this.isStartConfigurationDisabled = true;

        const stopOnRequest: Subject<void> = new Subject<void>();
        this.edge.getConfig(this.websocket).pipe(
            takeUntil(stopOnRequest),
            filter(config => config !== null),
        ).subscribe((config) => {
            stopOnRequest.next();
            stopOnRequest.complete();

            // Add objects to component configurator
            this.componentConfigurator = this.ibn.getComponentConfigurator(this.edge, config, this.websocket, this.service);
            this.isWaiting = true;

            // Starts the configuration
            this.componentConfigurator.start().then(() => {
                this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.SUCCESSFULLY_CONFIGURED"), "success");
            }).catch((reason) => {
                console.log(reason);

                if (!this.componentConfigurator.allHaveConfigurationState(ConfigurationState.Configured)) {
                    this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.PARTIAL_CONFIGURATION"), "danger");
                    return;
                }

                if (!this.componentConfigurator.allHaveFunctionState(FunctionState.Ok)) {
                    this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.FUNCTION_TEST_ERROR"), "warning");
                    return;
                }
            }).finally(() => {
                this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.START_FUNCTION_TEST"), "warning", 5000);
                this.componentConfigurator.startFunctionTest(this.ibn).then(() => {
                    this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.FINISH_FUNCTION_TEST"), "success");
                    this.isWaiting = false;
                    this.isNextDisabled = false;
                });
            });
        });
    }

    protected onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    protected onNextClicked() {
        if (this.form.invalid) {
            return;
        }
        this.ibn.checklist = this.model;
        this.nextViewEvent.emit(this.ibn);
    }

    protected areAllFieldsChecked(): boolean {
        return this.fields.every(field => {
            const key = field.key as string; // Treat key as a string
            return !!this.model[key]; // Check if the field is checked
        });
    }

    private arePreviousFieldsChecked(index: number): boolean {
        let allPreviousChecked = true;
        for (let i = 0; i < index; i++) {
            const key = this.fields[i].key as string;
            if (key === ProtocolChecklistComponent.MULTI_STEP_FIELD || key === ProtocolChecklistComponent.IP_ADDR) {
                const multiStepField = this.model[key];
                // If any step is unchecked, return false
                if (!multiStepField || !multiStepField.every((stepChecked: boolean) => stepChecked === true)) {
                    allPreviousChecked = false;
                }
            }

            if (!this.model[key]) {
                allPreviousChecked = false;
            }

            // If previous fields are not checked, reset current field's value to false
            if (!allPreviousChecked) {
                if (this.model[key] !== undefined && this.model[key] !== false) {
                    if (key === ProtocolChecklistComponent.MULTI_STEP_FIELD) {
                        this.model[key] = this.model[key].map(() => false); // Uncheck all steps
                    } else {
                        this.model[key] = false; // Uncheck checkbox
                    }
                }
            }
        }
        return allPreviousChecked;
    }

    private getFields(): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = [];

        fields.push({
            key: "connectInverter",
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.CONNECT_INVERTER"),
                url: "assets/img/commercial-checklist/connect_network_cable.png",
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        fields.push({
            key: "ipAddress",
            type: "multi-step",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.CHANGE_NETWORK_SETTINGS"),
                description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.NETWORK_SETTINGS_NOTE"),
                hideButtons: true,
                attributes: {
                    infoLine: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.NETWORK_SETTINGS_INFO"),
                },
                steps: [
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 1, totalStep: 3, description: "Ethernet-Einstellungen öffnen" }),
                        url: ["assets/img/commercial-checklist/ip_addr_step_1.png"],
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 2, totalStep: 3, description: "Ethernet-Einstellungen bearbeiten" }),
                        url: ["assets/img/commercial-checklist/ip_addr_step_2.png"],
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 3, totalStep: 3, description: "IP-Adresse speichern" }),
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.NETWORK_SETTINGS"),
                        url: ["assets/img/commercial-checklist/ip_addr_step_3.png"],
                    },
                ],
            },
        });

        fields.push({
            key: "url",
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.IP_ADDRESS"),
                url: "assets/img/commercial-checklist/ip_address.png",
                description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.IP_ADDRESS_DESCRIPTION"),
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        fields.push({
            key: "enterPassword",
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.ENTER_PASSWORD"),
                url: "assets/img/commercial-checklist/enter_password.png",
                description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.PASSWORD_DESCRIPTION"),
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        fields.push({
            key: "startConfiguration",
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.START_CONFIGURATION"),
                url: "assets/img/commercial-checklist/start_configuration.png",
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        // Default VDE-AR-N 4105
        let gridSetting: GridSetting = GridSetting.VDE_AR_N_4105;
        let voltageLimit: string = "600.0";
        let url: string[] = ["assets/img/commercial-checklist/step2.1.png", "assets/img/commercial-checklist/step2.2.png"];

        if (this.ibn.gridSetting && this.ibn.gridSetting === GridSetting.VDE_AR_N_4110) { // Undefined for other countries
            gridSetting = GridSetting.VDE_AR_N_4110;
            voltageLimit = "650.0";
            url = ["assets/img/commercial-checklist/step2_4110.png"];
        }

        fields.push({
            key: "multiStepField",
            type: "multi-step",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.MULTI_STEP", { totalSteps: 8, listPosition: "F" }),
                steps: [
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 1, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_1") }),
                        url: ["assets/img/commercial-checklist/step1.png"],
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 2, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_2") }),
                        url: url,
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_2_DESCRIPTION", { gridSetting: gridSetting, voltageLimit: voltageLimit }),
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 3, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_3") }),
                        url: ["assets/img/commercial-checklist/step3.png"],
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_3_DESCRIPTION"),
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 4, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_4") }),
                        url: ["assets/img/commercial-checklist/step4.1.png", "assets/img/commercial-checklist/step4.2.png"],
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_4_DESCRIPTION"),
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 5, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_5") }),
                        url: ["assets/img/commercial-checklist/step5.png"],
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_5_DESCRIPTION"),
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 6, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_6") }),
                        url: ["assets/img/commercial-checklist/step6.png"],
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_6_DESCRIPTION"),
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 7, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_7") }),
                        url: ["assets/img/commercial-checklist/step7.png"],
                    },
                    {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP", { currStep: 8, totalStep: 8, description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_8") }),
                        url: ["assets/img/commercial-checklist/step8.1.png", "assets/img/commercial-checklist/step8.2.png"],
                        description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.STEP_8_DESCRIPTION"),
                    },
                ],
            },
        });

        fields.push({
            key: "minVoltage",
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.MIN_VOLTAGE"),
                url: "assets/img/commercial-checklist/min_voltage.png",
                description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.MIN_VOLTAGE_DESCRIPTION", { voltageLimit: voltageLimit, gridSetting: gridSetting }),
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        fields.push({
            key: "powerControl",
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.POWER_CONTROL"),
                url: "assets/img/commercial-checklist/power_control.png",
                description: this.translate.instant("INSTALLATION.PROTOCOL_CHECKLIST.POWER_CONTROL_DESCRIPTION"),
            },
            wrappers: ["formly-field-checkbox-with-image"],
        });

        return fields;
    }
}
