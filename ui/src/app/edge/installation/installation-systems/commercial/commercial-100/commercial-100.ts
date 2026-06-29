import { TranslateService } from "@ngx-translate/core";

import { GridSetting } from "../../../shared/enums";
import { GridSettingUtils } from "../../../shared/gridsetting.utils";
import { SystemId } from "../../../shared/system";
import { WebLinks } from "../../../shared/weblink.utils";
import { AbstractCommercialGen3 } from "../abstract-commercial-gen3";

export class Commercial100Ibn extends AbstractCommercialGen3 {
    private static readonly MAX_MPPT = 8;

    public override warrantyLink = WebLinks.WARRANTY_LINK_COMMERCIAL_100;
    public override readonly systemId: SystemId = SystemId.COMMERCIAL_100;
    public override appId: string = "App.FENECON.Commercial.100";
    public override appAlias: string = "FENECON Commercial 100";

    protected override readonly baseImagePath =
        "assets/img/ibn/mppt/c-100-mppt/";

    constructor(translate: TranslateService) {
        super(
            AbstractCommercialGen3.VIEWS,
            Commercial100Ibn.MAX_MPPT,
            translate,
        );
    }

    // TODO: This should be removed when VDE4110 settings implemented in APP.
    public override getGridSettingOptions() {
        return [
            {
                label: GridSettingUtils.getDisplayName(GridSetting.VDE_4105),
                value: GridSetting.VDE_4105,
            },
        ];
    }
}
