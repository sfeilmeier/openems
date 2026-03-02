import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { JsonrpcResponseSuccess, SetupProtocolResponse } from "src/app/shared/jsonrpc/base";
import { SetupProtocol, SubmitSetupProtocolRequest } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { Edge, Websocket } from "src/app/shared/shared";
import { Country } from "src/app/shared/type/country";
import { environment } from "src/environments";
import { Category } from "../../shared/category";
import { ExternalLimitationType, FeedInSetting, GridSetting, View } from "../../shared/enums";
import { GridSettingUtils } from "../../shared/gridsetting.utils";
import { ComponentData, EmsType, ExtensionBoxPrefix } from "../../shared/ibndatatypes";
import { Meter } from "../../shared/meter";
import { EXTERNAL_LIMITATION_OPTIONS_WITH_IMAGES } from "../../shared/options";
import { System, SystemType } from "../../shared/system";
import { ViewUtils } from "../../shared/view.utils";
import { SafetyCountry } from "../../views/configuration-execute/safety-country";
import { AbstractHomeIbn } from "../home/abstract-home";

export type MpptConfig = {
    [K in `HAS_MPPT_${number}`]: boolean;
} & {
    [K in `ALIAS_MPPT_${number}`]?: string;
};

export type CommercialGen3App = {
    SAFETY_COUNTRY: SafetyCountry,
    GRID_CODE: string,
    FEED_IN_TYPE: ExternalLimitationType,
    MAX_FEED_IN_POWER?: number,
    FEED_IN_SETTING: string,
    HAS_EMERGENCY_RESERVE: boolean,
    EMERGENCY_RESERVE_ENABLED?: boolean,
    EMERGENCY_RESERVE_SOC?: number,
    SHADOW_MANAGEMENT_DISABLED?: boolean,
    HAS_ESS_LIMITER_14A: boolean,
    NA_PROTECTION_ENABLED: boolean,
    CT_RATIO_FIRST: number,
} & MpptConfig;

export abstract class AbstractCommercialGen3 extends AbstractHomeIbn {

    protected static readonly VIEWS = [
        View.PreInstallation,
        View.PreInstallationUpdate,
        View.ConfigurationSystem,
        View.ConfigurationSubSystem,
        View.ProtocolInstaller,
        View.ProtocolCustomer,
        View.ProtocolSystem,
        View.ProtocolSystemLocation,
        View.ConfigurationEssLimiter14aComponent,
        View.ConfigurationEnergyFlowMeter,
        View.ConfigurationMpptSelection,
        View.ProtocolPv,
        View.ConfigurationGridSetting,
        View.ProtocolFeedInLimitation,
        View.ConfigurationStsBox,
        View.ConfigurationSummary,
        View.ConfigurationExecute,
        View.ProtocolSerialNumbers,
        View.Alerting,
        View.Completion,
    ];

    public override readonly systemType: SystemType = SystemType.COMMERCIAL;
    public override readonly defaultNumberOfModules: number = 2;
    public override readonly minNumberOfTowers: number = 2;
    public override readonly maxNumberOfTowers: number = 5;
    public override readonly maxNumberOfModulesPerTower: number = 15;
    public override readonly minNumberOfModulesPerTower: number = 5;
    public override readonly maxNumberOfPvStrings: number = 8;
    public override readonly isDoubleSocketValid: boolean = true;
    public override readonly maxFeedInLimit: number = Number.MAX_VALUE;
    public gridSetting: GridSetting | null = null;

    public override readonly emsBoxLabel = Category.EMS_BOX_LABEL_HOME;
    public override defaultEnergyFlowMeter: Meter.GridMeterCategory = Meter.GridMeterCategory.COMMERCIAL_METER;
    public override readonly parallelBoxPrefix: string = ExtensionBoxPrefix.FCP;
    public override readonly emsBoxPrefix: string | null = "FEF";

    public override mppt: Record<string, boolean>;

    public override energyFlowMeter: {
        meter: Meter.GridMeterCategory;
        value?: number;
    } = {
        meter: Meter.GridMeterCategory.COMMERCIAL_METER,
    };

    // configuration-emergency-reserve
    public override emergencyReserve = {
        isStsBoxAvailable: false,
        isEnabled: false,
        minValue: 5,
        value: 20,
        isReserveSocEnabled: false,
        stsBoxSerialNumber: null as string | null,
    };

