import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { SetupProtocol } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { Edge } from "src/app/shared/shared";
import { StringUtils } from "src/app/shared/utils/string/string.utils";
import { Category } from "../../../shared/category";
import { ExternalLimitationType, FeedInSetting, GridSetting, View } from "../../../shared/enums";
import { GridSettingUtils } from "../../../shared/gridsetting.utils";
import { ComponentData } from "../../../shared/ibndatatypes";
import { SystemId } from "../../../shared/system";
import { ViewUtils } from "../../../shared/view.utils";
import { WebLinks } from "../../../shared/weblink.utils";
import { AdvancedGridSettingsModel, getDefaultAdvancedGridSettings } from "../../../views/configuration-advanced-grid-settings/advanced-grid-settings.model";
import { ConfigurationAdvancedSettingsComponent } from "../../../views/configuration-advanced-grid-settings/configuration-advanced-grid-settings.component";
import { SafetyCountry } from "../../../views/configuration-execute/safety-country";
import { EmergencyReserve } from "../../abstract-ibn";
import { AbstractCommercialGen3, CommercialGen3App, StsBox } from "../abstract-commercial-gen3";

export interface Genset {
    isEnabled: boolean;
    isConnected: boolean;
    ratedPower: number;
    preheatingTime: number;
    runTime: number;
    enableCharge: boolean;
    maxPower: number;
    chargeSocStart: number;
    chargeSocEnd: number;
}

export type GensetProperties = {
    IS_GENSET_INSTALLED: boolean;
    RATED_POWER: number | null;
    PREHEATING_TIME: number | null;
    RUN_TIME: number | null;
    ENABLE_CHARGE: boolean;
    MAX_POWER: number | null;
    CHARGE_SOC_START: number | null;
    CHARGE_SOC_END: number | null;
};

export class Commercial50Gen3Ibn extends AbstractCommercialGen3 {
    private static readonly MAX_MPPT = 4;

    public override warrantyLink: WebLinks = WebLinks.WARRANTY_LINK_COMMERCIAL_50_GEN3;
    public override readonly systemId: SystemId = SystemId.COMMERCIAL_50_GEN_3;
    public override appId: string = "App.FENECON.Commercial.50.Gen3";
    public override appAlias: string = "FENECON Commercial 50";

    public advancedGridSettings: AdvancedGridSettingsModel = getDefaultAdvancedGridSettings();

    public override emergencyReserve: EmergencyReserve & StsBox & { genset: Genset } = {
        isEnabled: false,
        minValue: 5,
        value: 20,
        isReserveSocEnabled: false,
        isStsBoxAvailable: false,
        stsBoxSerialNumber: null,
        genset: {
            isEnabled: false,
            isConnected: false,
            ratedPower: 0,
            preheatingTime: 10,
            runTime: 0,
            enableCharge: false,
            maxPower: 0,
            chargeSocStart: 20,
            chargeSocEnd: 40,
        },
    };

    protected override readonly baseImagePath = "assets/img/ibn/mppt/c-50-mppt/";

    constructor(translate: TranslateService) {
        super(AbstractCommercialGen3.VIEWS, Commercial50Gen3Ibn.MAX_MPPT, translate);
    }

    public override getGridSettingOptions() {
        const options = [{ label: GridSettingUtils.getDisplayName(GridSetting.VDE_4105), value: GridSetting.VDE_4105 }];

        if (this.emergencyReserve != null && !this.emergencyReserve.isStsBoxAvailable) {
            options.push({ label: GridSettingUtils.getDisplayName(GridSetting.VDE_4110), value: GridSetting.VDE_4110 });
        }

        return options;
    }

    public override getEmergencyReserveFields(): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = super.getEmergencyReserveFields();

        const getModel = (field: FormlyFieldConfig): EmergencyReserve & StsBox & { genset: Genset } =>
            field.model as EmergencyReserve & StsBox & { genset: Genset };

