import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/environments";
import { View } from "../../../shared/enums";
import { SystemId } from "../../../shared/system";
import { WebLinks } from "../../../shared/weblink.utils";
import { AbstractCommercialGen3 } from "../abstract-commercial-gen3";

export class Commercial50Gen3Ibn extends AbstractCommercialGen3 {
    private static readonly MAX_MPPT = 4;
    private static readonly VIEWS = [
        View.PreInstallation,
        View.PreInstallationUpdate,
        View.ConfigurationSystem,
        View.ConfigurationSubSystem,
        View.ProtocolInstaller,
        View.ProtocolCustomer,
        View.ProtocolSystem,
        View.ProtocolSystemLocation,
        View.ConfigurationEssLimiter14aComponent,
        View.ConfigurationEnergyFlowMeter,
        View.ConfigurationMpptSelection,
        View.ProtocolPv,
        View.ConfigurationStsBox,
        View.ConfigurationGridSetting,
        View.ProtocolFeedInLimitation,
        View.ConfigurationSummary,
        View.ConfigurationExecute,
        View.ProtocolSerialNumbers,
        View.Alerting,
        View.Completion,
    ];

    public override warrantyLink: WebLinks = WebLinks.WARRANTY_LINK_COMMERCIAL_50_GEN3;
    public override readonly systemId: SystemId = SystemId.COMMERCIAL_50_GEN_3;
    public override appId: string = "App.FENECON.Commercial.50.Gen3";
    public override appAlias: string = "FENECON Commercial 50";

    protected override readonly mpptImagePaths = environment.links.DOWNLOAD.INSTALLATION.COMMERCIAL.COMMERCIAL_50.MPPT;

    constructor(translate: TranslateService) {
        super(Commercial50Gen3Ibn.VIEWS, Commercial50Gen3Ibn.MAX_MPPT, translate);
    }
}
