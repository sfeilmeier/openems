import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { filter, Subject, takeUntil } from "rxjs";
import { v4 as uuidv4 } from "uuid";

import { SetupProtocol } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { ChannelAddress, Edge, Websocket } from "src/app/shared/shared";
import { environment } from "src/environments";
import { Category } from "../../../shared/category";
import { ConnectedBatterySystems, FeedInSetting, View } from "../../../shared/enums";
import { ComponentData, ExtensionBoxPrefix } from "../../../shared/ibndatatypes";
import { SystemId } from "../../../shared/system";
import { WebLinks } from "../../../shared/weblink.utils";
import { SafetyCountry } from "../../../views/configuration-execute/safety-country";
import { BatteryTowerSettings } from "../../abstract-ibn";
import { AbstractCommercialGen3, CommercialGen3App, GensetProperties } from "../abstract-commercial-gen3";

type Commercial100AppProperties = CommercialGen3App &
    GensetProperties & {
        CONNECTED_BATTERY_SYSTEMS: ConnectedBatterySystems;
    };

export class Commercial100Ibn extends AbstractCommercialGen3 {
    /**
     * The GoodWe battery inverter currently only supports a single connected battery input on the Edge side (the second
     * battery port is not yet functional there). The ConfigurationBatteryInputs view, its texts and the battery-input
     * model are intentionally kept so the feature can be re-enabled by flipping this flag once the Edge supports it -
     * until then the second-input option is neither displayed nor applied.
     */
    public static readonly IS_SECOND_BATTERY_INPUT_SUPPORTED: boolean = true;

    private static readonly VIEWS = [
        View.PreInstallation,
        View.PreInstallationUpdate,
        View.ConfigurationSystem,
        View.ConfigurationSubSystem,
        View.ConfigurationBatteryInputs,
        View.ProtocolInstaller,
        View.ProtocolCustomer,
        View.ProtocolSystem,
        View.ProtocolSystemLocation,
        View.ConfigurationEssLimiter14aComponent,
        View.ConfigurationEnergyFlowMeter,
        View.ConfigurationLineSideMeterFuse,
        View.ConfigurationMpptSelection,
        View.ProtocolPv,
        View.ConfigurationStsBox,
        View.ConfigurationGridSetting,
        View.ProtocolFeedInLimitation,
        View.ConfigurationSummary,
        View.ConfigurationExecute,
        View.ProtocolSerialNumbers,
        View.Alerting,
        View.Completion,
    ];
    private static readonly MAX_MPPT = 8;

    public override warrantyLink = WebLinks.WARRANTY_LINK_COMMERCIAL_100;
    public override readonly systemId: SystemId = SystemId.COMMERCIAL_100;
    public override systemAppId: string = "App.FENECON.Commercial.100";
    public override appAlias: string = "FENECON Commercial 100";

    /** Battery-input selection captured in the ConfigurationBatteryInputs view. */
    public batteryInputs: { hasBatteryInput1: boolean; hasBatteryInput2: boolean } = {
        hasBatteryInput1: true,
        hasBatteryInput2: false,
    };

    protected override readonly mpptImagePaths = environment.links.DOWNLOAD.INSTALLATION.COMMERCIAL.COMMERCIAL_100.MPPT;

    constructor(translate: TranslateService) {
        super(Commercial100Ibn.VIEWS, Commercial100Ibn.MAX_MPPT, translate);
    }

    /** Number of active battery inputs */
    public get numberOfBatteryInputs(): number {
        if (!Commercial100Ibn.IS_SECOND_BATTERY_INPUT_SUPPORTED) {
            return 1;
        }

        const count = (this.batteryInputs.hasBatteryInput1 ? 1 : 0) + (this.batteryInputs.hasBatteryInput2 ? 1 : 0);
        return Math.max(count, 1);
    }

    /**
     * Extends the standard pre-settings fields with a read-only display of the number of active battery inputs (derived
     * from the ConfigurationBatteryInputs step).
     */
    public override getPreSettingsFields(numberOfModulesPerTower: number, numberOfTowers: number): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = [
            {
                key: "numberOfBatteryInputs",
                type: "input",
                templateOptions: {
                    type: "number",
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_BATTERY_INPUTS.NUMBER_OF_BATTERY_INPUTS"),
                    readonly: true,
                },
                defaultValue: this.numberOfBatteryInputs,
            },
            ...super.getPreSettingsFields(numberOfModulesPerTower, numberOfTowers),
        ];

