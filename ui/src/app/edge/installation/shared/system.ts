// @ts-strict-ignore
import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/environments";
import { AbstractIbn } from "../installation-systems/abstract-ibn";
import { Commercial30AnschlussIbn } from "../installation-systems/commercial/commercial-30/commercial30-anschluss";
import { Commercial30NetztrennIbn } from "../installation-systems/commercial/commercial-30/commercial30-netztrenn";
import { Commercial50Balancing } from "../installation-systems/commercial/commercial-50/commercial50-balancing";
import { Commercial92Ibn } from "../installation-systems/commercial/commercial-92/commercial92";
import { Commercial92ClusterIbn } from "../installation-systems/commercial/commercial-92/commercial92-cluster";
import { GeneralIbn } from "../installation-systems/general-ibn";
import { Home10FeneconIbn } from "../installation-systems/home/home-10";
import { Home10Gen2FeneconIbn } from "../installation-systems/home/home-10-gen2";
import { Home10HeckertIbn } from "../installation-systems/home/home-10-heckert";
import { Home15Gen2FeneconIbn } from "../installation-systems/home/home-15-gen2";
import { Home20FeneconIbn } from "../installation-systems/home/home-20";
import { Home30FeneconIbn } from "../installation-systems/home/home-30";
import { Home6Gen2FeneconIbn } from "../installation-systems/home/home-6-gen2";
import { EmsType } from "./ibndatatypes";

export enum SystemType {
    FENECON_HOME = "FENECON Home",
    HECKERT_HOME = "Symphon-E",
    COMMERCIAL = "FENECON Commercial",
}

export enum SubSystemType {
    COMMERCIAL_30 = "FENECON Commercial 30",
    COMMERCIAL_50 = "FENECON Commercial 50",
    COMMERCIAL_92 = "FENECON Commercial",
}

export enum SystemId {
    GENERAL,
    FENECON_HOME_10 = "FENECON Home 10",
    FENECON_HOME_10_GEN_2 = "FENECON Home 10 (Gen 2)",
    FENECON_HOME_6 = "FENECON Home 6",
    FENECON_HOME_15 = "FENECON Home 15",
    FENECON_HOME_20 = "FENECON Home 20",
    FENECON_HOME_30 = "FENECON Home 30",
    HECKERT_HOME_10 = "Symphon-E",
    COMMERCIAL_30_ANSCHLUSS = `FEMS Anschlussbox
    (Commercial 30 ohne Notstromversorgung)`,
    COMMERCIAL_30_NETZTRENNSTELLE = `Netztrennstelle 
    (Commercial 30 mit Notstromversorgung)`,
    COMMERCIAL_50_BALANCING = "FENECON Commercial 50 Balancing",
    COMMERCIAL_92 = "FENECON Commercial 92",
    COMMERCIAL_92_CLUSTER = "FENECON Commercial 92 Cluster",
}

export type HomeSystemId =
    SystemId.FENECON_HOME_10 |
    SystemId.FENECON_HOME_20 |
    SystemId.FENECON_HOME_30 |
    SystemId.FENECON_HOME_10_GEN_2 |
    SystemId.FENECON_HOME_6 |
    SystemId.FENECON_HOME_15;

export namespace System {

    /**
     * Returns the IBN Object from the System type.
     *
     * @param systemType Type of the System.
     * @param translate the translate service
     * @param emsType The type of the EMS assigned in Odoo.
     * @returns the System IBN Object.
     */
    export function getSystemObjectFromSystemType(systemType: SystemType, translate: TranslateService, emsType: EmsType): AbstractIbn {

        switch (systemType) {
            case SystemType.FENECON_HOME:
                return new Home10FeneconIbn(translate);
            case SystemType.HECKERT_HOME:
                return new Home10HeckertIbn(translate);
            case SystemType.COMMERCIAL:
                switch (emsType) {
                    case "feh013":
                        return new Commercial92Ibn(translate);
                    case "fec013":
                        return new Commercial92ClusterIbn(translate);
                    default:
                        return new Commercial30AnschlussIbn(translate);
                }
        }
    }

    /**
     * Returns the IBN Object from the System type.
     *
     * @param systemType Type of the System.
     * @param translate the translate service
     * @returns the System IBN Object.
     */
    export function getSystemObjectFromSubSystemType(subSystemType: SubSystemType, translate: TranslateService): AbstractIbn {

        switch (subSystemType) {
            case SubSystemType.COMMERCIAL_30:
                return new Commercial30AnschlussIbn(translate);
            case SubSystemType.COMMERCIAL_50:
                return new Commercial50Balancing(translate);
            case SubSystemType.COMMERCIAL_92:
                return new Commercial92Ibn(translate);
        }
    }

