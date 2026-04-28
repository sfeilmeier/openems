import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { FormlyUtils, TypedFormlyFieldConfig } from "src/app/shared/components/formly/formly-utils";
import { SetupProtocol } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { Commercial50Gen3Ibn } from "../../installation-systems/commercial/commercial-50/commercial-50-gen3";
import { Category } from "../../shared/category";
import { ComponentData } from "../../shared/ibndatatypes";
import { FEED_IN_POWER_FACTOR_OPTIONS } from "../../shared/options";
import { ActivePowerModeModel, AdvancedGridSettingsModel, ConnectionParametersModel, COS_PHI_CURVE_POINTS, CurrentDistributionMode, CurveMode, CurvePoint, FrequencyRideThroughModel, GRID_SETTING_RANGES, GridUnit, ProtectionParametersModel, ReactivePowerMode, ReactivePowerModeModel, RecoveryMode, VoltageRideThroughModel } from "./advanced-grid-settings.model";

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

    protected fields: TypedFormlyFieldConfig<AdvancedGridSettingsModel>[] = [];

    constructor(private translate: TranslateService) { }

    public static buildFields(translate: TranslateService): TypedFormlyFieldConfig<AdvancedGridSettingsModel>[] {
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
                            label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.ACTIVE_POWER_MODE"),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getActivePowerFields(translate) as TypedFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                    {
                        type: "accordion",
                        templateOptions: {
                            label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.REACTIVE_POWER_MODE"),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getReactivePowerFields(translate) as TypedFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                    {
                        type: "accordion",
                        templateOptions: {
                            label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.PROTECTION"),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getProtectionFields(translate) as TypedFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                    {
                        type: "accordion",
                        templateOptions: {
                            label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.CONNECTION"),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getConnectionFields(translate) as TypedFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                    {
                        type: "accordion",
                        templateOptions: {
                            label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.VOLTAGE_RIDE_THROUGH"),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getVoltageRtFields(translate) as TypedFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                    {
                        type: "accordion",
                        templateOptions: {
                            label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.GROUPS.FREQUENCY_RIDE_THROUGH"),
                        },
                        fieldGroup: ConfigurationAdvancedSettingsComponent.getFrtFields(translate) as TypedFormlyFieldConfig<AdvancedGridSettingsModel>[],
                    },
                ],
            },
        ];
    }

    /**
     * Gets the advanced grid settings fields for the setup protocol.
     *
     * @param translate the translate service
     * @param advancedGridSettings the advanced grid settings
     * @returns setup protocol fields
     */
    public static getAdvancedGridSettingsFieldsProtocolItems(translate: TranslateService, advancedGridSettings: Commercial50Gen3Ibn["advancedGridSettings"]) {

        const FIELD_SEPARATOR = " - ";
        const advancedGridSettingsFields = ConfigurationAdvancedSettingsComponent.buildFields(translate);
        let advancedGridSettingsProtocolItems: SetupProtocol["items"] = [];

        function traverseFormlyFieldConfig(fields: TypedFormlyFieldConfig<AdvancedGridSettingsModel>, advancedGridSettings: AdvancedGridSettingsModel) {
            for (const field of fields.fieldGroup ?? []) {

                for (const subField of field?.fieldGroup ?? []) {
                    if (subField?.templateOptions?.label != null && fields?.templateOptions?.label != null) {
                        subField.templateOptions.label ??= [(subField?.templateOptions?.label ?? ""), field?.templateOptions?.label ?? ""].join(FIELD_SEPARATOR);
                        subField.templateOptions.label ??= fields.templateOptions.label + FIELD_SEPARATOR + subField.templateOptions.label;
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
                    name: [(fields?.templateOptions?.label ?? ""), field?.templateOptions?.label ?? ""].join(FIELD_SEPARATOR),
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
     * @param translate the translate service
     * @param advancedGridSettings the advanced grid settings
     * @returns the completion summary for the advanced grid settings
     */
    public static getCompletionSummaryFromAdvancedGridSettings(translate: TranslateService, advancedGridSettings: Commercial50Gen3Ibn["advancedGridSettings"]): { header: string; rows: ComponentData[] }[] {
        if (Object.keys(advancedGridSettings).length == 0) {
            return [];
        }
        const protocolItems = ConfigurationAdvancedSettingsComponent.getAdvancedGridSettingsFieldsProtocolItems(translate, advancedGridSettings);
        return [{ header: Category.toTranslatedString(Category.GRID, translate), rows: protocolItems.map(el => ({ label: el.name, value: el.value })) }];
    }

    /**
     * Generates a strict, type-safe expression function for checkbox classes.
     *
     * @param propertyName The strict key from AdvancedGridSettingsModel
     * @param hasPadding Whether to include 'ion-padding-start' in the classes
     */
    private static getCheckboxClassExpression(
        propertyName: keyof AdvancedGridSettingsModel,
        hasPadding: boolean = false
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

    private static getActivePowerFields(translate: TranslateService): TypedFormlyFieldConfig<ActivePowerModeModel>[] {
        return [{
            key: "apmOutputActivePower",
            type: "input",
            className: "genset-nested-field",
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.OUTPUT_ACTIVE_POWER"),
                type: "number",
                min: 0, max: 1100, unit: GridUnit.PER_MILLE,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { min: 0, max: 1100, unit: GridUnit.PER_MILLE }),
                required: true,
            },
            wrappers: ["input-with-unit", "form-field"],
        },
        {
            key: "apmPowerGradient",
            type: "input",
            className: "genset-nested-field",
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.POWER_GRADIENT"),
                type: "number",
                ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS }),
                required: true,
            },
            wrappers: ["input-with-unit", "form-field"],
        },
        {
            key: "apmPfOverFrequencyCurveEnable",
            type: "checkbox",
            expressionProperties: {
                "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("apmPfOverFrequencyCurveEnable"),
            },
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.ENABLE"),
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.ENABLE_DESC"),
            },
        },
        {
            key: "apmPfOverFrequencyStartPoint",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.START_POINT"),
                type: "number",
                ...GRID_SETTING_RANGES.FREQUENCY,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.FREQUENCY }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("apmPfOverFrequencyCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("apmPfOverFrequencyCurveEnable", false),
            },
        },
        {
            key: "apmPfOverFrequencySlope",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.SLOPE"),
                type: "number",
                ...GRID_SETTING_RANGES.GRADIENT_PER_MILLE_PER_HZ,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.GRADIENT_PER_MILLE_PER_HZ }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("apmPfOverFrequencyCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("apmPfOverFrequencyCurveEnable", false),
            },
        },
        {
            key: "apmPfOverFrequencyDelayTime",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.DELAY_TIME"),
                type: "number",
                ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("apmPfOverFrequencyCurveEnable", true),
            },
        },
        {
            key: "apmPfOverFrequencyDeactivationThresholdFstop",
            type: "checkbox",
            resetOnHide: false,
            expressionProperties: {
                "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("apmPfOverFrequencyDeactivationThresholdFstop"),
            },
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.DEACTIVATION_THRESHOLD_FSTOP"),
            },
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("apmPfOverFrequencyCurveEnable", true),
            },
        },
        {
            key: "apmPfOverFrequencyHysteresisPoint",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.HYSTERESIS_POINT"),
                type: "number",
                ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.anyPropIsFalse<ActivePowerModeModel>(
                    "apmPfOverFrequencyCurveEnable",
                    "apmPfOverFrequencyDeactivationThresholdFstop"
                ),
            },
        },
        {
            key: "apmPfOverFrequencyDelayWaitingTime",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.DELAY_WAITING_TIME"),
                type: "number",
                ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.anyPropIsFalse<ActivePowerModeModel>(
                    "apmPfOverFrequencyCurveEnable",
                    "apmPfOverFrequencyDeactivationThresholdFstop"
                ),
            },
        },
        {
            key: "apmPfOverFrequencyHysteresisSlope",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.HYSTERESIS_SLOPE"),
                type: "number",
                ...GRID_SETTING_RANGES.POWER_RECOVERY_SLOPE_PER_MIN,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.POWER_RECOVERY_SLOPE_PER_MIN }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.anyPropIsFalse<ActivePowerModeModel>(
                    "apmPfOverFrequencyCurveEnable",
                    "apmPfOverFrequencyDeactivationThresholdFstop"
                ),
            },
        },
        {
            key: "pfCurveUnderfrequency",
            type: "checkbox",
            expressionProperties: {
                "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("apmPfUnderFrequencyCurveEnable"),
            },
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_UNDER_FREQUENCY.ENABLE"),
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_UNDER_FREQUENCY.ENABLE_DESC"),
            },
        },
        {
            key: "apmPfUnderFrequencyThreshold",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_UNDER_FREQUENCY.THRESHOLD"),
                type: "number",
                ...GRID_SETTING_RANGES.FREQUENCY,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.FREQUENCY }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("apmPfUnderFrequencyCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("apmPfUnderFrequencyCurveEnable", false),
            },
        },
        {
            key: "apmPfUnderFrequencySlope",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_UNDER_FREQUENCY.SLOPE"),
                type: "number",
                ...GRID_SETTING_RANGES.GRADIENT_PER_MILLE_PER_HZ,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.GRADIENT_PER_MILLE_PER_HZ }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("apmPfUnderFrequencyCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("apmPfUnderFrequencyCurveEnable", false),
            },
        },
        {
            key: "apmPfUnderFrequencyDelayTime",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_UNDER_FREQUENCY.DELAY_TIME"),
                type: "number",
                min: 0, max: 1000, unit: GridUnit.SECONDS,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { min: 0, max: 1000, unit: GridUnit.SECONDS }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("apmPfUnderFrequencyCurveEnable", true),
            },
        },
        {
            key: "apmPfUnderFrequencyDeactivationThresholdFstop",
            type: "checkbox",
            expressionProperties: {
                "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("apmPfUnderFrequencyDeactivationThresholdFstop"),
            },
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.DEACTIVATION_THRESHOLD_FSTOP"),
            },
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("apmPfUnderFrequencyCurveEnable", true),
            },
        },
        {
            key: "apmPfUnderFrequencyHysteresisPoint",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.HYSTERESIS_POINT"),
                type: "number",
                ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.anyPropIsFalse<ActivePowerModeModel>("apmPfUnderFrequencyCurveEnable", "apmPfUnderFrequencyDeactivationThresholdFstop"),
            },
        },
        {
            key: "apmPfUnderFrequencyDelayWaitingTime",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.DELAY_WAITING_TIME"),
                type: "number",
                ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.TIME_PER_MILLI_SECONDS }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.anyPropIsFalse<ActivePowerModeModel>("apmPfUnderFrequencyCurveEnable", "apmPfUnderFrequencyDeactivationThresholdFstop"),
            },
        },
        {
            key: "apmPfUnderFrequencyHysteresisSlope",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PF_OVER_FREQUENCY.HYSTERESIS_SLOPE"),
                type: "number",
                ...GRID_SETTING_RANGES.POWER_RECOVERY_SLOPE_PER_MIN,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.POWER_RECOVERY_SLOPE_PER_MIN }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.anyPropIsFalse<ActivePowerModeModel>("apmPfUnderFrequencyCurveEnable", "apmPfUnderFrequencyDeactivationThresholdFstop"),
            },
        },
        {
            key: "puCurveEnable",
            type: "checkbox",
            expressionProperties: {
                "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("puCurveEnable"),
            },
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PU_CURVE.ENABLE"),
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PU_CURVE.ENABLE_DESC"),
            },
        },
        {
            key: "apmPuV1Voltage",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE", { number: 1 }),
                type: "number",
                ...GRID_SETTING_RANGES.VOLTAGE,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("puCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("puCurveEnable", false),
            },
        },
        {
            key: "apmPuV1ActivePower",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.ACTIVE_POWER", { number: 1 }),
                type: "number",
                ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("puCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("puCurveEnable", false),
            },
        },
        {
            key: "apmPuV2Voltage",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE", { number: 2 }),
                type: "number",
                ...GRID_SETTING_RANGES.VOLTAGE,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("puCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("puCurveEnable", false),
            },
        },
        {
            key: "apmPuV2ActivePower",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.ACTIVE_POWER", { number: 2 }),
                type: "number",
                ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("puCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("puCurveEnable", false),
            },
        },
        {
            key: "apmPuV3Voltage",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE", { number: 3 }),
                type: "number",
                ...GRID_SETTING_RANGES.VOLTAGE,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("puCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("puCurveEnable", false),
            },
        },
        {
            key: "apmPuV3ActivePower",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.ACTIVE_POWER", { number: 3 }),
                type: "number",
                ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("puCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("puCurveEnable", false),
            },
        },
        {
            key: "apmPuV4Voltage",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE", { number: 4 }),
                type: "number",
                ...GRID_SETTING_RANGES.VOLTAGE,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("puCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("puCurveEnable", false),
            },
        },
        {
            key: "apmPuV4ActivePower",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.ACTIVE_POWER", { number: 4 }),
                type: "number",
                ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("puCurveEnable", true),
            },
        },
        {
            key: "apmPuOutputResponseMode",
            type: "select",
            className: "ion-padding-start",
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PU_CURVE.RESPONSE_MODE"),
                options: [
                    { value: RecoveryMode.DISABLE, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.DEACTIVATE") },
                    { value: RecoveryMode.GRADIENT_CONTROL, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.GRADIENT_CONTROL") },
                    { value: RecoveryMode.PT_1_BEHAVIOUR, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.PT_1_BEHAVIOUR") },
                ],
            },
            expressions: {
                "hide": FormlyUtils.propIsFalse<ActivePowerModeModel>("puCurveEnable", true),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("puCurveEnable", false),
            },
        },
        {
            key: "apmPuPt1LowPassFilterTimeConstant",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.PU_CURVE.PT1_TIME_CONSTANT"),
                type: "number",
                ...GRID_SETTING_RANGES.TIME_CONSTANT,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.TIME_CONSTANT }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.combineOr<ActivePowerModeModel>(
                    FormlyUtils.propIsFalse("puCurveEnable"),
                    FormlyUtils.propNotEquals("apmPuOutputResponseMode", RecoveryMode.PT_1_BEHAVIOUR)
                ),
                "templateOptions.required": FormlyUtils.propIsTrue<ActivePowerModeModel>("puCurveEnable", false),
            },
        },
        {
            key: "apmPuPt1LowPassFilterConstantGradientMode",
            type: "input",
            className: "ion-padding-start",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.ACTIVE_POWER_MODE.POWER_GRADIENT"),
                type: "number",
                min: 0, max: 650000, unit: GridUnit.PERMILLE_PN_PER_SEC,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { min: 0, max: 650000, unit: GridUnit.PERMILLE_PN_PER_SEC }),
            },
            wrappers: ["input-with-unit", "form-field"],
            expressions: {
                "hide": FormlyUtils.combineOr<ActivePowerModeModel>(
                    FormlyUtils.propIsFalse("puCurveEnable"),
                    FormlyUtils.propNotEquals("apmPuOutputResponseMode", RecoveryMode.GRADIENT_CONTROL)
                ),
                "templateOptions.required": FormlyUtils.combineOr<ActivePowerModeModel>(
                    FormlyUtils.propIsTrue("puCurveEnable"),
                    FormlyUtils.propEquals("apmPuOutputResponseMode", RecoveryMode.GRADIENT_CONTROL)
                ),
            },
        }];
    }

    private static getReactivePowerFields(translate: TranslateService): TypedFormlyFieldConfig<ReactivePowerModeModel>[] {
        const reactivePowerFields: TypedFormlyFieldConfig<ReactivePowerModeModel>[] = [{
            key: "rpmMode",
            type: "select",
            resetOnHide: false,
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.MODE"),
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.MODE_DESC"),
                required: true,
                options: [
                    { value: ReactivePowerMode.NONE, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.NONE") },
                    { value: ReactivePowerMode.FIX_PF, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.FIX_PF") },
                    { value: ReactivePowerMode.FIX_Q, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.FIX_Q") },
                    { value: ReactivePowerMode.QU_CURVE, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.QU_CURVE") },
                    { value: ReactivePowerMode.COS_PHI_P_CURVE, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.COSPHIP_CURVE") },
                    { value: ReactivePowerMode.QP_CURVE, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.QP_CURVE") },
                ],
            },
        }];

        const nestedAccordionsGroup: TypedFormlyFieldConfig<ReactivePowerModeModel> = {
            type: "accordion-group",
            templateOptions: {
                isMulti: true,
            },
            fieldGroup: [{
                type: "accordion",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.FIX_PF"),
                },
                resetOnHide: false,
                expressions: {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmMode", ReactivePowerMode.FIX_PF, true),
                },
                fieldGroup: [
                    {
                        key: "rpmFixPf",
                        type: "select",
                        className: "ion-padding-start",
                        resetOnHide: false,
                        templateOptions: {
                            label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.FIX_PF.POWER_FACTOR"),
                            description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.FIX_PF.POWER_FACTOR_DESC"),
                            required: true,
                            options: FEED_IN_POWER_FACTOR_OPTIONS(translate),
                        },
                    },
                ],
            },
            {
                type: "accordion",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.FIX_Q"),
                },
                expressions: {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmMode", ReactivePowerMode.FIX_Q, true),
                },
                fieldGroup: [
                    {
                        key: "rpmFixQ",
                        type: "input",
                        className: "ion-padding-start",
                        templateOptions: {
                            label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.FIX_Q.REACTIVE_POWER"),
                            type: "number",
                            min: -600, max: 600, unit: GridUnit.PER_MILLE,
                            description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { min: -600, max: 600, unit: GridUnit.PER_MILLE }),
                            required: true,
                        },
                        wrappers: ["input-with-unit", "form-field"],
                    },
                ],
            }],
        };

        const quCurveGroup: TypedFormlyFieldConfig<ReactivePowerModeModel>[] = [
            {
                key: "rpmQuCurveMode",
                type: "select",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.MODE"),
                    required: true,
                    options: [
                        { value: CurveMode.STANDARD, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.STANDARD_MODE") },
                        { value: CurveMode.SLOPE, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.SLOPE_MODE") },
                    ],
                },
            },
            {
                key: "rpmQuVoltageDeadBand",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    type: "number",
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE_DEAD_BAND"),
                    ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmQuCurveMode", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmQuCurveMode", CurveMode.SLOPE, false),
                },
            },
            {
                key: "rpmQuOverexcitedSlope",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.OVEREXCITED_SLOPE"),
                    type: "number",
                    min: -2000, max: 2000, unit: GridUnit.QMAX_PER_10_PERCENT_VN,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { min: -2000, max: 2000, unit: GridUnit.QMAX_PER_10_PERCENT_VN }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmQuCurveMode", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmQuCurveMode", CurveMode.SLOPE, false),
                },
            },
            {
                key: "rpmQuUnderexcitedSlope",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.UNDEREXCITED_SLOPE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmQuCurveMode", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmQuCurveMode", CurveMode.SLOPE, false),
                },
            },
        ];

        for (let i = 1; i <= 4; i++) {
            quCurveGroup.push(
                {
                    key: `rpmQuV${i}Voltage` as keyof ReactivePowerModeModel,
                    type: "input",
                    className: "ion-padding-start",
                    resetOnHide: false,
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.VOLTAGE", { number: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE }),
                        required: true,
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmQuCurveMode", CurveMode.SLOPE, true),
                        "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmQuCurveMode", CurveMode.SLOPE, false),
                    },
                },
                {
                    key: `rpmQuV${i}ReactivePower` as keyof ReactivePowerModeModel,
                    type: "input",
                    className: "ion-padding-start",
                    resetOnHide: false,
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.ACTIVE_POWER", { number: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE }),
                        required: true,
                    },
                    wrappers: ["input-with-unit", "form-field"],
                }
            );
        }

        quCurveGroup.push(
            {
                key: "rpmQuTimeConstant",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.TIME_CONSTANT"),
                    type: "number",
                    ...GRID_SETTING_RANGES.TIME_CONSTANT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.TIME_CONSTANT }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "rpmQuExtendedFunctions",
                type: "checkbox",
                resetOnHide: false,
                expressionProperties: {
                    "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("rpmQuExtendedFunctions", true),
                },
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.EXTENDED_FUNCTIONS"),
                },
            },
            {
                key: "rpmQuLockInPower",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.LOCK_IN_POWER"),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsFalse<ReactivePowerModeModel>("rpmQuExtendedFunctions"),
                    "templateOptions.required": FormlyUtils.propIsTrue<ReactivePowerModeModel>("rpmQuExtendedFunctions"),
                },
            },
            {
                key: "rpmQuLockOutPower",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.LOCK_OUT_POWER"),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsFalse<ReactivePowerModeModel>("rpmQuExtendedFunctions"),
                    "templateOptions.required": FormlyUtils.propIsTrue<ReactivePowerModeModel>("rpmQuExtendedFunctions"),
                },
            }
        );

        nestedAccordionsGroup.fieldGroup!.push({
            type: "accordion",
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.QU_CURVE"),
            },
            expressions: {
                "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmMode", ReactivePowerMode.QU_CURVE, true),
            },
            fieldGroup: quCurveGroup,
        });

        const cosPhiGroup: TypedFormlyFieldConfig<ReactivePowerModeModel>[] = [
            {
                key: "rpmCosPhiMode",
                type: "select",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.MODE"),
                    required: true,
                    options: [
                        { value: CurveMode.STANDARD, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.STANDARD_MODE") },
                        { value: CurveMode.SLOPE, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.SLOPE_MODE") },
                    ],
                },
            },
            {
                key: "rpmCosPhiOverexcitedSlope",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.OVEREXCITED_SLOPE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmCosPhiMode", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmCosPhiMode", CurveMode.SLOPE, false),
                },
            },
            {
                key: "rpmCosPhiUnderexcitedSlope",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.UNDEREXCITED_SLOPE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmCosPhiMode", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmCosPhiMode", CurveMode.SLOPE, false),
                },
            },
        ];

        for (const pt of COS_PHI_CURVE_POINTS) {

            const POINTS_WITH_FIXED_POWER: CurvePoint[] = ["A", "D", "E"];
            const POINTS_WITH_FIXED_COS_PHI: CurvePoint[] = ["E"];

            const hidePow = POINTS_WITH_FIXED_POWER.includes(pt);
            const hideCos = POINTS_WITH_FIXED_COS_PHI.includes(pt);

            const powField: TypedFormlyFieldConfig<ReactivePowerModeModel> = {
                key: `rpmCosPhipPower${pt}` as keyof ReactivePowerModeModel,
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.POWER", { value: pt }),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE }),
                    required: !hidePow,
                },
                wrappers: ["input-with-unit", "form-field"],
            };

            if (hidePow) {
                powField.expressions = {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmCosPhiMode", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmCosPhiMode", CurveMode.SLOPE, false),
                };
            }

            const cosField: TypedFormlyFieldConfig<ReactivePowerModeModel> = {
                key: `rpmCosPhipCosPhi${pt}` as keyof ReactivePowerModeModel,
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false, // Keep your data safe when toggling modes
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.COS_PHI", { value: pt }),
                    type: "number",
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.COS_PHI_DESC"),
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
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmCosPhiMode", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmCosPhiMode", CurveMode.SLOPE, false),
                };
            }

            cosPhiGroup.push(powField, cosField);
        }

        cosPhiGroup.push(
            {
                key: "rpmCosPhipTimeConstant",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.TIME_CONSTANT"),
                    type: "number",
                    ...GRID_SETTING_RANGES.TIME_CONSTANT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.TIME_CONSTANT }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "rpmCosPhipExtendedFunctions",
                type: "checkbox",
                expressionProperties: {
                    "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("rpmCosPhipExtendedFunctions", true),
                },
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.EXTENDED_FUNCTIONS"),
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.EXTENDED_FUNCTIONS_DESC"),
                },
            },
            {
                key: "rpmCosPhipLockInVolt",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.LOCK_IN_VOLT"),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsFalse<ReactivePowerModeModel>("rpmCosPhipExtendedFunctions"),
                },
            },
            {
                key: "rpmCosPhipLockOutVolt",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.COSPHIP_CURVE.LOCK_OUT_VOLT"),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsFalse<ReactivePowerModeModel>("rpmCosPhipExtendedFunctions"),
                },
            }
        );

        nestedAccordionsGroup.fieldGroup!.push({
            type: "accordion",
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.COSPHIP_CURVE"),
            },
            expressions: {
                "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmMode", ReactivePowerMode.COS_PHI_P_CURVE, true),
            },
            fieldGroup: cosPhiGroup,
        });

        const qpCurveGroup: TypedFormlyFieldConfig<ReactivePowerModeModel>[] = [
            {
                key: "rpmQpCurveMode",
                type: "select",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.MODE"),
                    required: true,
                    options: [
                        { value: CurveMode.STANDARD, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.STANDARD_MODE") },
                        { value: CurveMode.SLOPE, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QU_CURVE.MODE.SLOPE_MODE") },
                    ],
                },
            },
            {
                key: "rpmQpOverexcitedSlope",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QP_CURVE.OVEREXCITED_SLOPE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmQpCurveMode", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmQpCurveMode", CurveMode.SLOPE, false),
                },
            },
            {
                key: "rpmQpUnderexcitedSlope",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QP_CURVE.UNDEREXCITED_SLOPE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.UNDER_OVER_EXCITED_SLOPE }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmQpCurveMode", CurveMode.SLOPE, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmQpCurveMode", CurveMode.SLOPE, false),
                },
            },
        ];

        const qpPoints = [1, 2, 3, 4, 5, 6] as const;

        for (const i of qpPoints) {

            const isDynamicPow = i >= 4;
            const isDynamicReact = i >= 5;

            const powField: TypedFormlyFieldConfig<ReactivePowerModeModel> = {
                key: `rpmQpPowerP${i}` as keyof ReactivePowerModeModel,
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.POWER", { value: `P${i}` }),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE }),
                    required: isDynamicPow,
                },
                wrappers: ["input-with-unit", "form-field"],
            };

            if (isDynamicPow) {
                powField.expressions = {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmQpCurveMode", CurveMode.STANDARD, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmQpCurveMode", CurveMode.STANDARD, false),
                };
            }

            const reactField: TypedFormlyFieldConfig<ReactivePowerModeModel> = {
                key: `rpmQpReactivePowerP${i}` as keyof ReactivePowerModeModel,
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER", { value: `P${i}` }),
                    type: "number",
                    ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.ACTIVE_POWER_PER_MILLE }),
                    required: isDynamicReact,
                },
                wrappers: ["input-with-unit", "form-field"],
            };

            if (isDynamicReact) {
                reactField.expressions = {
                    "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmQpCurveMode", CurveMode.STANDARD, true),
                    "templateOptions.required": FormlyUtils.propEquals<ReactivePowerModeModel>("rpmQpCurveMode", CurveMode.STANDARD, false),
                };
            }

            qpCurveGroup.push(powField, reactField);
        }

        qpCurveGroup.push({
            key: "rpmQpTimeConstant",
            type: "input",
            className: "ion-padding-start",
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.QP_CURVE.TIME_CONSTANT"),
                type: "number",
                ...GRID_SETTING_RANGES.TIME_CONSTANT,
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.TIME_CONSTANT }),
            },
            wrappers: ["input-with-unit", "form-field"],
        });

        nestedAccordionsGroup.fieldGroup!.push({
            type: "accordion",
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.REACTIVE_POWER_MODE.OPTIONS.QP_CURVE"),
            },
            expressions: {
                "hide": FormlyUtils.propNotEquals<ReactivePowerModeModel>("rpmMode", ReactivePowerMode.QP_CURVE, true),
            },
            fieldGroup: qpCurveGroup,
        });

        // Add the fully constructed accordion-group back into the main array
        reactivePowerFields.push(nestedAccordionsGroup);
        return reactivePowerFields;
    }

    private static getProtectionFields(translate: TranslateService): TypedFormlyFieldConfig<ProtectionParametersModel>[] {
        const protectionFields: TypedFormlyFieldConfig<ProtectionParametersModel>[] = [];

        for (let i = 1; i <= 4; i++) {
            const uvMin = (i <= 2) ? 0 : 150;

            protectionFields.push(
                {
                    key: `vppOvStage${i}TriggerValue` as keyof ProtectionParametersModel, type: "input",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.OVERVOLTAGE_TRIGGER", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `vppOvStage${i}TripTime` as keyof ProtectionParametersModel, type: "input",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.OVERVOLTAGE_TRIP_TIME", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `vppUvStage${i}TripValue` as keyof ProtectionParametersModel, type: "input",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.UNDERVOLTAGE_TRIP_VALUE", { stage: i }),
                        type: "number",
                        min: uvMin, max: 1000, unit: GridUnit.PERMILLE_VN,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { min: uvMin, max: 1000, unit: GridUnit.PERMILLE_VN }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `vppUvStage${i}TripTime` as keyof ProtectionParametersModel, type: "input",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.UNDERVOLTAGE_TRIP_TIME", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                }
            );
        }

        protectionFields.push(
            {
                key: "vpp10MinOvTripThreshold", type: "input",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.TEN_MIN_OVERVOLTAGE_THRESHOLD"),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                    required: true,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD }),
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "vpp10MinOvTripTime", type: "input",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.TEN_MIN_OVERVOLTAGE_TIME"),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME }),
                },
                wrappers: ["input-with-unit", "form-field"],
            }
        );

        for (let i = 1; i <= 4; i++) {
            protectionFields.push(
                {
                    key: `fppOfStage${i}TriggerValue` as keyof ProtectionParametersModel, type: "input",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.OVERFREQUENCY_TRIGGER", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.FREQUENCY,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.FREQUENCY }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `fppOfStage${i}TripTime` as keyof ProtectionParametersModel, type: "input",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.OVERFREQUENCY_TRIP_TIME", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        required: i < 3,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `fppUfStage${i}TripValue` as keyof ProtectionParametersModel, type: "input",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.UNDERFREQUENCY_TRIP_VALUE", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.FREQUENCY,
                        required: i === 1,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.FREQUENCY }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                },
                {
                    key: `fppUfStage${i}TripTime` as keyof ProtectionParametersModel, type: "input",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.PROTECTION.UNDERFREQUENCY_TRIP_TIME", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME,
                        required: i === 1,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_TRIP_TIME }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                }
            );
        }

        return protectionFields;
    }

    private static getConnectionFields(translate: TranslateService): TypedFormlyFieldConfig<ConnectionParametersModel>[] {
        const connectionFields: TypedFormlyFieldConfig<ConnectionParametersModel>[] = [];

        connectionFields.push(
            {
                key: "cpRampUpUpperVoltage",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RAMP_UP_UPPER_VOLTAGE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "cpRampUpLowerVoltage",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RAMP_UP_LOWER_VOLTAGE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_LOWER,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_LOWER }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "cpRampUpUpperFrequency",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RAMP_UP_UPPER_FREQUENCY"),
                    type: "number",
                    ...GRID_SETTING_RANGES.FREQUENCY,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.FREQUENCY }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "cpRampUpLowerFrequency",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RAMP_UP_LOWER_FREQUENCY"),
                    type: "number",
                    ...GRID_SETTING_RANGES.FREQUENCY,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.FREQUENCY }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "cpRampUpObservationTime",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RAMP_UP_OBSERVATION_TIME"),
                    type: "number",
                    ...GRID_SETTING_RANGES.OBSERVATION_TIME,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.OBSERVATION_TIME }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "cpSoftRampUpGradientEnable",
                type: "checkbox",
                resetOnHide: false,
                expressionProperties: {
                    "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("cpSoftRampUpGradientEnable"),
                },
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.SOFT_RAMP_UP_GRADIENT_ENABLE"),
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.SOFT_RAMP_UP_GRADIENT_ENABLE_DESC"),
                },
            },
            {
                key: "cpSoftRampUpGradient",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.SOFT_RAMP_UP_GRADIENT_VALUE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsTrue<ConnectionParametersModel>("cpSoftRampUpGradientEnable"),
                    "templateOptions.required": FormlyUtils.propIsTrue<ConnectionParametersModel>("cpSoftRampUpGradientEnable"),
                },
            },
            {
                key: "cpReconnectionUpperVoltage",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_UPPER_VOLTAGE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_THRESHOLD }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "cpReconnectionLowerVoltage",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_LOWER_VOLTAGE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_LOWER,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_LOWER }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "cpReconnectionUpperFrequency",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_UPPER_FREQUENCY"),
                    type: "number",
                    ...GRID_SETTING_RANGES.FREQUENCY,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.FREQUENCY }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "cpReconnectionLowerFrequency",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_LOWER_FREQUENCY"),
                    type: "number",
                    ...GRID_SETTING_RANGES.FREQUENCY,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.FREQUENCY }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "cpReconnectionObservationTime",
                type: "input",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_OBSERVATION_TIME"),
                    type: "number",
                    ...GRID_SETTING_RANGES.OBSERVATION_TIME,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.OBSERVATION_TIME }),
                    required: true,
                },
                wrappers: ["input-with-unit", "form-field"],
            },
            {
                key: "cpReconnectionGradientEnable",
                type: "checkbox",
                resetOnHide: false,
                expressionProperties: {
                    "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("cpReconnectionGradientEnable"),
                },
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_GRADIENT_ENABLE"),
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_GRADIENT_ENABLE_DESC"),
                },
            },
            {
                key: "cpReconnectionGradient",
                type: "input",
                resetOnHide: false,
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.CONNECTION.RECONNECTION_GRADIENT_VALUE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.GRADIENT_PER_SECONDS }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsTrue<ConnectionParametersModel>("cpReconnectionGradientEnable"),
                    "templateOptions.required": FormlyUtils.propIsTrue<ConnectionParametersModel>("cpReconnectionGradientEnable"),
                },
            }
        );

        return connectionFields;
    }

    private static getVoltageRtFields(translate: TranslateService): TypedFormlyFieldConfig<VoltageRideThroughModel>[] {
        const vrtFields: TypedFormlyFieldConfig<VoltageRideThroughModel>[] = [{
            key: "vrtLvrtEnable",
            type: "checkbox",
            resetOnHide: false,
            expressionProperties: {
                "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("vrtLvrtEnable"),
            },
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.ENABLE"),
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.ENABLE_DESC"),
            },
        }];

        for (let i = 1; i <= 7; i++) {
            vrtFields.push(
                {
                    key: `vrtUv${i}Voltage` as keyof VoltageRideThroughModel,
                    type: "input",
                    resetOnHide: false,
                    className: "ion-padding-start",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.UV_VOLTAGE", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtLvrtEnable"),
                        "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("vrtLvrtEnable"),
                    },
                },
                {
                    key: `vrtUv${i}Time` as keyof VoltageRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    resetOnHide: false,
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.UV_TIME", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.UNDERVOTAGE_TRIP_TIME,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.UNDERVOTAGE_TRIP_TIME }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtLvrtEnable"),
                        "templateOptions.required": (field) => {
                            if (field.model && i !== 1) {
                                return field.model.vrtLvrtEnable === true;
                            }
                            return false;
                        },
                    },
                }
            );
        }

        vrtFields.push(
            {
                key: "vrtEnterLvrtThreshold",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.ENTER_THRESHOLD"),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtLvrtEnable"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("vrtLvrtEnable"),
                },
            },
            {
                key: "vrtExitLvrtEndpoint",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.EXIT_ENDPOINT"),
                    type: "number",
                    ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.VOLTAGE_DEAD_BAND }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtLvrtEnable"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("vrtLvrtEnable"),
                },
            },
            {
                key: "vrtK1Slope", type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.K1_SLOPE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.SLOPE_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.SLOPE_RANGE", { ...GRID_SETTING_RANGES.SLOPE_SECONDS }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtLvrtEnable"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("vrtLvrtEnable"),
                },
            },
            {
                key: "vrtLvrtZeroCurrentModeEnable",
                type: "checkbox",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.ZERO_CURRENT_ENABLE"),
                },
                expressions: {
                    "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtLvrtEnable"),
                },
            },
            {
                key: "vrtLvrtZeroCurrentModeEntryThreshold",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.LVRT.ZERO_CURRENT_THRESHOLD"),
                    type: "number",
                    min: 0, max: 1000, unit: GridUnit.PERCENT_VN,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { min: 0, max: 1000, unit: GridUnit.PERCENT_VN }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.anyPropIsFalse<VoltageRideThroughModel>("vrtHvrtEnable", "vrtHvrtZeroCurrentModeEnable"),
                },
            }
        );

        vrtFields.push({
            key: "vrtHvrtEnable",
            type: "checkbox",
            resetOnHide: false,
            expressionProperties: {
                "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("vrtHvrtEnable"),
            },
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.ENABLE"),
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.ENABLE_DESC"),
            },
        });

        for (let i = 1; i <= 5; i++) {
            vrtFields.push(
                {
                    key: `vrtOv${i}Voltage` as keyof VoltageRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    resetOnHide: false,
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.OV_VOLTAGE", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtHvrtEnable"),
                        "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("vrtHvrtEnable"),
                    },
                },
                {
                    key: `vrtOv${i}Time` as keyof VoltageRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    resetOnHide: false,
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.OV_TIME", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.UNDERVOTAGE_TRIP_TIME,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.UNDERVOTAGE_TRIP_TIME }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtHvrtEnable"),
                        "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("vrtHvrtEnable"),
                    },
                }
            );
        }

        vrtFields.push(
            {
                key: "vrtEnterHighCrossingThreshold",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.ENTER_THRESHOLD"),
                    type: "number",
                    ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtHvrtEnable"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("vrtHvrtEnable"),
                },
            },
            {
                key: "hvrtExitHighCrossingThreshold",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.EXIT_ENDPOINT"),
                    type: "number",
                    ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtHvrtEnable"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("vrtHvrtEnable"),
                },
            },
            {
                key: "hvrtK2Slope",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.K2_SLOPE"),
                    type: "number",
                    ...GRID_SETTING_RANGES.SLOPE_SECONDS,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.SLOPE_RANGE", { ...GRID_SETTING_RANGES.SLOPE_SECONDS }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtHvrtEnable"),
                    "templateOptions.required": FormlyUtils.propIsTrue<VoltageRideThroughModel>("vrtHvrtEnable"),
                },
            },
            {
                key: "vrtHvrtZeroCurrentModeEnable",
                type: "checkbox",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.ZERO_CURRENT_ENABLE"),
                },
                expressions: {
                    "hide": FormlyUtils.propIsFalse<VoltageRideThroughModel>("vrtHvrtEnable"),
                },
            },
            {
                key: "vrtHvrtZeroCurrentModeEntryThreshold",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.HVRT.ZERO_CURRENT_THRESHOLD"),
                    type: "number",
                    ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.OVER_VOLTAGE_THRESHOLD }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.anyPropIsFalse<VoltageRideThroughModel>("vrtHvrtEnable", "vrtHvrtZeroCurrentModeEnable"),
                },
            }
        );

        vrtFields.push(
            {
                key: "vrtCurrentDistributionMode",
                type: "select",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.CURRENT_DISTRIBUTION_MODE"),
                    required: true,
                    options: [
                        { value: CurrentDistributionMode.REACTIVE_PRIORITY, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.REACTIVE_PRIORITY") },
                        { value: CurrentDistributionMode.ACTIVE_PRIORITY, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.ACTIVE_PRIORITY") },
                        { value: CurrentDistributionMode.CONSTANT_CURRENT, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.CONSTANT_CURRENT") },
                    ],
                },
            },
            {
                key: "vrtActivePowerRecoveryMode",
                type: "select",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.ACTIVE_RECOVERY_MODE"),
                    required: true,
                    options: [
                        { value: RecoveryMode.DISABLE, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.DEACTIVATE") },
                        { value: RecoveryMode.GRADIENT_CONTROL, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.GRADIENT_CONTROL") },
                        { value: RecoveryMode.PT_1_BEHAVIOUR, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.PT_1_BEHAVIOUR") },
                    ],
                },
            },
            {
                key: "vrtActivePowerRecoverySpeed",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.POWER_GRADIENT"),
                    type: "number", ...GRID_SETTING_RANGES.POWER_GRADIENT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.POWER_GRADIENT }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<VoltageRideThroughModel>(
                        "vrtActivePowerRecoveryMode",
                        RecoveryMode.GRADIENT_CONTROL,
                    ),
                    "templateOptions.required": FormlyUtils.propEquals<VoltageRideThroughModel>(
                        "vrtActivePowerRecoveryMode",
                        RecoveryMode.GRADIENT_CONTROL,
                        false
                    ),
                },
            },
            {
                key: "vrtActivePowerRecoverySlope",
                type: "input",
                className: "ion-padding-start",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.PT1_TIME_CONSTANT"),
                    type: "number",
                    ...GRID_SETTING_RANGES.LOW_PASS_FILTER_TIME_CONSTANT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.LOW_PASS_FILTER_TIME_CONSTANT }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<VoltageRideThroughModel>(
                        "vrtActivePowerRecoveryMode",
                        RecoveryMode.PT_1_BEHAVIOUR,
                    ),
                    "templateOptions.required": FormlyUtils.propEquals<VoltageRideThroughModel>(
                        "vrtActivePowerRecoveryMode",
                        RecoveryMode.PT_1_BEHAVIOUR,
                        false
                    ),
                },
            },
            {
                key: "vrtReactivePowerRecoveryModeEnd", type: "select",
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.REACTIVE_RECOVERY_MODE"),
                    required: true,
                    options: [
                        { value: RecoveryMode.DISABLE, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.DEACTIVATE") },
                        { value: RecoveryMode.GRADIENT_CONTROL, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.GRADIENT_CONTROL") },
                        { value: RecoveryMode.PT_1_BEHAVIOUR, label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.OPTIONS.PT_1_BEHAVIOUR") },
                    ],
                },
            },
            {
                key: "vrtReactivePowerRecoverySpeed",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.POWER_GRADIENT"),
                    type: "number",
                    ...GRID_SETTING_RANGES.POWER_GRADIENT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.POWER_GRADIENT }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<VoltageRideThroughModel>(
                        "vrtReactivePowerRecoveryModeEnd",
                        RecoveryMode.GRADIENT_CONTROL,
                    ),
                    "templateOptions.required": FormlyUtils.propEquals<VoltageRideThroughModel>(
                        "vrtReactivePowerRecoveryModeEnd",
                        RecoveryMode.GRADIENT_CONTROL,
                        false
                    ),
                },
            },
            {
                key: "vrtReactivePowerRecoverySlope",
                type: "input",
                className: "ion-padding-start",
                resetOnHide: false,
                templateOptions: {
                    label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.VOLTAGE_RIDE_THROUGH.PT1_TIME_CONSTANT"),
                    type: "number",
                    ...GRID_SETTING_RANGES.LOW_PASS_FILTER_TIME_CONSTANT,
                    description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.LOW_PASS_FILTER_TIME_CONSTANT }),
                },
                wrappers: ["input-with-unit", "form-field"],
                expressions: {
                    "hide": FormlyUtils.propNotEquals<VoltageRideThroughModel>(
                        "vrtReactivePowerRecoveryModeEnd",
                        RecoveryMode.PT_1_BEHAVIOUR,
                    ),
                    "templateOptions.required": FormlyUtils.propEquals<VoltageRideThroughModel>(
                        "vrtReactivePowerRecoveryModeEnd",
                        RecoveryMode.PT_1_BEHAVIOUR,
                        false
                    ),
                },
            }
        );

        return vrtFields;
    }

    private static getFrtFields(translate: TranslateService): TypedFormlyFieldConfig<FrequencyRideThroughModel>[] {
        const frtFields: TypedFormlyFieldConfig<FrequencyRideThroughModel>[] = [];

        frtFields.push({
            key: "frtEnable",
            type: "checkbox",
            resetOnHide: false,
            expressionProperties: {
                "className": ConfigurationAdvancedSettingsComponent.getCheckboxClassExpression("frtEnable"),
            },
            templateOptions: {
                label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.ENABLE"),
                description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.ENABLE_DESC"),
            },
        });

        for (let i = 1; i <= 3; i++) {
            frtFields.push(
                {
                    key: `frtUf${i}Frequency` as keyof FrequencyRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.UF_FREQUENCY", { stage: i }),
                        type: "number",
                        min: 45000, max: 60000, unit: GridUnit.MILLI_HERTZ,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { min: 45000, max: 60000, unit: GridUnit.MILLI_HERTZ }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        "hide": FormlyUtils.propIsFalse<FrequencyRideThroughModel>("frtEnable"),
                        "templateOptions.required": FormlyUtils.propIsTrue<FrequencyRideThroughModel>("frtEnable"),
                    },
                },
                {
                    key: `frtUf${i}Time` as keyof FrequencyRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.UF_TIME", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.FREQUENY_TIME_PER_MILLISECONDS,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.FREQUENY_TIME_PER_MILLISECONDS }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        "hide": FormlyUtils.propIsFalse<FrequencyRideThroughModel>("frtEnable"),
                        "templateOptions.required": FormlyUtils.propIsTrue<FrequencyRideThroughModel>("frtEnable"),
                    },
                }
            );
        }

        for (let i = 1; i <= 3; i++) {
            frtFields.push(
                {
                    key: `frtOf${i}Frequency` as keyof FrequencyRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.OF_FREQUENCY", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.HYSTERISIS_TIME_PER_MILLIHERTZ }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        "hide": FormlyUtils.propIsFalse<FrequencyRideThroughModel>("frtEnable"),
                        "templateOptions.required": FormlyUtils.propIsTrue<FrequencyRideThroughModel>("frtEnable"),
                    },
                },
                {
                    key: `frtOf${i}Time` as keyof FrequencyRideThroughModel,
                    type: "input",
                    className: "ion-padding-start",
                    templateOptions: {
                        label: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.FREQUENCY_RIDE_THROUGH.OF_TIME", { stage: i }),
                        type: "number",
                        ...GRID_SETTING_RANGES.FREQUENY_TIME_PER_MILLISECONDS,
                        description: translate.instant("INSTALLATION.CONFIGURATION_ADVANCED_GRID_SETTINGS.RANGE", { ...GRID_SETTING_RANGES.FREQUENY_TIME_PER_MILLISECONDS }),
                    },
                    wrappers: ["input-with-unit", "form-field"],
                    expressions: {
                        "hide": FormlyUtils.propIsFalse<FrequencyRideThroughModel>("frtEnable"),
                    },
                }
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
