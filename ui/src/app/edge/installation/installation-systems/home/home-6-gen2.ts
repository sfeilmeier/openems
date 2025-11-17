// @ts-strict-ignore
import { TranslateService } from "@ngx-translate/core";

import { Category } from "../../shared/category";
import { FeedInSetting, View } from "../../shared/enums";
import { Meter } from "../../shared/meter";
import { SystemId } from "../../shared/system";
import { SafetyCountry } from "../../views/configuration-execute/safety-country";
import { AbstractHomeIbn } from "./abstract-home";
import { AbstractHomeGen2Ibn } from "./abstract-home-gen2";

export class Home6Gen2FeneconIbn extends AbstractHomeGen2Ibn {

    public override readonly maxNumberOfModulesPerTower: number = 14;
    public override readonly maxNumberOfPvStrings: number = 2;
    public override readonly maxNumberOfMppt: number = 0;
    public override readonly maxNumberOfTowers: number = 3;
    public override readonly minNumberOfModulesPerTower: number = 3;
    public override readonly minNumberOfTowers: number = 1;

    public override readonly systemId: SystemId = SystemId.FENECON_HOME_6;
    public override readonly emsBoxLabel = Category.EMS_BOX_LABEL_HOME;
    public override readonly appId: string = "App.FENECON.Home6";
    public override readonly appAlias: string = "FENECON Home";
    public override readonly defaultEnergyFlowMeter: Meter.GridMeterCategory = Meter.GridMeterCategory.INTEGRATED_METER;

    public override mppt: {
        mppt1: boolean;
        mppt2: boolean;
    } = {
        mppt1: false,
        mppt2: false,
    };

    constructor(public override translate: TranslateService) {
        super([
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
            View.Completion,
        ], translate);
    }

    public override getAppProperties(safetyCountry: SafetyCountry, feedInSetting: FeedInSetting): {} {
        const dc1 = this.pv.dc[0];
        const dc2 = this.pv.dc[1];

        const home6Gen2AppProperties = {
            ...this.commonProperties(safetyCountry, feedInSetting),
            ...this.additionalProperties(),
            HAS_DC_PV1: dc1.isSelected,
            ...(dc1.isSelected && { DC_PV1_ALIAS: dc1.alias }),
            HAS_DC_PV2: dc2.isSelected,
            ...(dc2.isSelected && { DC_PV2_ALIAS: dc2.alias }),
        };

        return home6Gen2AppProperties;
    }

    public getImageUrl(mppt: number): string {
        return `${AbstractHomeIbn.BASE_IMAGE_PATH}Home_6_MPPT${mppt}.png`;
    }

    public override getMpptLabel(mppt: number, pv: number) {
        return "MPPT" + pv;
    }

    public override getEnergyFlowMeterFields() {
        return this.getGen2EnergyFlowMeterFields();
    }
}