    protected abstract readonly baseImagePath: string;

    constructor(views: View[], public override readonly maxNumberOfMppt: number, translate: TranslateService) {
        super(views, translate);
        this.mppt = this.generateMpptFormModel();
    }

    public override getSerialNumberCategoryHeader(towerIndex: number): string {
        const towerNr: number = towerIndex + 1;
        return this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_TOWER", { number: towerNr });
    }

    public override getSerialNumberFields(towerNr: number, numberOfModulesPerTower: number, slaveIndex?: number): FormlyFieldConfig[] {

        const checkboxValue =
            slaveIndex !== undefined &&
                this.serialNumbers?.doubleSocket?.isEnabled?.[slaveIndex]?.[towerNr]
                ? true
                : false;

        const updateFn = (checked: boolean) => {
            if (
                slaveIndex !== undefined &&
                this.serialNumbers?.doubleSocket?.isEnabled?.[slaveIndex]
            ) {
                this.serialNumbers.doubleSocket.isEnabled[slaveIndex][towerNr] = checked;
            }
        };
        const headFields: FormlyFieldConfig[] = towerNr === 0
            ? [
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
                },
                {
                    key: "emsBox",
                    type: "input",
                    templateOptions: {
                        label: Category.toTranslatedString(Category.EMS_BOX_LABEL_HOME, this.translate),
                        required: true,
                        placeholder: "FEFxxxxxxx",
                    },
                    validators: { validation: ["emsBoxSerialNumber"] },
                    wrappers: ["input-serial-number"],
                },
            ]
            : [
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

        const bmsField: FormlyFieldConfig = {
            key: "bmsBox",
            type: "input",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BMS_BOX"),
                required: true,
                placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx",
                checkbox: {
                    value: checkboxValue,
                    label: this.serialNumbers?.doubleSocket?.label,
                    updateFn,
                },
            },
            validators: { validation: ["batteryAndBmsBoxSerialNumber"] },
            wrappers: ["input-serial-number"],
        };

        const moduleFields: FormlyFieldConfig[] = Array.from(
            { length: numberOfModulesPerTower },
            (_, moduleNr) => ({
                key: "module" + moduleNr,
                type: "input",
                templateOptions: {
                    label:
                        this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_MODULE") +
                        (moduleNr + 1),
                    required: true,
                    placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx",
                },
                validators: { validation: ["batteryAndBmsBoxSerialNumber"] },
                wrappers: ["input-serial-number"],
            })
        );

