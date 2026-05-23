import { alertCircleOutline, checkmarkDoneCircleOutline, flame, informationCircleOutline, warningOutline } from "ionicons/icons";
import { BaseMeta } from "src/environments";

export const OemMeta: BaseMeta = {
    api: {
        SYSTEM_OUTAGE: "https://status.fenecon.de/",
        CHANGELOG: {
            REMOTE: "https://fenecon.de/fems-changelog",
            LOCAL: "assets/json/changelog.json",
        },
    },
    icons: {
        COMMON: {
            CONSUMPTION: "assets/img/icon/consumption.svg",
            SELFCONSUMPTION: "assets/img/icon/selfconsumption.svg",
            GENERATOR: "assets/img/icon/generator.svg",
            GRID: "assets/img/icon/grid.svg",
            GRID_STORAGE: "assets/img/icon/gridStorage.svg",
            GRID_RESTRICTION: "assets/img/icon/gridRestriction.svg",
            MEGAFON: "assets/img/icon/megafon.svg",
            OFFGRID: "assets/img/icon/offgrid.svg",
            PRODUCTION: "assets/img/icon/production.svg",
            STORAGE: "assets/img/icon/storage.svg",
            WEATHER: {
                CLEAR_DAY: "assets/img/icon/clear_day.svg",
                CLEAR_NIGHT: "assets/img/icon/clear_night.svg",
                PARTLY_CLOUDY_DAY: "assets/img/icon/partly_cloudy_day.svg",
                PARTLY_CLOUDY_NIGHT: "assets/img/icon/partly_cloudy_night.svg",
                THUNDERSTORM: "assets/img/icon/thunderstorm.svg",
                WEATHER_CLOUDY: "assets/img/icon/weather_cloudy.svg",
                WEATHER_FOGGY: "assets/img/icon/weather_foggy.svg",
                WEATHER_MIX: "assets/img/icon/weather_mix.svg",
                WEATHER_RAINY: "assets/img/icon/weather_rainy.svg",
                WEATHER_SNOWY: "assets/img/icon/weather_snowy.svg",
                SUNSHINE_DURATION: "assets/img/icon/sunshine_duration.svg",
                HELP: "assets/img/icon/help.svg",
            },
            OFFLINE: {
                CLOUD_OFFLINE_OUTLINE: "icons/common/offline/cloud_offline_outline.svg",
            },
            TIME_OF_USE: {
                TIME_OF_USE: "icons/common/time_of_use/time_of_use.svg",
                TIME_OF_USE_THIN: "icons/common/time_of_use/time_of_use-thin.svg",
            },
        },
        COMPONENT: {
            HEATPUMP: flame,
            EVCS: "assets/img/icon/evcs.svg",
        },
        STATUS: {
            CHECKMARK: checkmarkDoneCircleOutline,
            ERROR: alertCircleOutline,
            WARNING: warningOutline,
            INFO: informationCircleOutline,
        },
        BATTERY_EXTENSION: null,
        ENERGY_JOURNEY: null,
        WRAP_UP: null,
    },
    images: {
        EVSE: {
            KEBA_P30: "https://docs.fenecon.de/de/_images/other/zz/product_pictures/Evse.ChargePoint.Keba.P30.png",
            KEBA_P40: "https://docs.fenecon.de/de/_images/other/zz/product_pictures/Evse.ChargePoint.Keba.P40.png",
            HARDY_BARTH: "https://docs.fenecon.de/de/_images/other/zz/product_pictures/Evse.ChargePoint.HardyBarth.cPu2.png",
            ALPITRONIC: null,
            MENNEKES: "https://docs.fenecon.de/de/_images/other/zz/product_pictures/Evse.ChargePoint.Mennekes.4You.png",
        },
        LOGO: {
            DARK: null,
            LIGHT: null,
        },
        HEAT: {
            ASKOMA: {
                HEATING_ELEMENT: null,
            },
            MYPV: {
                HEATING_ELEMENT: null,
            },
        },
    },
    links: {
        DATA_PROTECTION: "https://docs.fenecon.de/{language}/fems/data_protection/data_protection_info.html",
        REDIRECT: {
            BETA_SURVEY: "https://erp.fenecon.de/survey/start/d123c5ff-72e1-4fdf-bbc8-867d5a75c51c",
            BETA_CHANGE_LOG: "https://docs.fenecon.de/redirect/fenecon/de/beta_change_log",
            COMMON_STORAGE: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_storage",
            COMMON_AUTARCHY: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_autarchy",
            COMMON_CONSUMPTION: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_consumption",
            COMMON_GRID: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_grid",
            COMMON_PRODUCTION: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_production",
            COMMON_SELFCONSUMPTION: "https://docs.fenecon.de/redirect/fenecon/de/standardwidgets_selfconsumption",

            CONTROLLER_ESS_GRID_OPTIMIZED_CHARGE: "io.openems.edge.controller.ess.gridoptimizedcharge/readme.adoc",
            CONTROLLER_IO_HEAT_PUMP_SG_READY: "io.openems.edge.controller.io.heatpump.sgready/readme.adoc",
            CONTROLLER_IO_HEATING_ELEMENT: "io.openems.edge.controller.io.heatingelement/readme.adoc",
            CONTROLLER_ESS_TIME_OF_USE_TARIFF: "io.openems.edge.controller.ess.timeofusetariff/readme.adoc",

            EVCS_KEBA: "https://docs.fenecon.de/redirect/fenecon/de/evcs_keba",
            EVCS_HARDY_BARTH: "https://docs.fenecon.de/redirect/fenecon/de/evcs_hardybarth",
            EVCS_MENNEKES: "https://docs.fenecon.de/redirect/fenecon/de/evcs_mennekes",
            EVCS_GO_E: "https://docs.fenecon.de/redirect/fenecon/de/evcs_goe",
            EVCS_IES: "https://docs.fenecon.de/redirect/fenecon/de/evcs_ies",
            EVCS_ALPITRONIC_HYPER: "https://docs.fenecon.de/redirect/fenecon/de/evcs_alpitronichyper",
            SETTINGS_ALERTING: null,
            SETTINGS_NETWORK_CONFIGURATION: null,
            WEATHER_WIDGET: null,
            SYSTEM: {
                INDUSTRIAL_S_MANUAL: null,
                INDUSTRIAL_M_MANUAL: null,
                INDUSTRIAL_L_OVERVIEW: null,
                INDUSTRIAL_XL_MANUAL: null,
            },
            WARRANTY: {
                HOME_GUARANTEE_CONDITIONS: {
                    EN: "#",
                    DE: "#",
                },
                COMMERCIAL_50_GEN3_GUARANTEE_CONDITIONS: {
                    EN: "#",
                    DE: "#",
                },
                COMMERCIAL_92_GUARANTEE_CONDITIONS: {
                    EN: "#",
                    DE: "#",
                },
                COMMERCIAL_100_GUARANTEE_CONDITIONS: {
                    EN: "#",
                    DE: "#",
                },
            },
            OFFLINE_INSTRUCTIONS: null,
        },
        FORGET_PASSWORD: "https://auth.fenecon.de/realms/fenecon/login-actions/reset-credentials?client_id=fenecon-backend",
        EVCS: "https://docs.fenecon.de/topics/emobility_overview.html",

        CONTROLLER_CHP_SOC: "io.openems.edge.controller.chp.soc/readme.adoc",
        CONTROLLER_IO_CHANNEL_SINGLE_THRESHOLD: "io.openems.edge.controller.io.channelsinglethreshold/readme.adoc",
        CONTROLLER_IO_FIX_DIGITAL_OUTPUT: "io.openems.edge.controller.io.fixdigitaloutput/readme.adoc",

        CONTROLLER_API_MODBUSTCP_READ: "io.openems.edge.controller.api.modbus/readme.adoc",
        CONTROLLER_API_MODBUSTCP_READWRITE: "io.openems.edge.controller.api.modbus/readme.adoc",

        CONTROLLER_API_REST_READ: "io.openems.edge.controller.api.rest/readme.adoc",
        CONTROLLER_API_REST_READWRITE: "io.openems.edge.controller.api.rest/readme.adoc",

        EVCS_CLUSTER: "io.openems.edge.evcs.cluster/readme.adoc",

        SYSTEM: {
            INDUSTRIAL_S: "#",
            INDUSTRIAL_L: "#",
        },

        METER: {
            SOCOMEC: "#",
            KDK: "#",
        },

        MANUALS: {
            SYSTEM: {
                HOME: {
                    HOME_10: "#",
                    HOME_20_30: {
                        DE: "#",
                        EN: "#",
                    },
                    HOME_GEN_2: {
                        DE: "#",
                        EN: "#",
                    },
                },
                COMMERCIAL: {
                    COMMERCIAL_30: "#",
                    COMMERCIAL_50_GEN_1: "#",
                    COMMERCIAL_50_GEN_3: "#",
                    COMMERCIAL_92: "#",
                    COMMERCIAL_92_CLUSTER: "#",
                    COMMERCIAL_100: "#",
                },
            },

            RUNDSTEUER: {
                HOME: "#",
                HOME_GEN_2: "#",
                HOME_6_10_15: "#",
                HOME_20_30: "#",
                COMMERCIAL_50_GEN_3: "#",
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
                DE: "https://docs.fenecon.de/download/fenecon/en/fenecon_home_6-10-15_productsheet.pdf",
                EN: "https://docs.fenecon.de/download/fenecon/en/fenecon_home_6-10-15_productsheet.pdf",
            },
            HOME_20_30: {
                DE: "https://docs.fenecon.de/download/fenecon/de/fenecon_home_20-30_productsheet.pdf",
                EN: "https://docs.fenecon.de/download/fenecon/en/fenecon_home_20-30_productsheet.pdf",
            },
        },
    },
};