        return fields;
    }

    /**
     * Returns "Battery N Tower M" headers so every (battery-input × tower) combination gets a distinct serial-number
     * form section.
     */
    public override getSerialNumberCategoryHeader(towerIndex: number, batteryIndex?: number): string {
        return this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBER.BATTERY_INPUT_TOWER", {
            batteryInput: (batteryIndex ?? 0) + 1,
            towerNumber: towerIndex + 1,
        });
    }

    /**
     * Replicates the single system-setup form model across all active battery inputs, yielding one entry per
     * (battery-input × set-of-towers).
     */
    public override expandBatteryFormModels(formModels: BatteryTowerSettings[]): BatteryTowerSettings[] {
        const [model] = formModels;
        return Array(this.numberOfBatteryInputs).fill({
            numberOfTowers: model.numberOfTowers,
            numberOfModulesPerTower: model.numberOfModulesPerTower,
        });
    }

    /**
     * Collapses the full (battery-input × tower) array back to a single form card, since all battery inputs share the
     * same tower/module configuration.
     */
    public override collapseToFormSettings(settings: BatteryTowerSettings[]): BatteryTowerSettings[] {
        return settings.length > 0 ? [settings[0]] : [];
    }

    public override populateFromData(ibnString: any) {
        super.populateFromData(ibnString);
        if (ibnString.batteryInputs !== undefined) {
            this.batteryInputs = ibnString.batteryInputs;
        }
    }

    public override getAppProperties(
        safetyCountry: SafetyCountry,
        feedInSetting: FeedInSetting,
    ): Commercial100AppProperties {
        return {
            ...super.getAppProperties(safetyCountry, feedInSetting),
            CONNECTED_BATTERY_SYSTEMS:
                this.numberOfBatteryInputs === 1 ? ConnectedBatterySystems.ONE : ConnectedBatterySystems.TWO,
        };
    }

    public override getSerialNumbersFromEdge(
        towerNr: number,
        edge: Edge,
        websocket: Websocket,
        numberOfModulesPerTower: number,
        batteryIndex?: number,
    ) {
        return new Promise((resolve) => {
            let isResolved = false;
            const channelAddresses: { [key: string]: ChannelAddress } = {};
            const subscriptionId = uuidv4();
            const model: { [key: string]: string } = {};

            // Each battery input has its own component id (battery1, battery2, ...).
            const batteryComponentId = Commercial100Ibn.IS_SECOND_BATTERY_INPUT_SUPPORTED
                ? "battery" + ((batteryIndex ?? 0) + 1)
                : "battery0";

            // Gather channel addresses
            channelAddresses["batteryInverter"] = new ChannelAddress("batteryInverter0", "SerialNumber");
            channelAddresses["bmsBox"] = new ChannelAddress(batteryComponentId, "Tower" + towerNr + "BmsSerialNumber");

            for (let moduleNr = 0; moduleNr < numberOfModulesPerTower; moduleNr++) {
                channelAddresses["module" + moduleNr] = new ChannelAddress(
                    batteryComponentId,
                    "Tower" + towerNr + "Module" + moduleNr + "SerialNumber",
                );
            }

            // Edge-subscribe
            edge.subscribeChannelsWithState(websocket, subscriptionId, Object.values(channelAddresses));

            // Subject to stop the subscription to currentData
            const stopOnRequest: Subject<void> = new Subject<void>();

            // Read data
            edge.currentData
                .pipe(
                    takeUntil(stopOnRequest),
                    filter((currentData) => currentData != null),
                )
                .subscribe((currentData) => {
                    let anyNullOrUndefined: boolean = false;
                    for (const key in channelAddresses) {
                        const channelAddress: ChannelAddress = channelAddresses[key];
                        const serialNumber: string = currentData.channel[channelAddress.toString()];

                        // If one serial number is undefined return
                        if (serialNumber === undefined || serialNumber === null) {
                            anyNullOrUndefined = true;
                            continue;
                        }

                        // Add serial Number
                        model[key] = serialNumber;
                    }

                    if (!anyNullOrUndefined) {
                        // Resolve the promise
                        isResolved = true;
                        resolve(model);
                    }
                });
            setTimeout(() => {
                if (!isResolved) {
                    resolve(model);
                }

                // Unsubscribe
                stopOnRequest.next();
                stopOnRequest.complete();
                edge.unsubscribeFromChannels(subscriptionId, websocket, Object.values(channelAddresses));
            }, 2_000);
        });
    }

    public override getPreSettingBatteryIds(): string[] {
        if (!Commercial100Ibn.IS_SECOND_BATTERY_INPUT_SUPPORTED) {
            return ["battery0"];
        }

        const batteryInputToId: [boolean, string][] = [
            [this.batteryInputs.hasBatteryInput1, "battery1"],
            [this.batteryInputs.hasBatteryInput2, "battery2"],
        ];

        return batteryInputToId.filter(([isActive]) => isActive === true).map(([, batteryId]) => batteryId);
    }

    public override addProtocolItems(protocol: SetupProtocol): void {
        super.addProtocolItems(protocol);
        protocol.items ??= [];

        protocol.items.push({
            category: Category.BATTERY,
            name: this.translate.instant("INSTALLATION.CONFIGURATION_BATTERY_INPUTS.NUMBER_OF_BATTERY_INPUTS"),
            value: this.numberOfBatteryInputs.toString(),
        });
    }

    public override addSystemSpecificFields(tableData: any): void {
        super.addSystemSpecificFields(tableData);

        const batteryInputData: ComponentData[] = [
            {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_BATTERY_INPUTS.NUMBER_OF_BATTERY_INPUTS"),
                value: this.numberOfBatteryInputs.toString(),
            },
        ];

        tableData.push({
            header: Category.BATTERY,
            rows: batteryInputData,
        });
    }

    /**
     * Commercial100 has its own tower-head layout because it has up to two independently wired battery inputs:
     *
     * - Battery 1's first tower is wired to the inverter and EMS box (like a regular single-battery system).
     * - Battery 2 (and any additional battery input) has no direct inverter/EMS wiring of its own; instead its first
     *   tower carries a battery communication box.
     * - Every tower after the first one (for either battery input) only adds an extension box, identical across battery
     *   inputs.
     */
    protected override getTowerHeadFields(towerNr: number, batteryIndex?: number): FormlyFieldConfig[] {
        const emsBoxSerialNumber: string | null =
            sessionStorage.getItem("emsBoxSerialNumber")?.slice(this.emsBoxPrefix?.length) ?? null;
        if (towerNr > 0) {
            return [
                {
                    key: "extensionBox",
                    type: "input",
                    templateOptions: {
                        label: "Extension Box",
                        required: true,
                        prefix: ExtensionBoxPrefix.FEE,
                        placeholder: "xxxxxxxxx",
                    },
                    validators: { validation: ["boxSerialNumber"] },
                    wrappers: ["input-serial-number"],
                },
            ];
        }

        const parallelBoxField: FormlyFieldConfig = {
            key: "parallelBox",
            type: "input",
            templateOptions: {
                label: "Parallel Box",
                required: true,
                prefix: this.parallelBoxPrefix,
                placeholder: "xxxxxxxxx",
            },
            validators: { validation: ["boxSerialNumber"] },
            wrappers: ["input-serial-number"],
        };

        // Battery 1 (default) is wired directly to the inverter and EMS box.
        if ((batteryIndex ?? 0) === 0) {
            return [
                {
                    key: "batteryInverter",
                    type: "input",
                    templateOptions: {
                        label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.INVERTER"),
                        required: true,
                        placeholder: "xxxxxxxxxxxxxxxx",
                    },
                    wrappers: ["input-serial-number"],
                },
                {
                    key: "emsBox",
                    type: "input",
                    templateOptions: {
                        label: Category.toTranslatedString(Category.EMS_BOX_LABEL_HOME, this.translate),
                        required: true,
                        prefix: this.emsBoxPrefix,
                        placeholder: "FEFxxxxxxx",
                    },
                    defaultValue: emsBoxSerialNumber,
                    validators: { validation: ["emsBoxSerialNumber"] },
                    wrappers: ["input-serial-number"],
                },
                parallelBoxField,
            ];
        }

        const batteryCommunicationBoxField: FormlyFieldConfig = {
            key: "batteryCommunicationBox",
            type: "input",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBER.BATTERY_COMMUNICATION_BOX"),
                required: true,
                prefix: ExtensionBoxPrefix.FCC,
                placeholder: "xxxxxxxxx",
            },
            validators: { validation: ["boxSerialNumber"] },
            wrappers: ["input-serial-number"],
        };

        // Additional battery inputs (battery2, ...) communicate via a battery communication box instead.
        return [batteryCommunicationBoxField, parallelBoxField];
    }
}
