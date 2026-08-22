// @ts-strict-ignore
import { TranslateService } from "@ngx-translate/core";
import { Edge } from "src/app/shared/shared";
import { Country } from "src/app/shared/type/country";
import { Category } from "../../../shared/category";
import { View } from "../../../shared/enums";
import { ComponentData } from "../../../shared/ibndatatypes";
import { WebLinks } from "../../../shared/weblink.utils";
import { SchedulerIdBehaviour } from "../../abstract-ibn";
import { AbstractCommercial92Ibn } from "./abstract-commercial92";

export class Commercial92Ibn extends AbstractCommercial92Ibn {
    public override readonly warrantyLink: WebLinks = WebLinks.WARRANTY_LINK_COMMERCIAL_92;
    public override isClusterConfiguration: boolean = false;
    public override readonly isDoubleSocketValid: boolean = true;

    constructor(translate: TranslateService) {
        super(
            [
                View.PreInstallation,
                View.PreInstallationUpdate,
                View.ConfigurationSystem,
                View.ConfigurationSubSystem,
                View.ProtocolInstaller,
                View.ProtocolCustomer,
                View.ProtocolSystem,
                View.ProtocolSystemLocation,
                View.ConfigurationEssLimiter14aComponent,
                View.ConfigurationLineSideMeterFuse,
                View.ProtocolFeedInLimitation,
                View.ConfigurationGridSetting,
                View.ConfigurationSummary,
                View.ConfigurationExecute,
                View.ProtocolSerialNumbers,
                View.ProtocolChecklist,
                View.Alerting,
                View.Completion,
            ],
            translate,
        );
    }

    public override addSystemSpecificFields(tableData): void {
        super.addSystemSpecificFields(tableData);

        const gridData: ComponentData[] = [];

        gridData.push({
            label: this.translate.instant("INSTALLATION.CONFIGURATION_ESS_LIMITER.TITLE"),
            value: this.isController14aActivated
                ? this.translate.instant("GENERAL.YES")
                : this.translate.instant("GENERAL.NO"),
        });

        if (gridData.length > 0) {
            tableData.push({
                header: Category.GRID,
                rows: gridData,
            });
        }
    }

    public override setRequiredControllers() {
        this.requiredControllerIds = [];

        this.requiredControllerIds.push({
            componentId: "ctrlPrepareBatteryExtension0",
            behaviour: SchedulerIdBehaviour.MANAGED_BY_APP_MANAGER,
        });

        if (this.isController14aActivated) {
            this.requiredControllerIds.push({
                componentId: "ctrlEssLimiter14a0",
                behaviour: SchedulerIdBehaviour.MANAGED_BY_APP_MANAGER,
            });
        }

        this.requiredControllerIds.push(
            {
                componentId: "ctrlGridOptimizedCharge0",
                behaviour: SchedulerIdBehaviour.MANAGED_BY_APP_MANAGER,
            },
            {
                componentId: "ctrlBalancing0",
                behaviour: SchedulerIdBehaviour.ALWAYS_INCLUDE,
            },
        );
    }

    public override getEdge(index: number): Edge {
        return JSON.parse(sessionStorage.getItem("edge")) as Edge;
    }

    public override getEmsBoxSerialNumber(slaveNr: number): string | null {
        return sessionStorage.getItem("emsBoxSerialNumber");
    }

    protected override addCustombatteryInverterData(): ComponentData[] {
        const batteryInverterData: ComponentData[] = super.addCustombatteryInverterData();
        const safetyCountry = this.location.isEqualToCustomerData ? this.customer.country : this.location.country;

        if (safetyCountry === Country.GERMANY) {
            batteryInverterData.push({
                label: this.translate.instant("INSTALLATION.CONFIGURATION_GRID_SETTING.TITLE"),
                value: this.gridSetting,
            });
        }

        return batteryInverterData;
    }
}
