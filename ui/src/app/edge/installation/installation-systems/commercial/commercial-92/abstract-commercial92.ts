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
import { CommercialCluster, FeedInType, View } from "../../../shared/enums";
import { ComponentData } from "../../../shared/ibndatatypes";
import { Meter } from "../../../shared/meter";
import { SystemId } from "../../../shared/system";
import { BaseMode, ComponentConfigurator, ConfigurationMode, ConfigurationObject } from "../../../views/configuration-execute/component-configurator";
import { GetEstimatedConfigRequest } from "../../../views/configuration-execute/jsonrpc/getEstimatedConfig";
import { GetEstimatedConfigResponse } from "../../../views/configuration-execute/jsonrpc/getEstimatedConfigResponse";
import { SafetyCountry } from "../../../views/configuration-execute/safety-country";
import { AbstractCommercialIbn } from "../abstract-commercial";

export type Commercial92App = {
    SAFETY_COUNTRY: SafetyCountry,
    FEED_IN_TYPE: FeedInType,
    MAX_FEED_IN_POWER?: number,
    BATTERY_TARGET: BatteryTarget,
    HAS_ESS_LIMITER_14A: boolean,
};

export enum BatteryTarget {
    START = "START",
    AUTO = "AUTO",
}

export enum GridSetting {
    VDE_AR_N_4105 = "VDE-AR-N 4105",
    VDE_AR_N_4110 = "VDE-AR-N 4110",
}

export abstract class AbstractCommercial92Ibn extends AbstractCommercialIbn {

    public override WAIT_FOR_BATTERY_SERIAL_NUMBERS = 8 * 60 * 1000;

    public override readonly systemId: SystemId = SystemId.COMMERCIAL_92;
    public override showViewCount: boolean = true;
    public override readonly defaultNumberOfModules = 15;
    public override readonly minNumberOfTowers: number = 2;
    public override readonly maxFeedInLimit: number = 6000000;
    public override readonly showNote: boolean = true;
    public batteryStartStopTarget: BatteryTarget = BatteryTarget.START;
    public gridSetting: GridSetting | null = null;
    public numberOfSlaves: number = 1;

    // protocol-dynamic-feed-in-limitation
    public override feedInLimitation? = {
        feedInType: FeedInType.NO_LIMITATION,
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

    public override getSerialNumberCategoryHeader(slaveNr: number, towerNr: number): string {
        return this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_TOWER", { number: towerNr + 1 });
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

    public override getSerialNumberFields(towerNr: number, numberOfModulesPerTower: number, slaveNr?: number) {
        const fields: FormlyFieldConfig[] = [];
        const emsBoxSerialNumber: string | null = sessionStorage.getItem("emsBoxSerialNumber");

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
                    defaultValue: emsBoxSerialNumber,
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
                        prefix: "FEE",
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
        // Update the feedInlimitation field
        const totalPvPower = 0;
        this.feedInLimitation.maximumFeedInPower = totalPvPower;

        const options: ComponentData[] = [
            { label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.DYNAMIC_LIMITATION"), value: FeedInType.DYNAMIC_LIMITATION },
            { label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.NO_LIMITATION"), value: FeedInType.NO_LIMITATION },
        ];

        return super.getCommonFeedInLimitsFields(totalPvPower, options);
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
            ...(this.feedInLimitation.feedInType === FeedInType.DYNAMIC_LIMITATION && { MAX_FEED_IN_POWER: this.feedInLimitation.maximumFeedInPower }),
            BATTERY_TARGET: this.batteryStartStopTarget,
            HAS_ESS_LIMITER_14A: this.isController14aActivated,
        };

        componentConfigurator.addInstallAppCallback(() => {
            return AppCenterUtil.createOrUpdateApp(edge, websocket, appId, appAlias, appProperties, AppCenterUtil.keyForIntegratedSystems());
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

    public override setNonAbstractFields(ibnString: any) {

        super.setNonAbstractFields(ibnString);

        if ("checklist" in ibnString) {
            this.checklist = ibnString.checklist;
        }

        if (ibnString.gridSetting) {
            this.gridSetting = ibnString.gridSetting;
        }
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

        // Speichersystemkomponenten
        protocol.lots = [];

        this.serialNumbers.batteriesData.forEach((batteryData) => {
            batteryData.modules.forEach((module) => {
                // Push the data to protocol.lots
                protocol.lots.push({
                    category: batteryData.label,
                    name: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.SINGLE_SERIAL_NUMBER", { label: module.label }),
                    serialNumber: module.value,
                });
            });
        });

        return new Promise((resolve, reject) => {
            websocket.sendRequest(SubmitSetupProtocolRequest.translateFrom(protocol, this.translate)).then((response: JsonrpcResponseSuccess) => {
                resolve(response.result["setupProtocolId"]);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }

    /**
     * Manages the presence of the ConfigurationGridSettingComponent view based on country location.
     *
     * @remarks
     * Performs two main operations:
     * 1. Removes the ConfigurationGridSettingComponent view and resets the gridSetting to the default "VDE_AR_N_4105" when the location is not Germany
     * 2. Re-adds the ConfigurationGridSettingComponent view (if missing) when the location is Germany,
     * handling accidental country selection rollbacks
     *
     */
    protected removeOrAddGridSettingView() {
        const location: Country = this.location?.isEqualToCustomerData ? this.customer.country : this.location?.country;
        const existingIndexOfView: number = this.views.indexOf(View.ConfigurationGridSetting);
        const indexOfViewToBeAdded: number = 9;

        if (location && location !== Country.GERMANY) {
            if (existingIndexOfView != -1) {
                // Remove ConfigurationGridSettingComponent.
                this.views.splice(existingIndexOfView, 1);
                this.gridSetting = null;
            }
            return;
        }

        if (existingIndexOfView === -1) {
            // Add ConfigurationGridSettingComponent.
            // This is valid only when installer accidentally selects a wrong country and comes back changes it to "Germany".
            this.views.splice(indexOfViewToBeAdded, 0, View.ConfigurationGridSetting);
        }
    }

    public abstract getEdge(index: number): Edge;
}
