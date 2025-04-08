// @ts-strict-ignore
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { filter, Subject, takeUntil } from "rxjs";
import { SumState } from "src/app/index/shared/sumState";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { ChannelAddress, Edge, EdgeConfig, Service, Websocket } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";
import { AppCenterUtil } from "../../../shared/appcenterutil";
import { Category } from "../../../shared/category";
import { CommercialCluster, FeedInType, View } from "../../../shared/enums";
import { SystemId } from "../../../shared/system";
import { BaseMode, ComponentConfigurator, ConfigurationMode, ConfigurationObject } from "../../../views/configuration-execute/component-configurator";
import { GetEstimatedConfigRequest } from "../../../views/configuration-execute/jsonrpc/getEstimatedConfig";
import { GetEstimatedConfigResponse } from "../../../views/configuration-execute/jsonrpc/getEstimatedConfigResponse";
import { SafetyCountry } from "../../../views/configuration-execute/safety-country";
import { AbstractCommercial92Ibn } from "./abstract-commercial92";

export class Commercial92ClusterIbn extends AbstractCommercial92Ibn {

    public override readonly systemId: SystemId = SystemId.COMMERCIAL_92_CLUSTER;
    public override isClusterConfiguration: boolean = true;
    public slaveEdges = [];
    public emsBoxSerialNumbers: string[] = [];

    constructor(translate: TranslateService) {
        super([
            View.PreInstallation,
            View.PreInstallationUpdate,
            View.ConfigurationSystem,
            View.ProtocolInstaller,
            View.ProtocolCustomer,
            View.ProtocolSystem,
            View.ConfigurationLineSideMeterFuse,
            View.ProtocolFeedInLimitation,
            View.ProtocolCommercialClusterSlaveCount,
            View.ConfigurationSummary,
            View.ConfigurationExecute,
            View.ProtocolCommercialClusterSlaveInstallation,
            View.ProtocolChecklist,
            View.ProtocolSerialNumbers,
            View.Completion,
        ], translate);
    }

    public override removeOrAddView(edge: Edge): void {
        super.removeOrAddView(edge);
        this.removeOrAddEssLimiter14aView();
        this.removeOrAddGridSettingView();
    }

