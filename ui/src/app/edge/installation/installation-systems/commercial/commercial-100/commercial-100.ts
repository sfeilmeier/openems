import { TranslateService } from "@ngx-translate/core";

import { ExternalLimitationType, FeedInSetting } from "../../../shared/enums";
import { SystemId } from "../../../shared/system";
import { SafetyCountry } from "../../../views/configuration-execute/safety-country";
import { AbstractCommercialGen3, CommercialGen3App } from "../abstract-commercial-gen3";

export class Commercial100Ibn extends AbstractCommercialGen3 {

    private static readonly MAX_MPPT = 8;

    public override readonly systemId: SystemId = SystemId.COMMERCIAL_100;
    public override appId: string = "App.FENECON.Commercial.100";
    public override appAlias: string = "FENECON Commercial 100";

    protected override readonly baseImagePath = "assets/img/ibn/mppt/c-100-mppt/";

    constructor(translate: TranslateService) {
        super(AbstractCommercialGen3.VIEWS, Commercial100Ibn.MAX_MPPT, translate);
    }

    public override getAppProperties(safetyCountry: SafetyCountry, feedInSetting: FeedInSetting): CommercialGen3App {

        return {
            ...this.commonProperties(safetyCountry, feedInSetting),
            FEED_IN_TYPE: this.feedInLimitation?.feedInType ?? ExternalLimitationType.NO_LIMITATION,
            GRID_CODE: this.gridSetting,
            CT_RATIO_FIRST: this.energyFlowMeter.value,
            ...this.generateMpptProperties(),
        } as CommercialGen3App;
    }
}
