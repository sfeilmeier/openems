import { Injector } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { startOfDay } from "date-fns";
import { NavigationConstants, NavigationTree } from "src/app/shared/components/navigation/shared";
import { OeFormlyField, OeFormlyView } from "src/app/shared/components/shared/oe-formly-component";
import { QueryHistoricTimeseriesEnergyResponse } from "src/app/shared/jsonrpc/response/queryHistoricTimeseriesEnergyResponse";
import { ChannelAddress, CurrentData, EdgeConfig, Utils } from "src/app/shared/shared";
import { DefaultTypes } from "src/app/shared/type/defaulttypes";
import { NumberUtils } from "src/app/shared/utils/number/number-utils";
import { Fena } from "../../../fena/fena.type";

export namespace SharedSelfConsumption {
    export const COMMON_NOTE = (translate: TranslateService): OeFormlyField.InfoLine => ({
        type: "info-line",
        name: translate.instant("EDGE.INDEX.WIDGETS.SELFCONSUMPTION_INFO"),
    });

    export const getFormlyView = (translate: TranslateService): OeFormlyView => ({
        title: translate.instant("GENERAL.SELF_CONSUMPTION"),
        helpKey: "REDIRECT.COMMON_SELFCONSUMPTION",
        lines: [
            {
                type: "percentage-bar-line",
                controlName: "selfConsumption",
            },
            COMMON_NOTE(translate),
        ],
        component: new EdgeConfig.Component(),
        useCiFont: true,
    });

    export function getChannelAddresses(): ChannelAddress[] {
        return [new ChannelAddress("_sum", "GridActivePower"), new ChannelAddress("_sum", "ProductionActivePower")];
    }

    export function getSelfConsumptionValue(currentData: CurrentData) {
        return Utils.calculateSelfConsumption(
            Utils.multiplySafely(currentData.allComponents["_sum/GridActivePower"], -1),
            currentData.allComponents["_sum/ProductionActivePower"],
        );
    }

    export function getFormGroup(): FormGroup {
        return new FormGroup({
            selfConsumption: new FormControl(null),
        });
    }

    export function getNavigationTree(translate: TranslateService): ConstructorParameters<typeof NavigationTree> {
        return new NavigationTree(
            "selfconsumption",
            { baseString: "common/selfconsumption" },
            { name: "oe-selfconsumption", color: "normal" },
            translate.instant("GENERAL.SELF_CONSUMPTION"),
            "label",
            [
                NavigationConstants.CommonNodes.HISTORY(translate, "selfconsumption"),
                NavigationConstants.CommonNodes.INFO(translate, "selfconsumption", { source: "selfconsumption" }),
            ],
            null,
        ).toConstructorParams();
    }

    export function getFenaMessages(
        translate: TranslateService,
        config: EdgeConfig,
        injector: Injector,
    ): Fena.Message[] {
        if (config.hasFactories(["Controller.Ess.Time-Of-Use-Tariff"]) || !config.hasProducer()) {
            return [];
        }

        function calculateSelfconsumption(currentData: QueryHistoricTimeseriesEnergyResponse): number {
            if (currentData == null || currentData.result == null) {
                return 0;
            }
            const gridSellActiveEnergy = currentData.result.data["_sum/GridSellActiveEnergy"] ?? null;
            const productionActiveEnergy = currentData.result.data["_sum/ProductionActiveEnergy"] ?? null;
            if (gridSellActiveEnergy == null || productionActiveEnergy == null) {
                return 0;
            }

            return NumberUtils.ceilSafelyOrElse(
                Utils.calculateSelfConsumption(gridSellActiveEnergy, productionActiveEnergy),
                0,
            );
        }
        return [
            new Fena.HistoricEnergyMessage(
                "KPI",
                8,
                [Fena.MessageUtils.buildDetailAction("selfconsumption-history", injector)],
                [
                    new ChannelAddress("_sum", "GridSellActiveEnergy"),
                    new ChannelAddress("_sum", "ProductionActiveEnergy"),
                ],
                (data: QueryHistoricTimeseriesEnergyResponse) => calculateSelfconsumption(data) >= 80,
                {
                    textCallback: (currentData: QueryHistoricTimeseriesEnergyResponse) => {
                        const selfConsumption = calculateSelfconsumption(currentData);
                        return translate.instant("FENA.MESSAGES.KPI.SELF_CONSUMPTION", { selfConsumption });
                    },
                },
                new DefaultTypes.HistoryPeriod(startOfDay(new Date()), new Date()),
            ),
        ];
    }
}
