import { TranslateService } from "@ngx-translate/core";
import { SystemId } from "./system";

export namespace Meter {
    export enum GridMeter {
        SOCOMEC = "SOCOMEC",
        KDK = "KDK",
        WAGO = "WAGO",
        JANITZA_UMG_96_RME = "JANITZA_UMG_96_RME",
        JANITZA_UMG_604_PRO = "JANITZA_UMG_604_PRO",
    }

    export enum GridMeterCategory {
        SMART_METER = "SMART_METER",
        COMMERCIAL_METER = "COMMERCIAL_METER",
        INTEGRATED_METER = "INTEGRATED_METER",
    }

    /**
     * Returns the display label of the grid meter selected as string.
     *
     * @param meter The {@link GridMeter}.
     * @param systemId The {@link SystemId}.
     * @returns The meter label as string.
     */
    export function toGridMeterLabel(meter: GridMeter, systemId: SystemId): string {
        switch (meter) {
            case GridMeter.SOCOMEC:
                return "SOCOMEC";
            case GridMeter.KDK:
                if (
                    systemId === SystemId.COMMERCIAL_92_CLUSTER ||
                    systemId === SystemId.COMMERCIAL_92_WITHOUT_CLUSTER
                ) {
                    return "KDK 2PU-CT";
                }
                return "KDK";
            case GridMeter.WAGO:
                if (
                    systemId === SystemId.COMMERCIAL_92_CLUSTER ||
                    systemId === SystemId.COMMERCIAL_92_WITHOUT_CLUSTER
                ) {
                    return "Wago 2PU-CT";
                }
                return "WAGO";
            case GridMeter.JANITZA_UMG_96_RME:
                return "Janitza UMG 96RM-E";
            case GridMeter.JANITZA_UMG_604_PRO:
                return "Janitza UMG 604-Pro";
        }
    }

    /**
     * Returns the factory id of the meter type selected.
     *
     * @param meter The Meter.
     * @returns The factory id of the meter.
     */
    export function toFactoryId(meter: GridMeter): string {
        switch (meter) {
            case GridMeter.SOCOMEC:
                return "Meter.Socomec.Threephase";
            case GridMeter.KDK:
            case GridMeter.WAGO:
                // Wago is a rebranded KDK meter, using the same factory id.
                return "Meter.KDK.2PUCT";
            case GridMeter.JANITZA_UMG_96_RME:
                return "Meter.Janitza.UMG96RME";
            case GridMeter.JANITZA_UMG_604_PRO:
                return "Meter.Janitza.UMG604";
        }
    }

    /**
     * Returns the label of the meter selected as string.
     *
     * @param meterCategory The {@link GridMeterCategory}.
     * @param type Standard or Optional.
     * @returns The meter label as string.
     */
    export function toGridMeterCategoryLabelString(
        meterCategory: GridMeterCategory,
        translate: TranslateService,
        type?: string,
    ): string {
        const standardType: string = translate.instant(
            "INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.STANDARD",
        );
        const optionalType: string = translate.instant(
            "INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.OPTIONAL",
        );

        switch (meterCategory) {
            case GridMeterCategory.SMART_METER:
                return translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.WITH_CT", {
                    type: type ?? standardType,
                });
            case GridMeterCategory.COMMERCIAL_METER:
                if (type != null && type === standardType) {
                    return translate.instant(
                        "INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.WITHOUT_CT_STANDARD_DELIVERY",
                    );
                }
                return translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.WITHOUT_CT");
            case GridMeterCategory.INTEGRATED_METER:
                return translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.INTEGRATED", {
                    type: type ?? optionalType,
                });
        }
    }
}
