import { formatNumber } from "@angular/common";
import { Component, Input, OnChanges, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { HistoryDataService } from "src/app/edge/history/historydataservice";
import { Converter } from "src/app/shared/components/shared/converter";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { Formatter } from "src/app/shared/components/shared/formatter";
import { Producttype, Service, Utils } from "src/app/shared/shared";
import { environment } from "src/environments";
import { SimulationResult } from "../battery-extension.module";

type EnergyJourneyLinkKeys =
    keyof (typeof environment.links.ENERGY_JOURNEY)[keyof typeof environment.links.ENERGY_JOURNEY];

type TableData = {
    gridSaving: string[];
    maxChargeDischargePowerIncrease: (number | null)[];
    totalChargeDischargePower: string[];
    capacityIncrease: string[];
    totalCapacity: string[];
    numberOfModulesDiff: string[];
};

@Component({
    selector: "battery-extension-detail",
    templateUrl: "./details.html",
    providers: [{ provide: DataService, useClass: HistoryDataService }],
    styles: [
        `
            :host a {
                display: inline;
            }

            .desktop-view {
                :is(ion-row) {
                    ion-col:not(:first-child) {
                        align-self: center !important;
                        text-align: center !important;
                        :not(:first-child) {
                            :nth-child(odd) {
                            }
                        }
                    }

                    ion-col:first-child {
                        width: calc(var(width) +5%);
                        text-align: left !important;
                    }
                }
            }

            .smartphone-view {
                ion-row:not(:first-child):nth-child(odd) {
                    background-color: rgba(var(--ion-color-light-rgb), 1);
                }

                :is(ion-row) {
                    ion-col:not(:first-child) {
                        text-align: left;
                    }
                    ion-col:first-child {
                        align-self: center;
                    }
                }
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class DetailComponent implements OnInit, OnChanges {
    @Input({ required: true }) public simulatedData: SimulationResult = {
        simulationData: [],
    };
    protected tableData: TableData | null = null;
    protected isSmartphoneResolution: boolean = false;
    protected product: Product | null = null;

    private locale: string = "de";

    constructor(private service: Service) {}

    private static FORMAT_TO_TOTAL(value: number, label: string, locale: string): string {
        const _value = Utils.divideSafely(value, 1000);

        if (_value == null) {
            return "";
        }
        // TODO apply correct locale
        return "(= " + formatNumber(_value, locale, "1.0-2") + " " + label + ")";
    }

    private static FORMAT_EUROS(value: number | null, locale: string) {
        if (!value) {
            return "-";
        }
        return formatNumber(value, locale, "1.2-2");
    }

    private static FORMAT_TO_SIGNED_NUMBER(value: number | null, locale: string) {
        let prefix: string = "";

        return Converter.IF_NUMBER(value, (val) => {
            if (val < 0) {
                prefix = "-";
            } else {
                prefix = "+";
            }
            const absVal = Utils.absSafely(value);
            return prefix + " " + Formatter.formatSafely(absVal, "1.2-2");
        });
    }

    public ngOnInit() {
        this.isSmartphoneResolution = this.service.getIsSmartphoneResolution();
        this.locale = this.service.translate.currentLang;
    }

    public ngOnChanges() {
        this.tableData = this.simulatedData?.simulationData.reduce(
            (arr: TableData, el, index) => {
                if (index === 0) {
                    return arr;
                }

                arr.capacityIncrease.push(
                    this.FORMAT_TO_INCREASE(
                        Utils.subtractSafely(el.capacity, this.simulatedData?.simulationData[0].capacity),
                    ),
                );
                arr.totalCapacity.push(DetailComponent.FORMAT_TO_TOTAL(el.capacity, "kWh", this.locale));
                arr.maxChargeDischargePowerIncrease.push(
                    Utils.subtractSafely(el.kWPeak, this.simulatedData?.simulationData[0].kWPeak),
                );
                arr.totalChargeDischargePower.push(DetailComponent.FORMAT_TO_TOTAL(el.kWPeak, "kW", this.locale));
                arr.gridSaving.push(
                    DetailComponent.FORMAT_EUROS(
                        Utils.divideSafely(
                            Utils.subtractSafely(this.simulatedData.simulationData[0].gridBuyCosts, el.gridBuyCosts),
                            100,
                        ),
                        this.locale,
                    ),
                );
                arr.numberOfModulesDiff.push(
                    "+ " +
                        Utils.subtractSafely(el.numberOfModules, this.simulatedData?.simulationData[0].numberOfModules),
                );
                return arr;
            },
            {
                capacityIncrease: [],
                gridSaving: [],
                maxChargeDischargePowerIncrease: [],
                numberOfModulesDiff: [],
                totalCapacity: [],
                totalChargeDischargePower: [],
            },
        );

        if (this.simulatedData.simulationData.length > 0) {
            this.getProduct().then((product: Product | null) => {
                this.product = product;
            });
        }
    }

    protected FORMAT_TO_INCREASE: Converter = (raw: number | string | null): string => {
        return Converter.IF_NUMBER(raw, (val) => {
            const _value = Utils.divideSafely(val, 1000);
            if (_value == null) {
                return "";
            }
            return DetailComponent.FORMAT_TO_SIGNED_NUMBER(_value, this.locale);
        });
    };

    /**
     * Gets the url for the product based on the language selecetd.
     *
     * @returns The product url.
     */
    private async getProduct(): Promise<Product | null> {
        const edge = await this.service.getCurrentEdge();

        if (!edge) {
            return null;
        }

        const energyJourneyLinks: typeof environment.links.ENERGY_JOURNEY = environment.links.ENERGY_JOURNEY;
        const key: EnergyJourneyLinkKeys = (
            ["DE", "EN"].includes(this.locale.toUpperCase()) ? this.locale.toUpperCase() : "EN"
        ) as EnergyJourneyLinkKeys;

        switch (edge.producttype) {
            case Producttype.HOME:
                return new Product(energyJourneyLinks.HOME_10[key], "Home 10");
            case Producttype.HOME_6:
                return new Product(energyJourneyLinks.HOME_6_10_15[key], "Home 6");
            case Producttype.HOME_10:
                return new Product(energyJourneyLinks.HOME_6_10_15[key], "Home 10");
            case Producttype.HOME_15:
                return new Product(energyJourneyLinks.HOME_6_10_15[key], "Home 15");
            case Producttype.HOME_20:
                return new Product(energyJourneyLinks.HOME_20_30[key], "Home 20");
            case Producttype.HOME_30:
                return new Product(energyJourneyLinks.HOME_20_30[key], "Home 30");
            default:
                return null;
        }
    }
}

export class Product {
    constructor(
        private link: string,
        private name: string,
    ) {}
}
