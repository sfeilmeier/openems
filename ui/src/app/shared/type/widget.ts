// @ts-strict-ignore
import { Edge } from "../components/edge/edge";
import { EdgeConfig } from "../components/edge/edgeconfig";
import { ArrayUtils } from "../utils/array/array.utils";
import { Language } from "./language";
import { Role } from "./role";
import { TEnumKeys } from "./utility";

export enum WidgetClass {
    Energymonitor,
    Common_Autarchy,
    Common_Selfconsumption,
    Storage,
    Grid,
    Common_Production,
    Consumption,
    Controller_ChannelThreshold,
    Controller_Io_Digital_Outputs,
}

export enum WidgetNature {
    "io.openems.edge.evcs.api.Evcs",
    "io.openems.edge.heat.api.ManagedHeatElement",
    "io.openems.impl.controller.channelthreshold.ChannelThresholdController", // TODO deprecated
    "io.openems.edge.io.api.DigitalInput",
}

export enum WidgetFactory {
    "Controller.Api.ModbusRtu.ReadWrite",
    "Controller.Api.ModbusTcp.ReadWrite",
    "Controller.Asymmetric.PeakShaving",
    "Controller.BraiinsOS.Single",
    "Controller.ChannelThreshold",
    "Controller.CHP.SoC",
    "Controller.Clever-PV",
    "Controller.Ess.DelayedSellToGrid",
    "Controller.Ess.EmergencyCapacityReserve",
    "Controller.Ess.FixActivePower",
    "Controller.Ess.GridOptimizedCharge",
    "Controller.Ess.Limiter14a",
    "Controller.Ess.RippleControlReceiver",
    "Controller.Ess.Time-Of-Use-Tariff.Discharge",
    "Controller.Ess.Time-Of-Use-Tariff",
    "Controller.Heat.Heatingelement",
    "Controller.IO.ChannelSingleThreshold",
    "Controller.Io.FixDigitalOutput",
    "Controller.IO.Heating.Room",
    "Controller.IO.HeatingElement",
    "Controller.Io.HeatPump.SgReady",
    "Controller.Symmetric.Balancing",
    "Controller.Symmetric.FixReactivePower",
    "Controller.Symmetric.PeakShaving",
    "Controller.TimeslotPeakshaving",
    "Core.Sum",
    "Edge2Edge.Websocket.Ess",
    "Ess.Generic.ManagedSymmetric",
    "Evcs.Cluster.PeakShaving",
    "Evcs.Cluster.SelfConsumption",
    "Evcs.HardyBarth",
    "Evcs.Keba.KeContact",
    "Evcs.Keba.P40",
    "Evcs.Mennekes",
    "Evse.ChargePoint.Alfen",
    "Evse.ChargePoint.Keba.UDP",
    "Evse.Controller.Cluster",
    "Evse.Controller.Single",
    "Evse.ElectricVehicle.Generic",
    "GoodWe.Charger-PV1",
    "GoodWe.Charger.Mppt.Two-String",
    "GoodWe.Grid-Meter",
    "Heat.Askoma",
    "Heat.MyPv.AcThor9s",
    "Heat.MyPv",
    "Meter.Microcare.SDM630",
    "Meter.Socomec.Threephase",
    "Scheduler.JSCalendar",
    "SolarEdge.PV-Inverter",
    "System.Fenecon.Industrial.L",
    "System.Fenecon.Industrial.M",
    "System.Fenecon.Industrial.S",
    "System.Fenecon.Industrial.Tokai2",
    "System.Fenecon.Industrial.Xl",
    "Weather.OpenMeteo",
}

export type Icon = {
    color: string;
    size: string;
    name: string;
};

export type ImageIcon = {
    src: string;
    large: boolean;
};

export class Widget {
    public name: TEnumKeys<typeof WidgetNature | typeof WidgetFactory> | string;
    public componentId: string;
    public alias: string;
}

export type AdvertWidget = {
    name: string;
    title?: { rawTitle: string } | { languageKey: string };
};

export class AdvertWidgets {
    private static readonly SV_EDGE_IDS = new Set([
        "fems71681",
        "fems16759",
        "fems83388",
        "fems52776",
        "fems92999",
        "fems66196",
        "fems66196",
        "fems71677",
        "fems17294",
        "fems62798",
        "fems70680",
        "fems92994",
        "fems17289",
        "fems66741",
        "fems16769",
        "fems17301",
        "fems83245",
        "fems92993",
        "fems83385",
        "fems17311",
        "fems91590",
        "fems73160",
        "fems16748",
        "fems69501",
        "fems70180",
        "fems78179",
        "fems81605",
        "fems17308",
        "fems67615",
        "fems66747",
        "fems70288",
        "fems92996",
        "fems52791",
        "fems30754",
        "fems78176",
        "fems67000",
        "fems30643",
        "fems67600",
        "fems81539",
        "fems70683",
        "fems73188",
        "fems75255",
        "fems83386",
        "fems70679",
        "fems30718",
        "fems30720",
        "fems30717",
        "fems30719",
        "fems91974",
        "fems65401",
        "fems69756",
        "fems66665",
        "fems78327",
        "fems78335",
        "fems73161",
        "fems67577",
        "fems78172",
        "fems16751",
        "fems83393",
        "fems52799",
        "fems93011",
        "fems81086",
        "fems92995",
        "fems52791",
        "fems70681",
        "fems71678",
        "fems70682",
        "fems52783",
        "fems66751",
        "fems83391",
        "fems65377",
        "fems30478",
        "fems92998",
        "fems66746",
        "fems66099",
        "fems70684",
        "fems69105",
        "fems30578",
        "fems75256",
        "fems65081",
        "fems66620",
    ]);

