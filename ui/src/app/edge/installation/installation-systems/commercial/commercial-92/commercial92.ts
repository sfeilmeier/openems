// @ts-strict-ignore

import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { JsonrpcResponseSuccess } from "src/app/shared/jsonrpc/base";
import { SetupProtocol, SubmitSetupProtocolRequest } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { ChannelAddress, Edge, EdgeConfig, Service, Websocket } from "src/app/shared/shared";
import { Country } from "src/app/shared/type/country";
import { AppCenterUtil } from "../../../shared/appcenterutil";
import { Category } from "../../../shared/category";
import { FeedInType, View } from "../../../shared/enums";
import { IbnUtils } from "../../../shared/ibn.utils";
import { ComponentData, SerialNumberFormData } from "../../../shared/ibndatatypes";
import { Meter } from "../../../shared/meter";
import { SystemId } from "../../../shared/system";
import { BaseMode, ComponentConfigurator, ConfigurationMode } from "../../../views/configuration-execute/component-configurator";
import { SafetyCountry } from "../../../views/configuration-execute/safety-country";
import { SchedulerIdBehaviour } from "../../abstract-ibn";
import { AbstractCommercialIbn } from "../abstract-commercial";

export type Commercial92App = {
    SAFETY_COUNTRY: SafetyCountry,
    FEED_IN_TYPE: FeedInType,
    MAX_FEED_IN_POWER?: number,
    BATTERY_TARGET: BatteryTarget,
};

export enum BatteryTarget {
    START = "START",
    AUTO = "AUTO",
}

export enum GridSetting {
    VDE_AR_N_4105 = "VDE-AR-N 4105",
    VDE_AR_N_4110 = "VDE-AR-N 4110",
}

export class Commercial92Ibn extends AbstractCommercialIbn {

    public override WAIT_FOR_BATTERY_SERIAL_NUMBERS = 8 * 60 * 1000;

