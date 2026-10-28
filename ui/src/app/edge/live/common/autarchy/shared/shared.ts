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

export namespace SharedAutarchy {
    export const COMMON_NOTE = (translate: TranslateService): OeFormlyField.InfoLine => ({
        type: "info-line",
        name: translate.instant("EDGE.INDEX.WIDGETS.AUTARCHY_INFO"),
    });

    export const getFormlyView = (translate: TranslateService): OeFormlyView => ({
        title: translate.instant("GENERAL.AUTARCHY"),
        helpKey: "REDIRECT.COMMON_AUTARCHY",
        lines: [
            {
                type: "percentage-bar-line",
                controlName: "autarchy",
            },
            COMMON_NOTE(translate),
        ],
        component: new EdgeConfig.Component(),
        useCiFont: true,
    });

    export function getChannelAddresses(): ChannelAddress[] {
        return [new ChannelAddress("_sum", "GridActivePower"), new ChannelAddress("_sum", "ConsumptionActivePower")];
    }

    export function getAutarchyValue(currentData: CurrentData) {
        return Utils.calculateAutarchy(
            currentData.allComponents["_sum/GridActivePower"],
            currentData.allComponents["_sum/ConsumptionActivePower"],
        );
    }

    export function getFormGroup(): FormGroup {
        return new FormGroup({
            autarchy: new FormControl(null),
        });
    }

    export function getNavigationTree(translate: TranslateService): ConstructorParameters<typeof NavigationTree> {
        return new NavigationTree(
            "autarchy",
            { baseString: "common/autarchy" },
            { name: "oe-grid", color: "normal" },
            translate.instant("GENERAL.AUTARCHY"),
            "label",
            [
                NavigationConstants.CommonNodes.HISTORY(translate, "autarchy"),
                NavigationConstants.CommonNodes.INFO(translate, "autarchy", { source: "autarchy" }),
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

        function calculateAutarchy(currentData: QueryHistoricTimeseriesEnergyResponse): number {
            if (currentData == null || currentData.result == null) {
                return 0;
            }
            const gridBuyActiveEnergy = currentData.result.data["_sum/GridBuyActiveEnergy"];
            const consumptionActiveEnergy = currentData.result.data["_sum/ConsumptionActiveEnergy"];
            if (gridBuyActiveEnergy == null || consumptionActiveEnergy == null) {
                return 0;
            }
            return NumberUtils.ceilSafelyOrElse(
                Utils.calculateAutarchy(gridBuyActiveEnergy, consumptionActiveEnergy),
                0,
            );
        }
        return [
            new Fena.HistoricEnergyMessage(
                "KPI",
                8,
                [Fena.MessageUtils.buildDetailAction("autarchy-history", injector)],
                [
                    new ChannelAddress("_sum", "GridBuyActiveEnergy"),
                    new ChannelAddress("_sum", "ConsumptionActiveEnergy"),
                ],
                (data: QueryHistoricTimeseriesEnergyResponse) => calculateAutarchy(data) >= 80,
                {
                    textCallback: (currentData: QueryHistoricTimeseriesEnergyResponse) => {
                        const autarchy = calculateAutarchy(currentData);
                        return translate.instant("FENA.MESSAGES.KPI.AUTARCHY", { autarchy });
                    },
                },
                new DefaultTypes.HistoryPeriod(startOfDay(new Date()), new Date()),
            ),
        ];
    }
}
