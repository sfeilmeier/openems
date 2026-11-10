import { Injector } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { NavigationConstants, NavigationTree } from "src/app/shared/components/navigation/shared";
import { Converter } from "src/app/shared/components/shared/converter";
import { Name } from "src/app/shared/components/shared/name";
import { ChannelAddress, CurrentData, EdgeConfig } from "src/app/shared/shared";
import { Fena } from "../../../fena/fena.type";
import { CONVERT_CHARGE_MODE } from "../new-navigation/new-navigation";
export namespace SharedEvcs {
    export function getChannelAddresses(
        component: EdgeConfig.Component,
        ctrl: EdgeConfig.Component | null,
    ): Promise<ChannelAddress[]> {
        const channels: ChannelAddress[] = [
            // EVCS state channels
            new ChannelAddress(component.id, "State"),
            new ChannelAddress(component.id, "Status"),
            new ChannelAddress(component.id, "ActivePower"),
            new ChannelAddress(component.id, "Plug"),
            new ChannelAddress(component.id, "Phases"),
            new ChannelAddress(component.id, "EnergySession"),

            // Used by old implementation
            new ChannelAddress(component.id, "MinimumHardwarePower"),
            new ChannelAddress(component.id, "MaximumHardwarePower"),
            new ChannelAddress(component.id, "SetChargePowerLimit"),
        ];

        if (ctrl == null) {
            return Promise.resolve(channels);
        }

        channels.push(
            new ChannelAddress(ctrl.id, "_PropertyChargeMode"),
            new ChannelAddress(ctrl.id, "_PropertyForceChargeMinPower"),
            new ChannelAddress(ctrl.id, "_PropertyEnergySessionLimit"),
            new ChannelAddress(ctrl.id, "_PropertyDefaultChargeMinPower"),
            new ChannelAddress(ctrl.id, "_PropertyPriority"),
            new ChannelAddress(ctrl.id, "_PropertyEnabledCharging"),
        );

        return Promise.resolve(channels);
    }

    export type EvcsViewModel = {
        hasConnection: boolean;
        isEnergySinceBeginningAllowed: boolean;
        isChargingEnabled: boolean;
        isReadOnly: boolean;
        isNotExcessPower: boolean;
        hasNoDefaultChargeMinPower: boolean;
        isNotForceCharge: boolean;
        hasNoEnergySessionLimit: boolean;
    };

    export function getFormGroup(): FormGroup {
        return new FormGroup({
            chargeMode: new FormControl(null),
            isEnergySinceBeginningAllowed: new FormControl(null),
            hasConnection: new FormControl(null),
            isChargingEnabled: new FormControl(null),
            isNotExcessPower: new FormControl(null),
            isNotForceCharge: new FormControl(null),
            isReadOnly: new FormControl(null),
            hasNoDefaultChargeMinPower: new FormControl(null),
            hasNoEnergySessionLimit: new FormControl(null),
            energyLimit: new FormControl(null),
            minGuarantee: new FormControl(null),
            defaultChargeMinPower: new FormControl(null),
            forceChargeMinPower: new FormControl(null),
            priority: new FormControl(null),
            // EnergySessionLimit as Wh value
            energySessionLimit: new FormControl(null),
            // EnergySessionLimit as kWh value, for ion-range
            energySessionLimitKwh: new FormControl(null),
            enabledCharging: new FormControl(null),
        });
    }

    function isPartOfCluster(component: EdgeConfig.Component, config: EdgeConfig): boolean {
        const clusterIds = config.getComponentIdsByFactory("Evcs.Cluster.PeakShaving");
        const clusters: EdgeConfig.Component[] = clusterIds.map((id) => config.getComponentSafelyOrDefault(id));
        return clusters.some((cluster) => {
            const ids = cluster.getPropertyFromComponent<string[]>("evcs.ids");
            return Array.isArray(ids) && ids.includes(component.id);
        });
    }

    export function getNavigationTree(
        translate: TranslateService,
        component: EdgeConfig.Component,
        config: EdgeConfig,
    ): ConstructorParameters<typeof NavigationTree> | null {
        const isComponentPartOfCluster = isPartOfCluster(component, config);
        if (isComponentPartOfCluster) {
            return null;
        }

        const isReadOnly =
            config.getPropertyFromComponent<boolean>(config.getComponentSafelyOrDefault(component.id), "readOnly") ??
            false;

        return new NavigationTree(
            component.id,
            { baseString: "controller/evcs/" + component.id },
            { name: "oe-evcs", color: "normal" },
            Name.METER_ALIAS_OR_ID(component),
            "label",
            [
                ...(isReadOnly ? [] : [NavigationConstants.CommonNodes.SETTINGS(translate, component.id, "HIGH")]),
                NavigationConstants.CommonNodes.HISTORY(translate, component.id, []),
            ],
            null,
        ).toConstructorParams();
    }

    export function getFenaMessages(
        factoryId: string,
        config: EdgeConfig,
        translate: TranslateService,
        injector: Injector,
    ): Fena.Message[] {
        const evcss: EdgeConfig.Component[] = config.getComponentsByFactory(factoryId);
        return evcss.flatMap((evcs) => getFenaMessagesForEvcs(evcs, config, translate, injector));
    }

