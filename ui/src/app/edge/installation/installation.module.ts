// @ts-strict-ignore
import { NgModule } from "@angular/core";
import { AbstractControl, FormControl, ValidationErrors } from "@angular/forms";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { SetupKeyComponent } from "src/app/edge/installation/shared/reusable-input-field";
import { SystemLocationValidatorComponent } from "src/app/shared/components/system-location-validator/system-location-validator.component";
import { SharedModule } from "src/app/shared/shared.module";
import { Language } from "src/app/shared/type/language";
import { AlertingComponent } from "../settings/alerting/component/alerting.component";
import { SettingsModule } from "../settings/settings.module";
import { OeSystemUpdateComponent } from "../settings/system/oe-system-update.component";
import de from "./i18n/de.json";
import en from "./i18n/en.json";
import { AbstractIbn } from "./installation-systems/abstract-ibn";
import { InstallationViewComponent } from "./installation-view/installation-view.component";
import { InstallationComponent } from "./installation.component";
import { ExtensionBoxPrefix } from "./shared/ibndatatypes";
import { CompletionComponent } from "./views/completion/completion.component";
import { ConfigurationCommercialModbuBridgeComponent } from "./views/configuration-commercial-modbusbridge/configuration-commercial-modbusbridge";
import { ConfigurationEmergencyReserveComponent } from "./views/configuration-emergency-reserve/configuration-emergency-reserve.component";
import { ConfigurationEnergyFlowMeterComponent } from "./views/configuration-energy-flow-direction-meter/configuration-energy-flow-direction-meter.component";
import { ConfigurationEssLimiter14aComponent } from "./views/configuration-ess-limiter-14a/configuration-ess-limiter-14a";
import { ConfigurationExecuteComponent } from "./views/configuration-execute/configuration-execute.component";
import { ConfigurationGridSettingComponent } from "./views/configuration-grid-setting/configuration-grid-setting";
import { ConfigurationLineSideMeterFuseComponent } from "./views/configuration-line-side-meter-fuse/configuration-line-side-meter-fuse.component";
import { ConfigurationMpptSelectionComponent } from "./views/configuration-mppt-selection/configuration-mppt-selection.component";
import { ConfigurationStsBoxComponent } from "./views/configuration-sts-box/configuration-sts-box.component";
import { ConfigurationSubSystemComponent } from "./views/configuration-sub-system/configuration-sub-system";
import { ConfigurationSummaryComponent } from "./views/configuration-summary/configuration-summary.component";
import { ConfigurationSystemComponent } from "./views/configuration-system/configuration-system.component";
import { ConfigurationSystemVariantComponent } from "./views/configuration-system-variant/configuration-system-variant";
import { PreInstallationComponent } from "./views/pre-installation/pre-installation.component";
import { PreInstallationUpdateComponent } from "./views/pre-installation-update/pre-installation-update.component";
import { ProtocolAvuBoxComponent } from "./views/protocol-avu-box/protocol-avu-box";
import { ProtocolChecklistComponent } from "./views/protocol-checklist/protocol-checklist.component";
import { ProtocolCommercialClusterSlaveCountComponent } from "./views/protocol-commercial-cluster/slave-count/slave-count";
import { ProtocolCommercialClusterSlaveInstallationComponent } from "./views/protocol-commercial-cluster/slave-installation/slave-installation";
import { ProtocolCustomerComponent } from "./views/protocol-customer/protocol-customer.component";
import { ProtocolFeedInLimitationComponent } from "./views/protocol-feed-in-limitation/protocol-feed-in-limitation.component";
import { ProtocolInstallerComponent } from "./views/protocol-installer/protocol-installer.component";
import { ProtocolPvComponent } from "./views/protocol-pv/protocol-pv.component";
import { ProtocolSerialNumbersComponent } from "./views/protocol-serial-numbers/protocol-serial-numbers.component";
import { ProtocolSystemComponent } from "./views/protocol-system/protocol-system.component";
import { ProtocolSystemLocationValidationComponent } from "./views/protocol-system-location/protocol-system-location.component";

//#region Validators
export function EmailMatchValidator(control: FormControl): ValidationErrors {

    const { email, emailConfirm } = control.value;
    if (email === emailConfirm) {
        return null;
    }

    return { "emailMatch": true };
}

