import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { WrapUpComponent } from "src/app/shared/components/edge/popover/annual-review/new-navigation/wrap-up";
import { hasEdgeRole } from "src/app/shared/guards/functional-guards";
import { Role } from "src/app/shared/type/role";
import { environment } from "src/environments";
import { CommonAutarchyHistoryComponent } from "../../live/common/autarchy/history/new-navigation/new-navigation";
import { CommonAutarchyHomeComponent } from "../../live/common/autarchy/new-navigation/new-navigation";
import { CommonSelfConsumptionHistoryComponent } from "../../live/common/selfconsumption/history/new-navigation/new-navigation";
import { CommonSelfConsumptionHomeComponent } from "../../live/common/selfconsumption/new-navigation/new-navigation";
import { BatteryExtensionComponent } from "./pages/battery-extension/battery-extension";
import { ElectricityPriceSelectionComponent } from "./pages/electricity-price-choice/electricity-price-selection";

export const energyJourneyRoutes: Routes = [
    { path: "common/autarchy", component: CommonAutarchyHomeComponent },
    {
        path: "common/autarchy/history",
        component: CommonAutarchyHistoryComponent,
    },
    {
        path: "common/selfconsumption",
        component: CommonSelfConsumptionHomeComponent,
    },
    {
        path: "common/selfconsumption/history",
        component: CommonSelfConsumptionHistoryComponent,
    },
    {
        path: "extension",
        loadComponent: () =>
            import("src/app/edge/settings/energy-journey/new-navigation/energy-journey").then(
                (m) => m.EnergyJourneyLiveComponent,
            ),
        data: { navbarTitle: "Energy Journey" },
    },
    {
        path: "extension/batteryExtension",
        component: BatteryExtensionComponent,
        data: {
            navbarTitleToBeTranslated:
                "SETTINGS.ENERGY_JOURNEY.ANALYSE_BATTERY_EXTENSION_TITLE",
        },
    },
    {
        path: "extension/batteryExtension/electricityPriceChoice",
        component: ElectricityPriceSelectionComponent,
        data: {
            navbarTitleToBeTranslated:
                "SETTINGS.ENERGY_JOURNEY.ANALYSE_BATTERY_EXTENSION_TITLE",
        },
    },
    {
        path: "appcenter",
        loadComponent: () =>
            import("src/app/edge/settings/app/index.component").then(
                (m) => m.IndexComponent,
            ),
        canActivate: [hasEdgeRole(Role.OWNER)],
        data: { navbarTitle: environment.edgeShortName + " Apps" },
    },
    {
        path: "appcenter/install/:appId",
        loadComponent: () =>
            import("src/app/edge/settings/app/install.component").then(
                (m) => m.InstallAppComponent,
            ),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "appcenter/update/:appId",
        loadComponent: () =>
            import("src/app/edge/settings/app/update.component").then(
                (m) => m.UpdateAppComponent,
            ),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "appcenter/single/:appId",
        loadComponent: () =>
            import("src/app/edge/settings/app/single.component").then(
                (m) => m.SingleAppComponent,
            ),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "appcenter/oauth",
        data: { navbarTitle: "OAuth" },
        loadComponent: () =>
            import("src/app/edge/settings/app/oauth/oauth.component").then(
                (m) => m.OAuthIndexComponent,
            ),
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
    { path: "wrap-up", component: WrapUpComponent },
];

@NgModule({
    imports: [RouterModule.forChild(energyJourneyRoutes)],
    exports: [RouterModule],
})
export class EnergyJourneyRoutingModule {}
