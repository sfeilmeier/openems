import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { hasEdgeRole, hasEnvironmentBackend } from "src/app/shared/guards/functional-guards";
import { Role } from "src/app/shared/type/role";
import { ChannelsComponent as EdgeSettingsChannelsComponent } from "./channels/channels.component";
import { IndexComponent as EdgeSettingsComponentInstallIndexComponentComponent } from "./component/install/index.component";
import { ComponentInstallComponent as EdgeSettingsComponentInstallComponentComponent } from "./component/install/install.component";
import { IndexComponent as EdgeSettingsComponentUpdateIndexComponentComponent } from "./component/update/index.component";
import { ComponentUpdateComponent as EdgeSettingsComponentUpdateComponentComponent } from "./component/update/update.component";
import { BatteryExtensionComponent } from "./energy-journey/pages/battery-extension/battery-extension";
import { ElectricityPriceSelectionComponent } from "./energy-journey/pages/electricity-price-choice/electricity-price-selection";
import { JsonrpcTestComponent } from "./jsonrpctest/jsonrpctest";
import { NetworkOldComponent as EdgeSettingsNetworkOldComponent } from "./network.old/network.old.component";
import { SettingsComponent } from "./settings.component";
import { SystemExecuteComponent as EdgeSettingsSystemExecuteComponent } from "./systemexecute/systemexecute.component";

export const settingsRoutes: Routes = [
    {
        path: "",
        component: SettingsComponent,
    },
    {
        path: "industrialLAssistant",
        loadComponent: () =>
            import("./assistant/industrial/industrial").then((m) => m.IndustrialServiceAssistantComponent),
    },
    {
        path: "homeServiceAssistant",
        loadComponent: () => import("./assistant/home/home").then((m) => m.HomeServiceAssistantComponent),
    },
    {
        path: "channels",
        component: EdgeSettingsChannelsComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
    {
        path: "component.install",
        component: EdgeSettingsComponentInstallIndexComponentComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
    {
        path: "component.install/:factoryId",
        component: EdgeSettingsComponentInstallComponentComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
    {
        path: "component.update",
        component: EdgeSettingsComponentUpdateIndexComponentComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
    {
        path: "component.update/:componentId",
        component: EdgeSettingsComponentUpdateComponentComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
    {
        path: "network",
        loadComponent: () => import("./network/network.component").then((m) => m.NetworkComponent),
        canActivate: [hasEdgeRole(Role.INSTALLER)],
    },
    {
        path: "network.old",
        component: EdgeSettingsNetworkOldComponent,
    },
    {
        path: "profile",
        loadComponent: () => import("./profile/profile.component").then((m) => m.ProfileComponent),
    },
    {
        path: "profile/location-validation",
        loadComponent: () =>
            import("./profile/location/location-validator/location-validator").then(
                (m) => m.LocationValidatorComponent,
            ),
    },
    {
        path: "profile/alias-update/:componentId",
        loadComponent: () => import("./profile/aliasupdate.component").then((m) => m.AliasUpdateComponent),
    },
    {
        path: "serviceAssistant",
        loadComponent: () =>
            import("./serviceassistant/serviceassistant.component").then((m) => m.ServiceAssistantComponent),
    },
    {
        path: "systemexecute",
        component: EdgeSettingsSystemExecuteComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
    {
        path: "systemlog",
        loadComponent: () => import("./systemlog/systemlog.component").then((m) => m.SystemLogComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "system",
        loadComponent: () => import("./system/system.component").then((m) => m.SystemComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "app",
        loadComponent: () => import("./app/index.component").then((m) => m.IndexComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "app/single/install",
        loadComponent: () => import("./app/install.component").then((m) => m.InstallAppComponent),
        canActivate: [hasEdgeRole(Role.OWNER), hasEnvironmentBackend("OpenEMS Backend")],
    },
    {
        path: "app/single/update",
        loadComponent: () => import("./app/update.component").then((m) => m.UpdateAppComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "app/single",
        loadComponent: () => import("./app/single.component").then((m) => m.SingleAppComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "app/oauth",
        loadComponent: () => import("./app/oauth/oauth.component").then((m) => m.OAuthIndexComponent),
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
    {
        path: "energy-journey",
        children: [
            {
                path: "",
                loadComponent: () =>
                    import("src/app/edge/settings/energy-journey/new-navigation/energy-journey").then(
                        (m) => m.EnergyJourneyLiveComponent,
                    ),
            },
            {
                path: "battery-extension/electricity-price-choice",
                component: ElectricityPriceSelectionComponent,
            },
            {
                path: "battery-extension/result",
                component: BatteryExtensionComponent,
            },
        ],
    },
    {
        path: "alerting",
        loadChildren: () => import("./alerting/alerting.module").then((m) => m.AlertingModule),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "homeServiceAssistant",
        loadComponent: () => import("./assistant/home/home").then((m) => m.HomeServiceAssistantComponent),
    },
    {
        path: "jsonrpctest",
        component: JsonrpcTestComponent,
    },
    {
        path: "powerAssistant",
        loadComponent: () => import("./assistant/powerassistant/powerassistant").then((m) => m.PowerAssistantComponent),
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
];

@NgModule({
    imports: [RouterModule.forChild(settingsRoutes)],
    exports: [RouterModule],
})
export class SettingsRoutingModule {}
