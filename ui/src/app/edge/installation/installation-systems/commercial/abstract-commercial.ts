// @ts-strict-ignore
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { JsonrpcResponseSuccess } from "src/app/shared/jsonrpc/base";
import { SetupProtocol, SubmitSetupProtocolRequest } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { ChannelAddress, Edge, Service, Websocket } from "src/app/shared/shared";

import { Category } from "../../shared/category";
import { ExternalLimitationType, GridFeedInLimitationType, ModbusBridgeType } from "../../shared/enums";
import { IbnUtils } from "../../shared/ibn.utils";
import { ComponentData, EmsType } from "../../shared/ibndatatypes";
import { Meter } from "../../shared/meter";
import { System, SystemId, SystemType } from "../../shared/system";
import { WebLinks } from "../../shared/weblink.utils";
import { ComponentConfigurator, ConfigurationMode, ConfigurationObject, } from "../../views/configuration-execute/component-configurator";
import { AbstractIbn } from "../abstract-ibn";

export abstract class AbstractCommercialIbn extends AbstractIbn {
    private static readonly SELECTOR = "Commercial";

    public override readonly warrantyLink: WebLinks = WebLinks.WARRANTY_LINK_COMMERCIAL_50_GEN3;
    public override readonly systemType: SystemType = SystemType.COMMERCIAL;
    public override readonly showRundSteuerManual: boolean = false;
    public readonly minNumberOfTowers: number = 1;
    public modbusBridgeType: ModbusBridgeType;

    // configuration-emergency-reserve
    public override emergencyReserve? = {
        isEnabled: true,
        minValue: 15,
        value: 20,
        isReserveSocEnabled: false,
    };

    // protocol-dynamic-feed-in-limitation
    public override feedInLimitation? = {
        feedInType: ExternalLimitationType.NO_LIMITATION,
        dynamicLimitationType: GridFeedInLimitationType.NO_LIMITATION,
        maximumFeedInPower: 0,
    };

    // Protocol line side meter fuse
    public override lineSideMeterFuse?: {
        category: Category;
        fixedValue?: number;
        otherValue?: number;
        meterType: Meter.GridMeter;
    } = {
        category: Category.LINE_SIDE_METER_FUSE_COMMERCIAL,
        meterType: Meter.GridMeter.KDK,
    };

    /**
     * Returns the Modbus Serial bridge component.
     *
     * @param ioComponentId The component id of the component.
     * @param invalidateElementsAfterReadErrors The maximum read errors allowed.
     * @param alias The alias string
     * @returns The modbus serial Configuration Object.
     */
    private static getSerialModbusBridgeComponent(
        ioComponentId: string,
        invalidateElementsAfterReadErrors: number,
        alias: string,
    ): ConfigurationObject {
        return {
            factoryId: "Bridge.Modbus.Serial",
            componentId: ioComponentId,
            alias: alias,
            properties: [
                { name: "enabled", value: true },
                { name: "portName", value: "/dev/ttyAMA0" },
                { name: "baudRate", value: 9600 },
                { name: "databits", value: 8 },
                { name: "stopbits", value: "ONE" },
                { name: "parity", value: "NONE" },
                { name: "logVerbosity", value: "NONE" },
                { name: "invalidateElementsAfterReadErrors", value: invalidateElementsAfterReadErrors },
            ],
            mode: ConfigurationMode.RemoveAndConfigure,
        };
    }

    public override setFeedInLimitFields(model: any) {
        this.feedInLimitation.feedInType = model.feedInType;
    }

