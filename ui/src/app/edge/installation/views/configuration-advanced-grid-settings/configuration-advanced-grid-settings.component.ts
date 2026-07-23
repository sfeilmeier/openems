import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { FormlyUtils, StrictFormlyFieldConfig } from "src/app/shared/components/formly/formly-utils";
import { SetupProtocol } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { Commercial50Gen3Ibn } from "../../installation-systems/commercial/commercial-50/commercial-50-gen3";
import { Category } from "../../shared/category";
import { ComponentData } from "../../shared/ibndatatypes";
import { FEED_IN_POWER_FACTOR_OPTIONS } from "../../shared/options";
import { ActivePowerModeModel, AdvancedGridSettingsModel, ConnectionParametersModel, COS_PHI_CURVE_POINTS, CurrentDistributionMode, CurveMode, CurvePoint, FrequencyRideThroughModel, GRID_SETTING_RANGES, GridUnit, ProtectionParametersModel, ReactivePowerMode, ReactivePowerModeModel, RecoveryMode, VoltageRideThroughModel, } from "./advanced-grid-settings.model";

@Component({
    selector: "configuration-advanced-grid-settings",
    templateUrl: "./configuration-advanced-grid-settings.component.html",
    styleUrl: "../../installation.component.scss",
    standalone: false,
})
export class ConfigurationAdvancedSettingsComponent implements OnInit {
    @Input() public ibn!: Commercial50Gen3Ibn;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<any>();

    protected form: FormGroup = new FormGroup({});
    protected model!: AdvancedGridSettingsModel;

    protected fields: StrictFormlyFieldConfig<AdvancedGridSettingsModel>[] = [];

    constructor(private translate: TranslateService) {}

