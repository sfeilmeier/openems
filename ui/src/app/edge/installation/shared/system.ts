import { TranslateService } from "@ngx-translate/core";
import { AbstractIbn } from "../installation-systems/abstract-ibn";
import { Commercial100Ibn } from "../installation-systems/commercial/commercial-100/commercial-100";
import { Commercial30AnschlussIbn } from "../installation-systems/commercial/commercial-30/commercial30-anschluss";
import { Commercial30NetztrennIbn } from "../installation-systems/commercial/commercial-30/commercial30-netztrenn";
import { Commercial50Gen1Ibn } from "../installation-systems/commercial/commercial-50/commercial-50-gen1";
import { Commercial50Gen3Ibn } from "../installation-systems/commercial/commercial-50/commercial-50-gen3";
import { Commercial92Ibn } from "../installation-systems/commercial/commercial-92/commercial92";
import { Commercial92ClusterIbn } from "../installation-systems/commercial/commercial-92/commercial92-cluster";
import { Home10FeneconIbn } from "../installation-systems/home/home-10";
import { Home10Gen2FeneconIbn } from "../installation-systems/home/home-10-gen2";
import { Home10HeckertIbn } from "../installation-systems/home/home-10-heckert";
import { Home15Gen2FeneconIbn } from "../installation-systems/home/home-15-gen2";
import { Home20FeneconIbn } from "../installation-systems/home/home-20";
import { Home30FeneconIbn } from "../installation-systems/home/home-30";
import { Home6Gen2FeneconIbn } from "../installation-systems/home/home-6-gen2";

export enum SystemType {
    FENECON_HOME = "FENECON Home",
    HECKERT_HOME = "Symphon-E",
    COMMERCIAL = "FENECON Commercial",
}

export enum SystemId {
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
    COMMERCIAL_50_GEN_1 = "Commercial 50 (Gen 1)",
    COMMERCIAL_50_GEN_3 = "Commercial 50 (Gen 3)",
    COMMERCIAL_92_WITHOUT_CLUSTER = "FENECON Commercial 92",
    COMMERCIAL_92_CLUSTER = "FENECON Commercial 92 Cluster",
    COMMERCIAL_100 = "Fenecon Commercial 100",
}

export type HomeSystemId =
    | SystemId.FENECON_HOME_10
    | SystemId.FENECON_HOME_20
    | SystemId.FENECON_HOME_30
    | SystemId.FENECON_HOME_10_GEN_2
    | SystemId.FENECON_HOME_6
    | SystemId.FENECON_HOME_15;

export type CommercialSystemId =
    | SystemId.COMMERCIAL_30_ANSCHLUSS
    | SystemId.COMMERCIAL_30_NETZTRENNSTELLE
    | SystemId.COMMERCIAL_50_GEN_1
    | SystemId.COMMERCIAL_50_GEN_3
    | SystemId.COMMERCIAL_92_WITHOUT_CLUSTER
    | SystemId.COMMERCIAL_92_CLUSTER
    | SystemId.COMMERCIAL_100;

type IbnConstructor = new (translate: TranslateService) => AbstractIbn<any>;

const SYSTEM_ID_MAP: Record<SystemId, IbnConstructor> = {
    [SystemId.FENECON_HOME_10]: Home10FeneconIbn,
    [SystemId.FENECON_HOME_10_GEN_2]: Home10Gen2FeneconIbn,
    [SystemId.FENECON_HOME_6]: Home6Gen2FeneconIbn,
    [SystemId.FENECON_HOME_15]: Home15Gen2FeneconIbn,
    [SystemId.FENECON_HOME_20]: Home20FeneconIbn,
    [SystemId.FENECON_HOME_30]: Home30FeneconIbn,
    [SystemId.HECKERT_HOME_10]: Home10HeckertIbn,
    [SystemId.COMMERCIAL_30_ANSCHLUSS]: Commercial30AnschlussIbn,
    [SystemId.COMMERCIAL_30_NETZTRENNSTELLE]: Commercial30NetztrennIbn,
    [SystemId.COMMERCIAL_50_GEN_1]: Commercial50Gen1Ibn,
    [SystemId.COMMERCIAL_50_GEN_3]: Commercial50Gen3Ibn,
    [SystemId.COMMERCIAL_92_WITHOUT_CLUSTER]: Commercial92Ibn,
    [SystemId.COMMERCIAL_92_CLUSTER]: Commercial92ClusterIbn,
    [SystemId.COMMERCIAL_100]: Commercial100Ibn,
};

export namespace System {
    export const HOME_SYSTEMS: HomeSystemId[] = [
        SystemId.FENECON_HOME_10,
        SystemId.FENECON_HOME_20,
        SystemId.FENECON_HOME_30,
        SystemId.FENECON_HOME_10_GEN_2,
        SystemId.FENECON_HOME_6,
        SystemId.FENECON_HOME_15,
    ];

    export const COMMERCIAL_SYSTEMS: CommercialSystemId[] = [
        SystemId.COMMERCIAL_30_ANSCHLUSS,
        SystemId.COMMERCIAL_30_NETZTRENNSTELLE,
        SystemId.COMMERCIAL_50_GEN_1,
        SystemId.COMMERCIAL_50_GEN_3,
        SystemId.COMMERCIAL_92_WITHOUT_CLUSTER,
        SystemId.COMMERCIAL_92_CLUSTER,
        SystemId.COMMERCIAL_100,
    ];

    /**
     * Returns the IBN Object from the System type.
     *
     * @param systemType Type of the System.
     * @param translate The translate service
     * @returns The System IBN Object.
     */
    const SYSTEM_TYPE_MAP: Record<SystemType, IbnConstructor> = {
        [SystemType.FENECON_HOME]: Home10FeneconIbn,
        [SystemType.HECKERT_HOME]: Home10HeckertIbn,
        [SystemType.COMMERCIAL]: Commercial92Ibn,
    };

    export function getSystemObjectFromSystemType(systemType: SystemType, translate: TranslateService): AbstractIbn {
        return new SYSTEM_TYPE_MAP[systemType](translate);
    }

    /**
     * Returns the IBN Object based on the System id.
     *
     * @param systemId Id of the System.
     * @param translate The translate service.
     * @returns The IBN object.
     */
    export function getSystemObjectFromSystemId(systemId: SystemId, translate: TranslateService): AbstractIbn {
        return new SYSTEM_ID_MAP[systemId](translate);
    }

    /**
     * Checks whether the given id is a known system id. Use this to validate ids from untrusted sources (e.g. session
     * storage) before calling {@link getSystemObjectFromSystemId}.
     *
     * @param systemId Id to check.
     * @returns True if the id maps to an IBN implementation.
     */
    export function isKnownSystemId(systemId: string): boolean {
        return SYSTEM_ID_MAP[systemId as SystemId] != null;
    }
}
