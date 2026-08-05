import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Converter } from "src/app/shared/components/shared/converter";
import { Formatter } from "src/app/shared/components/shared/formatter";
import { Currency } from "src/app/shared/shared";
import { environment } from "src/environments";
import { SimulationResult } from "../../pages/battery-extension/battery-extension.module";

@Component({
    selector: EnergyJourneyConstantsComponent.SELECTOR,
    templateUrl: "./constants.html",
    styles: [
        `
            :host {
                ion-label {
                    font-family: var(--ion-font-family) !important;
                }
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class EnergyJourneyConstantsComponent implements OnChanges {
    private static readonly SELECTOR: string = "oe-energy-journey-constants";

    @Input() public simulatedData: SimulationResult | null = null;
    @Input() public electricityPrice: number | null = null;
    @Input() public description: string | null = null;

    protected readonly Converter = Converter;
    protected readonly CONVERT_TO_PRICE = this.convertToPrice(Currency.Unit.CENT);
    protected readonly environment = environment;

    protected spinnerId: string = EnergyJourneyConstantsComponent.SELECTOR;
    protected displayData: { name: string; value: any; converter: Converter; editable?: boolean }[] = [];

    private constants: SimulationResult | null = null;

    constructor(
        private translate: TranslateService,
        private route: ActivatedRoute,
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if ("simulatedData" in changes || "electricityPrice" in changes) {
            const constants = (changes?.simulatedData?.currentValue as SimulationResult) ?? this.constants;
            const electricityPrice: number = changes?.electricityPrice?.currentValue ?? this.electricityPrice;

            if (!constants && !electricityPrice) {
                return;
            }
            this.displayData = this.getDisplayData(constants, electricityPrice);
            this.constants = constants;
        }
    }

    protected convertToPrice(currency: Currency.Unit) {
        return (raw: any): string => {
            return Converter.IF_NUMBER_OR_STRING(raw, (value) => {
                let _value: number | null = null;
                if (typeof value === "string") {
                    _value = Number.parseInt(value);
                }

                if (!_value) {
                    console.error("[Converter.CONVERT_PRICE_TO_READABLE] value could not pe parsed to int");
                    return "-";
                }

                return Formatter.FORMAT_CURRENCY_PER_KWH(value, currency);
            });
        };
    }

    /**
     * Gets the data to be displayed
     *
     * @param constants The simulation result constants
     * @returns The data to display
     */
    private getDisplayData(constants: SimulationResult, electricityPrice: number): typeof this.displayData {
        return [
            {
                name: this.translate.instant("SETTINGS.ENERGY_JOURNEY.CONSTANTS.BATTERY_MODULE"),
                value: constants?.simulationData[0]?.numberOfModules ?? null,
                converter: Converter.TO_STRING,
            },
            {
                name: this.translate.instant("SETTINGS.ENERGY_JOURNEY.CONSTANTS.CHARGE_DISCHARGE"),
                value: constants?.simulationData[0]?.kWPeak ?? null,
                converter: Converter.POWER_IN_KILO_WATT,
            },
            {
                name: this.translate.instant("SETTINGS.ENERGY_JOURNEY.CONSTANTS.GRID_SUPPLY"),
                value: constants?.simulationData[0]?.gridBuy ?? null,
                converter: Converter.TO_KILO_WATT_HOURS,
            },
            {
                name: this.translate.instant("SETTINGS.ENERGY_JOURNEY.CONSTANTS.ELECTRICITY_PRICE"),
                value: electricityPrice,
                converter: this.CONVERT_TO_PRICE,
                editable: true,
            },
        ];
    }
}
