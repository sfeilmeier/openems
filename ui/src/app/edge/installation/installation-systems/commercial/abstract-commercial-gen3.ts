import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { StrictFormlyFieldConfig, TypedFormlyFieldConfig } from "src/app/shared/components/formly/formly-utils";
import { JsonrpcResponseSuccess, SetupProtocolResponse } from "src/app/shared/jsonrpc/base";
import { SetupProtocol, SubmitSetupProtocolRequest } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { Edge, Websocket } from "src/app/shared/shared";
import { Country } from "src/app/shared/type/country";
import { StringUtils } from "src/app/shared/utils/string/string.utils";
import { environment } from "src/environments";
import { Category } from "../../shared/category";
import { ExternalLimitationType, FeedInSetting, GridSetting, View } from "../../shared/enums";
import { GridSettingUtils } from "../../shared/gridsetting.utils";
import { ComponentData, EmsType, ExtensionBoxPrefix } from "../../shared/ibndatatypes";
import { Meter } from "../../shared/meter";
import { EXTERNAL_LIMITATION_OPTIONS_WITH_IMAGES } from "../../shared/options";
import { System, SystemType } from "../../shared/system";
import { ViewUtils } from "../../shared/view.utils";
import { AdvancedGridSettingsModel, getDefaultAdvancedGridSettings, } from "../../views/configuration-advanced-grid-settings/advanced-grid-settings.model";
import { ConfigurationAdvancedSettingsComponent } from "../../views/configuration-advanced-grid-settings/configuration-advanced-grid-settings.component";
import { SafetyCountry } from "../../views/configuration-execute/safety-country";
import { EmergencyReserve } from "../abstract-ibn";
import { AbstractHomeIbn } from "../home/abstract-home";

export interface StsBox {
    isStsBoxAvailable: boolean;
    stsBoxSerialNumber: string | null;
}

export interface Genset {
    isEnabled: boolean;
    IS_GENSET_INSTALLED: boolean;
    GENSET_RATED_POWER: number | null;
    GENSET_PREHEATING_TIME: number | null;
    GENSET_RUN_TIME: number | null;
    GENSET_ENABLE_CHARGE: boolean;
    GENSET_MAX_POWER: number | null;
    GENSET_CHARGE_SOC_START: number | null;
    GENSET_CHARGE_SOC_END: number | null;
}

export type EmergencyModel = EmergencyReserve & StsBox & { genset: Genset };

export type MpptConfig = {
    [K in `HAS_MPPT_${number}`]: boolean;
} & {
    [K in `ALIAS_MPPT_${number}`]?: string;
};

export type CommercialGen3App = {
    SAFETY_COUNTRY: SafetyCountry;
    GRID_CODE: string;
    FEED_IN_TYPE: ExternalLimitationType;
    MAX_FEED_IN_POWER?: number;
    FEED_IN_SETTING: string;
    HAS_EMERGENCY_RESERVE: boolean;
    EMERGENCY_RESERVE_ENABLED?: boolean;
    EMERGENCY_RESERVE_SOC?: number;
    SHADOW_MANAGEMENT_DISABLED?: boolean;
    HAS_ESS_LIMITER_14A: boolean;
    NA_PROTECTION_ENABLED: boolean;
    CT_RATIO_FIRST: number;
} & MpptConfig;

export abstract class AbstractCommercialGen3 extends AbstractHomeIbn<EmergencyModel> {
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
    public advancedGridSettings: AdvancedGridSettingsModel = getDefaultAdvancedGridSettings();

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

    public override emergencyReserve: EmergencyModel = {
        isEnabled: false,
        minValue: 5,
        value: 20,
        isReserveSocEnabled: false,
        isStsBoxAvailable: false,
        stsBoxSerialNumber: null,
        genset: {
            isEnabled: false,
            IS_GENSET_INSTALLED: false,
            GENSET_RATED_POWER: 0,
            GENSET_PREHEATING_TIME: 10,
            GENSET_RUN_TIME: 0,
            GENSET_ENABLE_CHARGE: false,
            GENSET_MAX_POWER: 0,
            GENSET_CHARGE_SOC_START: 20,
            GENSET_CHARGE_SOC_END: 40,
        },
    };

