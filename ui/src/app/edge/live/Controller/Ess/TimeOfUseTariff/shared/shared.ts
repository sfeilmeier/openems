import { Injector } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Fena } from "src/app/edge/live/fena/fena.type";
import { MetaComponent } from "src/app/shared/components/edge/config-components/meta/meta";
import { NavigationConstants, NavigationTree } from "src/app/shared/components/navigation/shared";
import { Name } from "src/app/shared/components/shared/name";
import { OeFormlyView } from "src/app/shared/components/shared/oe-formly-component";
import { RouteService } from "src/app/shared/service/route/route.service";
import { ChannelAddress, Currency, CurrentData, Edge, EdgeConfig, Service, Utils } from "src/app/shared/shared";
import { Mode } from "src/app/shared/type/general";
import { AssertionUtils } from "src/app/shared/utils/assertions/assertions.utils";
import { TimeOfUseTariffUtils } from "src/app/shared/utils/utils";

export namespace SharedControllerEssTimeOfUseTariff {
    // hide automatic elements when mode is manual
    const HIDE_ON_MODE_OFF = (el: { mode: Mode }) => el.mode === Mode.OFF;

    export const getFormlyView = (
        translate: TranslateService,
        component: EdgeConfig.Component,
        edge: Edge,
        service: Service,
    ): OeFormlyView<AutomaticViewModel> => {
        return {
            title: component.alias,
            helpKey: "REDIRECT.CONTROLLER_ESS_TIME_OF_USE_TARIFF",
            icon: { name: "oe-time-of-use", color: "normal", size: "large" },
            lines: [
                ...getFormlySharedLines(translate, component, service),
                ...getFormlyAutomaticView(translate, component, edge, HIDE_ON_MODE_OFF),
            ],
            component: component,
            edge: edge,
        };
    };

    const getFormlyAutomaticView = (
        translate: TranslateService,
        component: EdgeConfig.Component,
        edge: Edge,
        hideCondition: (field: { mode: Mode }) => boolean,
    ): OeFormlyView<AutomaticViewModel>["lines"] => {
        const lines: OeFormlyView<AutomaticViewModel>["lines"] = [];

        lines.push(
            {
                type: "toggle-line",
                name: translate.instant("EDGE.INDEX.WIDGETS.TIME_OF_USE_TARIFF.CHARGE_FROM_GRID_ACTIVATE"),
                controlName: "chargeConsumptionIsActive",
            },
            {
                type: "horizontal-line",
            },
        );

        lines.push({
            type: "info-line",
            html: translate.instant(
                "EDGE.INDEX.WIDGETS.TIME_OF_USE_TARIFF.CONTROL_MODE_DESCRIPTION.CHARGE_CONSUMPTION",
            ),
            hide: (el: { chargeConsumptionIsActive: boolean }) => el.chargeConsumptionIsActive === false,
        });

        return lines.map((line) => ({
            ...line,
            hide: line.hide ?? hideCondition,
        }));
    };

    const getFormlySharedLines = (
        translate: TranslateService,
        component: EdgeConfig.Component,
        service: Service,
    ): OeFormlyView["lines"] => [
        {
            type: "channel-line",
            name: translate.instant("GENERAL.MODE"),
            channel: component.id + "/_PropertyMode",
            converter: Utils.CONVERT_MODE_TO_MANUAL_OFF_AUTOMATIC(translate),
        },
        {
            type: "channel-line",
            name: translate.instant("EDGE.INDEX.WIDGETS.TIME_OF_USE_TARIFF.PRICE"),
            channel: new ChannelAddress(component.id, "QuarterlyPrices").toString(),
            converter: (quarterlyPrice: number | null) => {
                if (quarterlyPrice == null) {
                    return "-";
                }
                const edge = service.currentEdge();
                const config = edge.getCurrentConfig();
                const meta = new MetaComponent(config);
                const currency = meta.getCurrency();
                if (typeof currency !== "string") {
                    return "-";
                }
                const currencyLabel = Currency.getCurrencyLabelByCurrency(currency);
                return Utils.CONVERT_PRICE_TO_CENT_PER_KWH(2, currencyLabel)(quarterlyPrice);
            },
        },
        {
            type: "buttons-from-form-control-line",
            name: translate.instant("GENERAL.MODE"),
            controlName: "mode",
            buttons: [
                {
                    name: translate.instant("GENERAL.AUTOMATIC"),
                    value: Mode.AUTOMATIC,
                    icon: { color: "primary", name: "sunny", size: "medium" },
                },
                {
                    name: translate.instant("GENERAL.OFF"),
                    value: Mode.OFF,
                    icon: {
                        color: "danger",
                        name: "power-outline",
                        size: "medium",
                    },
                },
            ],
        },
        {
            type: "horizontal-line",
        },
    ];

    export function getChannelAddresses(
        service: Service,
        routeService: RouteService,
        component: EdgeConfig.Component | null = null,
    ): Promise<ChannelAddress[]> {
        const edge = service.currentEdge();
        const config = edge.getCurrentConfig();
        AssertionUtils.assertIsDefined(config);

        const TimeOfUseComponent = component ?? config.getComponentSafely(routeService.getRouteParam("componentId"));

        AssertionUtils.assertIsDefined(TimeOfUseComponent);
        return Promise.resolve([
            new ChannelAddress(TimeOfUseComponent.id, "_PropertyMode"),
            new ChannelAddress(TimeOfUseComponent.id, "_PropertyControlMode"),
            new ChannelAddress(TimeOfUseComponent.id, "QuarterlyPrices"),
        ]);
    }