    constructor(
        /** List of all Widgets. */
        public readonly list: AdvertWidget[],
    ) {}

    public static parseAdvertWidgets(edge: Edge, config: EdgeConfig) {
        let list: AdvertWidget[] = [];

        // no filter for new UI as new UI currently does not show adverts
        list.push({
            name: "advert-1",
            title: { languageKey: "ADVERT.1.TITLE" },
        });

        if (edge.roleIsAtLeast(Role.INSTALLER) && Language.getCurrentLanguage() === Language.DE) {
            list.push({
                name: "advert-2",
                title: { languageKey: "ADVERT.2.TITLE" },
            });
        }

        if (AdvertWidgets.SV_EDGE_IDS.has(edge.id) && Language.getCurrentLanguage() === Language.SV) {
            list.push({
                name: "advert-3",
                title: { languageKey: "ADVERT.3.TITLE" },
            });
        }

        list = ArrayUtils.shuffleArray(list);
        return new AdvertWidgets(list);
    }
}

export class Widgets {
    /** Names of Widgets. */
    public readonly names: string[] = [];

    private constructor(
        /** List of all Widgets. */
        public readonly list: Widget[],
        /** List of Widget-Classes. */
        public readonly classes: string[],
    ) {
        // fill names
        for (const widget of list) {
            const name: string = widget.name.toString();
            if (!this.names.includes(name)) {
                this.names.push(name);
            }
        }
    }

    public static parseWidgets(edge: Edge, config: EdgeConfig): Widgets {
        const classes: string[] = Object.values(WidgetClass) //
            .filter((v) => typeof v === "string")
            .filter((clazz) => {
                switch (clazz) {
                    case "Common_Autarchy":
                    case "Grid":
                        return config.hasMeter();
                    case "Energymonitor":
                    case "Consumption":
                        if (config.hasMeter() == true || config.hasProducer() == true || config.hasStorage() == true) {
                            return true;
                        } else {
                            return false;
                        }
                    case "Storage":
                        return config.hasStorage();
                    case "Common_Production":
                    case "Common_Selfconsumption":
                        return config.hasProducer();
                    case "Controller_ChannelThreshold":
                        return config.getComponentIdsByFactory("Controller.ChannelThreshold")?.length > 0;
                    case "Controller_Io_Digital_Outputs":
                        return (
                            config.getComponentIdsByFactories(
                                "Controller.Io.FixDigitalOutput",
                                "Controller.IO.ChannelSingleThreshold",
                            )?.length > 0
                        );
                    case "Controller.Api.ModbusTcp.ReadWrite":
                        return true;
                    default:
                        return false;
                }
            })
            .map((clazz) => clazz.toString());
        const list: Widget[] = [];

        for (const nature of Object.values(WidgetNature).filter((v) => typeof v === "string")) {
            for (const componentId of config.getComponentIdsImplementingNature(nature.toString())) {
                if (
                    nature === "io.openems.edge.io.api.DigitalInput" &&
                    list.some((e) => e.name === "io.openems.edge.io.api.DigitalInput")
                ) {
                    continue;
                }
                const component = config.getComponent(componentId);

                if (
                    component.isEnabled &&
                    component.factoryId != "Evcs.Cluster.PeakShaving" &&
                    component.factoryId != "Evcs.Cluster.SelfConsumption"
                ) {
                    list.push({
                        name: nature,
                        componentId: componentId,
                        alias: component.alias,
                    });
                }
            }
        }
        for (const factory of Object.values(WidgetFactory).filter((v) => typeof v === "string")) {
            for (const componentId of config.getComponentIdsByFactory(factory.toString())) {
                const component = config.getComponent(componentId);
                if (factory === "Controller.Clever-PV") {
                    // Clever-PV Widget should be shown only if readOnly property is explicitely set to false
                    const readOnly = config.getPropertyFromComponent<boolean>(component, "readOnly");
                    if (readOnly !== false) {
                        continue;
                    }
                }
                if (component.isEnabled) {
                    list.push({
                        name: factory,
                        componentId: componentId,
                        alias: component.alias,
                    });
                }
            }
        }

        // explicitely sort ChannelThresholdControllers by their outputChannelAddress
        list.sort((w1, w2) => {
            if (
                w1.name === "Controller.IO.ChannelSingleThreshold" &&
                w2.name === "Controller.IO.ChannelSingleThreshold"
            ) {
                let outputChannelAddress1: string | string[] = config.getComponentProperties(w1.componentId)[
                    "outputChannelAddress"
                ];
                if (typeof outputChannelAddress1 !== "string") {
                    // Takes only the first output for simplicity reasons
                    outputChannelAddress1 = outputChannelAddress1[0];
                }
                let outputChannelAddress2: string | string[] = config.getComponentProperties(w2.componentId)[
                    "outputChannelAddress"
                ];
                if (typeof outputChannelAddress2 !== "string") {
                    // Takes only the first output for simplicity reasons
                    outputChannelAddress2 = outputChannelAddress2[0];
                }
                if (outputChannelAddress1 && outputChannelAddress2) {
                    return outputChannelAddress1.localeCompare(outputChannelAddress2);
                }
            }

            return w1.componentId.localeCompare(w1.componentId);
        });
        return new Widgets(list, classes);
    }
}

export enum ProductType {
    HOME = "home",
    HOME_20_30 = "Home 20 & 30",
}
