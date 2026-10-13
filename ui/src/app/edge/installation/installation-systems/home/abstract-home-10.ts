// @ts-strict-ignore
import { ExternalLimitationType, FeedInSetting } from "../../shared/enums";
import { Meter } from "../../shared/meter";
import { SafetyCountry } from "../../views/configuration-execute/safety-country";
import { AbstractHomeIbn, HomeCommonApp } from "./abstract-home";

type Home10App = HomeCommonApp &
    Home10AppPv & {
        RIPPLE_CONTROL_RECEIVER_ACTIV: boolean;
    };

type Home10AppPv = {
    HAS_DC_PV1: boolean;
    DC_PV1_ALIAS?: string;
    HAS_DC_PV2: boolean;
    DC_PV2_ALIAS?: string;
};

export abstract class AbstractHome10Ibn extends AbstractHomeIbn {
    public override readonly appAlias: string = "FENECON Home";
    public override readonly systemAppId: string = "App.FENECON.Home";
    public override readonly maxNumberOfModulesPerTower: number = 10;
    public override readonly maxNumberOfPvStrings: number = 2;
    public override readonly maxNumberOfMppt: number = 2;
    public override readonly maxNumberOfTowers: number = 3;
    public override readonly minNumberOfModulesPerTower: number = 4;
    public override readonly defaultEnergyFlowMeter: Meter.GridMeterCategory = Meter.GridMeterCategory.SMART_METER;
    public override readonly minNumberOfTowers: number = 1;

    public override mppt: {
        mppt1: boolean;
        mppt2: boolean;
    } = {
        mppt1: true,
        mppt2: true,
    };

    // configuration Energu Flow Meter
    public override energyFlowMeter: {
        meter: Meter.GridMeterCategory;
        value?: number;
    } = {
        meter: this.defaultEnergyFlowMeter,
    };

    public override getAppProperties(safetyCountry: SafetyCountry, feedInSetting: FeedInSetting): {} {
        const dc1 = this.pv.dc[0];
        const dc2 = this.pv.dc[1];

        const home10AppProperties: Home10App = {
            ...this.commonProperties(safetyCountry, feedInSetting),
            ...(this.feedInLimitation.feedInType === ExternalLimitationType.EXTERNAL_LIMITATION && {
                RIPPLE_CONTROL_RECEIVER_ACTIV: true,
            }),
            ...(this.feedInLimitation.feedInType !== ExternalLimitationType.EXTERNAL_LIMITATION && {
                FEED_IN_TYPE: this.feedInLimitation.feedInType,
            }),
            HAS_DC_PV1: dc1.isSelected,
            ...(dc1.isSelected && { DC_PV1_ALIAS: dc1.alias }),
            HAS_DC_PV2: dc2.isSelected,
            ...(dc2.isSelected && { DC_PV2_ALIAS: dc2.alias }),
        };

        return home10AppProperties;
    }

    public override getMpptLabel(mppt: number) {
        return this.translate.instant("INSTALLATION.PROTOCOL_PV.MARKED_AS", { mppt: mppt });
    }
}
