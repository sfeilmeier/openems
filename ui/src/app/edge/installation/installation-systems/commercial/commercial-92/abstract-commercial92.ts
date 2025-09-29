// @ts-strict-ignore
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { JsonrpcResponseSuccess } from "src/app/shared/jsonrpc/base";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { SetupProtocol, SubmitSetupProtocolRequest } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { ChannelAddress, Edge, EdgeConfig, Service, Websocket } from "src/app/shared/shared";
import { Country } from "src/app/shared/type/country";
import { AppCenterUtil } from "../../../shared/appcenterutil";
import { Category } from "../../../shared/category";
import { CommercialCluster, ExternalLimitationType, GridFeedInLimitationType, GridSetting, View } from "../../../shared/enums";
import { ExtensionBoxPrefix } from "../../../shared/ibndatatypes";
import { Meter } from "../../../shared/meter";
import { SystemId } from "../../../shared/system";
import { ViewUtils } from "../../../shared/view.utils";
import { BaseMode, ComponentConfigurator, ConfigurationMode, ConfigurationObject } from "../../../views/configuration-execute/component-configurator";
import { GetEstimatedConfigRequest } from "../../../views/configuration-execute/jsonrpc/getEstimatedConfig";
import { GetEstimatedConfigResponse } from "../../../views/configuration-execute/jsonrpc/getEstimatedConfigResponse";
import { SafetyCountry } from "../../../views/configuration-execute/safety-country";
import { AbstractCommercialIbn } from "../abstract-commercial";

export type Commercial92App = {
    SAFETY_COUNTRY: SafetyCountry,
    FEED_IN_TYPE: ExternalLimitationType,
    BATTERY_TARGET: BatteryTarget,
    HAS_ESS_LIMITER_14A: boolean,
};

export enum BatteryTarget {
    START = "START",
    AUTO = "AUTO",
}

export abstract class AbstractCommercial92Ibn extends AbstractCommercialIbn {

    public override WAIT_FOR_BATTERY_SERIAL_NUMBERS = 8 * 60 * 1000;

    public override readonly systemId: SystemId = SystemId.COMMERCIAL_92_WITHOUT_CLUSTER;
    public override readonly defaultNumberOfModules = 15;
    public override readonly minNumberOfTowers: number = 2;
    public override readonly maxFeedInLimit: number = 6000000;
    public override readonly showNote: boolean = true;
    public batteryStartStopTarget: BatteryTarget = BatteryTarget.START;
    public gridSetting: GridSetting | null = null;
    public numberOfSlaves: number = 1;

    // protocol-dynamic-feed-in-limitation
    public override feedInLimitation? = {
        feedInType: ExternalLimitationType.NO_LIMITATION,
        dynamicLimitationType: GridFeedInLimitationType.NO_LIMITATION,
        maximumFeedInPower: 0,
    };