export function OnlyPositiveIntegerValidator(control: FormControl): ValidationErrors {
    return /^[0-9]+$/.test(control.value) ? null : { "onlyPositiveInteger": true };
}

export function BatteryInverterSerialNumberValidator(control: FormControl): ValidationErrors {
    // This validator checks the length of the value
    return /^.{16}$/.test(control.value) ? null : { "batteryInverterSerialNumber": true };
}

export function EmsBoxSerialNumberValidator(control: FormControl, field: FormlyFieldConfig): ValidationErrors {
    // This validator only checks the value after the prefix, Applies for Home and Commercial but not Netztrenstelle.
    const value: string = control.value ?? "";
    const prefix: string | null = field?.props?.prefix ?? null;

    const DIGITS_ONLY_REGEX = /^\d{9}$/;
    const FULL_SERIAL_REGEX = /^F[CEH][FS]\d{9}$/;

    if (prefix !== null) {
        // When a prefix is already given, we only validate the number part
        return DIGITS_ONLY_REGEX.test(value) ? null : { emsBoxSerialNumber: true };
    }

    // When no prefix is given, expect the full serial format
    return FULL_SERIAL_REGEX.test(value) ? null : { emsBoxSerialNumber: true };
}

export function EmsBoxNetztrennstelleSerialNumberValidator(control: FormControl): ValidationErrors {
    return /^\d{4}$/.test(control.value) ? null : { "emsBoxNetztrennstelleSerialNumber": true };
}

export function BoxSerialNumberValidator(control: FormControl, field: FormlyFieldConfig): ValidationErrors {
    // This validator only checks the value after the prefix
    const BoxSerialNumberRules: Record<string, RegExp> = {
        [ExtensionBoxPrefix.FHP]: /^\d{9}$/,
        [ExtensionBoxPrefix.FCP]: /^\d{9}$/,
        [ExtensionBoxPrefix.FEE]: /^\d{9}$/,
        [ExtensionBoxPrefix.FHA]: /^\d{9}$/,
        [ExtensionBoxPrefix.FCP1]: /^\d{8}$/,
        [ExtensionBoxPrefix.FHE]: /^\d{9}$/,
    };

    const value: string = control.value ?? "";
    const prefix: string | null = field?.props?.prefix ?? null;

    if (prefix !== null && BoxSerialNumberRules[prefix]?.test(value)) {
        return null;
    }

    return { boxSerialNumber: true };
}

export function BatteryAndBmsBoxSerialNumberValidator(control: FormControl): ValidationErrors {
    // This validator only checks the value after the prefix
    return /^[a-zA-Z0-9]{24}$/.test(control.value) ? null : { "batteryAndBmsBoxSerialNumber": true };
}

export function CommercialBmsBoxSerialNumberValidator(control: FormControl): ValidationErrors {
    return /^\d{10}$/.test(control.value) ? null : { "commercialBmsBoxSerialNumber": true };
}

export function CommercialBatteryModuleSerialNumberValidator(control: FormControl): ValidationErrors {
    // This validator only checks the value after the prefix
    return /^\d{8}$/.test(control.value) ? null : { "commercialBatteryModuleSerialNumber": true };
}

export function Commercial30BatteryInverterSerialNumberValidator(control: FormControl): ValidationErrors {
    // This validator checks the length of the value
    return /^.{10}$/.test(control.value) ? null : { "commercialBatteryInverterSerialNumber": true };
}

export function Commercial50BatteryInverterSerialNumberValidator(control: FormControl): ValidationErrors {
    // This validator checks the length of the value
    return /^.{6}$/.test(control.value) ? null : { "commercialBatteryInverterSerialNumber": true };
}

export function ZipCodeValidator(control: FormControl): ValidationErrors {
    // This validator checks the zip code pattern
    return AbstractIbn.COUNTRY_PARTNER_ZIP_CODE_REGEX.test(control.value) ? null : { "zip": true };
}