        fields.push({
            key: "genset.isEnabled",
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.EMERGENCY_POWER_FUNCTION"),
            },
            expressions: {
                "templateOptions.disabled": (field) => !getModel(field).isStsBoxAvailable,
                "hide": (field) => !getModel(field).isEnabled,
            },
            hooks: {
                onInit: (field) => {
                    field.formControl!.valueChanges.subscribe((isChecked: boolean) => {
                        getModel(field).genset.isConnected = isChecked;
                    });
                },
            },
        });

        fields.push({
            key: "genset.isConnected",
            type: "toggle",
            className: "genset-settings-toggle",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CONNECTED"),
                required: true,
            },
            expressions: {
                hide: (field) => !getModel(field).genset.isEnabled,
            },
            hooks: {
                onInit: (field) => {
                    field.formControl!.valueChanges.subscribe((isChecked: boolean) => {
                        const model = getModel(field);
                        model.genset.isEnabled = isChecked;

                        const control = field.form!.get("genset.isEnabled")!;
                        control.setValue(isChecked);
                    });
                },
            },
        });

        fields.push({
            key: "genset.ratedPower",
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
                "hide": (field) => !getModel(field).genset.isEnabled,
                "props.disabled": (field) => !getModel(field).genset.isConnected,
            },
            wrappers: ["input-with-unit"],
        });

        fields.push({
            key: "genset.preheatingTime",
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
                "hide": (field) => !getModel(field).genset.isEnabled,
                "props.disabled": (field) => !getModel(field).genset.isConnected,
            },
            wrappers: ["input-with-unit"],
        });

        fields.push({
            key: "genset.runTime",
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
                "hide": (field) => !getModel(field).genset.isEnabled,
                "props.disabled": (field) => !getModel(field).genset.isConnected,
            },
            wrappers: ["input-with-unit"],
        });

        fields.push({
            key: "genset.enableCharge",
            type: "toggle",
            className: "genset-settings-toggle",
            resetOnHide: true,
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.BATTERY_CHARGING"),
            },
            expressions: {
                hide: (field) => !getModel(field).genset.isEnabled,
            },
        });

        fields.push({
            key: "genset.maxPower",
            type: "input",
            className: "genset-nested-field",
            resetOnHide: true,
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.MAX_POWER"),
                type: "number",
                unit: "%",
                min: 1,
                max: 100,
                description: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.MAX_POWER_DESCRIPTION") + " [0,100] %",
                required: true,
            },
            expressions: {
                "hide": (field) => !getModel(field).genset.isConnected,
                "props.disabled": (field) => !getModel(field).genset.enableCharge,
            },
            wrappers: ["input-with-unit"],
        });

        fields.push({
            key: "genset.chargeSocStart",
            type: "input",
            className: "genset-nested-field",
            resetOnHide: true,
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_START"),
                type: "number",
                unit: "%",
                min: 20,
                max: 90,
                description: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_START_DESCRIPTION") + " [20,90] %",
                required: true,
            },
            expressions: {
                "hide": (field) => !getModel(field).genset.isConnected,
                "props.disabled": (field) => !getModel(field).genset.enableCharge,
            },
            wrappers: ["input-with-unit"],
        });

        fields.push({
            key: "genset.chargeSocEnd",
            type: "input",
            className: "genset-nested-field",
            resetOnHide: true,
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_END"),
                type: "number",
                unit: "%",
                min: 40,
                max: 95,
                description: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_END_DESCRIPTION") + " [40,95] %",
                required: true,
            },
            expressions: {
                "hide": (field) => !getModel(field).genset.isConnected,
                "props.disabled": (field) => !getModel(field).genset.enableCharge,
            },
            wrappers: ["input-with-unit"],
        });

        return fields;
    }

    public override addCustomBatteryInverterData(): ComponentData[] {
        const batteryInverterData: ComponentData[] = super.addCustomBatteryInverterData();

        if (this.emergencyReserve.genset != null) {
            batteryInverterData.push({
                label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CONNECTED"),
                value: this.emergencyReserve.genset.isConnected ? this.translate.instant("GENERAL.YES") : this.translate.instant("GENERAL.NO"),
            });

            if (this.emergencyReserve.genset.isEnabled) {
                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.POWER"),
                    value: `${this.emergencyReserve.genset.ratedPower} kW`,
                });

                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.PREHEAT_TIME"),
                    value: `${this.emergencyReserve.genset.preheatingTime} Sec`,
                });

                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.RUN_TIME"),
                    value: `${this.emergencyReserve.genset.runTime} min`,
                });
            }

            if (this.emergencyReserve.genset.enableCharge) {
                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_START"),
                    value: `${this.emergencyReserve.genset.chargeSocStart} %`,
                });

                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_END"),
                    value: `${this.emergencyReserve.genset.chargeSocEnd} %`,
                });

                batteryInverterData.push({
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.MAX_POWER"),
                    value: `${this.emergencyReserve.genset.maxPower} kW`,
                });
            }
        }
        return batteryInverterData;
    }

    public override addProtocolItems(protocol: SetupProtocol) {
        super.addProtocolItems(protocol);

        const emergencyReserve = this.emergencyReserve;
        protocol.items ??= [];

        if (emergencyReserve.genset != null) {
            if (emergencyReserve.genset.isEnabled) {
                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CONNECTED"),
                    value: emergencyReserve.genset.isConnected ? this.translate.instant("GENERAL.YES") : this.translate.instant("GENERAL.NO"),
                });

                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.POWER"),
                    value: `${emergencyReserve.genset.ratedPower} kW`,
                });

                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.PREHEAT_TIME"),
                    value: `${emergencyReserve.genset.preheatingTime} Sec`,
                });

                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.RUN_TIME"),
                    value: `${emergencyReserve.genset.runTime} min`,
                });
            }

            if (emergencyReserve.genset.enableCharge) {
                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_START"),
                    value: `${emergencyReserve.genset.chargeSocStart} %`,
                });

                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.CHARGE_SOC_END"),
                    value: `${emergencyReserve.genset.chargeSocEnd} %`,
                });

                protocol.items.push({
                    category: Category.EMERGENCY_RESERVE,
                    name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.MAX_POWER"),
                    value: `${emergencyReserve.genset.maxPower} kW`,
                });
            }

            protocol.items.push(...ConfigurationAdvancedSettingsComponent.getAdvancedGridSettingsFieldsProtocolItems(this.translate, this.advancedGridSettings));
        }
    }

    public override removeOrAddView(edge: Edge): void {

        super.removeOrAddView(edge);

        const gridSettingIndex = this.views.indexOf(View.ConfigurationGridSetting);
        const advancedSettingsIndex = gridSettingIndex !== -1 ? gridSettingIndex + 1 : 10;

        if (this.gridSetting !== null && this.gridSetting === GridSetting.VDE_4110 && !this.emergencyReserve.isStsBoxAvailable) {
            ViewUtils.add(this.views, View.ConfigurationAdvancedGridSettings, advancedSettingsIndex);
        } else {
            ViewUtils.remove(this.views, View.ConfigurationAdvancedGridSettings);
        }
    }

    public override getAppProperties(safetyCountry: SafetyCountry, feedInSetting: FeedInSetting): CommercialGen3App & GensetProperties {
        return {
            ...this.commonProperties(safetyCountry, feedInSetting),
            FEED_IN_TYPE: this.feedInLimitation?.feedInType ?? ExternalLimitationType.NO_LIMITATION,
            GRID_CODE: this.gridSetting,
            CT_RATIO_FIRST: this.energyFlowMeter.value,
            ...this.generateMpptProperties(),
            ...this.getGensetProperties(),
            ...this.getAdvancedGridProperties(),
        } as CommercialGen3App & GensetProperties;
    }

    private getAdvancedGridProperties(): Record<string, string | number | boolean | null> {
        const payload: Record<string, string | number | boolean | null> = {};
        const model = this.advancedGridSettings;

        // Custom overrides for keys that don't perfectly translate via Regex
        const keyOverrides: Record<string, string> = {
            "vpp10MinOvTripThreshold": "VPP_10MIN_OV_TRIP_THRESHOLD",
            "vpp10MinOvTripTime": "VPP_10MIN_OV_TRIP_TIME",
        };

        Object.entries(model).forEach(([key, value]) => {
            if (value != null) {
                //Check if it's in the override dictionary
                let backendKey = keyOverrides[key] ?? null;

                // If not, generate it using the Regex!
                if (backendKey == null) {
                    backendKey = StringUtils.toScreamingSnakeCase(key);
                }

                payload[backendKey] = value;
            }
        });

        return payload;
    }

    private getGensetProperties(): Record<string, boolean | number | null> {
        const gensetProps: Record<string, boolean | number> = {};
        const connected = this.emergencyReserve.genset?.isConnected ?? false;
        gensetProps["IS_GENSET_INSTALLED"] = connected;

        if (connected) {
            gensetProps["GENSET_RATED_POWER"] = this.emergencyReserve.genset?.ratedPower ?? 0;
            gensetProps["GENSET_PREHEATING_TIME"] = this.emergencyReserve.genset?.preheatingTime ?? 10;
            gensetProps["GENSET_RUN_TIME"] = this.emergencyReserve.genset?.runTime ?? 0;
        }

        const enableCharge = this.emergencyReserve.genset?.enableCharge ?? false;
        gensetProps["GENSET_ENABLE_CHARGE"] = enableCharge;
        if (enableCharge) {
            gensetProps["GENSET_MAX_POWER"] = this.emergencyReserve.genset?.maxPower ?? 0;
            gensetProps["GENSET_CHARGE_SOC_START"] = this.emergencyReserve.genset?.chargeSocStart ?? 20;
            gensetProps["GENSET_CHARGE_SOC_END"] = this.emergencyReserve.genset?.chargeSocEnd ?? 40;
        }

        return gensetProps;
    }
}