        return [...headFields, bmsField, ...moduleFields];
    }

    public override getEnergyFlowMeterFields() {
        const type: string = this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.STANDARD");

        return [
            {
                value: Meter.GridMeterCategory.COMMERCIAL_METER, //
                label: Meter.toGridMeterCategoryLabelString(Meter.GridMeterCategory.COMMERCIAL_METER, this.translate, type),
            },
        ];
    }

    public override setRequiredControllers() {
        this.requiredControllerIds = [];
    }

    public getMpptLabel(mppt: number) {
        return this.getTwoStringMpptLabel(mppt);
    }

    public getImageUrl(mppt: number): string {
        return `${this.baseImagePath}MPPT${mppt}.png`;
    }

    public override populateFromData(ibnString: any) {

        super.populateFromData(ibnString);

        this.isController14aActivated = ibnString.isController14aActivated;
        this.gridSetting = ibnString.gridSetting ?? null;
        this.emergencyReserve = ibnString.emergencyReserve;
    }

    public override removeOrAddView(edge: Edge): void {
        if (!this.location || !this.customer) {
            return;
        }

        const location: Country = this.location.isEqualToCustomerData ? this.customer.country : this.location.country;

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

    public override getProtocol(edge: Edge, websocket: Websocket): Promise<string> {
        const protocol: SetupProtocol = super.getCommonProtocolItems(edge);
        this.addProtocolItems(protocol);

        return new Promise((resolve, reject) => {
            websocket
                .sendStateFullRequest(SubmitSetupProtocolRequest.translateFrom(protocol, this.translate))
                .then((response: JsonrpcResponseSuccess) => {
                    const result = response.result as SetupProtocolResponse;
                    resolve(result.setupProtocolId);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    public override addCustomBatteryInverterData(): ComponentData[] {
        const batteryInverterData: ComponentData[] = super.addCustomBatteryInverterData();

        if (this.location && this.customer) {
            const safetyCountry = this.location.isEqualToCustomerData ? this.customer.country : this.location.country;
            if (safetyCountry === Country.GERMANY) {
                batteryInverterData.push({ label: this.translate.instant("INSTALLATION.CONFIGURATION_GRID_SETTING.TITLE"), value: this.gridSetting });
            }
        }

        batteryInverterData.push({
            label: this.translate.instant("INSTALLATION.CONFIGURATION_STS_BOX.STS_BOX_AVAILABLE"),
            value: this.emergencyReserve.isStsBoxAvailable ? this.translate.instant("GENERAL.YES") : this.translate.instant("GENERAL.NO"),
        });

        if (this.emergencyReserve.isStsBoxAvailable) {
            batteryInverterData.push({
                label: this.translate.instant("INSTALLATION.PROTOCOL_AVU_BOX.SERIAL_NUMBER"),
                value: this.emergencyReserve.stsBoxSerialNumber,
            });
        }

        return batteryInverterData;
    }

    public override getSubSystemFields(): FormlyFieldConfig[] {
        const emsType: EmsType = this.getEmsType();

        return System.getSubSystemFields(emsType, this.translate);
    }

    public override addProtocolItems(protocol: SetupProtocol) {
        super.addProtocolItems(protocol);

        const emergencyReserve = this.emergencyReserve;
        protocol.items ??= [];

        protocol.items.push({
            category: Category.STS_BOX,
            name: this.translate.instant("INSTALLATION.CONFIGURATION_STS_BOX.STS_BOX_AVAILABLE"),
            value: emergencyReserve.isStsBoxAvailable ? this.translate.instant("GENERAL.YES") : this.translate.instant("GENERAL.NO"),
        });

        if (emergencyReserve.isStsBoxAvailable) {

            protocol.items.push({
                category: Category.STS_BOX,
                name: this.translate.instant("INSTALLATION.PROTOCOL_AVU_BOX.SERIAL_NUMBER"),
                value: emergencyReserve.stsBoxSerialNumber ?? "",
            });
        }
    }

    public override getGridSettingOptions() {
        return [
            { label: GridSettingUtils.getDisplayName(GridSetting.VDE_4105), value: GridSetting.VDE_4105 },
        ];
    }

    public override getExternalLimitationTypeOptions(): ComponentData[] {
        const docLink = environment.links.MANUALS.RUNDSTEUER.COMMERCIAL_50_GEN_3;
        return EXTERNAL_LIMITATION_OPTIONS_WITH_IMAGES(this.translate, docLink);
    }

    public override getAppProperties(safetyCountry: SafetyCountry, feedInSetting: FeedInSetting): CommercialGen3App {

        return {
            ...this.commonProperties(safetyCountry, feedInSetting),
            FEED_IN_TYPE: this.feedInLimitation?.feedInType ?? ExternalLimitationType.NO_LIMITATION,
            GRID_CODE: this.gridSetting,
            CT_RATIO_FIRST: this.energyFlowMeter.value,
            ...this.generateMpptProperties(),
        } as CommercialGen3App;
    }

    protected generateMpptProperties(): Record<string, any> {
        const mpptProps: Record<string, any> = {};

        if (!this.pv || !this.pv.dc) {
            return mpptProps;
        }

        for (let i = 0; i < this.maxNumberOfMppt; i++) {
            const dc = this.pv.dc[i];

            if (!dc) {
                continue;
            }
            const mpptIndex = i + 1;

            // Sets HAS_MPPT_X
            mpptProps[`HAS_MPPT_${mpptIndex}`] = dc.isSelected;

            // Conditionally sets ALIAS_MPPT_X
            if (dc.isSelected) {
                mpptProps[`ALIAS_MPPT_${mpptIndex}`] = dc.alias;
            }
        }

        return mpptProps;
    }

    protected generateMpptFormModel(): Record<string, boolean> {
        const model: Record<string, boolean> = {};
        for (let i = 1; i <= this.maxNumberOfMppt; i++) {
            model[`mppt${i}`] = false;
        }
        return model;
    }

}