    public override async getComponentConfigurator(edge: Edge, config: EdgeConfig, websocket: Websocket, service?: Service, cluster?: CommercialCluster): Promise<ComponentConfigurator> {
        const componentConfigurator: ComponentConfigurator =
            new ComponentConfigurator(edge, config, websocket);

        // Determine safety country
        const safetyCountry: SafetyCountry = this.location.isEqualToCustomerData
            ? SafetyCountry.getSafetyCountry(this.customer.country)
            : SafetyCountry.getSafetyCountry(this.location.country);

        // system not updated => newest appManager not available
        let appProperties: {} = {
            NUMBER_OF_SLAVES: this.numberOfSlaves,
            SAFETY_COUNTRY: safetyCountry,
            FEED_IN_TYPE: this.feedInLimitation.feedInType,
            ...(this.feedInLimitation.feedInType === FeedInType.DYNAMIC_LIMITATION && { MAX_FEED_IN_POWER: this.feedInLimitation.maximumFeedInPower }),
            // HAS_ESS_LIMITER_14A: this.isController14aActivated,
        };
        let appId: string = "App.FENECON.Commercial.92.ClusterMaster";
        let alias: string = "commercial-92-cluster-master";

        if (cluster && cluster == CommercialCluster.SLAVE) {
            appProperties = {
                BATTERY_TARGET: this.batteryStartStopTarget,
            };

            appId = "App.FENECON.Commercial.92.ClusterSlave";
            alias = "commercial-92-cluster-slave";
        }

        // system not updated => newest appManager not available
        const baseMode = AppCenterUtil.isAppManagerAvailable(edge) ? BaseMode.AppManager : BaseMode.UI;

        componentConfigurator.addInstallAppCallback(() => {
            return AppCenterUtil.createOrUpdateApp(edge, websocket, appId, alias, appProperties, AppCenterUtil.keyForIntegratedSystems());
        });

        // Send request and process components
        const estimatedConfig: GetEstimatedConfigResponse = await edge.sendRequest(
            websocket,
            new ComponentJsonApiRequest({
                componentId: "_appManager",
                payload: new GetEstimatedConfigRequest({
                    appId: appId,
                    alias: alias,
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

    public override getEdge(index: number): Edge {
        const edge = this.slaveEdges[index];

        return new Edge(
            edge.id, edge.comment, edge.producttype, edge.version,
            Role.INSTALLER, edge.online, null, SumState.OK, null
        );
    }

    public override getSerialNumberCategoryHeader(slaveNr: number, towerNr: number): string {
        return this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_TOWER_CLUSTER", { batteryNumber: slaveNr, towerNumber: towerNr + 1 });
    }

    public override getSerialNumberFields(towerNr: number, numberOfModulesPerTower: number, slaveNr: number) {
        const fields: FormlyFieldConfig[] = [];

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
                    defaultValue: this.emsBoxSerialNumbers[slaveNr - 1],
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


    /**
     * Restricts the reading of serial numbers to specific towers configured.
     */
    public override readSerialNumbersFromRegisters(edge: Edge, websocket: Websocket, numberOfTowers: number, numberOfModulesPerTower: number, slaveNr: number): Promise<{}>[] {

        const result: Promise<{}>[] = [];
        // Only process towers for the given slaveNr
        for (let tower = 0; tower < numberOfTowers; tower++) {
            result.push(this.getSerialNumbersFromEdge(tower, edge, websocket, numberOfModulesPerTower, slaveNr));
        }
        return result;
    }

    public override getSerialNumbersFromEdge(towerNr: number, edge: Edge, websocket: Websocket, numberOfModulesPerTower: number, slaveNr: number) {
        return new Promise((resolve) => {
            const subscriptionId = `Commercial-battery${slaveNr}-tower${towerNr}`;
            const serialNumbers: { [key: string]: string } = {};
            const channelAddresses = this.getChannelAddresses(towerNr, numberOfModulesPerTower, slaveNr);

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

    /**
     * Helper function to gather channel addresses
     */
    public override getChannelAddresses(towerNr: number, numberOfModulesPerTower: number, slaveNr: number): { [key: string]: ChannelAddress } {
        const channelAddresses: { [key: string]: ChannelAddress } = {};

        channelAddresses["batteryInverter"] = new ChannelAddress(`batteryInverter${slaveNr}`, "S1Sn");
        channelAddresses["bmsBox"] = new ChannelAddress(`battery${slaveNr}`, `Tower${towerNr}BmsSerialNumber`);

        for (let moduleNr = 0; moduleNr < numberOfModulesPerTower; moduleNr++) {
            channelAddresses[`module${moduleNr}`] = new ChannelAddress(`battery${slaveNr}`, `Tower${towerNr}Module${moduleNr}SerialNumber`);
        }

        return channelAddresses;
    }

    public override setNonAbstractFields(ibnString: any) {

        super.setNonAbstractFields(ibnString);

        this.slaveEdges = ibnString.slaveEdges;
        this.numberOfSlaves = ibnString.numberOfSlaves;
        this.emsBoxSerialNumbers = ibnString.emsBoxSerialNumbers;
    }

    public override getPreSettingInformationFromEdge(edge: Edge, websocket: Websocket):
        Promise<Array<{ numberOfTowers: number; numberOfModulesPerTower: number }>> {
        return new Promise((resolve) => {
            const channelAddresses: ChannelAddress[] = [];

            for (let i = 1; i <= this.numberOfSlaves; i++) {
                channelAddresses.push(new ChannelAddress(`battery${i}`, "NumberOfTowers"));
                channelAddresses.push(new ChannelAddress(`battery${i}`, "NumberOfModulesPerTower"));
            }

            let isResolved = false;

            // Edge-subscribe
            edge.subscribeChannels(websocket, "commercial", channelAddresses);

            // Subject to stop the subscription to currentData
            const stopOnRequest: Subject<void> = new Subject<void>();

            // Read tower and module numbers
            edge.currentData
                .pipe(
                    takeUntil(stopOnRequest),
                    filter(currentData => currentData != null))
                .subscribe((currentData) => {
                    // Initialize result as empty array
                    const result: Array<{ numberOfTowers: number; numberOfModulesPerTower: number }> = [];

                    for (let i = 1; i <= this.numberOfSlaves; i++) {
                        const numberOfTowers = currentData.channel[`battery${i}/NumberOfTowers`];
                        const numberOfModulesPerTower = currentData.channel[`battery${i}/NumberOfModulesPerTower`];

                        result.push({
                            numberOfTowers: parseInt(numberOfTowers, 10),
                            numberOfModulesPerTower: parseInt(numberOfModulesPerTower, 10),
                        });
                    }

                    const valid = result.every((setting) => setting.numberOfTowers && setting.numberOfModulesPerTower);

                    // If values are available, resolve the promise with them
                    if (valid) {
                        isResolved = true;
                        resolve(result);
                    }
                });

            setTimeout(() => {
                // If data isn't available after the timeout, the
                // promise gets resolved with default values
                if (!isResolved) {
                    // Initialize result as empty array
                    const result: Array<{ numberOfTowers: number; numberOfModulesPerTower: number }> = [];
                    for (let i = 1; i <= this.numberOfSlaves; i++) {
                        result.push({ numberOfTowers: this.minNumberOfTowers, numberOfModulesPerTower: this.defaultNumberOfModules });
                    }
                    resolve(result);
                }

                // Unsubscribe to currentData and channels after timeout
                stopOnRequest.next();
                stopOnRequest.complete();
                edge.unsubscribeFromChannels(websocket, channelAddresses);
            }, 5000);
        });
    }
}
