import { BaseMeta } from "src/environments";

export const OemMeta: BaseMeta = {
    api: {
        SYSTEM_OUTAGE: "https://status.fenecon.de/",
        CHANGELOG: {
            REMOTE: "https://fenecon.de/fems-changelog",
            LOCAL: "assets/json/changelog.json",
        },
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
            DARK: "assets/img/fenecon-logo-white.svg",
            LIGHT: "assets/img/fenecon-logo-darkblue.svg",
        },
        HEAT: {
            ASKOMA: {
                HEATING_ELEMENT:
                    "https://docs.fenecon.de/de/_images/other/zz/fems/heizstab/askoma/heat-element-askoma.png",
            },
            MYPV: {
                HEATING_ELEMENT: "https://docs.fenecon.de/de/_images/other/zz/fems/heizstab/mypv/Heizstab_MyPV.png",
            },
        },
    },
    /** Maps to file-proxy for fenecon docs */
    links: {
        DOWNLOAD: {
            INSTALLATION: {
                HOME: {
                    AVU_BOX:
                        "https://docs.fenecon.de/download/fenecon/{language}/installation/systems/home/avu-box/home-avu-box.png",
                    MPPT: {
                        HOME_6_10: {
                            1: "https://docs.fenecon.de/download/fenecon/de/installation/systems/home/mppt/home-6-10-mppt-1.png",
                            2: "https://docs.fenecon.de/download/fenecon/de/installation/systems/home/mppt/home-6-10-mppt-2.png",
                        },
                        HOME_10_15: {
                            1: "https://docs.fenecon.de/download/fenecon/de/installation/systems/home/mppt/home-10-15-mppt-1.png",
                            2: "https://docs.fenecon.de/download/fenecon/de/installation/systems/home/mppt/home-10-15-mppt-2.png",
                            3: "https://docs.fenecon.de/download/fenecon/de/installation/systems/home/mppt/home-10-15-mppt-3.png",
                        },
                        HOME_20: {
                            1: "https://docs.fenecon.de/download/fenecon/de/installation/systems/home/mppt/home-20-mppt-1.png",
                            2: "https://docs.fenecon.de/download/fenecon/de/installation/systems/home/mppt/home-20-mppt-2.png",
                        },
                        HOME_30: {
                            1: "https://docs.fenecon.de/download/fenecon/de/installation/systems/home/mppt/home-30-mppt-1.png",
                            2: "https://docs.fenecon.de/download/fenecon/de/installation/systems/home/mppt/home-30-mppt-2.png",
                            3: "https://docs.fenecon.de/download/fenecon/de/installation/systems/home/mppt/home-30-mppt-3.png",
                        },
                    },
                },
                COMMERCIAL: {
                    COMMERCIAL_50: {
                        MPPT: {
                            1: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-50/mppt/mppt-1.png",
                            2: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-50/mppt/mppt-2.png",
                            3: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-50/mppt/mppt-3.png",
                            4: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-50/mppt/mppt-4.png",
                        },
                    },
                    COMMERCIAL_100: {
                        BATTERY_INPUT_1:
                            "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-100/battery-inputs/battery-input-1.png",
                        BATTERY_INPUT_2:
                            "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-100/battery-inputs/battery-input-2.png",
                        MPPT: {
                            1: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-100/mppt/mppt-1.png",
                            2: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-100/mppt/mppt-2.png",
                            3: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-100/mppt/mppt-3.png",
                            4: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-100/mppt/mppt-4.png",
                            5: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-100/mppt/mppt-5.png",
                            6: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-100/mppt/mppt-6.png",
                            7: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-100/mppt/mppt-7.png",
                            8: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/commercial-100/mppt/mppt-8.png",
                        },
                    },
                    STS_BOX: "https://docs.fenecon.de/download/fenecon/de/installation/systems/commercial/sts-box.png",
                },
                SHARED: {
                    FEED_IN_LIMITATION: {
                        DYN_EXTERNAL_LIMITATION:
                            "https://docs.fenecon.de/download/fenecon/{language}/installation/systems/shared/feed-in-limitation/dyn-external-control.png",
                        EXTERNAL_LIMITATION:
                            "https://docs.fenecon.de/download/fenecon/{language}/installation/systems/shared/feed-in-limitation/external-control.png",
                    },
                },
            },
        },
        FORGET_PASSWORD:
            "https://auth.fenecon.de/realms/fenecon/login-actions/reset-credentials?client_id=fenecon-backend",
        DATA_PROTECTION: "https://docs.fenecon.de/{language}/fems/data_protection/data_protection_info.html",
        REDIRECT: {
            BETA_SURVEY: "https://erp.fenecon.de/survey/start/d123c5ff-72e1-4fdf-bbc8-867d5a75c51c",
            BETA_CHANGE_LOG: "https://docs.fenecon.de/redirect/fenecon/de/beta_change_log", // only available in german
            COMMON_STORAGE: "https://docs.fenecon.de/redirect/fenecon/{language}/standardwidgets_storage",
            COMMON_AUTARCHY: "https://docs.fenecon.de/redirect/fenecon/{language}/standardwidgets_autarchy",
            COMMON_CONSUMPTION: "https://docs.fenecon.de/redirect/fenecon/{language}/standardwidgets_consumption",
            COMMON_GRID: "https://docs.fenecon.de/redirect/fenecon/{language}/standardwidgets_grid",
            COMMON_PRODUCTION: "https://docs.fenecon.de/redirect/fenecon/{language}/standardwidgets_production",
            COMMON_SELFCONSUMPTION:
                "https://docs.fenecon.de/redirect/fenecon/{language}/standardwidgets_selfconsumption",
            CONTROLLER_CLEVER_PV: "https://docs.fenecon.de/redirect/fenecon/de/controller_clever_pv",
            OFFLINE_INSTRUCTIONS:
                "https://docs.fenecon.de/redirect/fenecon/{language}/installation_firewall_target_address",

            CONTROLLER_ESS_GRID_OPTIMIZED_CHARGE:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_ess_grid_optimized_charge",
            CONTROLLER_IO_HEAT_PUMP_SG_READY:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_io_heat_pump_sg_ready",
            CONTROLLER_IO_HEATING_ELEMENT:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_io_heating_element",
            CONTROLLER_HEAT_ASKOMA: "https://docs.fenecon.de/redirect/fenecon/{language}/controller_heat_askoma",
            CONTROLLER_HEAT_MYPV: "https://docs.fenecon.de/redirect/fenecon/{language}/controller_heat_mypv",
            CONTROLLER_ESS_TIME_OF_USE_TARIFF:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_ess_time_of_use",
            CONTROLLER_CHP_SOC: "https://docs.fenecon.de/redirect/fenecon/{language}/controller_chp_soc",
            CONTROLLER_IO_CHANNEL_SINGLE_THRESHOLD:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_io_channel_single_threshold",
            CONTROLLER_IO_FIX_DIGITAL_OUTPUT:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_io_fix_digital_output",

            CONTROLLER_API_MODBUSTCP_READ:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_api_modbustcp_read",
            CONTROLLER_API_MODBUSTCP_READWRITE:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_api_modbustcp_readwrite",

            CONTROLLER_API_REST_READ: "https://docs.fenecon.de/redirect/fenecon/{language}/controller_api_rest_read",
            CONTROLLER_API_REST_READWRITE:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_api_rest_readwrite",

            CONTROLLER_SYMMETRIC_PEAKSHAVING:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_symmetric_peakshaving",
            CONTROLLER_ASYMMETRIC_PEAKSHAVING:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_asymmetric_peakshaving",
            CONTROLLER_TIMESLOT_PEAKSHAVING:
                "https://docs.fenecon.de/redirect/fenecon/{language}/controller_timeslot_peakshaving",

            EVCS_KEBA: "https://docs.fenecon.de/redirect/fenecon/{language}/evcs_keba",
            EVCS_HARDY_BARTH: "https://docs.fenecon.de/redirect/fenecon/{language}/evcs_hardybarth",
            EVCS_MENNEKES: "https://docs.fenecon.de/redirect/fenecon/{language}/evcs_mennekes",
            EVCS_GO_E: "https://docs.fenecon.de/redirect/fenecon/{language}/evcs_goe",
            EVCS_IES: "https://docs.fenecon.de/redirect/fenecon/{language}/evcs_ies",
            EVCS_ALPITRONIC_HYPER: "https://docs.fenecon.de/redirect/fenecon/{language}/evcs_alpitronichyper",
            SETTINGS_NETWORK_CONFIGURATION: "https://docs.fenecon.de/redirect/fenecon/de/technical_documentation",
            SETTINGS_ALERTING: "https://docs.fenecon.de/redirect/fenecon/{language}/alerting",
            WEATHER_WIDGET: "https://docs.fenecon.de/redirect/fenecon/{language}/weather",
            SYSTEM: {
                INDUSTRIAL_S_MANUAL: "https://docs.fenecon.de/redirect/fenecon/{language}/industrial_s_manual",
                INDUSTRIAL_M_MANUAL: "https://docs.fenecon.de/redirect/fenecon/{language}/industrial_m_manual",
                INDUSTRIAL_L_OVERVIEW: "https://docs.fenecon.de/redirect/fenecon/{language}/industrial_l_overview",
                INDUSTRIAL_XL_MANUAL: "https://docs.fenecon.de/redirect/fenecon/{language}/industrial_xl_manual",
            },
            WARRANTY: {
                //  Home 6,10,15, 10 Gen 1 und Home 20/30
                HOME_GUARANTEE_CONDITIONS: {
                    DE: "https://docs.fenecon.de/download/fenecon/de/home_guarantee_conditions.pdf",
                    EN: "https://docs.fenecon.de/download/fenecon/en/home_guarantee_conditions.pdf",
                },
                COMMERCIAL_50_GEN3_GUARANTEE_CONDITIONS: {
                    DE: "https://docs.fenecon.de/redirect/fenecon/de/commercial_c50_gen3_guarantee_conditions",
                    EN: "https://docs.fenecon.de/redirect/fenecon/en/commercial_c50_gen3_guarantee_conditions",
                },
                // Commercial 92 & 92 Cluster
                COMMERCIAL_92_GUARANTEE_CONDITIONS: {
                    DE: "https://docs.fenecon.de/redirect/fenecon/de/commercial_c92_guarantee_conditions",
                    EN: "https://docs.fenecon.de/download/fenecon/en/commercial_c92_guarantee_conditions.pdf",
                },
                COMMERCIAL_100_GUARANTEE_CONDITIONS: {
                    DE: "https://docs.fenecon.de/redirect/fenecon/de/commercial_c100_guarantee_conditions",
                    EN: "https://docs.fenecon.de/redirect/fenecon/de/guarantee_conditions_c100_2026-04",
                },
            },
        },

        EVCS: "https://docs.fenecon.de/topics/emobility_overview.html",
        EVCS_CLUSTER: "fems-app/includes/FEMS_App_Multi-Ladepunkt-Management.html",

        SYSTEM: {
            INDUSTRIAL_S:
                "https://docs.fenecon.de/de/industrial/industrial_s/betrieb_und_serviceanleitung/Betrieb_und_Serviceanleitung_Industrial_S.html",
            INDUSTRIAL_L: "#",
        },

        // Currently the links are different with different prefixes. so adding whole url for meters.
        METER: {
            SOCOMEC:
                "https://docs.fenecon.de/de/Installationsanleitungen/FEMS_Socomec_Countis_E23_Installationsanleitung.pdf",
            KDK: "https://docs.fenecon.de/de/Installationsanleitungen/FEMS_KDK_2PU_CT_Installationsanleitung.pdf",
        },

        MANUALS: {
            SYSTEM: {
                HOME: {
                    HOME_10:
                        "https://docs.fenecon.de/_/de/home/home_10/montage_und_service_anleitung/Montage_und_Serviceanleitung_Home.html",
                    HOME_20_30: {
                        DE: "https://docs.fenecon.de/_/de/home/home_20-30/montage_und_service_anleitung/Montage_und_Serviceanleitung_Home_20-30.html",
                        EN: "https://docs.fenecon.de/en/home/home_20-30_overview.html",
                    },
                    HOME_GEN_2: {
                        DE: "https://docs.fenecon.de/de/home/home_6-10-15/betrieb_und_serviceanleitung/Betriebsanleitung_Home_6-10-15.html",
                        EN: "https://docs.fenecon.de/en/home/home_6-10-15_overview.html",
                    },
                },
                COMMERCIAL: {
                    COMMERCIAL_30:
                        "https://docs.fenecon.de/_/de/commercial/commercial_30/montage_und_serviceanleitung/Montage_und_Serviceanleitung_Commercial_30.html",
                    COMMERCIAL_50_GEN_1:
                        "https://docs.fenecon.de/_/de/commercial/commercial_50/montage_und_serviceanleitung/Montage_und_Serviceanleitung_Commercial_50.html",
                    COMMERCIAL_50_GEN_3:
                        "https://docs.fenecon.de/de/commercial/commercial_50-3/betrieb_und_serviceanleitung/Betrieb_und_Serviceanleitung_Commercial_50-3.html",
                    COMMERCIAL_92:
                        "https://docs.fenecon.de/de/commercial/commercial_92/betrieb_und_serviceanleitung/Betriebsanleitung_Commercial_92.html",
                    COMMERCIAL_92_CLUSTER:
                        "https://docs.fenecon.de/de/commercial/commercial_92_cluster/betrieb_und_serviceanleitung/Betriebsanleitung_Commercial_92_Cluster.html",
                    COMMERCIAL_92_OVERVIEW: "https://docs.fenecon.de/de/commercial/commercial_92_overview.html",
                    COMMERCIAL_100:
                        "https://docs.fenecon.de/de/commercial/commercial_100/betrieb_und_serviceanleitung/Commercial_100_instructions.html",
                },
            },

            RUNDSTEUER: {
                HOME: "https://fenecon.de/wp-content/uploads/2022/06/20220523_Anleitung-Rundsteuerempfaenger.pdf",
                HOME_GEN_2:
                    "https://docs.fenecon.de/de/home/home_6-10-15/betrieb_und_serviceanleitung/Betriebsanleitung_Home_6-10-15.html#_rundsteuerempf%C3%A4nger",
                HOME_6_10_15:
                    "https://docs.fenecon.de/de/home/home_6-10-15/betrieb_und_serviceanleitung/Betriebsanleitung_Home_6-10-15.html#_rundsteuerempf%C3%A4nger",
                HOME_20_30:
                    "https://docs.fenecon.de/de/home/home_20-30/betrieb_und_serviceanleitung/Betrieb_und_Serviceanleitung_Home_20-30.html#_rundsteuerempf%C3%A4nger_auf_netzanschlusspunkt",
                COMMERCIAL_50_GEN_3:
                    "https://docs.fenecon.de/de/commercial/commercial_50-3/betrieb_und_serviceanleitung/Betrieb_und_Serviceanleitung_Commercial_50-3.html#_rundsteuerempf%C3%A4nger_auf_netzanschlusspunkt",
            },

            AVU: {
                STANDARD:
                    "https://docs.fenecon.de/de/home/avu/betrieb_und_serviceanleitung/Betrieb_und_Serviceanleitung_AVU.html",
                EXTENDED:
                    "https://docs.fenecon.de/de/home/avu/betrieb_und_serviceanleitung/extended-compatibility/Betrieb_und_Serviceanleitung_AVU-extended.html",
            },
        },
        APP_CENTER: {
            APP_IMAGE: (language: string, appId: string): string | null => {
                const languageKey = (() => {
                    switch (language) {
                        case "de":
                            return "de";
                        case "en":
                            return "en";
                        default:
                            return "en";
                    }
                })();
                return "https://docs.fenecon.de/_/" + languageKey + "/_images/fenecon/apps/" + appId + ".png";
            },
        },
        APP: {
            ANDROID: "https://play.google.com/store/apps/details?id=de.fenecon.fems&gl=DE",
            IOS: "https://apps.apple.com/de/app/fenecon/id6476198535",
        },
        ENERGY_JOURNEY: {
            HOME_10: {
                DE: "https://docs.fenecon.de/download/fenecon/de/fenecon_home_10_productsheet.pdf",
                EN: "https://docs.fenecon.de/download/fenecon/en/fenecon_home_10_productsheet.pdf",
            },
            HOME_6_10_15: {
                DE: "https://docs.fenecon.de/pdfs/home-avu/2025/de/MAR1135_FENECON_Produktblatt_H6-10-15_Web.pdf",
                EN: "https://docs.fenecon.de/pdfs/home-avu/2025/de/MAR1135_FENECON_Produktblatt_H6-10-15_Web.pdf",
            },
            HOME_20_30: {
                DE: "https://docs.fenecon.de/download/fenecon/de/fenecon_home_20-30_productsheet.pdf",
                EN: "https://docs.fenecon.de/download/fenecon/en/fenecon_home_20-30_productsheet.pdf",
            },
        },
    },
    icons: {
        COMMON: {
            CONSUMPTION: "icons/common/consumption.svg",
            FAVORITES: "icons/common/heart.svg",
            SELFCONSUMPTION: "icons/common/selfconsumption.svg",
            GENERATOR: "assets/img/icon/generator.svg",
            GRID: "icons/common/grid.svg",
            GRID_STORAGE: "icons/common/gridStorage.svg",
            GRID_RESTRICTION: "icons/common/gridRestriction.svg",
            OFFGRID: "icons/common/offgrid.svg",
            PRODUCTION: "icons/common/production.svg",
            STORAGE: "icons/common/storage.svg",
            MEGAFON: "assets/img/icon/megafon.svg",
            WEATHER: {
                CLEAR_DAY: "icons/common/weather/clear_day.svg",
                CLEAR_NIGHT: "icons/common/weather/clear_night.svg",
                PARTLY_CLOUDY_DAY: "icons/common/weather/partly_cloudy_day.svg",
                PARTLY_CLOUDY_NIGHT: "icons/common/weather/partly_cloudy_night.svg",
                THUNDERSTORM: "icons/common/weather/thunderstorm.svg",
                WEATHER_CLOUDY: "icons/common/weather/weather_cloudy.svg",
                WEATHER_FOGGY: "icons/common/weather/weather_foggy.svg",
                WEATHER_MIX: "icons/common/weather/weather_mix.svg",
                WEATHER_RAINY: "icons/common/weather/weather_rainy.svg",
                WEATHER_SNOWY: "icons/common/weather/weather_snowy.svg",
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
            EVCS: "icons/component/evcs.svg",
            EVCS_PHASE_SWITCHING_1: "icons/component/phase-switching-1.svg",
            EVCS_PHASE_SWITCHING_3: "icons/component/phase-switching-3.svg",
            HEATPUMP: "icons/component/heatpump.svg",
            HEATING_ELEMENT: "icons/component/heating-element.svg",
        },
        STATUS: {
            CHECKMARK: "icons/status/checkmark.svg",
            ERROR: "icons/status/error.svg",
            WARNING: "icons/status/warning.svg",
            INFO: "icons/status/info.svg",
        },
        BATTERY_EXTENSION: "icons/battery-extension.svg",
        ENERGY_JOURNEY: "icons/energy-journey.svg",
        WRAP_UP: "icons/wrap-up.svg",
    },
};
