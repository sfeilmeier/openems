import { DocsUtils } from "src/app/shared/utils/docs/docs.utils";
import { environment } from "src/environments";
import { FeedInSetting, View } from "../../shared/enums";
import { ComponentData } from "../../shared/ibndatatypes";
import { Meter } from "../../shared/meter";
import { EXTERNAL_LIMITATION_OPTIONS_WITH_IMAGES } from "../../shared/options";
import { SafetyCountry } from "../../views/configuration-execute/safety-country";
import { AbstractHomeIbn } from "./abstract-home";

export abstract class AbstractHomeGen2Ibn extends AbstractHomeIbn {
    protected static getGen2Views(): View[] {
        return [
            View.PreInstallation,
            View.PreInstallationUpdate,
            View.ConfigurationSystem,
            View.ConfigurationSystemVariant,
            View.ProtocolAvuBox,
            View.ProtocolInstaller,
            View.ProtocolCustomer,
            View.ProtocolSystem,
            View.ProtocolSystemLocation,
            View.ConfigurationEssLimiter14aComponent,
            View.ConfigurationEmergencyReserve,
            View.ConfigurationEnergyFlowMeter,
            View.ConfigurationLineSideMeterFuse,
            View.ConfigurationMpptSelection,
            View.ProtocolPv,
            View.ProtocolFeedInLimitation,
            View.ConfigurationSummary,
            View.ConfigurationExecute,
            View.ProtocolSerialNumbers,
            View.Alerting,
            View.Completion,
        ];
    }

    public override getMpptLabel(mppt: number) {
        return "MPPT" + mppt;
    }

    public override getExternalLimitationTypeOptions(): ComponentData[] {
        const docLink = DocsUtils.replaceWithCurrentDocsLanguage(environment.links.MANUALS.RIPPLE_CONTROL.HOME_GEN_2);
        return EXTERNAL_LIMITATION_OPTIONS_WITH_IMAGES(this.translate, docLink);
    }

    public override getEnergyFlowMeterFields() {
        const standardType: string = this.translate.instant(
            "INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.STANDARD",
        );
        const optionalType: string = this.translate.instant(
            "INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.OPTIONAL",
        );

        const options: {
            value: Meter.GridMeterCategory;
            label: string;
        }[] = [
            {
                value: Meter.GridMeterCategory.INTEGRATED_METER, //
                label: Meter.toGridMeterCategoryLabelString(
                    Meter.GridMeterCategory.INTEGRATED_METER,
                    this.translate,
                    standardType,
                ),
            },
            {
                value: Meter.GridMeterCategory.SMART_METER, //
                label: Meter.toGridMeterCategoryLabelString(
                    Meter.GridMeterCategory.SMART_METER,
                    this.translate,
                    optionalType,
                ),
            },
            {
                value: Meter.GridMeterCategory.COMMERCIAL_METER, //
                label: Meter.toGridMeterCategoryLabelString(
                    Meter.GridMeterCategory.COMMERCIAL_METER,
                    this.translate,
                    optionalType,
                ),
            },
        ];

        return options;
    }

    protected buildGen2AppProperties(
        safetyCountry: SafetyCountry,
        feedInSetting: FeedInSetting,
        dcPvConfig: Record<string, boolean | string>,
    ): {} {
        return {
            ...this.commonProperties(safetyCountry, feedInSetting),
            ...this.additionalProperties(),
            ...dcPvConfig,
        };
    }
}