    /**
     * Returns the IBN Object based on the System id.
     *
     * @param systemId Id of the System.
     * @param translate the translate service.
     * @returns the IBN object.
     */
    export function getSystemObjectFromSystemId(systemId: SystemId, translate: TranslateService): AbstractIbn {

        switch (systemId) {
            case SystemId.GENERAL:
                return new GeneralIbn(translate);
            case SystemId.FENECON_HOME_10:
                return new Home10FeneconIbn(translate);
            case SystemId.HECKERT_HOME_10:
                return new Home10HeckertIbn(translate);
            case SystemId.COMMERCIAL_30_ANSCHLUSS:
                return new Commercial30AnschlussIbn(translate);
            case SystemId.COMMERCIAL_30_NETZTRENNSTELLE:
                return new Commercial30NetztrennIbn(translate);
            case SystemId.COMMERCIAL_50_BALANCING:
                return new Commercial50Balancing(translate);
            case SystemId.COMMERCIAL_92:
                return new Commercial92Ibn(translate);
            case SystemId.FENECON_HOME_20:
                return new Home20FeneconIbn(translate);
            case SystemId.FENECON_HOME_30:
                return new Home30FeneconIbn(translate);
            case SystemId.FENECON_HOME_10_GEN_2:
                return new Home10Gen2FeneconIbn(translate);
            case SystemId.FENECON_HOME_15:
                return new Home15Gen2FeneconIbn(translate);
            case SystemId.FENECON_HOME_6:
                return new Home6Gen2FeneconIbn(translate);
            case SystemId.COMMERCIAL_92_CLUSTER:
                return new Commercial92ClusterIbn(translate);
        }
    }

    /**
     * Returns the URL for the System type.
     *
     * @param systemType Type of the System.
     * @returns the url.
     */
    export function getSubSystemTypeLink(subSystemType: SubSystemType): string {
        switch (subSystemType) {
            case SubSystemType.COMMERCIAL_30:
                return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_30;
            case SubSystemType.COMMERCIAL_50:
                return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_50;
        }
    }

    /**
     * Returns the URL for the Home System type.
     *
     * @param systemType Type of the System.
     * @returns the url.
     */
    export function getHomeSystemInstructionsLink(homeSystemId: HomeSystemId): string {
        switch (homeSystemId) {
            case SystemId.FENECON_HOME_10:
                return environment.links.MANUALS.SYSTEM.HOME.HOME_10;
            case SystemId.FENECON_HOME_20:
            case SystemId.FENECON_HOME_30:
                return environment.links.MANUALS.SYSTEM.HOME.HOME_20_30;
            default:
                return environment.links.MANUALS.SYSTEM.HOME.HOME_GEN_2;
        }
    }

    export function getManualLinkFromSystemType(systemType: SystemType, emsType: EmsType): string {
        switch (systemType) {
            case SystemType.FENECON_HOME:
            case SystemType.HECKERT_HOME:
                return environment.links.MANUALS.SYSTEM.HOME.HOME_10;
            case SystemType.COMMERCIAL:
                switch (emsType) {
                    case "feh013":
                        return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_92;
                    case "fec013":
                        return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_92_CLUSTER;
                }
        }
    }

    /**
     * Checks if the currently selected system is one of the home systems.
     *
     * @returns {boolean} True if the selected system is a home system, false otherwise.
     *
     */
    export function isHomeSystemSelected(selectedSystem: SystemId): boolean {
        const homeSystemIds: SystemId[] = [
            SystemId.FENECON_HOME_10,
            SystemId.FENECON_HOME_20,
            SystemId.FENECON_HOME_30,
            SystemId.FENECON_HOME_10_GEN_2,
            SystemId.FENECON_HOME_6,
            SystemId.FENECON_HOME_15,
        ];

        return selectedSystem && homeSystemIds.includes(selectedSystem);
    }

    /**
     * Rundsteuer manual is returned based on the system.
     *
     * @param system Id of the System.
     * @returns the rundsteuer manual.
     */
    export function getRundsteuerManual(system: SystemId): string {
        switch (system) {
            case SystemId.FENECON_HOME_6:
            case SystemId.FENECON_HOME_10_GEN_2:
            case SystemId.FENECON_HOME_15:
                return environment.links.MANUALS.RUNDSTEUER.HOME_GEN_2;
            default:
                return environment.links.MANUALS.RUNDSTEUER.HOME;
        }
    }
}
