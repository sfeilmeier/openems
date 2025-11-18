import { TranslateService } from "@ngx-translate/core";

import { Category } from "../../shared/category";
import { View } from "../../shared/enums";
import { SystemId, SystemType } from "../../shared/system";
import { AbstractHome10Ibn } from "./abstract-home-10";

export class Home10HeckertIbn extends AbstractHome10Ibn {

    public override readonly systemType: SystemType = SystemType.HECKERT_HOME;
    public override readonly systemId: SystemId = SystemId.HECKERT_HOME_10;
    public override readonly emsBoxLabel = Category.EMS_BOX_LABEL_HECKERT;
    public override readonly indexOf14aLimiterControllerView: number = 6;

    constructor(translate: TranslateService) {
        super([
            View.PreInstallation,
            View.PreInstallationUpdate,
            View.ConfigurationSystem,
            View.ProtocolInstaller,
            View.ProtocolCustomer,
            View.ProtocolSystem,
            View.ProtocolSystemLocation,
            View.ConfigurationEssLimiter14aComponent,
            View.ConfigurationEmergencyReserve,
            View.ConfigurationLineSideMeterFuse,
            View.ProtocolPv,
            View.ProtocolFeedInLimitation,
            View.ConfigurationSummary,
            View.ConfigurationExecute,
            View.ProtocolSerialNumbers,
            View.Completion,
        ], translate);
    }
}