export function serialNumberRequiredWhenCheckedValidator(control: AbstractControl, field: FormlyFieldConfig): ValidationErrors {
    if (control.value == null || !control.value) {
        return null;
    }

    const snKey = field.props?.serialNumberField?.key;
    if (snKey == null) {
        return null;
    }

    const serialValue = field.model[snKey] as string;
    if (serialValue != null && !serialValue) {
        return { "serialNumberRequired": true };
    }

    return null;
}

/**
 * This validator checks if the value entered is greater than minimum (default) value.
 * Workaround for default min prop in formly field.
 * User has trouble entering value in a field which is initialized with min prop. especially if a minimum value specified is more than one digit.
 *
 * @param control the form control containing the value that needs to be validated.
 * @param field the specific field of the form.
 * @returns sets the validation to true if the condition is met.
 */
export function DefaultAsMinValueValidator(control: FormControl, field: FormlyFieldConfig): ValidationErrors {
    return control.value >= field.defaultValue ? null : { "defaultAsMinimumValue": true };
}

@NgModule({
    imports: [
        FormlyModule.forRoot({
            validators: [
                { name: "emailMatch", validation: EmailMatchValidator },
                { name: "batteryInverterSerialNumber", validation: BatteryInverterSerialNumberValidator },
                { name: "emsBoxSerialNumber", validation: EmsBoxSerialNumberValidator },
                { name: "emsBoxNetztrennstelleSerialNumber", validation: EmsBoxNetztrennstelleSerialNumberValidator },
                { name: "boxSerialNumber", validation: BoxSerialNumberValidator },
                { name: "batteryAndBmsBoxSerialNumber", validation: BatteryAndBmsBoxSerialNumberValidator },
                { name: "onlyPositiveInteger", validation: OnlyPositiveIntegerValidator },
                { name: "commercialBmsBoxSerialNumber", validation: CommercialBmsBoxSerialNumberValidator },
                { name: "commercialBatteryModuleSerialNumber", validation: CommercialBatteryModuleSerialNumberValidator },
                { name: "commercial30BatteryInverterSerialNumber", validation: Commercial30BatteryInverterSerialNumberValidator },
                { name: "commercial50BatteryInverterSerialNumber", validation: Commercial50BatteryInverterSerialNumberValidator },
                { name: "defaultAsMinimumValue", validation: DefaultAsMinValueValidator },
                { name: "zip", validation: ZipCodeValidator },
                { name: "serialNumberRequiredWhenChecked", validation: serialNumberRequiredWhenCheckedValidator },
            ],
        }),
        SharedModule,
        SettingsModule,
        SetupKeyComponent,
        OeSystemUpdateComponent,
        AlertingComponent,
        SystemLocationValidatorComponent,
    ],
    declarations: [
        CompletionComponent,
        ConfigurationEmergencyReserveComponent,
        ConfigurationExecuteComponent,
        ConfigurationLineSideMeterFuseComponent,
        ProtocolCustomerComponent,
        ProtocolFeedInLimitationComponent,
        ProtocolInstallerComponent,
        ProtocolSystemComponent,
        InstallationComponent,
        PreInstallationComponent,
        ConfigurationSystemComponent,
        ProtocolPvComponent,
        ConfigurationSummaryComponent,
        ProtocolSerialNumbersComponent,
        ConfigurationCommercialModbuBridgeComponent,
        ConfigurationMpptSelectionComponent,
        ConfigurationSystemVariantComponent,
        ConfigurationSubSystemComponent,
        ConfigurationEnergyFlowMeterComponent,
        ConfigurationEssLimiter14aComponent,
        ProtocolChecklistComponent,
        ProtocolAvuBoxComponent,
        PreInstallationUpdateComponent,
        InstallationViewComponent,
        ConfigurationGridSettingComponent,
        ProtocolCommercialClusterSlaveCountComponent,
        ProtocolCommercialClusterSlaveInstallationComponent,
        ConfigurationStsBoxComponent,
        ProtocolSystemLocationValidationComponent,
    ],
})
export class InstallationModule {

    constructor(translate: TranslateService) {
        Language.normalizeAdditionalTranslationFiles({ de: de, en: en }).then((translations) => {
            for (const { lang, translation, shouldMerge } of translations) {
                translate.setTranslation(lang, translation, shouldMerge);
            }
        });
    }
}

// TODO rename to Setup or SetupAssistant to be in line with SetupProtocol on Backend side
