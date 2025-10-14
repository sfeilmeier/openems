import { BaseMeta } from "src/environments";

export const OemMeta: BaseMeta = {
    images: {
        EVSE: {
            KEBA_P30: "https://docs.fenecon.de/de/_images/other/zz/product_pictures/Evse.ChargePoint.Keba.P30.png",
            KEBA_P40: "https://docs.fenecon.de/de/_images/other/zz/product_pictures/Evse.ChargePoint.Keba.P40.png",
            HARDY_BARTH: "https://docs.fenecon.de/de/_images/other/zz/product_pictures/Evse.ChargePoint.HardyBarth.cPu2.png",
        },
    },
    links: {
        DATA_PROTECTION: "https://docs.fenecon.de/{language}/fems/data_protection/data_protection_info.html",
        REDIRECT: {
            COMMON_STORAGE: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_storage",
            COMMON_AUTARCHY: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_autarchy",
            COMMON_CONSUMPTION: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_consumption",
            COMMON_GRID: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_grid",
            COMMON_PRODUCTION: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_production",
            COMMON_SELFCONSUMPTION: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_selfconsumption",

            EVCS_KEBA: "https://docs.fenecon.de/redirect/fenecon/de/evcs_keba",
            EVCS_HARDY_BARTH: "https://docs.fenecon.de/redirect/fenecon/de/evcs_hardybarth",
            EVCS_MENNEKES: "https://docs.fenecon.de/redirect/fenecon/de/evcs_mennekes",
            EVCS_GO_E: "https://docs.fenecon.de/redirect/fenecon/de/evcs_goe",
            EVCS_IES: "https://docs.fenecon.de/redirect/fenecon/de/evcs_ies",
            EVCS_ALPITRONIC_HYPER: "https://docs.fenecon.de/redirect/fenecon/de/evcs_alpitronichyper",
        },
        FORGET_PASSWORD: "#",
        EVCS: "https://docs.fenecon.de/topics/emobility_overview.html",

        CONTROLLER_ESS_GRID_OPTIMIZED_CHARGE: "io.openems.edge.controller.ess.gridoptimizedcharge/readme.adoc",
        CONTROLLER_CHP_SOC: "io.openems.edge.controller.chp.soc/readme.adoc",
        CONTROLLER_IO_CHANNEL_SINGLE_THRESHOLD: "io.openems.edge.controller.io.channelsinglethreshold/readme.adoc",
        CONTROLLER_IO_FIX_DIGITAL_OUTPUT: "io.openems.edge.controller.io.fixdigitaloutput/readme.adoc",
        CONTROLLER_IO_HEAT_PUMP_SG_READY: "io.openems.edge.controller.io.heatpump.sgready/readme.adoc",
        CONTROLLER_IO_HEATING_ELEMENT: "io.openems.edge.controller.io.heatingelement/readme.adoc",
        CONTROLLER_ESS_TIME_OF_USE_TARIFF: "io.openems.edge.controller.ess.timeofusetariff/readme.adoc",

        CONTROLLER_API_MODBUSTCP_READ: "io.openems.edge.controller.api.modbus/readme.adoc",
        CONTROLLER_API_MODBUSTCP_READWRITE: "io.openems.edge.controller.api.modbus/readme.adoc",

        CONTROLLER_API_REST_READ: "io.openems.edge.controller.api.rest/readme.adoc",
        CONTROLLER_API_REST_READWRITE: "io.openems.edge.controller.api.rest/readme.adoc",

        SETTINGS_ALERTING: null,
        SETTINGS_NETWORK_CONFIGURATION: null,
        EVCS_CLUSTER: "io.openems.edge.evcs.cluster/readme.adoc",

        SYSTEM: {
            INDUSTRIAL_S: "#",
            INDUSTRIAL_L: "#",
        },

        WARRANTY: {
            HOME: {
                EN: "#",
                DE: "#",
            },
            COMMERCIAL: {
                EN: "#",
                DE: "#",
            },
        },

        GTC: {
            EN: "#",
            DE: "#",
        },

        METER: {
            SOCOMEC: "#",
            KDK: "#",
        },

        MANUALS: {
            SYSTEM: {
                HOME: {
                    HOME_10: "#",
                    HOME_20_30: "#",
                    HOME_GEN_2: "#",
                },
                COMMERCIAL: {
                    COMMERCIAL_30: "#",
                    COMMERCIAL_50_GEN_1: "#",
                    COMMERCIAL_50_GEN_3: "#",
                    COMMERCIAL_92: "#",
                    COMMERCIAL_92_CLUSTER: "#",
                },
            },

            RUNDSTEUER: {
                HOME: "#",
                HOME_GEN_2: "#",
            },

            AVU: "#",
        },
        APP_CENTER: {
            APP_IMAGE: (language: string, appId: string): string | null => {
                return null;
            },
        },
        APP: {
            ANDROID: null,
            IOS: null,
        },
        ENERGY_JOURNEY: {
            HOME_10: {
                DE: "#",
                EN: "#",
            },
            HOME_6_10_15: {
                DE: "https://docs.fenecon.de/download/fenecon/en/FENECON_Home_6-10-15_Produktblatt.pdf",
                EN: "https://docs.fenecon.de/download/fenecon/en/FENECON_Home_6-10-15_Produktblatt.pdf",
            },
            HOME_20_30: {
                DE: "https://docs.fenecon.de/download/fenecon/de/FENECON_Home_20-30_Produktblatt.pdf",
                EN: "https://docs.fenecon.de/download/fenecon/en/FENECON_Home_20-30_Produktblatt.pdf",
            },
        },
    },
};