    protected abstract readonly baseImagePath: string;

    constructor(
        views: View[],
        public override readonly maxNumberOfMppt: number,
        translate: TranslateService,
    ) {
        super(views, translate);
        this.mppt = this.generateMpptFormModel();
    }

    public override addSystemSpecificFields(tableData: any): void {
        super.addSystemSpecificFields(tableData);

        if (
            this.gridSetting !== null &&
            this.gridSetting === GridSetting.VDE_4110 &&
            !this.emergencyReserve.isStsBoxAvailable
        ) {
            tableData.push(
                ...ConfigurationAdvancedSettingsComponent.getCompletionSummaryFromAdvancedGridSettings(
                    this.translate,
                    this.advancedGridSettings,
                ),
            );
        }
    }

    public override getSerialNumberCategoryHeader(towerIndex: number): string {
        const towerNr: number = towerIndex + 1;
        return this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_TOWER", { number: towerNr });
    }

    public override getEnergyFlowMeterFields() {
        const type: string = this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.STANDARD");

        return [
            {
                value: Meter.GridMeterCategory.COMMERCIAL_METER,
                label: Meter.toGridMeterCategoryLabelString(
                    Meter.GridMeterCategory.COMMERCIAL_METER,
                    this.translate,
                    type,
                ),
            },
        ];
    }

    public override setRequiredControllers() {
        this.requiredControllerIds = [];
    }

