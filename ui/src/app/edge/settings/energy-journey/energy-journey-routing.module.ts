import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { WrapUpComponent } from "src/app/shared/components/edge/popover/annual-review/new-navigation/wrap-up";
import { commonRoutes } from "src/app/shared/components/navigation/navigation-routing.module";
import { hasEdgeRole } from "src/app/shared/guards/functional-guards";
import { Role } from "src/app/shared/type/role";
import { EmptyPageComponent } from "../../../shared/components/navigation/empty-page/empty-page";
import { HistoryExcelExportComponent } from "../../history/common/energy/export/export";
import { HistoryChartComponent } from "../../history/common/energy/new-navigation/new-navigation";
import { BatteryExtensionComponent } from "./pages/battery-extension/battery-extension";
import { ElectricityPriceSelectionComponent } from "./pages/electricity-price-choice/electricity-price-selection";

export const energyJourneyRoutes: Routes = [
    { path: "", component: EmptyPageComponent, pathMatch: "full" },
    ...commonRoutes,
    {
        path: "history",
        component: HistoryChartComponent,
    },
    {
        path: "history/export",
        component: HistoryExcelExportComponent,
    },
    {
        path: "index",
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
        path: "appcenter",
        loadComponent: () => import("src/app/edge/settings/app/index.component").then((m) => m.IndexComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "appcenter/single/install",
        loadComponent: () => import("src/app/edge/settings/app/install.component").then((m) => m.InstallAppComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "appcenter/single/update",
        loadComponent: () => import("src/app/edge/settings/app/update.component").then((m) => m.UpdateAppComponent),
        runGuardsAndResolvers: "always",
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "appcenter/single",
        loadComponent: () => import("src/app/edge/settings/app/single.component").then((m) => m.SingleAppComponent),
        canActivate: [hasEdgeRole(Role.OWNER)],
    },
    {
        path: "appcenter/oauth",
        loadComponent: () =>
            import("src/app/edge/settings/app/oauth/oauth.component").then((m) => m.OAuthIndexComponent),
        canActivate: [hasEdgeRole(Role.ADMIN)],
    },
    { path: "wrap-up", component: WrapUpComponent },
];

@NgModule({
    imports: [RouterModule.forChild(energyJourneyRoutes)],
    exports: [RouterModule],
})
export class EnergyJourneyRoutingModule {}
