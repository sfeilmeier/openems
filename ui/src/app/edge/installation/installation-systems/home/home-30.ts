// @ts-strict-ignore
import { TranslateService } from "@ngx-translate/core";
import { Category } from "../../shared/category";
import { FeedInSetting, View } from "../../shared/enums";
import { DcPv } from "../../shared/ibndatatypes";
import { Meter } from "../../shared/meter";
import { SystemId } from "../../shared/system";
import { SafetyCountry } from "../../views/configuration-execute/safety-country";
import { AbstractHomeIbn, HomeAdditionalApp, HomeCommonApp } from "./abstract-home";

type Home30Mppt = {
    HAS_MPPT_1: boolean,
    ALIAS_MPPT_1?: string,
    HAS_MPPT_2: boolean,
    ALIAS_MPPT_2?: string,
    HAS_MPPT_3: boolean,
    ALIAS_MPPT_3?: string,
};

export class Home30FeneconIbn extends AbstractHomeIbn {

    public override readonly id: SystemId = SystemId.FENECON_HOME_30;
    public override readonly emsBoxLabel = Category.EMS_BOX_LABEL_HOME;
    public override readonly homeAppAlias: string = "FENECON Home 30";
    public override readonly homeAppId: string = "App.FENECON.Home.30";
    public override readonly maxNumberOfModulesPerTower: number = 15;
    public override readonly maxNumberOfPvStrings: number = 6;
    public override readonly maxNumberOfMppt: number = 3;
    public override readonly maxNumberOfTowers: number = 5;
    public override readonly minNumberOfModulesPerTower: number = 5;
    public override readonly relayFactoryId: string = "IO.KMtronic";
    public override readonly defaultEnergyFlowMeter: Meter.GridMeterCategory = Meter.GridMeterCategory.SMART_METER;

    public override mppt: {
        connectionCheck: boolean,
        mppt1: boolean,
        mppt2: boolean,
        mppt3: boolean,
    } = {
            connectionCheck: false,
            mppt1: false,
            mppt2: false,
            mppt3: false,
        };

    constructor(public override translate: TranslateService) {
        super([
            View.PreInstallation,
            View.PreInstallationUpdate,
            View.ConfigurationSystem,
            View.ConfigurationSystemVariant,
            View.ProtocolInstaller,
            View.ProtocolCustomer,
            View.ProtocolSystem,
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
            View.Completion,
        ], translate);
    }

    public override getHomeAppProperties(safetyCountry: SafetyCountry, feedInSetting: FeedInSetting): HomeCommonApp & HomeAdditionalApp & Home30Mppt {

        const dc1: DcPv = this.pv.dc[0];
        const dc2: DcPv = this.pv.dc[1];
        const dc3: DcPv = this.pv.dc[2];

        const home30AppProperties: HomeCommonApp & HomeAdditionalApp & Home30Mppt = {
            ...this.commonHomeProperties(safetyCountry, feedInSetting),
            ...this.additonalHomeProperties(),
            HAS_MPPT_1: dc1.isSelected,
            ...(dc1.isSelected && { ALIAS_MPPT_1: dc1.alias }),
            HAS_MPPT_2: dc2.isSelected,
            ...(dc2.isSelected && { ALIAS_MPPT_2: dc2.alias }),
            HAS_MPPT_3: dc3.isSelected,
            ...(dc3.isSelected && { ALIAS_MPPT_3: dc3.alias }),
        };

        return home30AppProperties;
    }

    public getImageUrl(mppt: number): string {
        return `${AbstractHomeIbn.BASE_IMAGE_PATH}Home_30_MPPT${mppt}.png`;
    }

    public override getMpptLabel(mppt: number, pv: number) {
        // Each MPPT label associates with two PV strings, calculated as adjacent pairs.
        // For example, MPPT 1 uses PV1 and PV2, MPPT 2 uses PV3 and PV4, and so on.
        const firstPvString = pv * 2 - 1;
        const secondPvString = pv * 2;
        return this.translate.instant("INSTALLATION.PROTOCOL_PV.MARKED_AS_BOTH_STRINGS", { mppt: mppt, pv1: firstPvString, pv2: secondPvString });
    }
}
