import { NgModule } from "@angular/core";
import { ChangelogComponent } from "src/app/changelog/view/component/changelog.component";
import { SharedModule } from "./../../shared/shared.module";
import { AlertingComponent } from "./alerting/alerting.component";
import { AppModule } from "./app/app.module";
import { AssistantModule } from "./assistant/assistant.module";
import { ChannelsComponent } from "./channels/channels.component";
import { IndexComponent as ComponentInstallIndexComponent } from "./component/install/index.component";
import { ComponentInstallComponent } from "./component/install/install.component";
import { IndexComponent as ComponentUpdateIndexComponent } from "./component/update/index.component";
import { ComponentUpdateComponent } from "./component/update/update.component";
import { EnergyJourneyModule } from "./energy-journey/energy-journey.module";
import { JsonrpcTestModule } from "./jsonrpctest/jsonrpctest.module";
import { NetworkComponent } from "./network/network.component";
import { NetworkOldComponent } from "./network.old/network.old.component";
import { AliasUpdateComponent } from "./profile/aliasupdate.component";
import { ProfileComponent } from "./profile/profile.component";
import { ServiceAssistantModule } from "./serviceassistant/serviceassistant.module";
import { SettingsComponent } from "./settings.component";
import { MaintenanceComponent } from "./system/maintenance/maintenance";
import { OeSystemUpdateComponent } from "./system/oe-system-update.component";
import { SystemComponent } from "./system/system.component";
import { SystemExecuteComponent } from "./systemexecute/systemexecute.component";
import { SystemUpdateOldComponent } from "./systemupdate.old/systemupdate.old.component";

@NgModule({
  imports: [
    AppModule,
    EnergyJourneyModule,
    JsonrpcTestModule,
    SharedModule,
    ServiceAssistantModule,
    AssistantModule,
    ChangelogComponent,
  ],
  declarations: [
    AlertingComponent,
    AliasUpdateComponent,
    ChannelsComponent,
    ComponentInstallComponent,
    ComponentInstallIndexComponent,
    ComponentUpdateComponent,
    ComponentUpdateIndexComponent,
    MaintenanceComponent,
    NetworkComponent,
    NetworkOldComponent,
    OeSystemUpdateComponent,
    ProfileComponent,
    SettingsComponent,
    SystemComponent,
    SystemExecuteComponent,
    SystemUpdateOldComponent,
  ],
  exports: [
    OeSystemUpdateComponent,
  ],
})
export class SettingsModule { }
