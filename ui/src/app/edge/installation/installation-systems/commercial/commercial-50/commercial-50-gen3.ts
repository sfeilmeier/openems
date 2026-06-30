import { TranslateService } from "@ngx-translate/core";
import { SystemId } from "../../../shared/system";
import { WebLinks } from "../../../shared/weblink.utils";
import { AbstractCommercialGen3 } from "../abstract-commercial-gen3";

export class Commercial50Gen3Ibn extends AbstractCommercialGen3 {
    private static readonly MAX_MPPT = 4;

    public override warrantyLink: WebLinks = WebLinks.WARRANTY_LINK_COMMERCIAL_50_GEN3;
    public override readonly systemId: SystemId = SystemId.COMMERCIAL_50_GEN_3;
    public override appId: string = "App.FENECON.Commercial.50.Gen3";
    public override appAlias: string = "FENECON Commercial 50";

    protected override readonly baseImagePath = "assets/img/ibn/mppt/c-50-mppt/";

    constructor(translate: TranslateService) {
        super(AbstractCommercialGen3.VIEWS, Commercial50Gen3Ibn.MAX_MPPT, translate);
    }

}
