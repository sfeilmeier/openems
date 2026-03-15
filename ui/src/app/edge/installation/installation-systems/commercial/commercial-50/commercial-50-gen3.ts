import { TranslateService } from "@ngx-translate/core";

import { FormlyFieldConfig } from "node_modules/@ngx-formly/core/lib/models/fieldconfig";
import { ExternalLimitationType, FeedInSetting } from "../../../shared/enums";
import { SystemId } from "../../../shared/system";
import { SafetyCountry } from "../../../views/configuration-execute/safety-country";
import { AbstractCommercialGen3, CommercialGen3App, GensetProperties } from "../abstract-commercial-gen3";

export class Commercial50Gen3Ibn extends AbstractCommercialGen3 {
    private static readonly MAX_MPPT = 4;

    public override readonly systemId: SystemId = SystemId.COMMERCIAL_50_GEN_3;
    public override appId: string = "App.FENECON.Commercial.50.Gen3";
    public override appAlias: string = "FENECON Commercial 50";

    protected override readonly baseImagePath = "assets/img/ibn/mppt/c-50-mppt/";

    constructor(translate: TranslateService) {
        super(AbstractCommercialGen3.VIEWS, Commercial50Gen3Ibn.MAX_MPPT, translate);
    }

    public override getEmergencyReserveFields(): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = super.getEmergencyReserveFields();

        fields.push({
            key: "genset.isEnabled",
            type: "checkbox",

            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.GENSET.EMERGENCY_POWER_FUNCTION"),
            },
            expressions: {
                "templateOptions.disabled": (field) => {
                    return !(field.model?.isStsBoxAvailable ?? true);
                },
                "hide": (field) => {
                    return !(field.model?.isEnabled ?? false);
                },
            },
            hooks: {
                onInit: (field) => {
                    field.formControl?.valueChanges.subscribe((isChecked: boolean) => {
                        field.model.generator.isGeneratorConnected = isChecked;
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
                hide: (field) => {
                    return !(field.model?.genset?.isEnabled ?? false);
                },
            },
            hooks: {
                onInit: (field) => {
                    field.formControl?.valueChanges.subscribe((isChecked: boolean) => {

                        if (field.model != null) {
                            field.model.genset.isEnabled = isChecked;
                        }
                        // Just updataing the model value does not disable the checkbox. so no need to disable it.
                        field.form?.get("genset.isEnabled")?.setValue(isChecked);
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
                "hide": (field) => !(field.model?.genset?.isEnabled ?? false),
                "props.disabled": (field) => !(field.model?.genset?.isGensetConnected ?? false),
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
                "hide": (field) => !(field.model?.genset?.isEnabled ?? false),
                "props.disabled": (field) => !(field.model?.genset?.isConnected ?? false),
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
                "hide": (field) => !(field.model?.genset?.isEnabled ?? false),
                "props.disabled": (field) => !(field.model?.genset?.isConnected ?? false),
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
                hide: (field) => !(field.model?.genset?.isEnabled ?? false),
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
                "hide": (field) => !(field.model?.genset?.isConnected ?? false),
                "props.disabled": (field) => !(field.model?.genset?.enableCharge ?? false),
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
                "hide": (field) => !(field.model?.genset?.isConnected ?? false),
                "props.disabled": (field) => !(field.model?.genset?.enableCharge ?? false),
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
                "hide": (field) => !(field.model?.genset?.isConnected ?? false),
                "props.disabled": (field) => !(field.model?.genset?.enableCharge ?? false),
            },
            wrappers: ["input-with-unit"],
        });

        return fields;
    }

    public override getAppProperties(safetyCountry: SafetyCountry, feedInSetting: FeedInSetting): CommercialGen3App & GensetProperties {

        return {
            ...this.commonProperties(safetyCountry, feedInSetting),
            FEED_IN_TYPE: this.feedInLimitation?.feedInType ?? ExternalLimitationType.NO_LIMITATION,
            GRID_CODE: this.gridSetting,
            CT_RATIO_FIRST: this.energyFlowMeter.value,
            ...this.generateMpptProperties(),
            ...this.getGensetProperties(),
        } as CommercialGen3App & GensetProperties;
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
