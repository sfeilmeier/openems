// @ts-strict-ignore
import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/environments";
import { Category } from "../../shared/category";
import { FeedInSetting, View } from "../../shared/enums";
import { ComponentData, DcPv } from "../../shared/ibndatatypes";
import { Meter } from "../../shared/meter";
import { EXTERNAL_LIMITATION_OPTIONS_WITH_IMAGES } from "../../shared/options";
import { SystemId } from "../../shared/system";
import { SafetyCountry } from "../../views/configuration-execute/safety-country";
import { AbstractHomeIbn, HomeAdditionalApp, HomeCommonApp } from "./abstract-home";

type Home30Mppt = {
    HAS_MPPT_1: boolean;
    ALIAS_MPPT_1?: string;
    HAS_MPPT_2: boolean;
    ALIAS_MPPT_2?: string;
    HAS_MPPT_3: boolean;
    ALIAS_MPPT_3?: string;
};

export class Home30FeneconIbn extends AbstractHomeIbn {
    public override readonly systemId: SystemId = SystemId.FENECON_HOME_30;
    public override readonly emsBoxLabel = Category.EMS_BOX_LABEL_HOME;
    public override readonly appAlias: string = "FENECON Home 30";
    public override readonly systemAppId: string = "App.FENECON.Home.30";
    public override readonly maxNumberOfModulesPerTower: number = 15;
    public override readonly maxNumberOfPvStrings: number = 6;
    public override readonly maxNumberOfMppt: number = 3;
    public override readonly maxNumberOfTowers: number = 5;
    public override readonly minNumberOfModulesPerTower: number = 5;
    public override readonly minNumberOfTowers: number = 1;
    public override readonly relayFactoryId: string = "IO.KMtronic";
    public override readonly defaultEnergyFlowMeter: Meter.GridMeterCategory = Meter.GridMeterCategory.SMART_METER;

    public override mppt: {
        connectionCheck: boolean;
        mppt1: boolean;
        mppt2: boolean;
        mppt3: boolean;
    } = {
        connectionCheck: false,
        mppt1: false,
        mppt2: false,
        mppt3: false,
    };

    protected override readonly mpptImagePaths = environment.links.DOWNLOAD.INSTALLATION.HOME.MPPT.HOME_30;

    constructor(public override translate: TranslateService) {
        super(
            [
                View.PreInstallation,
                View.PreInstallationUpdate,
                View.ConfigurationSystem,
                View.ConfigurationSystemVariant,
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
            ],
            translate,
        );
    }

    public override getAppProperties(
        safetyCountry: SafetyCountry,
        feedInSetting: FeedInSetting,
    ): HomeCommonApp & HomeAdditionalApp & Home30Mppt {
        const dc1: DcPv = this.pv.dc[0];
        const dc2: DcPv = this.pv.dc[1];
        const dc3: DcPv = this.pv.dc[2];

        const home30AppProperties: HomeCommonApp & HomeAdditionalApp & Home30Mppt = {
            ...this.commonProperties(safetyCountry, feedInSetting),
            ...this.additionalProperties(),
            HAS_MPPT_1: dc1.isSelected,
            ...(dc1.isSelected && { ALIAS_MPPT_1: dc1.alias }),
            HAS_MPPT_2: dc2.isSelected,
            ...(dc2.isSelected && { ALIAS_MPPT_2: dc2.alias }),
            HAS_MPPT_3: dc3.isSelected,
            ...(dc3.isSelected && { ALIAS_MPPT_3: dc3.alias }),
        };

        return home30AppProperties;
    }

    public override getMpptLabel(mppt: number) {
        return this.getTwoStringMpptLabel(mppt);
    }

    public override getExternalLimitationTypeOptions(): ComponentData[] {
        const docLink = environment.links.MANUALS.RUNDSTEUER.HOME_20_30;
        return EXTERNAL_LIMITATION_OPTIONS_WITH_IMAGES(this.translate, docLink);
    }
}