    public override getEmergencyReserveFields(): TypedFormlyFieldConfig<EmergencyModel>[] {
        const fields = super.getEmergencyReserveFields();

        const valueField = fields.find((field) => field.key === "value");

        if (valueField != null && valueField.props != null) {
            valueField.props["info"] = this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.INFO");

            valueField.hooks = valueField.hooks || {};
            valueField.hooks.onInit = (field) => {
                field.formControl?.valueChanges.subscribe((newReserveValue: number | null | undefined) => {
                    const chargeStartCtrl = field.form?.get("genset.CHARGE_SOC_START");
                    if (newReserveValue != null) {
                        this.emergencyReserve.genset.GENSET_CHARGE_SOC_START = newReserveValue;
                        chargeStartCtrl?.patchValue(newReserveValue, {
                            emitEvent: false,
                        });
                    }
                });
            };
        }

        const commercialGensetFields: StrictFormlyFieldConfig<EmergencyModel>[] = [
            {
                key: "genset.isEnabled",
                type: "checkbox",
                templateOptions: {
                    label: this.translate.instant(
                        "INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.EMERGENCY_POWER_FUNCTION",
                    ),
                },
                expressions: {
                    "templateOptions.disabled": (field) => !field.model?.isStsBoxAvailable,
                    hide: (field) => !field.model?.isEnabled,
                },
                hooks: {
                    onInit: (field) => {
                        field.formControl!.valueChanges.subscribe((isChecked: boolean) => {
                            if (field.model) {
                                field.model.genset.IS_GENSET_INSTALLED = isChecked;
                            }
                        });
                    },
                },
            },
            {
                key: "genset.IS_GENSET_INSTALLED",
                type: "toggle",
                className: "genset-settings-toggle",
                templateOptions: {
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CONNECTED"),
                    required: true,
                },
                expressions: {
                    hide: (field) => !field.model?.genset.isEnabled,
                },
                hooks: {
                    onInit: (field) => {
                        field.formControl!.valueChanges.subscribe((isChecked: boolean) => {
                            if (field.model) {
                                field.model.genset.isEnabled = isChecked;
                            }

                            const control = field.form!.get("genset.isEnabled")!;
                            control.setValue(isChecked);
                        });
                    },
                },
            },
            {
                key: "genset.GENSET_RATED_POWER",
                type: "input",
                className: "genset-nested-field",
                templateOptions: {
                    type: "number",
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.POWER"),
                    unit: "W",
                    min: 0,
                    max: 50000,
                    description: "[0,50000] W",
                    required: true,
                },
                expressions: {
                    hide: (field) => !field.model?.genset.isEnabled,
                    "props.disabled": (field) => !field.model?.genset.IS_GENSET_INSTALLED,
                },
                wrappers: ["input-with-unit"],
            },
            {
                key: "genset.GENSET_PREHEATING_TIME",
                type: "input",
                className: "genset-nested-field",
                resetOnHide: true,
                templateOptions: {
                    type: "number",
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.PREHEAT_TIME"),
                    unit: "Sec",
                    min: 10,
                    max: 300,
                    description: "[10,300] sec",
                    required: true,
                },
                expressions: {
                    hide: (field) => !field.model?.genset.isEnabled,
                    "props.disabled": (field) => !field.model?.genset.IS_GENSET_INSTALLED,
                },
                wrappers: ["input-with-unit"],
            },
            {
                key: "genset.GENSET_RUN_TIME",
                type: "input",
                className: "genset-nested-field",
                resetOnHide: true,
                templateOptions: {
                    type: "number",
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.RUN_TIME"),
                    unit: "min",
                    min: 0,
                    max: 1440,
                    description: "[0,1440] min",
                    required: true,
                },
                expressions: {
                    hide: (field) => !field.model?.genset.isEnabled,
                    "props.disabled": (field) => !field.model?.genset.IS_GENSET_INSTALLED,
                },
                wrappers: ["input-with-unit"],
            },
            {
                key: "genset.GENSET_ENABLE_CHARGE",
                type: "toggle",
                className: "genset-settings-toggle",
                resetOnHide: true,
                templateOptions: {
                    label: this.translate.instant(
                        "INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.BATTERY_CHARGING",
                    ),
                },
                expressions: {
                    hide: (field) => !field.model?.genset.isEnabled,
                },
            },
            {
                key: "genset.GENSET_MAX_POWER",
                type: "input",
                className: "genset-nested-field",
                resetOnHide: true,
                templateOptions: {
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.MAX_POWER"),
                    type: "number",
                    unit: "%",
                    min: 1,
                    max: 100,
                    description: this.translate.instant(
                        "INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.MAX_POWER_DESCRIPTION",
                        { min: 1, max: 100 },
                    ),
                    required: true,
                },
                expressions: {
                    hide: (field) => !field.model?.genset.IS_GENSET_INSTALLED,
                    "props.disabled": (field) => !field.model?.genset.GENSET_ENABLE_CHARGE,
                },
                wrappers: ["input-with-unit"],
            },
            {
                key: "genset.GENSET_CHARGE_SOC_START",
                type: "input",
                className: "genset-nested-field",
                resetOnHide: true,
                props: {
                    label: this.translate.instant(
                        "INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_START",
                    ),
                    type: "number",
                    unit: "%",
                    max: 90,
                    required: true,
                },
                expressions: {
                    hide: (field) => !field.model?.genset.IS_GENSET_INSTALLED,
                    "props.description": (field) =>
                        `${this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_START_DESCRIPTION")} [${field.model?.value ?? 20},90] %`,
                    "props.disabled": (field) => !field.model?.genset.GENSET_ENABLE_CHARGE,
                    "props.min": (field) => field.model?.value ?? 20,
                },
                wrappers: ["input-with-unit"],
            },
            {
                key: "genset.GENSET_CHARGE_SOC_END",
                type: "input",
                className: "genset-nested-field",
                resetOnHide: true,
                templateOptions: {
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_END"),
                    type: "number",
                    unit: "%",
                    min: 40,
                    max: 95,
                    description:
                        this.translate.instant(
                            "INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_END_DESCRIPTION",
                        ) + " [40,95] %",
                    required: true,
                },
                expressions: {
                    hide: (field) => !field.model?.genset.IS_GENSET_INSTALLED,
                    "props.disabled": (field) => !field.model?.genset.GENSET_ENABLE_CHARGE,
                },
                wrappers: ["input-with-unit"],
            },
        ];

        fields.push(...commercialGensetFields);

        return fields;
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

        const gridSettingIndex = this.views.indexOf(View.ConfigurationGridSetting);
        const advancedSettingsIndex = gridSettingIndex !== -1 ? gridSettingIndex + 1 : 10;

        if (
            this.gridSetting !== null &&
            this.gridSetting === GridSetting.VDE_4110 &&
            !this.emergencyReserve.isStsBoxAvailable
        ) {
            ViewUtils.add(this.views, View.ConfigurationAdvancedGridSettings, advancedSettingsIndex);
        } else {
            ViewUtils.remove(this.views, View.ConfigurationAdvancedGridSettings);
        }
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
                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_GRID_SETTING.TITLE"),
                    value: this.gridSetting,
                });
            }
        }

        batteryInverterData.push({
            label: this.translate.instant("INSTALLATION.CONFIGURATION_STS_BOX.STS_BOX_AVAILABLE"),
            value: this.emergencyReserve.isStsBoxAvailable
                ? this.translate.instant("GENERAL.YES")
                : this.translate.instant("GENERAL.NO"),
        });

        if (this.emergencyReserve.isStsBoxAvailable) {
            batteryInverterData.push({
                label: this.translate.instant("INSTALLATION.PROTOCOL_AVU_BOX.SERIAL_NUMBER"),
                value: this.emergencyReserve.stsBoxSerialNumber,
            });
        }

        if (this.emergencyReserve.genset != null) {
            batteryInverterData.push({
                label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CONNECTED"),
                value: this.emergencyReserve.genset.IS_GENSET_INSTALLED
                    ? this.translate.instant("GENERAL.YES")
                    : this.translate.instant("GENERAL.NO"),
            });

            if (this.emergencyReserve.genset.isEnabled) {
                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.POWER"),
                    value: `${this.emergencyReserve.genset.GENSET_RATED_POWER} kW`,
                });

                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.PREHEAT_TIME"),
                    value: `${this.emergencyReserve.genset.GENSET_PREHEATING_TIME} Sec`,
                });

                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.RUN_TIME"),
                    value: `${this.emergencyReserve.genset.GENSET_RUN_TIME} min`,
                });
            }

            if (this.emergencyReserve.genset.GENSET_ENABLE_CHARGE) {
                batteryInverterData.push({
                    label: this.translate.instant(
                        "INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_START",
                    ),
                    value: `${this.emergencyReserve.genset.GENSET_CHARGE_SOC_START} %`,
                });

                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_END"),
                    value: `${this.emergencyReserve.genset.GENSET_CHARGE_SOC_END} %`,
                });

                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.MAX_POWER"),
                    value: `${this.emergencyReserve.genset.GENSET_MAX_POWER} kW`,
                });
            }
        }

        return batteryInverterData;
    }

    public override getSubSystemFields(): FormlyFieldConfig[] {
        const emsType: EmsType = this.getEmsType();
        return System.getSubSystemFields(emsType, this.translate);
    }

    public override addProtocolItems(protocol: SetupProtocol) {
        super.addProtocolItems(protocol);

        protocol.items ??= [];

        if (this.location && this.customer) {
            const safetyCountry = this.location.isEqualToCustomerData ? this.customer.country : this.location.country;
            if (safetyCountry === Country.GERMANY) {
                protocol.items.push({
                    category: Category.GRID,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_GRID_SETTING.TITLE"),
                    value: this.gridSetting as string,
                });
            }
        }

        const emergencyReserve = this.emergencyReserve;
        protocol.items.push({
            category: Category.STS_BOX,
            name: this.translate.instant("INSTALLATION.CONFIGURATION_STS_BOX.STS_BOX_AVAILABLE"),
            value: emergencyReserve.isStsBoxAvailable
                ? this.translate.instant("GENERAL.YES")
                : this.translate.instant("GENERAL.NO"),
        });

        if (emergencyReserve.isStsBoxAvailable) {
            protocol.items.push({
                category: Category.STS_BOX,
                name: this.translate.instant("INSTALLATION.PROTOCOL_AVU_BOX.SERIAL_NUMBER"),
                value: emergencyReserve.stsBoxSerialNumber ?? "",
            });
        }

        if (emergencyReserve.genset != null) {
            if (emergencyReserve.genset.isEnabled) {
                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CONNECTED"),
                    value: emergencyReserve.genset.IS_GENSET_INSTALLED
                        ? this.translate.instant("GENERAL.YES")
                        : this.translate.instant("GENERAL.NO"),
                });

                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.POWER"),
                    value: `${emergencyReserve.genset.GENSET_RATED_POWER} kW`,
                });

                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.PREHEAT_TIME"),
                    value: `${emergencyReserve.genset.GENSET_PREHEATING_TIME} Sec`,
                });

                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.RUN_TIME"),
                    value: `${emergencyReserve.genset.GENSET_RUN_TIME} min`,
                });
            }

            if (emergencyReserve.genset.GENSET_ENABLE_CHARGE) {
                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant(
                        "INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_START",
                    ),
                    value: `${emergencyReserve.genset.GENSET_CHARGE_SOC_START} %`,
                });

                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_END"),
                    value: `${emergencyReserve.genset.GENSET_CHARGE_SOC_END} %`,
                });

                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.MAX_POWER"),
                    value: `${emergencyReserve.genset.GENSET_MAX_POWER} kW`,
                });
            }

            if (
                this.gridSetting !== null &&
                this.gridSetting === GridSetting.VDE_4110 &&
                !emergencyReserve.isStsBoxAvailable
            ) {
                protocol.items.push(
                    ...ConfigurationAdvancedSettingsComponent.getAdvancedGridSettingsFieldsProtocolItems(
                        this.translate,
                        this.advancedGridSettings,
                    ),
                );
            }
        }
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
            ...this.getGensetProperties(),
            ...this.getAdvancedGridProperties(),
        } as CommercialGen3App & Genset;
    }

    public override getGridSettingOptions() {
        const options = [
            {
                label: GridSettingUtils.getDisplayName(GridSetting.VDE_4105),
                value: GridSetting.VDE_4105,
            },
        ];

        if (this.emergencyReserve != null && !this.emergencyReserve.isStsBoxAvailable) {
            options.push({
                label: GridSettingUtils.getDisplayName(GridSetting.VDE_4110),
                value: GridSetting.VDE_4110,
            });
        }

        return options;
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

            mpptProps[`HAS_MPPT_${mpptIndex}`] = dc.isSelected;

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

    protected override getTowerHeadFields(towerNr: number, batteryIndex?: number): FormlyFieldConfig[] {
        if (towerNr === 0) {
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
            ];
        }

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

    private getAdvancedGridProperties(): Record<string, string | number | boolean | null> {
        const payload: Record<string, string | number | boolean | null> = {};
        const model = this.advancedGridSettings;

        if (this.gridSetting !== GridSetting.VDE_4110) {
            return payload; // Advanced grid settings are only relevant for VDE 4110, so we return an empty object if it's not selected
        }

        Object.entries(model).forEach(([key, value]) => {
            if (value != null) {
                const backendKey = StringUtils.toScreamingSnakeCase(key);

                if (backendKey == null) {
                    return;
                }
                payload[backendKey] = value;
            }
        });

        return payload;
    }

    private getGensetProperties(): Omit<Genset, "isEnabled"> {
        const { isEnabled, ...payload } = this.emergencyReserve.genset;
        return payload;
    }
}
