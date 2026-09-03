import { alertCircleOutline, checkmarkDoneCircleOutline, flame, heart, heartOutline, informationCircleOutline, removeOutline, reorderThreeOutline, warningOutline, } from "ionicons/icons";
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
            FAVORITES: heartOutline,
            FAVORITES_FILLED: heart,
        },
        COMPONENT: {
            HEATPUMP: flame,
            EVCS: "assets/img/icon/evcs.svg",
            EVCS_PHASE_SWITCHING_1: removeOutline,
            EVCS_PHASE_SWITCHING_3: reorderThreeOutline,
            HEATING_ELEMENT: flame,
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
            HARDY_BARTH:
                "https://docs.fenecon.de/de/_images/other/zz/product_pictures/Evse.ChargePoint.HardyBarth.cPu2.png",
            ALPITRONIC: null,
            MENNEKES: "https://docs.fenecon.de/de/_images/other/zz/product_pictures/Evse.ChargePoint.Mennekes.4You.png",
            SIMULATOR: "https://docs.fenecon.de/de/_images/other/zz/product_pictures/Evse.ChargePoint.Simulator.png",
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
        DOWNLOAD: {
            INSTALLATION: {
                HOME: {
                    AVU_BOX: null,
                    MPPT: {
                        HOME_6_10: {
                            1: null,
                            2: null,
                        },
                        HOME_10_15: {
                            1: null,
                            2: null,
                            3: null,
                        },
                        HOME_20: {
                            1: null,
                            2: null,
                        },
                        HOME_30: {
                            1: null,
                            2: null,
                            3: null,
                        },
                    },
                },
                COMMERCIAL: {
                    COMMERCIAL_50: {
                        MPPT: {
                            1: null,
                            2: null,
                            3: null,
                            4: null,
                        },
                    },
                    COMMERCIAL_100: {
                        BATTERY_INPUT_1: null,
                        BATTERY_INPUT_2: null,
                        MPPT: {
                            1: null,
                            2: null,
                            3: null,
                            4: null,
                            5: null,
                            6: null,
                            7: null,
                            8: null,
                        },
                    },
                    STS_BOX: null,
                },
                SHARED: {
                    FEED_IN_LIMITATION: {
                        DYN_EXTERNAL_LIMITATION: null,
                        EXTERNAL_LIMITATION: null,
                    },
                },
            },
        },
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
            CONTROLLER_CLEVER_PV: "https://docs.fenecon.de/redirect/fenecon/de/controller_clever_pv",
            CONTROLLER_ESS_GRID_OPTIMIZED_CHARGE:
                "https://docs.fenecon.de/redirect/fenecon/de/controller_ess_grid_optimized_charge",
            CONTROLLER_IO_HEAT_PUMP_SG_READY:
                "https://docs.fenecon.de/redirect/fenecon/de/controller_io_heat_pump_sg_ready",
            CONTROLLER_IO_HEATING_ELEMENT: "https://docs.fenecon.de/redirect/fenecon/de/controller_io_heating_element",
            CONTROLLER_HEAT_ASKOMA: "https://docs.fenecon.de/redirect/fenecon/{language}/App_Askoma_Heizstab",
            CONTROLLER_HEAT_MYPV: "https://docs.fenecon.de/redirect/fenecon/{language}/controller_heat_mypv",
            CONTROLLER_ESS_TIME_OF_USE_TARIFF: "https://docs.fenecon.de/redirect/fenecon/de/controller_ess_time_of_use",
            CONTROLLER_CHP_SOC: "https://docs.fenecon.de/redirect/fenecon/de/controller_chp_soc",
            CONTROLLER_IO_CHANNEL_SINGLE_THRESHOLD:
                "https://docs.fenecon.de/redirect/fenecon/de/controller_io_channel_single_threshold",
            CONTROLLER_IO_FIX_DIGITAL_OUTPUT:
                "https://docs.fenecon.de/redirect/fenecon/de/controller_io_fix_digital_output",

            CONTROLLER_API_MODBUSTCP_READ: "https://docs.fenecon.de/redirect/fenecon/de/controller_api_modbustcp_read",
            CONTROLLER_API_MODBUSTCP_READWRITE:
                "https://docs.fenecon.de/redirect/fenecon/de/controller_api_modbustcp_readwrite",

            CONTROLLER_API_REST_READ: "https://docs.fenecon.de/redirect/fenecon/de/controller_api_rest_read",
            CONTROLLER_API_REST_READWRITE: "https://docs.fenecon.de/redirect/fenecon/de/controller_api_rest_readwrite",

            CONTROLLER_SYMMETRIC_PEAKSHAVING:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_symmetric_peakshaving",
            CONTROLLER_ASYMMETRIC_PEAKSHAVING:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_asymmetric_peakshaving",
            CONTROLLER_TIMESLOT_PEAKSHAVING:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_timeslot_peakshaving",

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
        FORGET_PASSWORD:
            "https://auth.fenecon.de/realms/fenecon/login-actions/reset-credentials?client_id=fenecon-backend",
        EVCS: "https://docs.fenecon.de/topics/emobility_overview.html",

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
                    COMMERCIAL_92_OVERVIEW: "#",
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

            AVU: {
                STANDARD: "#",
                EXTENDED: "#",
            },
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
