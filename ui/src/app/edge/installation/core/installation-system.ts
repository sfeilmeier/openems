import { DocsUtils } from "src/app/shared/utils/docs/docs.utils";
import { environment } from "src/environments";
import { ComponentData, EmsType } from "../shared/ibndatatypes";
import { CommercialSystemId, HomeSystemId, System, SystemId, SystemType } from "../shared/system";
import { EmsTypeConfig } from "./ems-type-config";

/**
 * Pure utility functions for resolving system options, manual links, and variant lists based on EMS hardware type or
 * system ID.
 *
 * No Angular DI is required — call functions directly via the namespace.
 */
export namespace InstallationSystem {
    /**
     * Returns the URL for the system manual based on the system ID.
     *
     * @param systemId ID of the system.
     * @returns The URL of the system manual.
     */
    export function getSystemManualLink(systemId: SystemId): string {
        if (isHomeSystemVariant(systemId)) {
            return DocsUtils.replaceWithCurrentDocsLanguage(getHomeSystemInstructionsLink(systemId));
        }
        return DocsUtils.replaceWithCurrentDocsLanguage(
            getCommercialSystemInstructionsLink(systemId as CommercialSystemId),
        );
    }

    /**
     * Returns the supported system type options for the first installation step, based on EMS type and active theme.
     *
     * @param emsType {@link EmsType}
     * @returns Array of {@link ComponentData} representing available system types.
     */
    export function getSupportedSystemTypes(emsType: EmsType): ComponentData[] {
        if (environment.theme === "Heckert") {
            return [
                {
                    value: SystemType.HECKERT_HOME,
                    label: SystemType.HECKERT_HOME,
                },
            ];
        }
        return EmsTypeConfig.from(emsType).getSupportedSystemTypes();
    }

    /**
     * Returns the valid system variants based on the general type and EMS hardware.
     *
     * @param systemType The selected {@link SystemType}.
     * @param emsType The EMS hardware type.
     * @returns Array of {@link ComponentData} representing available variants.
     */
    export function getSystemVariants(systemType: SystemType, emsType: EmsType): ComponentData[] {
        const config = EmsTypeConfig.from(emsType);
        if (systemType === SystemType.FENECON_HOME || systemType === SystemType.HECKERT_HOME) {
            return config.getHomeVariants();
        }
        if (systemType === SystemType.COMMERCIAL) {
            return config.getCommercialVariants();
        }
        return [];
    }

    /**
     * Returns the link to the ripple control manual for the given system ID.
     *
     * @param systemId The ID of the system.
     * @returns The URL of the ripple control manual.
     */
    export function getRippleControlManualLink(systemId: SystemId): string {
        switch (systemId) {
            case SystemId.FENECON_HOME_6:
            case SystemId.FENECON_HOME_10_GEN_2:
            case SystemId.FENECON_HOME_15:
                return DocsUtils.replaceWithCurrentDocsLanguage(environment.links.MANUALS.RIPPLE_CONTROL.HOME_GEN_2);
            case SystemId.FENECON_HOME_20:
            case SystemId.FENECON_HOME_30:
                return DocsUtils.replaceWithCurrentDocsLanguage(environment.links.MANUALS.RIPPLE_CONTROL.HOME_20_30);
            default:
                return DocsUtils.replaceWithCurrentDocsLanguage(environment.links.MANUALS.RIPPLE_CONTROL.HOME_10_GEN_1);
        }
    }

    export function isHomeSystemVariant(systemId: SystemId): systemId is HomeSystemId {
        return systemId != null && System.HOME_SYSTEMS.some((homeSystemId) => homeSystemId === systemId);
    }
}

function getHomeSystemInstructionsLink(homeSystemId: HomeSystemId): string {
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

function getCommercialSystemInstructionsLink(systemId: CommercialSystemId): string {
    switch (systemId) {
        case SystemId.COMMERCIAL_30_ANSCHLUSS:
            return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_30;
        case SystemId.COMMERCIAL_50_GEN_1:
            return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_50_GEN_1;
        case SystemId.COMMERCIAL_50_GEN_3:
            return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_50_GEN_3;
        case SystemId.COMMERCIAL_92_WITHOUT_CLUSTER:
            return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_92;
        case SystemId.COMMERCIAL_92_CLUSTER:
            return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_92_CLUSTER;
        case SystemId.COMMERCIAL_100:
            return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_100;
        default:
            return environment.links.MANUALS.SYSTEM.COMMERCIAL.COMMERCIAL_30;
    }
}