    public checklist: {
        changeNetworkSettings: boolean,
        connectInverter: boolean,
        enterPassword: boolean,
        ipAddress: [boolean, boolean, boolean],
        minVoltage: boolean,
        multiStepField: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean],
        powerControl: boolean,
        startConfiguration: boolean,
    }[] = [{
        changeNetworkSettings: false,
        connectInverter: false,
        enterPassword: false,
        ipAddress: [false, false, false],
        minVoltage: false,
        multiStepField: [false, false, false, false, false, false, false, false],
        powerControl: false,
        startConfiguration: false,
    }];

    public abstract isClusterConfiguration: boolean;

    public override getLineSideMeterFuseFields() {
        const fields: FormlyFieldConfig[] = [];

        fields.push({
            key: "otherValue",
            type: "input",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.VALUE"),
                type: "number",
                description: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.FIXED_VALUE_DESCRIPTION"),
                min: 0,
                required: true,
            },
            parsers: [Number],
            validators: {
                validation: ["onlyPositiveInteger"],
            },
        });

        fields.push({
            key: "meterType",
            type: "select",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.METER_LABEL"),
                required: true,
                options: [
                    { label: "KDK", value: Meter.GridMeter.KDK },
                ],
            },
            defaultValue: Meter.GridMeter.KDK,
        });
        return fields;
    }

    public override getSerialNumberCategoryHeader(towerIndex: number, slaveIndex?: number): string {
        const towerNr: number = towerIndex + 1;
        return this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_TOWER", { number: towerNr });
    }

    public override getPreSettingsFields(numberOfModulesPerTower: number, numberOfTowers: number) {
        const fields: FormlyFieldConfig[] = [];

        fields.push({
            key: "numberOfTowers",
            type: "input",
            templateOptions: {
                type: "number",
                label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.NUMBER_OF_TOWERS"),
                min: 2,
                max: 5,
                required: true,
            },
            parsers: [Number],
            defaultValue: numberOfTowers,
        });

        fields.push({
            key: "numberOfModulesPerTower",
            type: "input",
            templateOptions: {
                type: "number",
                label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.NUMBER_OF_MODULES_PER_TOWER"),
                min: 15,
                max: 15,
                required: true,
            },
            parsers: [Number],
            defaultValue: numberOfModulesPerTower,
        });

        return fields;
    }

    public override getSerialNumberFields(towerNr: number, numberOfModulesPerTower: number, slaveIndex?: number) {
        const fields: FormlyFieldConfig[] = [];
        const slaveNr: number = slaveIndex + 1;

        switch (towerNr) {
            case 0:
                fields.push({
                    key: "batteryInverter",
                    type: "input",
                    templateOptions: {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.INVERTER"),
                        required: true,
                        placeholder: "xxxxxxxxxxxxxxxx",
                    },
                    wrappers: ["input-serial-number"],
                });
                fields.push({
                    key: "parallelBox",
                    type: "input",
                    templateOptions: {
                        label: "Parallel Box",
                        required: true,
                        prefix: "FCP",
                        placeholder: "xxxxxxxxx",
                    },
                    validators: {
                        validation: ["boxSerialNumber"],
                    },
                    wrappers: ["input-serial-number"],
                });
                fields.push({
                    key: "emsBox",
                    type: "input",
                    templateOptions: {
                        label: Category.toTranslatedString(Category.EMS_BOX_LABEL_HOME, this.translate),
                        required: true,
                        placeholder: "FEFxxxxxxx",
                    },
                    defaultValue: this.getEmsBoxSerialNumber(slaveNr),
                    validators: {
                        validation: ["emsBoxSerialNumber"],
                    },
                    wrappers: ["input-serial-number"],
                });
                break;
            default:
                fields.push({
                    key: "extensionBox",
                    type: "input",
                    templateOptions: {
                        label: "Extension Box",
                        required: true,
                        prefix: ExtensionBoxPrefix.FEE,
                        placeholder: "xxxxxxxxx",
                    },
                    validators: {
                        validation: ["boxSerialNumber"],
                    },
                    wrappers: ["input-serial-number"],
                });
                break;
        }

        fields.push({
            key: "bmsBox",
            type: "input",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BMS_BOX"),
                required: true,
                placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx",
                checkbox: {
                    value: this.serialNumbers?.doubleSocket?.isEnabled?.[slaveIndex]?.[towerNr] ?? false,
                    label: this.serialNumbers?.doubleSocket?.label,

                    updateFn: (checked: boolean) => {
                        if (this.serialNumbers?.doubleSocket?.isEnabled?.[slaveIndex]) {
                            this.serialNumbers.doubleSocket.isEnabled[slaveIndex][towerNr] = checked;
                        }
                    },
                },
            },
            validators: {
                validation: ["batteryAndBmsBoxSerialNumber"],
            },
            wrappers: ["input-serial-number"],
        });

        for (let moduleNr = 0; moduleNr < numberOfModulesPerTower; moduleNr++) {
            fields.push({
                key: "module" + moduleNr,
                type: "input",
                templateOptions: {
                    label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_MODULE") + (moduleNr + 1),
                    required: true,
                    placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx",
                },
                validators: {
                    validation: ["batteryAndBmsBoxSerialNumber"],
                },
                wrappers: ["input-serial-number"],
            });
        }

        return fields;
    }

    public override getFeedInLimitFields(): FormlyFieldConfig[] {
        const totalPvPower = 0;
        this.feedInLimitation.maximumFeedInPower = totalPvPower;

        return super.getDynamicLimitationFields(totalPvPower);
    }

    public override async getComponentConfigurator(edge: Edge, config: EdgeConfig, websocket: Websocket, service?: Service, cluster?: CommercialCluster): Promise<ComponentConfigurator> {

        const componentConfigurator: ComponentConfigurator =
            new ComponentConfigurator(edge, config, websocket);

        // system not updated => newest appManager not available
        const baseMode = AppCenterUtil.isAppManagerAvailable(edge) ? BaseMode.AppManager : BaseMode.UI;
        const appId: string = "App.FENECON.Commercial.92";
        const appAlias: string = "commercial-92";

        // Determine safety country
        const safetyCountry: SafetyCountry = this.location.isEqualToCustomerData
            ? SafetyCountry.getSafetyCountry(this.customer.country)
            : SafetyCountry.getSafetyCountry(this.location.country);

        const appProperties: Commercial92App = {
            SAFETY_COUNTRY: safetyCountry,
            FEED_IN_TYPE: this.feedInLimitation.feedInType,
            BATTERY_TARGET: this.batteryStartStopTarget,
            HAS_ESS_LIMITER_14A: this.isController14aActivated,
        };

        componentConfigurator.addInstallAppCallback(() => {
            return AppCenterUtil.updateMetaAndInstallApp(
                edge,
                websocket,
                appId,
                appAlias,
                appProperties,
                this.feedInLimitation.dynamicLimitationType,
                this.feedInLimitation.maximumFeedInPower
            );
        });

        // Send request and process components
        const estimatedConfig: GetEstimatedConfigResponse = await edge.sendRequest(
            websocket,
            new ComponentJsonApiRequest({
                componentId: "_appManager",
                payload: new GetEstimatedConfigRequest({
                    appId: appId,
                    alias: appAlias,
                    properties: appProperties,
                }),
            }),
        );

        // Add components to the configurator
        estimatedConfig.result.configurations
            .filter((config) => config.type === "Component")
            .forEach((config) => {
                const components = config.configuration?.components || [];
                components.forEach((component) => {
                    const configurationObject: ConfigurationObject = {
                        factoryId: component.factoryId,
                        componentId: component.id,
                        alias: component.alias,
                        properties: component.properties
                            ? Object.entries(component.properties).map(([name, value]) => ({ name, value }))
                            : undefined,
                        mode: ConfigurationMode.RemoveAndConfigure,
                        baseMode: baseMode,
                    };

                    componentConfigurator.add(configurationObject);
                });
            });

        return componentConfigurator;
    }

    public setRequiredControllers() {
        this.requiredControllerIds = [];
    }

    public override getSystemVariantFields(): FormlyFieldConfig[] {
        return [];
    }

    public override getSerialNumbersFromEdge(towerNr: number, edge: Edge, websocket: Websocket, numberOfModulesPerTower: number, slaveNr?: number) {
        return new Promise((resolve) => {
            const subscriptionId = `Commercial-tower${towerNr}`;
            const serialNumbers: { [key: string]: string } = {};
            const channelAddresses = this.getChannelAddresses(towerNr, numberOfModulesPerTower);

            // Edge-subscribe
            edge.subscribeChannels(websocket, subscriptionId, Object.values(channelAddresses));

            // Subject to stop the subscription to currentData
            const stopOnRequest: Subject<void> = new Subject<void>();

            // Read data
            edge.currentData.pipe(
                takeUntil(stopOnRequest),
                filter(currentData => currentData != null),
            ).subscribe((currentData) => {
                if (this.processCurrentData(currentData, channelAddresses, serialNumbers)) {

                    // If all serial numbers are resolved
                    stopOnRequest.next();
                    stopOnRequest.complete();
                    edge.unsubscribeFromChannels(websocket, Object.values(channelAddresses));
                    resolve(serialNumbers);
                }
            });
            setTimeout(() => {
                stopOnRequest.next();
                stopOnRequest.complete();
                edge.unsubscribeFromChannels(websocket, Object.values(channelAddresses));
                resolve(serialNumbers); // Resolve with available data
            }, 5_000);
        });
    }

    public override populateFromData(ibnString: any) {

        super.populateFromData(ibnString);

        // limitController14a
        this.isController14aActivated = ibnString.isController14aActivated;

        if ("checklist" in ibnString) {
            this.checklist = ibnString.checklist;
        }
        this.gridSetting = ibnString.gridSetting ?? null;
    }

    /**
     *
     * Processes current data.
     */
    public processCurrentData(
        currentData: any,
        channelAddresses: { [key: string]: ChannelAddress },
        serialNumbers: { [key: string]: string },
    ): boolean {
        let allSerialNumbersResolved = true;

        for (const key in channelAddresses) {
            const { componentId, channelId } = channelAddresses[key];
            const serialNumber = currentData.channel?.[`${componentId}/${channelId}`];

            if (!serialNumber) {
                allSerialNumbersResolved = false;
                continue;  // Skip if serial number is not available
            }
            serialNumbers[key] = serialNumber;
        }

        return allSerialNumbersResolved;
    }

    /**
     * Helper function to gather channel addresses
     */
    public getChannelAddresses(towerNr: number, numberOfModulesPerTower: number, slaveNr?: number): { [key: string]: ChannelAddress } {
        const channelAddresses: { [key: string]: ChannelAddress } = {
            batteryInverter: new ChannelAddress("batteryInverter0", "S1Sn"),
            bmsBox: new ChannelAddress("battery0", `Tower${towerNr}BmsSerialNumber`),
        };
        for (let moduleNr = 0; moduleNr < numberOfModulesPerTower; moduleNr++) {
            channelAddresses[`module${moduleNr}`] = new ChannelAddress("battery0", `Tower${towerNr}Module${moduleNr}SerialNumber`);
        }
        return channelAddresses;
    }

    public override getProtocol(edge: Edge, websocket: Websocket): Promise<string> {
        const protocol: SetupProtocol = super.getCommonProtocolItems(edge);
        const safetyCountry = this.location.isEqualToCustomerData ? this.customer.country : this.location.country;

        if (safetyCountry === Country.GERMANY) {
            protocol.items.push({
                category: Category.GRID,
                name: this.translate.instant("INSTALLATION.CONFIGURATION_GRID_SETTING.TITLE"),
                value: this.gridSetting,
            });
        }

        protocol.items.push({
            category: Category.GRID,
            name: this.translate.instant("INSTALLATION.CONFIGURATION_ESS_LIMITER.TITLE"),
            value: this.isController14aActivated ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
        });

        return new Promise((resolve, reject) => {
            websocket.sendRequest(SubmitSetupProtocolRequest.translateFrom(protocol, this.translate)).then((response: JsonrpcResponseSuccess) => {
                resolve(response.result["setupProtocolId"]);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }

    public override removeOrAddView(edge: Edge): void {
        const location: Country = this.location?.isEqualToCustomerData ? this.customer.country : this.location?.country;

        super.removeOrAddView(edge);
        // Limiter 14a view
        ViewUtils.handleViewPresence({
            location,
            targetCountry: Country.GERMANY,
            views: this.views,
            viewToToggle: View.ConfigurationEssLimiter14aComponent,
            insertIndex: this.indexOf14aLimiterControllerView,
            shouldClear: () => {
                this.isController14aActivated = false;
            },
            shouldSet: () => {
                this.isController14aActivated = true;
            },
        });

        // Grid setting view
        ViewUtils.handleViewPresence({
            location,
            targetCountry: Country.GERMANY,
            views: this.views,
            viewToToggle: View.ConfigurationGridSetting,
            insertIndex: 9,
            shouldClear: () => {
                this.gridSetting = null;
            },
        });
    }

    public abstract getEdge(index: number): Edge;

    public abstract getEmsBoxSerialNumber(slaveNr: number): string | null;
}
