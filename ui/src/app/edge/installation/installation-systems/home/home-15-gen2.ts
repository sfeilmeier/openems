// @ts-strict-ignore
import { TranslateService } from "@ngx-translate/core";

import { Category } from "../../shared/category";
import { FeedInSetting, View } from "../../shared/enums";
import { DcPv } from "../../shared/ibndatatypes";
import { Meter } from "../../shared/meter";
import { SystemId } from "../../shared/system";
import { SafetyCountry } from "../../views/configuration-execute/safety-country";
import { AbstractHomeIbn } from "./abstract-home";
import { AbstractHomeGen2Ibn } from "./abstract-home-gen2";

export class Home15Gen2FeneconIbn extends AbstractHomeGen2Ibn {

    public override readonly maxNumberOfModulesPerTower: number = 14;
    public override readonly maxNumberOfPvStrings: number = 3;
    public override readonly maxNumberOfMppt: number = 0;
    public override readonly maxNumberOfTowers: number = 4;
    public override readonly minNumberOfModulesPerTower: number = 3;
    public override readonly minNumberOfTowers: number = 1;

    public override readonly systemId: SystemId = SystemId.FENECON_HOME_15;
    public override readonly emsBoxLabel = Category.EMS_BOX_LABEL_HOME;
    public override readonly appId: string = "App.FENECON.Home15";
    public override readonly appAlias: string = "FENECON Home";
    public override readonly defaultEnergyFlowMeter: Meter.GridMeterCategory = Meter.GridMeterCategory.INTEGRATED_METER;

    public override mppt: {
        mppt1: boolean;
        mppt2: boolean;
        mppt3: boolean,
    } = {
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
        ], translate);
    }

    public override getAppProperties(safetyCountry: SafetyCountry, feedInSetting: FeedInSetting): {} {
        const dc1: DcPv = this.pv.dc[0];
        const dc2: DcPv = this.pv.dc[1];
        const dc3: DcPv = this.pv.dc[2];

        const home10Gen2AppProperties = {
            ...this.commonProperties(safetyCountry, feedInSetting),
            ...this.additionalProperties(),
            HAS_DC_PV1: dc1.isSelected,
            ...(dc1.isSelected && { DC_PV1_ALIAS: dc1.alias }),
            HAS_DC_PV2: dc2.isSelected,
            ...(dc2.isSelected && { DC_PV2_ALIAS: dc2.alias }),
            HAS_DC_PV3: dc3.isSelected,
            ...(dc3.isSelected && { DC_PV3_ALIAS: dc3.alias }),
        };

        return home10Gen2AppProperties;
    }

    public getImageUrl(mppt: number): string {
        return `${AbstractHomeIbn.BASE_IMAGE_PATH}Home_10_15_MPPT${mppt}.png`;
    }

    public override getEnergyFlowMeterFields() {
        return this.getGen2EnergyFlowMeterFields();
    }

    public override getMpptLabel(mppt: number, pv: number) {
        return "MPPT" + pv;
    }
}
