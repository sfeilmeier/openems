import { TranslateService } from "@ngx-translate/core";

export namespace Meter {

    export enum GridMeter {
        SOCOMEC = "SOCOMEC",
        KDK = "KDK",
    }

    export enum GridMeterCategory {
        SMART_METER = "SMART_METER",
        COMMERCIAL_METER = "COMMERCIAL_METER",
        INTEGRATED_METER = "INTEGRATED_METER",
    }

    /**
     * Returns the factory id of the meter type selected.
     *
     * @param meter The Meter.
     * @returns the factory id of the meter.
     */
    export function toFactoryId(meter: GridMeter): string {
        switch (meter) {
            case GridMeter.SOCOMEC:
                return "Meter.Socomec.Threephase";
            case GridMeter.KDK:
                return "Meter.KDK.2PUCT";
        }
    }

    /**
     * Returns the label of the meter selected as string.
     *
     * @param meterCategory The {@link GridMeterCategory}.
     * @param type Standard or Optional.
     * @returns the meter label as string.
     */
    export function toGridMeterCategoryLabelString(meterCategory: GridMeterCategory, translate: TranslateService, type?: string): string {
        const standardType: string = translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.STANDARD");
        const optionalType: string = translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.OPTIONAL");

        switch (meterCategory) {
            case GridMeterCategory.SMART_METER:
                return translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.WITH_CT", { type: type ?? standardType });
            case GridMeterCategory.COMMERCIAL_METER:
                if (type != null && type === standardType) {
                    return translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.WITHOUT_CT_STANDARD_DELIVERY");
                }
                return translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.WITHOUT_CT");
            case GridMeterCategory.INTEGRATED_METER:
                return translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.INTEGRATED", { type: type ?? optionalType });
        }
    }
}
