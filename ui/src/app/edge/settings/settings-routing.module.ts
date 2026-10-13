import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { hasEdgeRole, hasEnvironmentBackend } from "src/app/shared/guards/functional-guards";
import { Role } from "src/app/shared/type/role";
import { environment } from "src/environments";
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
        data: { navbarTitleToBeTranslated: "MENU.EDGE_SETTINGS" },
        component: SettingsComponent,
    },
    {
        path: "industrialLAssistant",
        loadComponent: () =>
            import("./assistant/industrial/industrial").then((m) => m.IndustrialServiceAssistantComponent),
        data: { navbarTitle: "Industrial L-Assistant" },
    },
    {
        path: "homeServiceAssistant",
        loadComponent: () => import("./assistant/home/home").then((m) => m.HomeServiceAssistantComponent),
        data: { navbarTitle: "Home Service Assistant" },
    },
    {
        path: "channels",
        component: EdgeSettingsChannelsComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
        data: { navbarTitle: "Channels" },
    },
    {
        path: "component.install",
        component: EdgeSettingsComponentInstallIndexComponentComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
        data: { navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.ADD_COMPONENTS" },
    },
    {
        path: "component.install/:factoryId",
        component: EdgeSettingsComponentInstallComponentComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
        data: { navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.ADD_COMPONENTS" },
    },
    {
        path: "component.update",
        component: EdgeSettingsComponentUpdateIndexComponentComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
        data: {
            navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.ADJUST_COMPONENTS",
        },
    },
    {
        path: "component.update/:componentId",
        component: EdgeSettingsComponentUpdateComponentComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
        data: {
            navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.ADJUST_COMPONENTS",
        },
    },
    {
        path: "network",
        loadComponent: () => import("./network/network.component").then((m) => m.NetworkComponent),
        canActivate: [hasEdgeRole(Role.INSTALLER)],
        data: {
            navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.NETWORK_CONFIGURATION",
        },
    },
    {
        path: "network.old",
        component: EdgeSettingsNetworkOldComponent,
        data: { navbarTitle: "Netzwerk Konfiguration" },
    },
    {
        path: "profile",
        loadComponent: () => import("./profile/profile.component").then((m) => m.ProfileComponent),
        data: { navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.SYSTEM_PROFILE" },
    },
    {
        path: "profile/location-validation",
        loadComponent: () =>
            import("./profile/location/location-validator/location-validator").then(
                (m) => m.LocationValidatorComponent,
            ),
        data: { navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.SYSTEM_PROFILE" },
    },
    {
        path: "profile/alias-update/:componentId",
        loadComponent: () => import("./profile/aliasupdate.component").then((m) => m.AliasUpdateComponent),
        data: {
            navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.RENAME_COMPONENTS",
        },
    },
    {
        path: "serviceAssistant",
        loadComponent: () =>
            import("./serviceassistant/serviceassistant.component").then((m) => m.ServiceAssistantComponent),
        data: { navbarTitle: "Service Assistant" },
    },
    {
        path: "systemexecute",
        component: EdgeSettingsSystemExecuteComponent,
        canActivate: [hasEdgeRole(Role.ADMIN)],
        data: { navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.SYSTEM_EXECUTE" },
    },
    {
        path: "systemlog",
        loadComponent: () => import("./systemlog/systemlog.component").then((m) => m.SystemLogComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
        data: { navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.LIVE_LOG" },
    },
    {
        path: "system",
        loadComponent: () => import("./system/system.component").then((m) => m.SystemComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
        data: { navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.SYSTEM" },
    },
    {
        path: "app",
        loadComponent: () => import("./app/index.component").then((m) => m.IndexComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
        data: { navbarTitle: environment.edgeShortName + " Apps" },
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
        data: { navbarTitle: "OAuth" },
        loadComponent: () => import("./app/oauth/oauth.component").then((m) => m.OAuthIndexComponent),
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
    {
        path: "energy-journey",
        data: {
            navbarTitleToBeTranslated: "SETTINGS.ENERGY_JOURNEY.ANALYSE_BATTERY_EXTENSION_TITLE",
        },
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
                data: {
                    navbarTitleToBeTranslated: "SETTINGS.ENERGY_JOURNEY.ANALYSE_BATTERY_EXTENSION_TITLE",
                },
            },
            {
                path: "battery-extension/result",
                component: BatteryExtensionComponent,
                data: {
                    navbarTitleToBeTranslated: "SETTINGS.ENERGY_JOURNEY.ANALYSE_BATTERY_EXTENSION_TITLE",
                },
            },
        ],
    },
    {
        path: "alerting",
        loadChildren: () => import("./alerting/alerting.module").then((m) => m.AlertingModule),
        canActivate: [hasEdgeRole(Role.OWNER)],
        data: { navbarTitleToBeTranslated: "EDGE.CONFIG.INDEX.ALERTING" },
    },
    {
        path: "homeServiceAssistant",
        loadComponent: () => import("./assistant/home/home").then((m) => m.HomeServiceAssistantComponent),
        data: { navbarTitle: "Home-Assistant" },
    },
    {
        path: "jsonrpctest",
        component: JsonrpcTestComponent,
        data: { navbarTitle: "Jsonrpc Test" },
    },
    {
        path: "powerAssistant",
        loadComponent: () => import("./assistant/powerassistant/powerassistant").then((m) => m.PowerAssistantComponent),
        canActivate: [hasEdgeRole(Role.ADMIN)],
        data: { navbarTitle: "Power-Assistant" },
    },
];

@NgModule({
    imports: [RouterModule.forChild(settingsRoutes)],
    exports: [RouterModule],
})
export class SettingsRoutingModule {}