    function getFenaMessagesForEvcs(
        evcs: EdgeConfig.Component,
        config: EdgeConfig,
        translate: TranslateService,
        injector: Injector,
    ): Fena.Message[] {
        if (evcs === null) {
            return [];
        }
        const isReadOnly: boolean = evcs.getPropertyFromComponent("readOnly") ?? true;
        const ctrlEvcs =
            config
                .getComponentsByFactory("Controller.Evcs")
                ?.find((ctrl) => ctrl.getPropertyFromComponent("evcs.id") === evcs.id) ?? null;
        const wallboxAlias = evcs.alias;
        const hasCtrlEvcs: boolean = ctrlEvcs !== null;
        let mode: ChargeMode | null = null;
        if (ctrlEvcs !== null) {
            mode = ctrlEvcs.getPropertyFromComponent("chargeMode");
        }

        return [
            new Fena.LiveMessage({
                category: "CONSUMPTION",
                priority: 2,
                actions: [Fena.MessageUtils.buildDetailAction(evcs.id, injector)],
                channels: [
                    new ChannelAddress(evcs.id, "Status"),
                    new ChannelAddress(evcs.id, "ActivePower"),
                    new ChannelAddress(evcs.id, "ChargingType"),
                ],
                showCallback: (currentData) => {
                    const currentState = currentData.allComponents[evcs.id + "/Status"];
                    const chargingType = currentData.allComponents[evcs.id + "/ChargingType"];
                    return (
                        hasCtrlEvcs &&
                        !isReadOnly &&
                        currentState === ChargeState.CHARGING &&
                        chargingType == ChargingType.AC
                    );
                },
                message: {
                    textCallback: (currentData: CurrentData) => {
                        const activePower = currentData.allComponents[evcs.id + "/ActivePower"];
                        return translate.instant("FENA.MESSAGES.CONSUMPTION.EVSE.CHARGING_WITH_MODE", {
                            wallboxAlias,
                            mode: CONVERT_CHARGE_MODE(translate)(mode),
                            activePower: Converter.POWER_IN_KILO_WATT(activePower),
                        });
                    },
                },
            }),
            new Fena.LiveMessage({
                category: "CONSUMPTION",
                priority: 2,
                actions: [Fena.MessageUtils.buildDetailAction(evcs.id, injector)],
                channels: [
                    new ChannelAddress(evcs.id, "Status"),
                    new ChannelAddress(evcs.id, "ActivePower"),
                    new ChannelAddress(evcs.id, "ChargingType"),
                ],
                showCallback: (currentData) => {
                    const currentState = currentData.allComponents[evcs.id + "/Status"];
                    const chargingType = currentData.allComponents[evcs.id + "/ChargingType"];
                    return isReadOnly && currentState === ChargeState.CHARGING && chargingType === ChargingType.AC;
                },
                message: {
                    textCallback: (currentData: CurrentData) => {
                        const activePower = currentData.allComponents[evcs.id + "/ActivePower"];
                        return translate.instant("FENA.MESSAGES.CONSUMPTION.EVSE.CHARGING", {
                            wallboxAlias,
                            activePower: Converter.POWER_IN_KILO_WATT(activePower),
                        });
                    },
                },
            }),
            new Fena.LiveMessage({
                category: "CONSUMPTION",
                priority: 3,
                actions: [Fena.MessageUtils.buildDetailAction(evcs.id, injector)],
                channels: [new ChannelAddress(evcs.id, "Status"), new ChannelAddress(evcs.id, "ChargingType")],
                showCallback: (currentData) => {
                    const currentState = currentData.allComponents[evcs.id + "/Status"];
                    const chargingType = currentData.allComponents[evcs.id + "/ChargingType"];
                    return (
                        hasCtrlEvcs &&
                        !isReadOnly &&
                        chargingType === ChargingType.AC &&
                        currentState === ChargeState.READY_FOR_CHARGING &&
                        mode === ChargeMode.OFF
                    );
                },
                message: {
                    textCallback: (currentData: CurrentData) => {
                        return translate.instant("FENA.MESSAGES.CONSUMPTION.EVSE.NOT_CHARGING", { wallboxAlias });
                    },
                },
            }),
        ];
    }

    export enum ChargingType {
        UNDEFINED = -1,
        CCS = 0,
        CHADEMO = 1,
        AC = 2,
    }

    export enum ChargeMode {
        /** Manually charge. */
        FORCE_CHARGE = "FORCE_CHARGE",

        /** Automatically charge. */
        EXCESS_POWER = "EXCESS_POWER",

        /** No charge. */
        OFF = "OFF",
    }

    export enum ChargeState {
        /** State is undefined or unknown. */
        UNDEFINED = -1,

        /** Charging station is starting up. */
        STARTING = 0,

        /** Charging is not possible yet, e.g. the EV is unplugged, X1 or "ena" is not enabled, or RFID is not enabled. */
        NOT_READY_FOR_CHARGING = 1,

        /** Charging station is ready and waiting for a charging request from the EV. */
        READY_FOR_CHARGING = 2,

        /** The EV is currently charging. */
        CHARGING = 3,

        /** An error has occurred. */
        ERROR = 4,

        /** Authorization to start charging was rejected. */
        AUTHORIZATION_REJECTED = 5,

        /** The configured energy limit has been reached. */
        ENERGY_LIMIT_REACHED = 6,

        /** Charging has finished. */
        CHARGING_FINISHED = 7,
    }
}