    public override readonly id: SystemId = SystemId.COMMERCIAL_92;
    public override showViewCount: boolean = true;
    public override readonly defaultNumberOfModules = 15;
    public override readonly minNumberOfTowers: number = 2;
    public override readonly maxFeedInLimit: number = 6000000;
    public override readonly showNote: boolean = true;
    public batteryStartStopTarget: BatteryTarget = BatteryTarget.START;
    public gridSetting: GridSetting;

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
    } = {
            changeNetworkSettings: false,
            connectInverter: false,
            enterPassword: false,
            ipAddress: [false, false, false],
            minVoltage: false,
            multiStepField: [false, false, false, false, false, false, false, false],
            powerControl: false,
            startConfiguration: false,
        };

    private appId: string = "App.FENECON.Commercial.92";

    constructor(translate: TranslateService) {
        super([
            View.PreInstallation,
            View.PreInstallationUpdate,
            View.ConfigurationSystem,
            View.ConfigurationSubSystem,
            View.ProtocolInstaller,
            View.ProtocolCustomer,
            View.ProtocolSystem,
            View.ConfigurationLineSideMeterFuse,
            View.ProtocolFeedInLimitation,
            View.ConfigurationGridSetting,
            View.ConfigurationSummary,
            View.ConfigurationExecute,
            View.ProtocolSerialNumbers,
            View.ProtocolChecklist,
            View.Completion,
        ], translate);
    }

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

    public override fillSerialNumberForms(
        numberOfTowers: number,
        numberOfModulesPerTower: number,
        models: any,
        forms: SerialNumberFormData[]) {
        this.numberOfModulesPerTower = numberOfModulesPerTower;
        for (let i = 0; i < numberOfTowers; i++) {
            forms[i] = {
                fieldSettings: this.getSerialNumberFields(i, numberOfModulesPerTower),
                model: models[i],
                formTower: new FormGroup({}),
                header: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_TOWER", { number: i + 1 }),
            };
        }
        return forms;
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

    public override getSerialNumberFields(towerNr: number, numberOfModulesPerTower: number) {
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

    public override getComponentConfigurator(edge: Edge, config: EdgeConfig, websocket: Websocket, service?: Service): ComponentConfigurator {

        const componentConfigurator: ComponentConfigurator =
            new ComponentConfigurator(edge, config, websocket);

        // Determine safety country
        const safetyCountry: SafetyCountry = this.location.isEqualToCustomerData
            ? SafetyCountry.getSafetyCountry(this.customer.country)
            : SafetyCountry.getSafetyCountry(this.location.country);

        // system not updated => newest appManager not available
        const isAppManagerAvailable: boolean = AppCenterUtil.isAppManagerAvailable(edge);
        const baseMode: BaseMode = isAppManagerAvailable ? BaseMode.AppManager : BaseMode.UI;
        if (isAppManagerAvailable) {
            const appProperties: Commercial92App = {
                SAFETY_COUNTRY: safetyCountry,
                FEED_IN_TYPE: this.feedInLimitation.feedInType,
                ...(this.feedInLimitation.feedInType === FeedInType.DYNAMIC_LIMITATION && { MAX_FEED_IN_POWER: this.feedInLimitation.maximumFeedInPower }),
                BATTERY_TARGET: this.batteryStartStopTarget,
            };

            componentConfigurator.addInstallAppCallback(() => {
                return AppCenterUtil.createOrUpdateApp(edge, websocket, this.appId, "commercial-92", appProperties, AppCenterUtil.keyForIntegratedSystems());
            });
        }

        // modbus0
        componentConfigurator.add({
            factoryId: "Bridge.Modbus.Serial",
            componentId: "modbus0",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.COMMUNICATION_WITH_BATTERY"),
            properties: [
                { name: "enabled", value: true },
                { name: "portName", value: "/dev/busUSB1" },
                { name: "baudRate", value: 19200 },
                { name: "databits", value: 8 },
                { name: "stopbits", value: "ONE" },
                { name: "parity", value: "NONE" },
                { name: "logVerbosity", value: "NONE" },
                { name: "invalidateElementsAfterReadErrors", value: 1 },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        // Add ip address to network configuration
        if (!IbnUtils.addIpAddress("eth1", "172.16.0.99/24", edge, websocket)) {
            service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.IP_ADDRESS_ERROR", { system: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.BATTERY_INVERTER") })
                , "danger");
        }

        // modbus1
        componentConfigurator.add({
            factoryId: "Bridge.Modbus.Tcp",
            componentId: "modbus1",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.COMMUNICATION_WITH_BATTERY_INVERTER"),
            properties: [
                { name: "enabled", value: true },
                { name: "ip", value: "172.16.0.100" },
                { name: "port", value: "502" },
                { name: "logVerbosity", value: "NONE" },
                { name: "invalidateElementsAfterReadErrors", value: 1 },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        // batteryInverter0
        componentConfigurator.add({
            factoryId: "Battery-Inverter.Kaco.BlueplanetGridsave",
            componentId: "batteryInverter0",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.BATTERY_INVERTER"),
            properties: [
                { name: "enabled", value: true },
                { name: "modbus.id", value: "modbus1" },
                { name: "startStop", value: "AUTO" },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        //modbus2
        componentConfigurator.add({
            factoryId: "Bridge.Modbus.Serial",
            componentId: "modbus2",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.COMMUNICATION_WITH_METER"),
            properties: [
                { name: "enabled", value: true },
                { name: "portName", value: "/dev/busUSB2" },
                { name: "baudRate", value: 9600 },
                { name: "databits", value: 8 },
                { name: "stopbits", value: "ONE" },
                { name: "parity", value: "NONE" },
                { name: "logVerbosity", value: "NONE" },
                { name: "invalidateElementsAfterReadErrors", value: 1 },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        // meter0
        componentConfigurator.add({
            factoryId: Meter.toFactoryId(this.lineSideMeterFuse.meterType),
            componentId: "meter0",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.GRID_METER"),
            properties: [
                { name: "enabled", value: true },
                { name: "modbus.id", value: "modbus2" },
                { name: "type", value: "GRID" },
                { name: "modbusUnitId", value: 5 },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        // io0
        componentConfigurator.add({
            factoryId: "IO.KMtronic",
            componentId: "io0",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.RELAY_BOARD"),
            properties: [
                { name: "enabled", value: true },
                { name: "modbus.id", value: "modbus0" },
                { name: "modbusUnitId", value: 2 },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        // battery0
        componentConfigurator.add({
            factoryId: "Battery.Fenecon.Home",
            componentId: "battery0",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.BATTERY"),
            properties: [
                { name: "enabled", value: true },
                { name: "startStop", value: this.batteryStartStopTarget },
                { name: "modbus.id", value: "modbus0" },
                { name: "modbusUnitId", value: 1 },
                { name: "batteryStartUpRelay", value: "io0/Relay4" },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        // ess0
        componentConfigurator.add({
            factoryId: "Ess.Generic.ManagedSymmetric",
            componentId: "ess0",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.STORAGE_SYSTEM"),
            properties: [
                { name: "enabled", value: true },
                { name: "startStop", value: "START" },
                { name: "batteryInverter.id", value: "batteryInverter0" },
                { name: "battery.id", value: "battery0" },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        // predictor0
        componentConfigurator.add({
            factoryId: "Predictor.PersistenceModel",
            componentId: "predictor0",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.PROGNOSIS"),
            properties: [
                { name: "enabled", value: true },
                {
                    name: "channelAddresses",
                    value: ["_sum/ProductionActivePower", "_sum/ConsumptionActivePower"],
                },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        // ctrlPrepareBatteryExtension
        componentConfigurator.add({
            factoryId: "Controller.Ess.PrepareBatteryExtension",
            componentId: "ctrlPrepareBatteryExtension0",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.PREPARE_BATTERY_EXTENSION"),
            properties: [
                { name: "enabled", value: true },
                { name: "ess.id", value: "ess0" },
                { name: "targetSoc", value: 30 },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        // ctrlGridOptimizedCharge0
        const gridOptimizedCharge = {
            factoryId: "Controller.Ess.GridOptimizedCharge",
            componentId: "ctrlGridOptimizedCharge0",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.GRID_OPTIMIZED_CHARGE"),
            properties: [
                { name: "enabled", value: true },
                { name: "ess.id", value: "ess0" },
                { name: "meter.id", value: "meter0" },
                { name: "delayChargeRiskLevel", value: "MEDIUM" },
                { name: "manualTargetTime", value: "17:00" },
                { name: "debugMode", value: false },
                { name: "sellToGridLimitRampPercentage", value: 2 },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        };

        this.feedInLimitation.feedInType == FeedInType.DYNAMIC_LIMITATION
            ? gridOptimizedCharge.properties.push(
                { name: "maximumSellToGridPower", value: this.feedInLimitation.maximumFeedInPower },
                { name: "sellToGridLimitEnabled", value: true },
                { name: "mode", value: "AUTOMATIC" },
            )
            :
            gridOptimizedCharge.properties.push(
                { name: "sellToGridLimitEnabled", value: false },
                { name: "mode", value: "OFF" },
            );

        componentConfigurator.add(gridOptimizedCharge);

        // ctrlBalancing0
        componentConfigurator.add({
            factoryId: "Controller.Symmetric.Balancing",
            componentId: "ctrlBalancing0",
            alias: this.translate.instant("INSTALLATION.CONFIGURATION_FEATURES_STORAGE_SYSTEM.BALANCING"),
            properties: [
                { name: "enabled", value: true },
                { name: "ess.id", value: "ess0" },
                { name: "meter.id", value: "meter0" },
                { name: "targetGridSetpoint", value: 0 },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
        });

        return componentConfigurator;
    }

    public setRequiredControllers() {
        this.requiredControllerIds = [];

        this.requiredControllerIds.push(
            {
                componentId: "ctrlPrepareBatteryExtension0",
                behaviour: SchedulerIdBehaviour.MANAGED_BY_APP_MANAGER,
            },
            {
                componentId: "ctrlGridOptimizedCharge0",
                behaviour: SchedulerIdBehaviour.MANAGED_BY_APP_MANAGER,
            },
            {
                componentId: "ctrlBalancing0",
                behaviour: SchedulerIdBehaviour.ALWAYS_INCLUDE,
            });
    }

    public override getSystemVariantFields(): FormlyFieldConfig[] {
        return [];
    }

    public override getSerialNumbersFromEdge(towerNr: number, edge: Edge, websocket: Websocket, numberOfModulesPerTower: number) {
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

        // Welcherister, BMS, Parallel box, EMS box
        const initialStaticTowerComponents: number = 4;

        // Subsequent towers will have only 2 static components. Paralell box and BMS box.
        const subsequentStaticTowerComponents: number = 2;
        const categoryElement: string = "INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_TOWER";

        super.addProtocolSerialNumbers(protocol, this.numberOfModulesPerTower, initialStaticTowerComponents, subsequentStaticTowerComponents, categoryElement);

        return new Promise((resolve, reject) => {
            websocket.sendRequest(SubmitSetupProtocolRequest.translateFrom(protocol, this.translate)).then((response: JsonrpcResponseSuccess) => {
                resolve(response.result["setupProtocolId"]);
            }).catch((reason) => {
                reject(reason);
            });
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
 * For `SystemType.FENECON_HOME` and `SystemType.HECKERT_HOME`, it checks the location:
 * - If the location is not Germany, it removes the `View.ConfigurationEssLimiter14aComponent` from the `views` array.
 * - If the location is Germany and the `View.ConfigurationEssLimiter14aComponent` is not already in the `views` array, it adds it at a specific index.
 */
    public override removeUpdateView(edge: Edge) {
        super.removeUpdateView(edge);

        const location: Country = this.location?.isEqualToCustomerData ? this.customer.country : this.location?.country;
        const existingIndexOfView: number = this.views.indexOf(View.ConfigurationGridSetting);
        const indexOfViewToBeAdded: number = 9;

        if (location && location !== Country.GERMANY) {
            if (existingIndexOfView != -1) {
                // Remove ConfigurationGridSettingComponent.
                this.views.splice(existingIndexOfView, 1);
                this.gridSetting = GridSetting.VDE_AR_N_4105; // reset to Default
            }
            return;
        }

        if (existingIndexOfView === -1) {
            // Add ConfigurationGridSettingComponent.
            // This is valid only when installer accidentally selects a wrong country and comes back changes it to "Germany".
            this.views.splice(indexOfViewToBeAdded, 0, View.ConfigurationGridSetting);
        }

    }

    protected override addCustombatteryInverterData(): ComponentData[] {
        const batteryInverterData: ComponentData[] = super.addCustombatteryInverterData();
        const safetyCountry = this.location.isEqualToCustomerData ? this.customer.country : this.location.country;

        if (safetyCountry === Country.GERMANY) {
            batteryInverterData.push({ label: this.translate.instant("INSTALLATION.CONFIGURATION_GRID_SETTING.TITLE"), value: this.gridSetting });
        }

        return batteryInverterData;

    }

    /**
     * Helper function to gather channel addresses
     */
    private getChannelAddresses(towerNr: number, numberOfModulesPerTower: number): { [key: string]: ChannelAddress } {
        const channelAddresses: { [key: string]: ChannelAddress } = {
            batteryInverter: new ChannelAddress("batteryInverter0", "S1Sn"),
            bmsBox: new ChannelAddress("battery0", `Tower${towerNr}BmsSerialNumber`),
        };
        for (let moduleNr = 0; moduleNr < numberOfModulesPerTower; moduleNr++) {
            channelAddresses[`module${moduleNr}`] = new ChannelAddress("battery0", `Tower${towerNr}Module${moduleNr}SerialNumber`);
        }
        return channelAddresses;
    }

    /**
     *
     * Processes current data.
     */
    private processCurrentData(
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
}