    public static buildFields(translate: TranslateService): StrictFormlyFieldConfig<AdvancedGridSettingsModel>[] {
        return [
            {
                type: "accordion-group",
                templateOptions: {
                    isMulti: true,
                    openAccordions: ["active-power-section"], // Auto-open first section
                },
                fieldGroup: [
                    {
                        type: "accordion",
                        templateOptions: {
                            accordionId: "active-power-section",
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.ACTIVE_POWER_MODE",
                            ),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getActivePowerFields(
                            translate,
                        ) as StrictFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                    {
                        type: "accordion",
                        templateOptions: {
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.REACTIVE_POWER_MODE",
                            ),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getReactivePowerFields(
                            translate,
                        ) as StrictFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                    {
                        type: "accordion",
                        templateOptions: {
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.PROTECTION",
                            ),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getProtectionFields(
                            translate,
                        ) as StrictFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                    {
                        type: "accordion",
                        templateOptions: {
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.CONNECTION",
                            ),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getConnectionFields(
                            translate,
                        ) as StrictFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                    {
                        type: "accordion",
                        templateOptions: {
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.VOLTAGE_RIDE_THROUGH",
                            ),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getVoltageRtFields(
                            translate,
                        ) as StrictFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                    {
                        type: "accordion",
                        templateOptions: {
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.FREQUENCY_RIDE_THROUGH",
                            ),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getFrtFields(
                            translate,
                        ) as StrictFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                ],
            },
        ];
    }

    /**
     * Gets the advanced grid settings fields for the setup protocol.
     *
     * @param translate The translate service
     * @param advancedGridSettings The advanced grid settings
     * @returns Setup protocol fields
     */
    public static getAdvancedGridSettingsFieldsProtocolItems(
        translate: TranslateService,
        advancedGridSettings: Commercial50Gen3Ibn["advancedGridSettings"],
    ) {
        const FIELD_SEPARATOR = " - ";
        const advancedGridSettingsFields = ConfigurationAdvancedSettingsComponent.buildFields(translate);
        let advancedGridSettingsProtocolItems: SetupProtocol["items"] = [];

        function traverseFormlyFieldConfig(
            fields: StrictFormlyFieldConfig<AdvancedGridSettingsModel>,
            advancedGridSettings: AdvancedGridSettingsModel,
        ) {
            for (const field of fields.fieldGroup ?? []) {
                for (const subField of field?.fieldGroup ?? []) {
                    if (subField?.templateOptions?.label != null && fields?.templateOptions?.label != null) {
                        subField.templateOptions.label ??= [
                            subField?.templateOptions?.label ?? "",
                            field?.templateOptions?.label ?? "",
                        ].join(FIELD_SEPARATOR);
                        subField.templateOptions.label ??=
                            fields.templateOptions.label + FIELD_SEPARATOR + subField.templateOptions.label;
                    }
                    traverseFormlyFieldConfig(subField, advancedGridSettings);
                }
                const key: keyof AdvancedGridSettingsModel = field.key as keyof AdvancedGridSettingsModel;
                const value = advancedGridSettings[key];

                if (value == null) {
                    continue;
                }

                if (advancedGridSettingsProtocolItems == null || advancedGridSettingsProtocolItems.length === 0) {
                    advancedGridSettingsProtocolItems = [];
                }

                advancedGridSettingsProtocolItems.push({
                    category: Category.GRID,
                    name: [fields?.templateOptions?.label ?? "", field?.templateOptions?.label ?? ""].join(
                        FIELD_SEPARATOR,
                    ),
                    value: value.toString(),
                });
            }
        }

        for (const advancedGridSettingsField of advancedGridSettingsFields) {
            for (const element of advancedGridSettingsField?.fieldGroup ?? []) {
                traverseFormlyFieldConfig(element, advancedGridSettings);
            }
        }
        return advancedGridSettingsProtocolItems;
    }

    /**
     * Gets the completion summary from advanced grid settings.
     *
     * @param translate The translate service
     * @param advancedGridSettings The advanced grid settings
     * @returns The completion summary for the advanced grid settings
     */
    public static getCompletionSummaryFromAdvancedGridSettings(
        translate: TranslateService,
        advancedGridSettings: AdvancedGridSettingsModel,
    ): { header: string; rows: ComponentData[] }[] {
        if (Object.keys(advancedGridSettings).length == 0) {
            return [];
        }
        const protocolItems = ConfigurationAdvancedSettingsComponent.getAdvancedGridSettingsFieldsProtocolItems(
            translate,
            advancedGridSettings,
        );
        return [
            {
                header: Category.toTranslatedString(Category.GRID, translate),
                rows: protocolItems.map((el) => ({
                    label: el.name,
                    value: el.value,
                })),
            },
        ];
    }

    /**
     * Generates a strict, type-safe expression function for checkbox classes.
     *
     * @param propertyName The strict key from AdvancedGridSettingsModel
     * @param hasPadding Whether to include 'ion-padding-start' in the classes
     */
    private static getCheckboxClassExpression(
        propertyName: keyof AdvancedGridSettingsModel,
        hasPadding: boolean = false,
    ) {
        const paddingClass = hasPadding ? " ion-padding-start" : "";
        const baseClass = hasPadding ? "ion-padding-start" : "";

        return (model: AdvancedGridSettingsModel | undefined) => {
            if (model == null) {
                return baseClass;
            }

            const isActive = model[propertyName] === true;
            return isActive ? `active-group-checkbox${paddingClass}` : baseClass;
        };
    }

    private static getActivePowerFields(translate: TranslateService): StrictFormlyFieldConfig<ActivePowerModeModel>[] {
        return [
            {
                key: "APM_OUTPUT_ACTIVE_POWER",
                type: "input",
                className: "genset-nested-field",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.OUTPUT_ACTIVE_POWER",
                    ),
                    type: "number",
                    min: 0,
                    max: 1100,
                    unit: GridUnit.PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        min: 0,
                        max: 1100,
                        unit: GridUnit.PER_MILLE,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "APM_POWER_GRADIENT",
                type: "input",
                className: "genset-nested-field",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.POWER_GRADIENT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "APM_PF_OVER_FREQUENCY_CURVE_ENABLE",
                type: "checkbox",
                expressionProperties: {
                    className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression(
                        "APM_PF_OVER_FREQUENCY_CURVE_ENABLE",
                    ),
                },
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.ENABLE",
                    ),
                    description: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.ENABLE_DESC",
                    ),
                },
            },
            {
                key: "APM_PF_OVER_FREQUENCY_START_POINT",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.START_POINT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.FREQUENCY,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.FREQUENCY,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("APM_PF_OVER_FREQUENCY_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>(
                        "APM_PF_OVER_FREQUENCY_CURVE_ENABLE",
                        false,
                    ),
                },
            },
            {
                key: "APM_PF_OVER_FREQUENCY_SLOPE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.GRADIENT_PER_MILLE_PER_HZ,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.GRADIENT_PER_MILLE_PER_HZ,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("APM_PF_OVER_FREQUENCY_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>(
                        "APM_PF_OVER_FREQUENCY_CURVE_ENABLE",
                        false,
                    ),
                },
            },
            {
                key: "APM_PF_OVER_FREQUENCY_DELAY_TIME",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.DELAY_TIME",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("APM_PF_OVER_FREQUENCY_CURVE_ENABLE", true),
                },
            },
            {
                key: "APM_PF_OVER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP",
                type: "checkbox",
                resetOnHide: false,
                expressionProperties: {
                    className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression(
                        "APM_PF_OVER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP",
                    ),
                },
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.DEACTIVATION_THRESHOLD_FSTOP",
                    ),
                },
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("APM_PF_OVER_FREQUENCY_CURVE_ENABLE", true),
                },
            },
            {
                key: "APM_PF_OVER_FREQUENCY_HYSTERESIS_POINT",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.HYSTERESIS_POINT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.anyPropIsFalse<ActivePowerModeModel>(
                        "APM_PF_OVER_FREQUENCY_CURVE_ENABLE",
                        "APM_PF_OVER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP",
                    ),
                },
            },
            {
                key: "APM_PF_OVER_FREQUENCY_DELAY_WAITING_TIME",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.DELAY_WAITING_TIME",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.anyPropIsFalse<ActivePowerModeModel>(
                        "APM_PF_OVER_FREQUENCY_CURVE_ENABLE",
                        "APM_PF_OVER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP",
                    ),
                },
            },
            {
                key: "APM_PF_OVER_FREQUENCY_HYSTERESIS_SLOPE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.HYSTERESIS_SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.POWER_RECOVERY_SLOPE_PER_MIN,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.POWER_RECOVERY_SLOPE_PER_MIN,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.anyPropIsFalse<ActivePowerModeModel>(
                        "APM_PF_OVER_FREQUENCY_CURVE_ENABLE",
                        "APM_PF_OVER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP",
                    ),
                },
            },
            {
                key: "APM_PF_UNDER_FREQUENCY_CURVE_ENABLE",
                type: "checkbox",
                expressionProperties: {
                    className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression(
                        "APM_PF_UNDER_FREQUENCY_CURVE_ENABLE",
                    ),
                },
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_UNDER_FREQUENCY.ENABLE",
                    ),
                    description: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_UNDER_FREQUENCY.ENABLE_DESC",
                    ),
                },
            },
            {
                key: "APM_PF_UNDER_FREQUENCY_THRESHOLD",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_UNDER_FREQUENCY.THRESHOLD",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.FREQUENCY,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.FREQUENCY,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("APM_PF_UNDER_FREQUENCY_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>(
                        "APM_PF_UNDER_FREQUENCY_CURVE_ENABLE",
                        false,
                    ),
                },
            },
            {
                key: "APM_PF_UNDER_FREQUENCY_SLOPE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_UNDER_FREQUENCY.SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.GRADIENT_PER_MILLE_PER_HZ,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.GRADIENT_PER_MILLE_PER_HZ,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("APM_PF_UNDER_FREQUENCY_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>(
                        "APM_PF_UNDER_FREQUENCY_CURVE_ENABLE",
                        false,
                    ),
                },
            },
            {
                key: "APM_PF_UNDER_FREQUENCY_DELAY_TIME",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_UNDER_FREQUENCY.DELAY_TIME",
                    ),
                    type: "number",
                    min: 0,
                    max: 1000,
                    unit: GridUnit.SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        min: 0,
                        max: 1000,
                        unit: GridUnit.SECONDS,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("APM_PF_UNDER_FREQUENCY_CURVE_ENABLE", true),
                },
            },
            {
                key: "APM_PF_UNDER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP",
                type: "checkbox",
                expressionProperties: {
                    className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression(
                        "APM_PF_UNDER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP",
                    ),
                },
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.DEACTIVATION_THRESHOLD_FSTOP",
                    ),
                },
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("APM_PF_UNDER_FREQUENCY_CURVE_ENABLE", true),
                },
            },
            {
                key: "APM_PF_UNDER_FREQUENCY_HYSTERESIS_POINT",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.HYSTERESIS_POINT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.anyPropIsFalse<ActivePowerModeModel>(
                        "APM_PF_UNDER_FREQUENCY_CURVE_ENABLE",
                        "APM_PF_UNDER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP",
                    ),
                },
            },
            {
                key: "APM_PF_UNDER_FREQUENCY_DELAY_WAITING_TIME",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.DELAY_WAITING_TIME",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.anyPropIsFalse<ActivePowerModeModel>(
                        "APM_PF_UNDER_FREQUENCY_CURVE_ENABLE",
                        "APM_PF_UNDER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP",
                    ),
                },
            },
            {
                key: "APM_PF_UNDER_FREQUENCY_HYSTERESIS_SLOPE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.HYSTERESIS_SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.POWER_RECOVERY_SLOPE_PER_MIN,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.POWER_RECOVERY_SLOPE_PER_MIN,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.anyPropIsFalse<ActivePowerModeModel>(
                        "APM_PF_UNDER_FREQUENCY_CURVE_ENABLE",
                        "APM_PF_UNDER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP",
                    ),
                },
            },
            {
                key: "PU_CURVE_ENABLE",
                type: "checkbox",
                expressionProperties: {
                    className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("PU_CURVE_ENABLE"),
                },
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PU_CURVE.ENABLE",
                    ),
                    description: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PU_CURVE.ENABLE_DESC",
                    ),
                },
            },
            {
                key: "APM_PU_V1_VOLTAGE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE",
                        { number: 1 },
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("PU_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("PU_CURVE_ENABLE", false),
                },
            },
            {
                key: "APM_PU_V1_ACTIVE_POWER",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.ACTIVE_POWER",
                        { number: 1 },
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("PU_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("PU_CURVE_ENABLE", false),
                },
            },
            {
                key: "APM_PU_V2_VOLTAGE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE",
                        { number: 2 },
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("PU_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("PU_CURVE_ENABLE", false),
                },
            },
            {
                key: "APM_PU_V2_ACTIVE_POWER",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.ACTIVE_POWER",
                        { number: 2 },
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("PU_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("PU_CURVE_ENABLE", false),
                },
            },
            {
                key: "APM_PU_V3_VOLTAGE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE",
                        { number: 3 },
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("PU_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("PU_CURVE_ENABLE", false),
                },
            },
            {
                key: "APM_PU_V3_ACTIVE_POWER",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.ACTIVE_POWER",
                        { number: 3 },
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("PU_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("PU_CURVE_ENABLE", false),
                },
            },
            {
                key: "APM_PU_V4_VOLTAGE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE",
                        { number: 4 },
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("PU_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("PU_CURVE_ENABLE", false),
                },
            },
            {
                key: "APM_PU_V4_ACTIVE_POWER",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.ACTIVE_POWER",
                        { number: 4 },
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("PU_CURVE_ENABLE", true),
                },
            },
            {
                key: "APM_PU_OUTPUT_RESPONSE_MODE",
                type: "select",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PU_CURVE.RESPONSE_MODE",
                    ),
                    options: [
                        {
                            value: RecoveryMode.DISABLE,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.DEACTIVATE",
                            ),
                        },
                        {
                            value: RecoveryMode.GRADIENT_CONTROL,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.GRADIENT_CONTROL",
                            ),
                        },
                        {
                            value: RecoveryMode.PT_1_BEHAVIOUR,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.PT_1_BEHAVIOUR",
                            ),
                        },
                    ],
                },
                expressions: {
                    hide: FormlyUtils.propIsFalse<ActivePowerModeModel>("PU_CURVE_ENABLE", true),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("PU_CURVE_ENABLE", false),
                },
            },
            {
                key: "APM_PU_PT1_LOW_PASS_FILTER_TIME_CONSTANT",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PU_CURVE.PT1_TIME_CONSTANT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.TIME_CONSTANT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.TIME_CONSTANT,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.combineOr<ActivePowerModeModel>(
                        FormlyUtils.propIsFalse("PU_CURVE_ENABLE"),
                        FormlyUtils.propNotEquals("APM_PU_OUTPUT_RESPONSE_MODE", RecoveryMode.PT_1_BEHAVIOUR),
                    ),
                    "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("PU_CURVE_ENABLE", false),
                },
            },
            {
                key: "APM_PU_PT1_LOW_PASS_FILTER_CONSTANT_GRADIENT_MODE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.POWER_GRADIENT",
                    ),
                    type: "number",
                    min: 0,
                    max: 650000,
                    unit: GridUnit.PERMILLE_PN_PER_SEC,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        min: 0,
                        max: 650000,
                        unit: GridUnit.PERMILLE_PN_PER_SEC,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.combineOr<ActivePowerModeModel>(
                        FormlyUtils.propIsFalse("PU_CURVE_ENABLE"),
                        FormlyUtils.propNotEquals("APM_PU_OUTPUT_RESPONSE_MODE", RecoveryMode.GRADIENT_CONTROL),
                    ),
                    "templateOptions.required": FormlyUtils.combineOr<ActivePowerModeModel>(
                        FormlyUtils.propIsTrue("PU_CURVE_ENABLE"),
                        FormlyUtils.propEquals("APM_PU_OUTPUT_RESPONSE_MODE", RecoveryMode.GRADIENT_CONTROL),
                    ),
                },
            },
        ];
    }

    private static getReactivePowerFields(
        translate: TranslateService,
    ): StrictFormlyFieldConfig<ReactivePowerModeModel>[] {
        const reactivePowerFields: StrictFormlyFieldConfig<ReactivePowerModeModel>[] = [
            {
                key: "RPM_MODE",
                type: "select",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.MODE",
                    ),
                    description: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.MODE_DESC",
                    ),
                    required: true,
                    options: [
                        {
                            value: ReactivePowerMode.NONE,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.NONE",
                            ),
                        },
                        {
                            value: ReactivePowerMode.FIX_PF,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.FIX_PF",
                            ),
                        },
                        {
                            value: ReactivePowerMode.FIX_Q,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.FIX_Q",
                            ),
                        },
                        {
                            value: ReactivePowerMode.QU_CURVE,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.QU_CURVE",
                            ),
                        },
                        {
                            value: ReactivePowerMode.COS_PHI_P_CURVE,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.COSPHIP_CURVE",
                            ),
                        },
                        {
                            value: ReactivePowerMode.QP_CURVE,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.QP_CURVE",
                            ),
                        },
                    ],
                },
            },
        ];

        const nestedAccordionsGroup: StrictFormlyFieldConfig<ReactivePowerModeModel> = {
            type: "accordion-group",
            templateOptions: {
                isMulti: true,
            },
            fieldGroup: [
                {
                    type: "accordion",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.FIX_PF",
                        ),
                    },
                    resetOnHide: false,
                    expressions: {
                        hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>(
                            "RPM_MODE",
                            ReactivePowerMode.FIX_PF,
                            true,
                        ),
                    },
                    fieldGroup: [
                        {
                            key: "RPM_FIX_PF",
                            type: "select",
                            className: "ion-padding-start",
                            resetOnHide: false,
                            templateOptions: {
                                label: translate.instant(
                                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.FIX_PF.POWER_FACTOR",
                                ),
                                description: translate.instant(
                                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.FIX_PF.POWER_FACTOR_DESC",
                                ),
                                required: true,
                                options: FEED_IN_POWER_FACTOR_OPTIONS(translate),
                            },
                        },
                    ],
                },
                {
                    type: "accordion",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.FIX_Q",
                        ),
                    },
                    expressions: {
                        hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>(
                            "RPM_MODE",
                            ReactivePowerMode.FIX_Q,
                            true,
                        ),
                    },
                    fieldGroup: [
                        {
                            key: "RPM_FIX_Q",
                            type: "input",
                            className: "ion-padding-start",
                            templateOptions: {
                                label: translate.instant(
                                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.FIX_Q.REACTIVE_POWER",
                                ),
                                type: "number",
                                min: -600,
                                max: 600,
                                unit: GridUnit.PER_MILLE,
                                description: translate.instant(
                                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE",
                                    {
                                        min: -600,
                                        max: 600,
                                        unit: GridUnit.PER_MILLE,
                                    },
                                ),
                                required: true,
                            },
                            wrappers: ["input-with-unit", "form-field"],
                        },
                    ],
                },
            ],
        };

        const quCurveGroup: StrictFormlyFieldConfig<ReactivePowerModeModel>[] = [
            {
                key: "RPM_QU_CURVE_MODE",
                type: "select",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.MODE"),
                    required: true,
                    options: [
                        {
                            value: CurveMode.STANDARD,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.STANDARD_MODE",
                            ),
                        },
                        {
                            value: CurveMode.SLOPE,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.SLOPE_MODE",
                            ),
                        },
                    ],
                },
            },
            {
                key: "RPM_QU_VOLTAGE_DEAD_BAND",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    type: "number",
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE_DEAD_BAND",
                    ),
                    ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_QU_CURVE_MODE", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_QU_CURVE_MODE",
                        CurveMode.SLOPE,
                        false,
                    ),
                },
            },
            {
                key: "RPM_QU_OVEREXCITED_SLOPE",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.OVEREXCITED_SLOPE",
                    ),
                    type: "number",
                    min: -2000,
                    max: 2000,
                    unit: GridUnit.QMAX_PER_10_PERCENT_VN,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        min: -2000,
                        max: 2000,
                        unit: GridUnit.QMAX_PER_10_PERCENT_VN,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_QU_CURVE_MODE", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_QU_CURVE_MODE",
                        CurveMode.SLOPE,
                        false,
                    ),
                },
            },
            {
                key: "RPM_QU_UNDEREXCITED_SLOPE",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.UNDEREXCITED_SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_QU_CURVE_MODE", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_QU_CURVE_MODE",
                        CurveMode.SLOPE,
                        false,
                    ),
                },
            },
        ];

        for (let i = 1; i <= 4; i++) {
            quCurveGroup.push(
                {
                    key: `RPM_QU_V${i}_VOLTAGE` as keyof ReactivePowerModeModel,
                    type: "input",
                    className: "ion-padding-start",
                    resetOnHide: false,
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE",
                            { number: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.VOLTAGE,
                        }),
                        required: true,
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>(
                            "RPM_QU_CURVE_MODE",
                            CurveMode.SLOPE,
                            true,
                        ),
                        "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                            "RPM_QU_CURVE_MODE",
                            CurveMode.SLOPE,
                            false,
                        ),
                    },
                },
                {
                    key: `RPM_QU_V${i}_REACTIVE_POWER` as keyof ReactivePowerModeModel,
                    type: "input",
                    className: "ion-padding-start",
                    resetOnHide: false,
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.ACTIVE_POWER",
                            { number: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                        }),
                        required: true,
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
            );
        }

        quCurveGroup.push(
            {
                key: "RPM_QU_TIME_CONSTANT",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.TIME_CONSTANT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.TIME_CONSTANT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.TIME_CONSTANT,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "RPM_QU_EXTENDED_FUNCTIONS",
                type: "checkbox",
                resetOnHide: false,
                expressionProperties: {
                    className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression(
                        "RPM_QU_EXTENDED_FUNCTIONS",
                        true,
                    ),
                },
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.EXTENDED_FUNCTIONS",
                    ),
                },
            },
            {
                key: "RPM_QU_LOCK_IN_POWER",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.LOCK_IN_POWER",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ReactivePowerModeModel>("RPM_QU_EXTENDED_FUNCTIONS"),
                    "templateOptions.required":
                        FormlyUtils.propIsTrue<ReactivePowerModeModel>("RPM_QU_EXTENDED_FUNCTIONS"),
                },
            },
            {
                key: "RPM_QU_LOCK_OUT_POWER",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.LOCK_OUT_POWER",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ReactivePowerModeModel>("RPM_QU_EXTENDED_FUNCTIONS"),
                    "templateOptions.required":
                        FormlyUtils.propIsTrue<ReactivePowerModeModel>("RPM_QU_EXTENDED_FUNCTIONS"),
                },
            },
        );

        nestedAccordionsGroup.fieldGroup!.push({
            type: "accordion",
            templateOptions: {
                label: translate.instant(
                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.QU_CURVE",
                ),
            },
            expressions: {
                hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_MODE", ReactivePowerMode.QU_CURVE, true),
            },
            fieldGroup: quCurveGroup,
        });

        const cosPhiGroup: StrictFormlyFieldConfig<ReactivePowerModeModel>[] = [
            {
                key: "RPM_COS_PHI_MODE",
                type: "select",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.MODE"),
                    required: true,
                    options: [
                        {
                            value: CurveMode.STANDARD,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.STANDARD_MODE",
                            ),
                        },
                        {
                            value: CurveMode.SLOPE,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.SLOPE_MODE",
                            ),
                        },
                    ],
                },
            },
            {
                key: "RPM_COS_PHI_OVEREXCITED_SLOPE",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.OVEREXCITED_SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_COS_PHI_MODE", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_COS_PHI_MODE",
                        CurveMode.SLOPE,
                        false,
                    ),
                },
            },
            {
                key: "RPM_COS_PHI_UNDEREXCITED_SLOPE",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.UNDEREXCITED_SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_COS_PHI_MODE", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_COS_PHI_MODE",
                        CurveMode.SLOPE,
                        false,
                    ),
                },
            },
        ];

        for (const pt of COS_PHI_CURVE_POINTS) {
            const POINTS_WITH_FIXED_POWER: CurvePoint[] = ["A", "D", "E"];
            const POINTS_WITH_FIXED_COS_PHI: CurvePoint[] = ["E"];

            const hidePow = POINTS_WITH_FIXED_POWER.includes(pt);
            const hideCos = POINTS_WITH_FIXED_COS_PHI.includes(pt);

            const powField: StrictFormlyFieldConfig<ReactivePowerModeModel> = {
                key: `RPM_COS_PHIP_POWER_${pt}` as keyof ReactivePowerModeModel,
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.POWER",
                        { value: pt },
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    }),
                    required: !hidePow,
                },
                wrappers: ["input-with-unit", "form-field"],
            };

            if (hidePow) {
                powField.expressions = {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_COS_PHI_MODE", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_COS_PHI_MODE",
                        CurveMode.SLOPE,
                        false,
                    ),
                };
            }

            const cosField: StrictFormlyFieldConfig<ReactivePowerModeModel> = {
                key: `RPM_COS_PHIP_COS_PHI_${pt}` as keyof ReactivePowerModeModel,
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false, // Keep your data safe when toggling modes
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.COS_PHI",
                        { value: pt },
                    ),
                    type: "number",
                    description: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.COS_PHI_DESC",
                    ),
                    required: hideCos === false,
                    splitRanges: [
                        { min: -1000, max: -800 },
                        { min: 800, max: 1000 },
                    ],
                },
                wrappers: ["input-with-unit", "form-field"],
                validators: {
                    validation: ["splitRange"],
                },
            };

            if (hideCos) {
                cosField.expressions = {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_COS_PHI_MODE", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_COS_PHI_MODE",
                        CurveMode.SLOPE,
                        false,
                    ),
                };
            }

            cosPhiGroup.push(powField, cosField);
        }

        cosPhiGroup.push(
            {
                key: "RPM_COS_PHIP_TIME_CONSTANT",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.TIME_CONSTANT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.TIME_CONSTANT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.TIME_CONSTANT,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "RPM_COS_PHIP_EXTENDED_FUNCTIONS",
                type: "checkbox",
                expressionProperties: {
                    className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression(
                        "RPM_COS_PHIP_EXTENDED_FUNCTIONS",
                        true,
                    ),
                },
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.EXTENDED_FUNCTIONS",
                    ),
                    description: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.EXTENDED_FUNCTIONS_DESC",
                    ),
                },
            },
            {
                key: "RPM_COS_PHIP_LOCK_IN_VOLT",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.LOCK_IN_VOLT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ReactivePowerModeModel>("RPM_COS_PHIP_EXTENDED_FUNCTIONS"),
                },
            },
            {
                key: "RPM_COS_PHIP_LOCK_OUT_VOLT",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.LOCK_OUT_VOLT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<ReactivePowerModeModel>("RPM_COS_PHIP_EXTENDED_FUNCTIONS"),
                },
            },
        );

        nestedAccordionsGroup.fieldGroup!.push({
            type: "accordion",
            templateOptions: {
                label: translate.instant(
                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.COSPHIP_CURVE",
                ),
            },
            expressions: {
                hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>(
                    "RPM_MODE",
                    ReactivePowerMode.COS_PHI_P_CURVE,
                    true,
                ),
            },
            fieldGroup: cosPhiGroup,
        });

        const qpCurveGroup: StrictFormlyFieldConfig<ReactivePowerModeModel>[] = [
            {
                key: "RPM_QP_CURVE_MODE",
                type: "select",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.MODE"),
                    required: true,
                    options: [
                        {
                            value: CurveMode.STANDARD,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.STANDARD_MODE",
                            ),
                        },
                        {
                            value: CurveMode.SLOPE,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.SLOPE_MODE",
                            ),
                        },
                    ],
                },
            },
            {
                key: "RPM_QP_OVEREXCITED_SLOPE",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QP_CURVE.OVEREXCITED_SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_QP_CURVE_MODE", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_QP_CURVE_MODE",
                        CurveMode.SLOPE,
                        false,
                    ),
                },
            },
            {
                key: "RPM_QP_UNDEREXCITED_SLOPE",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QP_CURVE.UNDEREXCITED_SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_QP_CURVE_MODE", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_QP_CURVE_MODE",
                        CurveMode.SLOPE,
                        false,
                    ),
                },
            },
        ];

        const qpPoints = [1, 2, 3, 4, 5, 6] as const;

        for (const i of qpPoints) {
            const isDynamicPow = i >= 4;
            const isDynamicReact = i >= 5;

            const powField: StrictFormlyFieldConfig<ReactivePowerModeModel> = {
                key: `RPM_QP_POWER_P${i}` as keyof ReactivePowerModeModel,
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.POWER", {
                        value: `P${i}`,
                    }),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    }),
                    required: isDynamicPow,
                },
                wrappers: ["input-with-unit", "form-field"],
            };

            if (isDynamicPow) {
                powField.expressions = {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>(
                        "RPM_QP_CURVE_MODE",
                        CurveMode.STANDARD,
                        true,
                    ),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_QP_CURVE_MODE",
                        CurveMode.STANDARD,
                        false,
                    ),
                };
            }

            const reactField: StrictFormlyFieldConfig<ReactivePowerModeModel> = {
                key: `RPM_QP_REACTIVE_POWER_P${i}` as keyof ReactivePowerModeModel,
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER", {
                        value: `P${i}`,
                    }),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    }),
                    required: isDynamicReact,
                },
                wrappers: ["input-with-unit", "form-field"],
            };

            if (isDynamicReact) {
                reactField.expressions = {
                    hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>(
                        "RPM_QP_CURVE_MODE",
                        CurveMode.STANDARD,
                        true,
                    ),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>(
                        "RPM_QP_CURVE_MODE",
                        CurveMode.STANDARD,
                        false,
                    ),
                };
            }

            qpCurveGroup.push(powField, reactField);
        }

        qpCurveGroup.push({
            key: "RPM_QP_TIME_CONSTANT",
            type: "input",
            className: "ion-padding-start",
            templateOptions: {
                label: translate.instant(
                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QP_CURVE.TIME_CONSTANT",
                ),
                type: "number",
                ...GRID_SETTING_RANGES.TIME_CONSTANT,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                    ...GRID_SETTING_RANGES.TIME_CONSTANT,
                }),
            },
            wrappers: ["input-with-unit", "form-field"],
        });

        nestedAccordionsGroup.fieldGroup!.push({
            type: "accordion",
            templateOptions: {
                label: translate.instant(
                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.QP_CURVE",
                ),
            },
            expressions: {
                hide: FormlyUtils.propNotEquals<ReactivePowerModeModel>("RPM_MODE", ReactivePowerMode.QP_CURVE, true),
            },
            fieldGroup: qpCurveGroup,
        });

        // Add the fully constructed accordion-group back into the main array
        reactivePowerFields.push(nestedAccordionsGroup);
        return reactivePowerFields;
    }

    private static getProtectionFields(
        translate: TranslateService,
    ): StrictFormlyFieldConfig<ProtectionParametersModel>[] {
        const protectionFields: StrictFormlyFieldConfig<ProtectionParametersModel>[] = [];

        for (let i = 1; i <= 4; i++) {
            const uvMin = i <= 2 ? 0 : 150;

            protectionFields.push(
                {
                    key: `VPP_OV_STAGE${i}_TRIGGER_VALUE` as keyof ProtectionParametersModel,
                    type: "input",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.OVERVOLTAGE_TRIGGER",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `VPP_OV_STAGE${i}_TRIP_TIME` as keyof ProtectionParametersModel,
                    type: "input",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.OVERVOLTAGE_TRIP_TIME",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `VPP_UV_STAGE${i}_TRIP_VALUE` as keyof ProtectionParametersModel,
                    type: "input",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.UNDERVOLTAGE_TRIP_VALUE",
                            { stage: i },
                        ),
                        type: "number",
                        min: uvMin,
                        max: 1000,
                        unit: GridUnit.PERMILLE_VN,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            min: uvMin,
                            max: 1000,
                            unit: GridUnit.PERMILLE_VN,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `VPP_UV_STAGE${i}_TRIP_TIME` as keyof ProtectionParametersModel,
                    type: "input",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.UNDERVOLTAGE_TRIP_TIME",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
            );
        }

        protectionFields.push(
            {
                key: "VPP_10MIN_OV_TRIP_THRESHOLD",
                type: "input",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.TEN_MIN_OVERVOLTAGE_THRESHOLD",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                    required: true,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "VPP_10MIN_OV_TRIP_TIME",
                type: "input",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.TEN_MIN_OVERVOLTAGE_TIME",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
            },
        );

        for (let i = 1; i <= 4; i++) {
            protectionFields.push(
                {
                    key: `FPP_OF_STAGE${i}_TRIGGER_VALUE` as keyof ProtectionParametersModel,
                    type: "input",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.OVERFREQUENCY_TRIGGER",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.FREQUENCY,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.FREQUENCY,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `FPP_OF_STAGE${i}_TRIP_TIME` as keyof ProtectionParametersModel,
                    type: "input",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.OVERFREQUENCY_TRIP_TIME",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `FPP_UF_STAGE${i}_TRIP_VALUE` as keyof ProtectionParametersModel,
                    type: "input",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.UNDERFREQUENCY_TRIP_VALUE",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.FREQUENCY,
                        required: i === 1,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.FREQUENCY,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `FPP_UF_STAGE${i}_TRIP_TIME` as keyof ProtectionParametersModel,
                    type: "input",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.UNDERFREQUENCY_TRIP_TIME",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        required: i === 1,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
            );
        }

        return protectionFields;
    }

    private static getConnectionFields(
        translate: TranslateService,
    ): StrictFormlyFieldConfig<ConnectionParametersModel>[] {
        const connectionFields: StrictFormlyFieldConfig<ConnectionParametersModel>[] = [];

        connectionFields.push(
            {
                key: "CP_RAMP_UP_UPPER_VOLTAGE",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RAMP_UP_UPPER_VOLTAGE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "CP_RAMP_UP_LOWER_VOLTAGE",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RAMP_UP_LOWER_VOLTAGE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_LOWER,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE_LOWER,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "CP_RAMP_UP_UPPER_FREQUENCY",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RAMP_UP_UPPER_FREQUENCY",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.FREQUENCY,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.FREQUENCY,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "CP_RAMP_UP_LOWER_FREQUENCY",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RAMP_UP_LOWER_FREQUENCY",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.FREQUENCY,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.FREQUENCY,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "CP_RAMP_UP_OBSERVATION_TIME",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RAMP_UP_OBSERVATION_TIME",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.OBSERVATION_TIME,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.OBSERVATION_TIME,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "CP_SOFT_RAMP_UP_GRADIENT_ENABLE",
                type: "checkbox",
                resetOnHide: false,
                expressionProperties: {
                    className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression(
                        "CP_SOFT_RAMP_UP_GRADIENT_ENABLE",
                    ),
                },
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.SOFT_RAMP_UP_GRADIENT_ENABLE",
                    ),
                    description: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.SOFT_RAMP_UP_GRADIENT_ENABLE_DESC",
                    ),
                },
            },
            {
                key: "CP_SOFT_RAMP_UP_GRADIENT",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.SOFT_RAMP_UP_GRADIENT_VALUE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsTrue<ConnectionParametersModel>("CP_SOFT_RAMP_UP_GRADIENT_ENABLE"),
                    "templateOptions.required": FormlyUtils.propIsTrue<ConnectionParametersModel>(
                        "CP_SOFT_RAMP_UP_GRADIENT_ENABLE",
                    ),
                },
            },
            {
                key: "CP_RECONNECTION_UPPER_VOLTAGE",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_UPPER_VOLTAGE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "CP_RECONNECTION_LOWER_VOLTAGE",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_LOWER_VOLTAGE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_LOWER,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE_LOWER,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "CP_RECONNECTION_UPPER_FREQUENCY",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_UPPER_FREQUENCY",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.FREQUENCY,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.FREQUENCY,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "CP_RECONNECTION_LOWER_FREQUENCY",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_LOWER_FREQUENCY",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.FREQUENCY,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.FREQUENCY,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "CP_RECONNECTION_OBSERVATION_TIME",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_OBSERVATION_TIME",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.OBSERVATION_TIME,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.OBSERVATION_TIME,
                    }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "CP_RECONNECTION_GRADIENT_ENABLE",
                type: "checkbox",
                resetOnHide: false,
                expressionProperties: {
                    className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression(
                        "CP_RECONNECTION_GRADIENT_ENABLE",
                    ),
                },
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_GRADIENT_ENABLE",
                    ),
                    description: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_GRADIENT_ENABLE_DESC",
                    ),
                },
            },
            {
                key: "CP_RECONNECTION_GRADIENT",
                type: "input",
                resetOnHide: false,
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_GRADIENT_VALUE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsTrue<ConnectionParametersModel>("CP_RECONNECTION_GRADIENT_ENABLE"),
                    "templateOptions.required": FormlyUtils.propIsTrue<ConnectionParametersModel>(
                        "CP_RECONNECTION_GRADIENT_ENABLE",
                    ),
                },
            },
        );

        return connectionFields;
    }

    private static getVoltageRtFields(translate: TranslateService): StrictFormlyFieldConfig<VoltageRideThroughModel>[] {
        const vrtFields: StrictFormlyFieldConfig<VoltageRideThroughModel>[] = [
            {
                key: "VRT_LVRT_ENABLE",
                type: "checkbox",
                resetOnHide: false,
                expressionProperties: {
                    className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("VRT_LVRT_ENABLE"),
                },
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.ENABLE",
                    ),
                    description: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.ENABLE_DESC",
                    ),
                },
            },
        ];

        for (let i = 1; i <= 7; i++) {
            vrtFields.push(
                {
                    key: `VRT_UV${i}_VOLTAGE` as keyof VoltageRideThroughModel,
                    type: "input",
                    resetOnHide: false,
                    className: "ion-padding-start",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.UV_VOLTAGE",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_LVRT_ENABLE"),
                        "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("VRT_LVRT_ENABLE"),
                    },
                },
                {
                    key: `VRT_UV${i}_TIME` as keyof VoltageRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    resetOnHide: false,
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.UV_TIME",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.UNDERVOTAGE_TRIP_TIME,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.UNDERVOTAGE_TRIP_TIME,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_LVRT_ENABLE"),
                        "templateOptions.required": (field) => {
                            if (field.model && i !== 1) {
                                return field.model.VRT_LVRT_ENABLE === true;
                            }
                            return false;
                        },
                    },
                },
            );
        }

        vrtFields.push(
            {
                key: "VRT_ENTER_LVRT_THRESHOLD",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.ENTER_THRESHOLD",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_LVRT_ENABLE"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("VRT_LVRT_ENABLE"),
                },
            },
            {
                key: "VRT_EXIT_LVRT_ENDPOINT",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.EXIT_ENDPOINT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_LVRT_ENABLE"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("VRT_LVRT_ENABLE"),
                },
            },
            {
                key: "VRT_K1_SLOPE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.K1_SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.SLOPE_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.SLOPE_RANGE", {
                        ...GRID_SETTING_RANGES.SLOPE_SECONDS,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_LVRT_ENABLE"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("VRT_LVRT_ENABLE"),
                },
            },
            {
                key: "VRT_LVRT_ZERO_CURRENT_MODE_ENABLE",
                type: "checkbox",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.ZERO_CURRENT_ENABLE",
                    ),
                },
                expressions: {
                    hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_LVRT_ENABLE"),
                },
            },
            {
                key: "VRT_LVRT_ZERO_CURRENT_MODE_ENTRY_THRESHOLD",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.ZERO_CURRENT_THRESHOLD",
                    ),
                    type: "number",
                    min: 0,
                    max: 1000,
                    unit: GridUnit.PERCENT_VN,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        min: 0,
                        max: 1000,
                        unit: GridUnit.PERCENT_VN,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.anyPropIsFalse<VoltageRideThroughModel>(
                        "VRT_HVRT_ENABLE",
                        "VRT_HVRT_ZERO_CURRENT_MODE_ENABLE",
                    ),
                },
            },
        );

        vrtFields.push({
            key: "VRT_HVRT_ENABLE",
            type: "checkbox",
            resetOnHide: false,
            expressionProperties: {
                className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("VRT_HVRT_ENABLE"),
            },
            templateOptions: {
                label: translate.instant(
                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.ENABLE",
                ),
                description: translate.instant(
                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.ENABLE_DESC",
                ),
            },
        });

        for (let i = 1; i <= 5; i++) {
            vrtFields.push(
                {
                    key: `VRT_OV${i}_VOLTAGE` as keyof VoltageRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    resetOnHide: false,
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.OV_VOLTAGE",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                        "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                    },
                },
                {
                    key: `VRT_OV${i}_TIME` as keyof VoltageRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    resetOnHide: false,
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.OV_TIME",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.UNDERVOTAGE_TRIP_TIME,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.UNDERVOTAGE_TRIP_TIME,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                        "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                    },
                },
            );
        }

        vrtFields.push(
            {
                key: "VRT_ENTER_HIGH_CROSSING_THRESHOLD",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.ENTER_THRESHOLD",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                },
            },
            {
                key: "HVRT_EXIT_HIGH_CROSSING_THRESHOLD",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.EXIT_ENDPOINT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                },
            },
            {
                key: "HVRT_K2_SLOPE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.K2_SLOPE",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.SLOPE_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.SLOPE_RANGE", {
                        ...GRID_SETTING_RANGES.SLOPE_SECONDS,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                },
            },
            {
                key: "VRT_HVRT_ZERO_CURRENT_MODE_ENABLE",
                type: "checkbox",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.ZERO_CURRENT_ENABLE",
                    ),
                },
                expressions: {
                    hide: FormlyUtils.propIsFalse<VoltageRideThroughModel>("VRT_HVRT_ENABLE"),
                },
            },
            {
                key: "VRT_HVRT_ZERO_CURRENT_MODE_ENTRY_THRESHOLD",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.ZERO_CURRENT_THRESHOLD",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.anyPropIsFalse<VoltageRideThroughModel>(
                        "VRT_HVRT_ENABLE",
                        "VRT_HVRT_ZERO_CURRENT_MODE_ENABLE",
                    ),
                },
            },
        );

        vrtFields.push(
            {
                key: "VRT_CURRENT_DISTRIBUTION_MODE",
                type: "select",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.CURRENT_DISTRIBUTION_MODE",
                    ),
                    required: true,
                    options: [
                        {
                            value: CurrentDistributionMode.REACTIVE_PRIORITY,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.REACTIVE_PRIORITY",
                            ),
                        },
                        {
                            value: CurrentDistributionMode.ACTIVE_PRIORITY,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.ACTIVE_PRIORITY",
                            ),
                        },
                        {
                            value: CurrentDistributionMode.CONSTANT_CURRENT,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.CONSTANT_CURRENT",
                            ),
                        },
                    ],
                },
            },
            {
                key: "VRT_ACTIVE_POWER_RECOVERY_MODE",
                type: "select",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.ACTIVE_RECOVERY_MODE",
                    ),
                    required: true,
                    options: [
                        {
                            value: RecoveryMode.DISABLE,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.DEACTIVATE",
                            ),
                        },
                        {
                            value: RecoveryMode.GRADIENT_CONTROL,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.GRADIENT_CONTROL",
                            ),
                        },
                        {
                            value: RecoveryMode.PT_1_BEHAVIOUR,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.PT_1_BEHAVIOUR",
                            ),
                        },
                    ],
                },
            },
            {
                key: "VRT_ACTIVE_POWER_RECOVERY_SPEED",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.POWER_GRADIENT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.POWER_GRADIENT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.POWER_GRADIENT,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<VoltageRideThroughModel>(
                        "VRT_ACTIVE_POWER_RECOVERY_MODE",
                        RecoveryMode.GRADIENT_CONTROL,
                    ),
                    "templateOptions.required": FormlyUtils.propEquals<VoltageRideThroughModel>(
                        "VRT_ACTIVE_POWER_RECOVERY_MODE",
                        RecoveryMode.GRADIENT_CONTROL,
                        false,
                    ),
                },
            },
            {
                key: "VRT_ACTIVE_POWER_RECOVERY_SLOPE",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.PT1_TIME_CONSTANT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.LOW_PASS_FILTER_TIME_CONSTANT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.LOW_PASS_FILTER_TIME_CONSTANT,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<VoltageRideThroughModel>(
                        "VRT_ACTIVE_POWER_RECOVERY_MODE",
                        RecoveryMode.PT_1_BEHAVIOUR,
                    ),
                    "templateOptions.required": FormlyUtils.propEquals<VoltageRideThroughModel>(
                        "VRT_ACTIVE_POWER_RECOVERY_MODE",
                        RecoveryMode.PT_1_BEHAVIOUR,
                        false,
                    ),
                },
            },
            {
                key: "VRT_REACTIVE_POWER_RECOVERY_MODE_END",
                type: "select",
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.REACTIVE_RECOVERY_MODE",
                    ),
                    required: true,
                    options: [
                        {
                            value: RecoveryMode.DISABLE,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.DEACTIVATE",
                            ),
                        },
                        {
                            value: RecoveryMode.GRADIENT_CONTROL,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.GRADIENT_CONTROL",
                            ),
                        },
                        {
                            value: RecoveryMode.PT_1_BEHAVIOUR,
                            label: translate.instant(
                                "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.PT_1_BEHAVIOUR",
                            ),
                        },
                    ],
                },
            },
            {
                key: "VRT_REACTIVE_POWER_RECOVERY_SPEED",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.POWER_GRADIENT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.POWER_GRADIENT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.POWER_GRADIENT,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<VoltageRideThroughModel>(
                        "VRT_REACTIVE_POWER_RECOVERY_MODE_END",
                        RecoveryMode.GRADIENT_CONTROL,
                    ),
                    "templateOptions.required": FormlyUtils.propEquals<VoltageRideThroughModel>(
                        "VRT_REACTIVE_POWER_RECOVERY_MODE_END",
                        RecoveryMode.GRADIENT_CONTROL,
                        false,
                    ),
                },
            },
            {
                key: "VRT_REACTIVE_POWER_RECOVERY_SLOPE",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant(
                        "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.PT1_TIME_CONSTANT",
                    ),
                    type: "number",
                    ...GRID_SETTING_RANGES.LOW_PASS_FILTER_TIME_CONSTANT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                        ...GRID_SETTING_RANGES.LOW_PASS_FILTER_TIME_CONSTANT,
                    }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    hide: FormlyUtils.propNotEquals<VoltageRideThroughModel>(
                        "VRT_REACTIVE_POWER_RECOVERY_MODE_END",
                        RecoveryMode.PT_1_BEHAVIOUR,
                    ),
                    "templateOptions.required": FormlyUtils.propEquals<VoltageRideThroughModel>(
                        "VRT_REACTIVE_POWER_RECOVERY_MODE_END",
                        RecoveryMode.PT_1_BEHAVIOUR,
                        false,
                    ),
                },
            },
        );

        return vrtFields;
    }

    private static getFrtFields(translate: TranslateService): StrictFormlyFieldConfig<FrequencyRideThroughModel>[] {
        const frtFields: StrictFormlyFieldConfig<FrequencyRideThroughModel>[] = [];

        frtFields.push({
            key: "FRT_ENABLE",
            type: "checkbox",
            resetOnHide: false,
            expressionProperties: {
                className: ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("FRT_ENABLE"),
            },
            templateOptions: {
                label: translate.instant(
                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.ENABLE",
                ),
                description: translate.instant(
                    "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.ENABLE_DESC",
                ),
            },
        });

        for (let i = 1; i <= 3; i++) {
            frtFields.push(
                {
                    key: `FRT_UF${i}_FREQUENCY` as keyof FrequencyRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.UF_FREQUENCY",
                            { stage: i },
                        ),
                        type: "number",
                        min: 45000,
                        max: 60000,
                        unit: GridUnit.MILLI_HERTZ,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            min: 45000,
                            max: 60000,
                            unit: GridUnit.MILLI_HERTZ,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        hide: FormlyUtils.propIsFalse<FrequencyRideThroughModel>("FRT_ENABLE"),
                        "templateOptions.required": FormlyUtils.propIsTrue<FrequencyRideThroughModel>("FRT_ENABLE"),
                    },
                },
                {
                    key: `FRT_UF${i}_TIME` as keyof FrequencyRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.UF_TIME",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.FREQUENY_TIME_PER_MILLISECONDS,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.FREQUENY_TIME_PER_MILLISECONDS,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        hide: FormlyUtils.propIsFalse<FrequencyRideThroughModel>("FRT_ENABLE"),
                        "templateOptions.required": FormlyUtils.propIsTrue<FrequencyRideThroughModel>("FRT_ENABLE"),
                    },
                },
            );
        }

        for (let i = 1; i <= 3; i++) {
            frtFields.push(
                {
                    key: `FRT_OF${i}_FREQUENCY` as keyof FrequencyRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.OF_FREQUENCY",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        hide: FormlyUtils.propIsFalse<FrequencyRideThroughModel>("FRT_ENABLE"),
                        "templateOptions.required": FormlyUtils.propIsTrue<FrequencyRideThroughModel>("FRT_ENABLE"),
                    },
                },
                {
                    key: `FRT_OF${i}_TIME` as keyof FrequencyRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    templateOptions: {
                        label: translate.instant(
                            "INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.OF_TIME",
                            { stage: i },
                        ),
                        type: "number",
                        ...GRID_SETTING_RANGES.FREQUENY_TIME_PER_MILLISECONDS,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", {
                            ...GRID_SETTING_RANGES.FREQUENY_TIME_PER_MILLISECONDS,
                        }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        hide: FormlyUtils.propIsFalse<FrequencyRideThroughModel>("FRT_ENABLE"),
                    },
                },
            );
        }

        return frtFields;
    }

    public ngOnInit(): void {
        this.model = this.ibn.advancedGridSettings;
        this.fields = ConfigurationAdvancedSettingsComponent.buildFields(this.translate);
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.ibn.advancedGridSettings = this.model;
        this.nextViewEvent.emit(this.ibn);
    }
}
