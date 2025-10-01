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
        COMMON_STORAGE: "ui/standardwidgets.html#_speicher",
        FORGET_PASSWORD: "https://erp.fenecon.de/web/reset_password?",
        EVCS: "https://docs.fenecon.de/topics/emobility_overview.html",

        CONTROLLER_ESS_GRID_OPTIMIZED_CHARGE: "fems-app/includes/FEMS_App_Netzdienliche_Beladung.html",
        CONTROLLER_CHP_SOC: "fems-app/bhkw.html",
        CONTROLLER_IO_CHANNEL_SINGLE_THRESHOLD: "fems-app/includes/FEMS_App_Schwellwertsteuerung.html",
        CONTROLLER_IO_FIX_DIGITAL_OUTPUT: "fems-app/includes/FEMS_App_Manuelle_Relaissteuerung.html",
        CONTROLLER_IO_HEAT_PUMP_SG_READY: "fems-app/includes/FEMS_App_Waermepumpe_SG-Ready.html",
        CONTROLLER_IO_HEATING_ELEMENT: "fems-app/includes/FEMS_App_Heizstab.html",
        CONTROLLER_ESS_TIME_OF_USE_TARIFF: "fems-app/OEM_App_TOU.html",

        CONTROLLER_API_MODBUSTCP_READ: "fems-app/FEMS_App_Modbus_TCP.html#_lesezugriff",
        CONTROLLER_API_MODBUSTCP_READWRITE: "fems-app/FEMS_App_Modbus_TCP.html#_schreibzugriff",

        CONTROLLER_API_REST_READ: "fems-app/FEMS_App_REST_JSON.html#_lesezugriff",
        CONTROLLER_API_REST_READWRITE: "fems-app/FEMS_App_REST_JSON.html#_schreibzugriff",

        SETTINGS_ALERTING: "ui/settings.html#_benachrichtigung",
        SETTINGS_NETWORK_CONFIGURATION: "ui/settings.html#_netzwerkkonfiguration",
        EVCS_CLUSTER: "fems-app/includes/FEMS_App_Multi-Ladepunkt-Management.html",

        SYSTEM: {
            INDUSTRIAL_S: "https://docs.fenecon.de/de/industrial/industrial_s/betrieb_und_serviceanleitung/Betrieb_und_Serviceanleitung_Industrial_S.html",
            INDUSTRIAL_L: "#",
        },

        WARRANTY: {
            HOME: {
                EN: "https://fenecon.de/wp-content/uploads/2022/06/V2021.11_EN_Warranty_conditions_FENECON_Home.pdf",
                DE: "https://fenecon.de/wp-content/uploads/2023/11/V2023.10_DE_Garantiebedingungen_FENECON_Home_Serie.pdf",
            },
            COMMERCIAL: {
                EN: "https://fenecon.de/wp-content/uploads/2022/08/V2022.03_EN_Warranty_conditions_for-FENECON-Commercial_30_50.pdf",
                DE: "https://fenecon.de/wp-content/uploads/2022/07/V2022.03_DE_Garantiebedingungen_FENECON_Commercial_30_50.pdf",
            },
        },

        GTC: {
            EN: "https://fenecon.de/page/gtc/",
            DE: "https://fenecon.de/allgemeine-lieferungs-und-zahlungsbedingungen/",
        },

        // Currently the links are different with different prefixes. so adding whole url for meters.
        METER: {
            SOCOMEC: "https://docs.fenecon.de/de/Installationsanleitungen/FEMS_Socomec_Countis_E23_Installationsanleitung.pdf",
            KDK: "https://docs.fenecon.de/de/Installationsanleitungen/FEMS_KDK_2PU_CT_Installationsanleitung.pdf",
        },

        MANUALS: {
            SYSTEM: {
                HOME: {
                    HOME_10: "https://docs.fenecon.de/_/de/home/home_10/montage_und_service_anleitung/Montage_und_Serviceanleitung_Home.html",
                    HOME_20_30: "https://docs.fenecon.de/_/de/home/home_20-30/montage_und_service_anleitung/Montage_und_Serviceanleitung_Home_20-30.html",
                    HOME_GEN_2: "https://docs.fenecon.de/de/home/home_6-10-15/betrieb_und_serviceanleitung/Betriebsanleitung_Home_6-10-15.html",
                },
                COMMERCIAL: {
                    COMMERCIAL_30: "https://docs.fenecon.de/_/de/commercial/commercial_30/montage_und_serviceanleitung/Montage_und_Serviceanleitung_Commercial_30.html",
                    COMMERCIAL_50_GEN_1: "https://docs.fenecon.de/_/de/commercial/commercial_50/montage_und_serviceanleitung/Montage_und_Serviceanleitung_Commercial_50.html",
                    COMMERCIAL_50_GEN_3: "https://docs.fenecon.de/de/commercial/commercial_50-3/betrieb_und_serviceanleitung/Betrieb_und_Serviceanleitung_Commercial_50-3.html",
                    COMMERCIAL_92: "https://docs.fenecon.de/de/commercial/commercial_92/betrieb_und_serviceanleitung/Betriebsanleitung_Commercial_92.html",
                    COMMERCIAL_92_CLUSTER: "https://docs.fenecon.de/de/commercial/commercial_92_cluster/betrieb_und_serviceanleitung/Betriebsanleitung_Commercial_92_Cluster.html",
                },
            },

            RUNDSTEUER: {
                HOME: "https://fenecon.de/wp-content/uploads/2022/06/20220523_Anleitung-Rundsteuerempfaenger.pdf",
                HOME_GEN_2: "https://docs.fenecon.de/de/home/home_6-10-15/betrieb_und_serviceanleitung/Betriebsanleitung_Home_6-10-15.html#_rundsteuerempf%C3%A4nger",
            },

            AVU: "https://docs.fenecon.de/de/avu/betrieb_und_serviceanleitung/Betrieb_und_Serviceanleitung_AVU.html",
        },
        APP_CENTER: {
            APP_IMAGE: (language: string, appId: string): string | null => {
                const languageKey = (() => {
                    switch (language) {
                        case "de": return "de";
                        case "en": return "en";
                        default: return "en";
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
                DE: "https://docs.fenecon.de/download/fenecon/de/FENECON_Home_10_Produktblatt.pdf",
                EN: "https://docs.fenecon.de/download/fenecon/en/FENECON_Home_10_Produktblatt.pdf",
            },
            HOME_6_10_15: {
                DE: "https://docs.fenecon.de/download/fenecon/de/FENECON_Home_6-10-15_Produktblatt.pdf",
                EN: "https://docs.fenecon.de/download/fenecon/en/FENECON_Home_6-10-15_Produktblatt.pdf",
            },
            HOME_20_30: {
                DE: "https://docs.fenecon.de/download/fenecon/de/FENECON_Home_20-30_Produktblatt.pdf",
                EN: "https://docs.fenecon.de/download/fenecon/en/FENECON_Home_20-30_Produktblatt.pdf",
            },
        },
    },
};
