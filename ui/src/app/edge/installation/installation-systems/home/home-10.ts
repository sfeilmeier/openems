import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/environments";
import { Category } from "../../shared/category";
import { View } from "../../shared/enums";
import { SystemId } from "../../shared/system";
import { AbstractHome10Ibn } from "./abstract-home-10";

export class Home10FeneconIbn extends AbstractHome10Ibn {
    public override readonly systemId: SystemId = SystemId.FENECON_HOME_10;
    public override readonly emsBoxLabel = Category.EMS_BOX_LABEL_HOME;
    public override mppt = {
        mppt1: false,
        mppt2: false,
    };

    protected override readonly mpptImagePaths = environment.links.DOWNLOAD.INSTALLATION.HOME.MPPT.HOME_6_10;

    constructor(public override translate: TranslateService) {
        super(
            [
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
                View.ConfigurationLineSideMeterFuse,
                View.ConfigurationEnergyFlowMeter,
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
    public override getMpptLabel(mppt: number): string {
        return "MPPT" + mppt;
    }
}