    export function getFormGroup(): FormGroup {
        return new FormGroup({
            mode: new FormControl(null),
            controlMode: new FormControl(null),
            chargeConsumptionIsActive: new FormControl(null),
        });
    }

    export function getNavigationTree(
        translate: TranslateService,
        component: EdgeConfig.Component,
    ): ConstructorParameters<typeof NavigationTree> {
        return new NavigationTree(
            component.id,
            { baseString: "controller/time-of-use/" + component.id },
            { name: "oe-time-of-use", color: "normal" },
            Name.METER_ALIAS_OR_ID(component),
            "label",
            [
                NavigationConstants.CommonNodes.HISTORY(translate, component.id),
                NavigationConstants.CommonNodes.SETTINGS(translate, component.id),
                NavigationConstants.CommonNodes.INFO(translate, component.id, {
                    source: component.id,
                }),
            ],
            null,
        ).toConstructorParams();
    }

    export function getFenaMessages(
        config: EdgeConfig,
        translate: TranslateService,
        injector: Injector,
    ): Fena.Message[] {
        const timeOfUseTariffController = config.getFirstComponentByFactoryId("Controller.Ess.Time-Of-Use-Tariff");
        const isEssChargeFromGridAllowed =
            config.getPropertyFromComponentId<boolean>("_meta", "isEssChargeFromGridAllowed") ?? false;

        if (timeOfUseTariffController === null) {
            return [];
        }

        const getFormattedPrice = (currentData: CurrentData) => {
            const meta = new MetaComponent(config);
            const currency = meta.getCurrency();
            if (typeof currency !== "string") {
                return "-";
            }

            const currencyLabel: Currency.Label = Currency.getCurrencyLabelByCurrency(currency);
            const quarterlyPrice = currentData.allComponents[`${timeOfUseTariffController.id}/QuarterlyPrices`];
            return Utils.CONVERT_PRICE_TO_CENT_PER_KWH(2, currencyLabel)(quarterlyPrice);
        };

        return [
            new Fena.LiveMessage({
                category: "GRID",
                priority: 1,
                actions: [Fena.MessageUtils.buildDetailAction(timeOfUseTariffController.id, injector)],
                channels: [
                    new ChannelAddress("_sum", "GridActivePower"),
                    new ChannelAddress(timeOfUseTariffController.id, "QuarterlyPrices"),
                ],
                showCallback: (currentData) => {
                    const gridActivePower = currentData.allComponents["_sum/GridActivePower"];
                    const gridBuyPrice = currentData.allComponents[`${timeOfUseTariffController.id}/QuarterlyPrices`];
                    return gridActivePower > 0 && gridBuyPrice != null && gridBuyPrice <= 0;
                },
                message: {
                    textCallback: (currentData: CurrentData) => {
                        const formattedPrice = getFormattedPrice(currentData);
                        return translate.instant("FENA.MESSAGES.STORAGE.TIME_OF_USE_TARIFF.NEGATIVE_GRID_BUY_PRICE", {
                            priceWithUnit: formattedPrice,
                        });
                    },
                },
            }),

            new Fena.LiveMessage({
                category: "GRID",
                priority: 2,
                actions: [Fena.MessageUtils.buildDetailAction(timeOfUseTariffController.id, injector)],
                channels: [
                    new ChannelAddress("_sum", "GridActivePower"),
                    new ChannelAddress(timeOfUseTariffController.id, "QuarterlyPrices"),
                    new ChannelAddress(timeOfUseTariffController.id, "StateMachine"),
                ],
                showCallback: (currentData) => {
                    const isInModeChargeGrid =
                        currentData.allComponents[`${timeOfUseTariffController.id}/StateMachine`] ===
                        TimeOfUseTariffUtils.State.ChargeGrid;
                    const gridActivePower = currentData.allComponents["_sum/GridActivePower"];
                    const gridBuyPrice = currentData.allComponents[`${timeOfUseTariffController.id}/QuarterlyPrices`];
                    return gridActivePower > 0 && gridBuyPrice > 0 && isInModeChargeGrid && isEssChargeFromGridAllowed;
                },
                message: {
                    textCallback: (currentData: CurrentData) => {
                        const formattedPrice = getFormattedPrice(currentData);
                        return translate.instant("FENA.MESSAGES.STORAGE.TIME_OF_USE_TARIFF.CHARGE_FROM_GRID_ACTIVE", {
                            priceWithUnit: formattedPrice,
                        });
                    },
                },
            }),
            new Fena.LiveMessage({
                category: "GRID",
                priority: 3,
                actions: [Fena.MessageUtils.buildDetailAction(timeOfUseTariffController.id, injector)],
                channels: [
                    new ChannelAddress("_sum", "GridActivePower"),
                    new ChannelAddress(timeOfUseTariffController.id, "QuarterlyPrices"),
                    new ChannelAddress(timeOfUseTariffController.id, "StateMachine"),
                ],
                showCallback: (currentData) => {
                    const gridBuyPrice = currentData.allComponents[`${timeOfUseTariffController.id}/QuarterlyPrices`];
                    const gridActivePower = currentData.allComponents["_sum/GridActivePower"];
                    return gridBuyPrice != null && gridBuyPrice <= 10 && gridActivePower > 0;
                },
                message: {
                    text: translate.instant("FENA.MESSAGES.STORAGE.TIME_OF_USE_TARIFF.DELAY_CHARGE_ACTIVE"),
                },
            }),
        ];
    }
}

export type AutomaticViewModel = {
    mode: Mode;
    chargeConsumptionIsActive: boolean;
};