    public override getLineSideMeterFuseFields() {
        const fields: FormlyFieldConfig[] = [];

        fields.push({
            key: "otherValue",
            type: "input",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.VALUE"),
                type: "number",
                description: this.translate.instant(
                    "INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.FIXED_VALUE_DESCRIPTION",
                ),
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
                options: [Meter.GridMeter.SOCOMEC, Meter.GridMeter.KDK].map((meter) => ({
                    label: Meter.toGridMeterLabel(meter, this.systemId),
                    value: meter,
                })),
            },
            defaultValue: Meter.GridMeter.KDK,
        });
        return fields;
    }

    public getFeedInLimitFields() {
        return super.getExternalFeedInLimitsFields();
    }

    public override addSystemSpecificFields(tableData): void {
        const batteryData: ComponentData[] = this.addCustomBatteryData();

        tableData.push({
            header: Category.BATTERY,
            rows: batteryData,
        });

        const batteryInverterData: ComponentData[] = this.addCustombatteryInverterData();

        tableData.push({
            header: Category.INVERTER,
            rows: batteryInverterData,
        });
    }

    public override getSerialNumbersFromEdge(
        towerNr: number,
        edge: Edge,
        websocket: Websocket,
        numberOfModulesPerTower: number,
    ) {
        return new Promise((resolve) => {
            let isResolved = false;
            const channelAddresses: ChannelAddress[] = this.getChannels(towerNr, numberOfModulesPerTower);
            const subscriptionId = AbstractCommercialIbn.SELECTOR + "-tower" + towerNr;
            const model: {} = {};

            // Subject to stop the subscription to currentData
            const stopOnRequest: Subject<void> = new Subject<void>();

            // Read data
            edge.currentData
                .pipe(
                    takeUntil(stopOnRequest),
                    filter((currentData) => currentData != null),
                )
                .subscribe((currentData) => {
                    let anyNullorUndefined: boolean = false;

                    for (const [key, channelAddress] of Object.entries(channelAddresses)) {
                        const serialNumber: string = currentData.channel[channelAddress.toString()];

                        // If serial number is undefined or null, return
                        if (!serialNumber) {
                            anyNullorUndefined = true;
                            continue;
                        }

                        if (!this.addSerialNumbersToModel(key, model, serialNumber)) {
                            // unhandled parsing
                            // eg: battery module serial numbers are taken directly.
                            model[key] = serialNumber;
                        }
                    }

                    if (!anyNullorUndefined) {
                        // Resolve the promise
                        isResolved = true;
                        resolve(model);
                    }
                });

            // Edge-subscribe.
            // TODO for method in edge to read channels once.
            edge.subscribeChannelsWithState(websocket, subscriptionId, Object.values(channelAddresses));

            setTimeout(() => {
                // If data isn't available after the timeout, the
                // promise gets resolved with an empty object
                if (!isResolved) {
                    resolve(model);
                }

                // Unsubscribe to currentData and channels after timeout
                stopOnRequest.next();
                stopOnRequest.complete();
                edge.unsubscribeChannels(websocket, subscriptionId);
            }, 5000);
        });
    }

    public override populateFromData(ibnString: any) {
        // Configuration commercial modbus bridge
        if ("modbusBridgeType" in ibnString) {
            this.modbusBridgeType = ibnString.modbusBridgeType;
        }
    }

    public override getSubSystemFields(): FormlyFieldConfig[] {
        const emsType: EmsType = this.getEmsType();

        return System.getSubSystemFields(emsType, this.translate);
    }

    public override getSystemVariantFields(): FormlyFieldConfig[] {
        const label = [];
        const emsType: EmsType = this.getEmsType();

        switch (emsType) {
            case "feh013":
                label.push(
                    { value: SystemId.COMMERCIAL_92_WITHOUT_CLUSTER, label: SystemId.COMMERCIAL_92_WITHOUT_CLUSTER },
                    { value: SystemId.COMMERCIAL_50_GEN_3, label: SystemId.COMMERCIAL_50_GEN_3 },
                );
                break;
            case "fec013":
                label.push({ value: SystemId.COMMERCIAL_92_CLUSTER, label: SystemId.COMMERCIAL_92_CLUSTER });
                break;
            case null:
                label.push(
                    { value: SystemId.COMMERCIAL_30_ANSCHLUSS, label: SystemId.COMMERCIAL_30_ANSCHLUSS },
                    { value: SystemId.COMMERCIAL_30_NETZTRENNSTELLE, label: SystemId.COMMERCIAL_30_NETZTRENNSTELLE },
                    { value: SystemId.COMMERCIAL_50_GEN_1, label: SystemId.COMMERCIAL_50_GEN_1 },
                );
                break;
        }

        const fields: FormlyFieldConfig[] = [
            {
                key: "system",
                type: "radio",
                templateOptions: {
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_SYSTEM.PRODUCT_NAME"),
                    type: "radio",
                    options: label,
                    required: true,
                },
            },
        ];

        return fields;
    }

    public override getPreSettingInformationFromEdge(
        edge: Edge,
        websocket: Websocket,
    ): Promise<Array<{ numberOfTowers: number; numberOfModulesPerTower: number }>> {
        return new Promise((resolve) => {
            const channelAddresses: ChannelAddress[] = [
                new ChannelAddress("battery0", "NumberOfTowers"),
                new ChannelAddress("battery0", "NumberOfModulesPerTower"),
            ];
            let isResolved = false;

            // Edge-subscribe
            edge.subscribeChannelsWithState(websocket, "commercial", channelAddresses);

            // Subject to stop the subscription to currentData
            const stopOnRequest: Subject<void> = new Subject<void>();

            // Read tower and module numbers
            edge.currentData
                .pipe(
                    takeUntil(stopOnRequest),
                    filter((currentData) => currentData != null),
                )
                .subscribe((currentData) => {
                    const numberOfTowers = currentData.channel["battery0/NumberOfTowers"];
                    const numberOfModulesPerTower = currentData.channel["battery0/NumberOfModulesPerTower"];

                    // If values are available, resolve the promise with them
                    if (numberOfTowers && numberOfModulesPerTower) {
                        isResolved = true;
                        resolve([
                            {
                                // 10 is given as radix parameter.
                                // 2 = binary, 8 = octal, 10 = decimal, 16 = hexadecimal.
                                numberOfTowers: Number.parseInt(numberOfTowers, 10),
                                numberOfModulesPerTower: Number.parseInt(numberOfModulesPerTower, 10),
                            },
                        ]);
                    }
                });

            setTimeout(() => {
                // If data isn't available after the timeout, the
                // promise gets resolved with default values
                if (!isResolved) {
                    resolve([
                        {
                            numberOfTowers: this.minNumberOfTowers,
                            numberOfModulesPerTower: this.defaultNumberOfModules,
                        },
                    ]);
                }

                // Unsubscribe to currentData and channels after timeout
                stopOnRequest.next();
                stopOnRequest.complete();
                edge.unsubscribeFromChannels("commercial", websocket, channelAddresses);
            }, 5000);
        });
    }

    public override getProtocol(edge: Edge, websocket: Websocket): Promise<string> {
        const protocol: SetupProtocol = super.getCommonProtocolItems(edge);

        return new Promise((resolve, reject) => {
            websocket
                .sendStateFullRequest(SubmitSetupProtocolRequest.translateFrom(protocol, this.translate))
                .then((response: JsonrpcResponseSuccess) => {
                    resolve(response.result["setupProtocolId"]);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    public override getSerialNumberCategoryHeader(towerIndex: number, slaveIndex: number): string {
        const slaveNr: number = slaveIndex + 1;
        const towerNr: number = towerIndex + 1;
        return this.serialNumbers.numberOfTowers[slaveNr] === 1
            ? this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BESS_COMPONENTS")
            : this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_STRING", { stringNumber: towerNr });
    }

    /**
     * Adds the Modbus bridge and IO component.
     *
     * Adds modbus0 and io0 if RTU is selected. otherwise modbus0, modbus3, io0 is added.
     *
     * @param modbusBridgeType Modbus bridge type (TCP or RS485).
     * @param invalidateElementsAfterReadErrors The maximum read errors allowed.
     * @param alias Alias for the component.
     * @param componentConfigurator Configuration object.
     * @returns Configuration object with modbus bridge components added.
     */
    public addModbusBridgeAndIoComponents(
        modbusBridgeType: ModbusBridgeType,
        invalidateElementsAfterReadErrors: number,
        alias: string,
        componentConfigurator: ComponentConfigurator,
        edge: Edge,
        websocket: Websocket,
        service: Service,
    ): ComponentConfigurator {
        let ioComponentId: string;

        switch (modbusBridgeType) {
            case ModbusBridgeType.TCP_IP:
                // modbus0
                componentConfigurator.add({
                    factoryId: "Bridge.Modbus.Tcp",
                    componentId: "modbus0",
                    alias: alias,
                    properties: [
                        { name: "enabled", value: true },
                        { name: "ip", value: "192.168.0.7" },
                        { name: "port", value: "20108" },
                        { name: "logVerbosity", value: "NONE" },
                        { name: "invalidateElementsAfterReadErrors", value: invalidateElementsAfterReadErrors },
                    ],
                    mode: ConfigurationMode.RemoveAndConfigure,
                });

                // Add ip address to network configuration
                if (!IbnUtils.addIpAddress("eth1", "192.168.0.9/24", edge, websocket)) {
                    service.toast(
                        this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.IP_ADDRESS_ERROR", {
                            system: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.BATTERY"),
                        }),
                        "danger",
                    );
                }

                ioComponentId = "modbus3"; // To communicate with io.

                // modbus3
                componentConfigurator.add(
                    AbstractCommercialIbn.getSerialModbusBridgeComponent(
                        ioComponentId,
                        invalidateElementsAfterReadErrors,
                        this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.COMMUNICATION_WITH_RELAY"),
                    ),
                );
                break;

            case ModbusBridgeType.RS485:
                ioComponentId = "modbus0"; // To communicate with battery and io.

                // modbus0
                componentConfigurator.add(
                    AbstractCommercialIbn.getSerialModbusBridgeComponent(
                        ioComponentId,
                        invalidateElementsAfterReadErrors,
                        alias,
                    ),
                );
                break;
        }

        // io0
        componentConfigurator.add(
            {
                factoryId: "IO.KMtronic",
                componentId: "io0",
                alias: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.RELAY_BOARD"),
                properties: [
                    { name: "enabled", value: true },
                    { name: "modbus.id", value: ioComponentId },
                    { name: "modbusUnitId", value: 6 },
                ],
                mode: ConfigurationMode.RemoveAndConfigure,
            },
            3,
        );

        return componentConfigurator;
    }

    public override dynamicFeedInLimitationOptions(): ComponentData[] {
        return [
            {
                label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.DYNAMIC_LIMITATION"),
                value: GridFeedInLimitationType.DYNAMIC_LIMITATION,
            },
            {
                label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.NO_LIMITATION"),
                value: GridFeedInLimitationType.NO_LIMITATION,
            },
        ];
    }

    /**
     * Returns the channel addresses for reading serial numbers of the system.
     *
     * @param towerNr Number of towers.
     * @param numberOfModulesPerTower Number of modules per tower.
     * @returns The channel addresses.
     */
    protected getChannels(towerNr: number, numberOfModulesPerTower: number): ChannelAddress[] {
        const channelAddresses: ChannelAddress[] = [];
        channelAddresses["bmsBoxMaster"] = new ChannelAddress("battery0", "MasterSerialNumber");

        for (let moduleNr = 0; moduleNr < numberOfModulesPerTower; moduleNr++) {
            channelAddresses["module" + moduleNr] = new ChannelAddress(
                "battery0",
                "Tower" + towerNr + "Module" + moduleNr + "SerialNumber",
            );
        }

        return channelAddresses;
    }

    /**
     * Adds serial numbers to the model.
     *
     * Returns true if adding serial numbers to the model was successful. If not, returns false.
     *
     * @param key The channel address
     * @param model The model.
     * @param serialNumber The serial number from the channel.
     */
    protected addSerialNumbersToModel(key: string, model: {}, serialNumber: string): boolean {
        if (key.startsWith("bmsBox")) {
            // BMS master.
            model[key] = serialNumber.substring(14);
            return true;
        }
        return false;
    }

    protected addCustombatteryInverterData(): ComponentData[] {
        const batteryInverterData: ComponentData[] = [];
        const feedInType = this.feedInLimitation.feedInType;
        const isExternalLimitataion = feedInType === ExternalLimitationType.EXTERNAL_LIMITATION;
        const isDynamicFeedInLimitation =
            this.feedInLimitation.dynamicLimitationType === GridFeedInLimitationType.DYNAMIC_LIMITATION;

        if (isExternalLimitataion) {
            batteryInverterData.push({
                label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.EXTERNAL_LIMITATION_TYPE"),
                value: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.EXTERNAL_LIMITATION"),
            });
        }

        batteryInverterData.push({
            label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.DYNAMIC_LIMITATION_TYPE"),
            value: isDynamicFeedInLimitation
                ? this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.DYNAMIC_LIMITATION")
                : this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.NO_LIMITATION"),
        });

        if (isDynamicFeedInLimitation) {
            batteryInverterData.push({
                label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.MAXIMUM_FEED_IN_VALUE"),
                value: this.feedInLimitation.maximumFeedInPower,
            });
        }

        const safetyCountry = this.location.isEqualToCustomerData ? this.customer.country : this.location.country;
        batteryInverterData.push({
            label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.COUNTRY_SETTING"),
            value: IbnUtils.getCountryLabel(safetyCountry, this.translate),
        });

        return batteryInverterData;
    }
}
