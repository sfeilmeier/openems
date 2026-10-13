import { ComponentData, EmsType } from "../shared/ibndatatypes";
import { SystemId, SystemType } from "../shared/system";

const DEFAULT_HOME_VARIANTS: ComponentData[] = [
    { value: SystemId.FENECON_HOME_6, label: SystemId.FENECON_HOME_6 },
    { value: SystemId.FENECON_HOME_10, label: SystemId.FENECON_HOME_10 },
    { value: SystemId.FENECON_HOME_10_GEN_2, label: SystemId.FENECON_HOME_10_GEN_2 },
    { value: SystemId.FENECON_HOME_15, label: SystemId.FENECON_HOME_15 },
    { value: SystemId.FENECON_HOME_20, label: SystemId.FENECON_HOME_20 },
    { value: SystemId.FENECON_HOME_30, label: SystemId.FENECON_HOME_30 },
];

const DEFAULT_COMMERCIAL_VARIANTS: ComponentData[] = [
    { value: SystemId.COMMERCIAL_30_ANSCHLUSS, label: SystemId.COMMERCIAL_30_ANSCHLUSS },
    { value: SystemId.COMMERCIAL_30_NETZTRENNSTELLE, label: SystemId.COMMERCIAL_30_NETZTRENNSTELLE },
    { value: SystemId.COMMERCIAL_50_GEN_1, label: SystemId.COMMERCIAL_50_GEN_1 },
];

/**
 * Encapsulates all EMS-type-specific options (supported system types, home variants, commercial variants) for a given
 * {@link EmsType}.
 *
 * Use {@link EmsTypeConfig.from} to obtain the correct instance.
 */
export abstract class EmsTypeConfig {
    public abstract readonly emsType: EmsType;

    /**
     * Returns the {@link EmsTypeConfig} for the given {@link EmsType}.
     *
     * @param emsType The EMS hardware type read from the device.
     * @returns The matching config instance.
     */
    static from(emsType: EmsType): EmsTypeConfig {
        switch (emsType) {
            case "feh013":
                return new FEH013Config();
            case "fho011":
                return new FHO011Config();
            case "fec011":
                return new FEC011Config();
            case "fec013":
                return new FEC013Config();
            default:
                return new DefaultEmsConfig();
        }
    }

    /** System-type choices shown in the first installation step. */
    abstract getSupportedSystemTypes(): ComponentData[];

    /** Home system variant choices for this EMS type. */
    abstract getHomeVariants(): ComponentData[];

    /** Commercial system variant choices for this EMS type. */
    abstract getCommercialVariants(): ComponentData[];
}

/** FEH013 – supports both Home and Commercial systems (Gen 2 hardware). */
class FEH013Config extends EmsTypeConfig {
    public override readonly emsType: EmsType = "feh013";

    getSupportedSystemTypes(): ComponentData[] {
        return [
            { value: SystemType.FENECON_HOME, label: SystemType.FENECON_HOME },
            { value: SystemType.COMMERCIAL, label: SystemType.COMMERCIAL },
        ];
    }

    getHomeVariants(): ComponentData[] {
        return [
            { value: SystemId.FENECON_HOME_6, label: SystemId.FENECON_HOME_6 },
            { value: SystemId.FENECON_HOME_10_GEN_2, label: SystemId.FENECON_HOME_10_GEN_2 },
            { value: SystemId.FENECON_HOME_15, label: SystemId.FENECON_HOME_15 },
            { value: SystemId.FENECON_HOME_20, label: SystemId.FENECON_HOME_20 },
            { value: SystemId.FENECON_HOME_30, label: SystemId.FENECON_HOME_30 },
        ];
    }

    getCommercialVariants(): ComponentData[] {
        return [
            { value: SystemId.COMMERCIAL_92_WITHOUT_CLUSTER, label: SystemId.COMMERCIAL_92_WITHOUT_CLUSTER },
            { value: SystemId.COMMERCIAL_50_GEN_3, label: SystemId.COMMERCIAL_50_GEN_3 },
            { value: SystemId.COMMERCIAL_100, label: SystemId.COMMERCIAL_100 },
        ];
    }
}

/** FHO011 – Home-only EMS (Gen 1 hardware, Home 10 only). */
class FHO011Config extends EmsTypeConfig {
    public override readonly emsType: EmsType = "fho011";

    getSupportedSystemTypes(): ComponentData[] {
        return [{ value: SystemType.FENECON_HOME, label: SystemType.FENECON_HOME }];
    }

    getHomeVariants(): ComponentData[] {
        return [{ value: SystemId.FENECON_HOME_10, label: SystemId.FENECON_HOME_10 }];
    }

    getCommercialVariants(): ComponentData[] {
        return [];
    }
}

/** FEC011 – Commercial-only EMS (Gen 1 hardware). */
class FEC011Config extends EmsTypeConfig {
    public override readonly emsType: EmsType = "fec011";

    getSupportedSystemTypes(): ComponentData[] {
        return [{ value: SystemType.COMMERCIAL, label: SystemType.COMMERCIAL }];
    }

    getHomeVariants(): ComponentData[] {
        return [];
    }

    getCommercialVariants(): ComponentData[] {
        return DEFAULT_COMMERCIAL_VARIANTS;
    }
}

/** FEC013 – Commercial-only EMS (Gen 2 hardware, 92 Cluster). */
class FEC013Config extends EmsTypeConfig {
    public override readonly emsType: EmsType = "fec013";

    getSupportedSystemTypes(): ComponentData[] {
        return [{ value: SystemType.COMMERCIAL, label: SystemType.COMMERCIAL }];
    }

    getHomeVariants(): ComponentData[] {
        return [];
    }

    getCommercialVariants(): ComponentData[] {
        return [{ value: SystemId.COMMERCIAL_92_CLUSTER, label: SystemId.COMMERCIAL_92_CLUSTER }];
    }
}

/** Fallback for unknown or null EMS types – exposes the full legacy option set. */
class DefaultEmsConfig extends EmsTypeConfig {
    public override readonly emsType: EmsType = null;

    getSupportedSystemTypes(): ComponentData[] {
        return [
            { value: SystemType.FENECON_HOME, label: SystemType.FENECON_HOME },
            { value: SystemType.COMMERCIAL, label: SystemType.COMMERCIAL },
        ];
    }

    getHomeVariants(): ComponentData[] {
        return DEFAULT_HOME_VARIANTS;
    }

    getCommercialVariants(): ComponentData[] {
        return DEFAULT_COMMERCIAL_VARIANTS;
    }
}
