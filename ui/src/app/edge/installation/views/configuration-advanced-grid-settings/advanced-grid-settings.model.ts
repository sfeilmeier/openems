import { TypedFormlyFieldConfig } from "src/app/shared/components/formly/formly-utils";
import { FeedInSetting } from "../../shared/enums";

export const COS_PHI_CURVE_POINTS = ["A", "B", "C", "D", "E"] as const;
export type CurvePoint = (typeof COS_PHI_CURVE_POINTS)[number];

export enum GridUnit {
    PER_MILLE = "‰",
    PERCENT_VN = "%Vn",
    PERCENT_PN = "%Pn",
    SECONDS = "sec",
    MILLI_SECONDS = "ms",
    MILLI_HERTZ = "mHz",
    PERMILLE_PER_HZ = "‰/Hz",
    PERMILLE_IN_PER_SEC = "‰In/s",
    PERMILLE_VN = "‰Vn",
    QMAX_PER_10_PERCENT_VN = "Qmax/10%Vn",
    QMAX_PER_10_PERCENT_PN = "Qmax/10%Pn",
    PERMILLE_PN_PER_MIN = "‰Pn/min",
    PERMILLE_PN_PER_SEC = "‰Pn/s",
}

export enum ReactivePowerMode {
    NONE = "NONE",
    FIX_PF = "FIX_PF",
    FIX_Q = "FIX_Q",
    QU_CURVE = "QU_CURVE",
    COS_PHI_P_CURVE = "COSPHIP_CURVE",
    QP_CURVE = "QP_CURVE",
}

export enum CurveMode {
    STANDARD = "STANDARD",
    SLOPE = "SLOPE",
}

export enum CurrentDistributionMode {
    REACTIVE_PRIORITY = "REACTIVE_PRIORITY",
    ACTIVE_PRIORITY = "ACTIVE_PRIORITY",
    CONSTANT_CURRENT = "CONSTANT_CURRENT",
}

export enum RecoveryMode {
    DISABLE = "DISABLE",
    GRADIENT_CONTROL = "GRADIENT_CONTROL",
    PT_1_BEHAVIOUR = "PT_1_BEHAVIOUR",
}

export const GRID_SETTING_RANGES = {
    FREQUENCY: {
        min: 30000,
        max: 80000,
        unit: GridUnit.MILLI_HERTZ,
    },

    VOLTAGE: {
        min: 0,
        max: 1400,
        unit: GridUnit.PERMILLE_VN,
    },

    GRADIENT_PER_SECONDS: {
        min: 0,
        max: 1200,
        unit: GridUnit.SECONDS,
    },

    GRADIENT_PER_MILLE_PER_HZ: {
        min: 0,
        max: 1000,
        unit: GridUnit.PERMILLE_PER_HZ,
    },

    TIME_PER_MILLI_SECONDS: {
        min: 0,
        max: 1000000,
        unit: GridUnit.MILLI_SECONDS,
    },

    HYSTERISIS_TIME_PER_MILLIHERTZ: {
        min: 50000,
        max: 65000,
        unit: GridUnit.MILLI_HERTZ,
    },

    FREQUENY_TIME_PER_MILLISECONDS: {
        min: 20,
        max: 7200000,
        unit: GridUnit.MILLI_SECONDS,
    },

    POWER_RECOVERY_SLOPE_PER_MIN: {
        min: 0,
        max: 65000,
        unit: GridUnit.PERMILLE_PN_PER_MIN,
    },

    ACTIVE_POWER_PER_MILLE: {
        min: -1000,
        max: 1000,
        unit: GridUnit.PER_MILLE,
    },

    TIME_CONSTANT: {
        min: 0,
        max: 6000000,
        unit: GridUnit.MILLI_SECONDS,
    },

    VOLTAGE_DEAD_BAND: {
        min: 0,
        max: 1000,
        unit: GridUnit.PERMILLE_VN,
    },

    UNDER_OVER_EXCITED_SLOPE: {
        min: -2000,
        max: 2000,
        unit: GridUnit.QMAX_PER_10_PERCENT_PN,
    },

    VOLTAGE_THRESHOLD: {
        min: 800,
        max: 1400,
        unit: GridUnit.PERMILLE_VN,
    },

    VOLTAGE_TRIP_TIME: {
        min: 10,
        max: 7200000,
        unit: GridUnit.MILLI_SECONDS,
    },

    VOLTAGE_LOWER: {
        min: 150,
        max: 1000,
        unit: GridUnit.PERMILLE_VN,
    },

    OBSERVATION_TIME: {
        min: 1,
        max: 1200,
        unit: GridUnit.SECONDS,
    },

    UNDERVOTAGE_TRIP_TIME: {
        min: 0,
        max: 650000,
        unit: GridUnit.MILLI_SECONDS,
    },

    OVER_VOLTAGE_THRESHOLD: {
        min: 1000,
        max: 1400,
        unit: GridUnit.PERCENT_VN,
    },

    SLOPE_SECONDS: {
        min: 0,
        max: 100,
    },

    LOW_PASS_FILTER_TIME_CONSTANT: {
        min: 0,
        max: 360000000,
        unit: GridUnit.MILLI_SECONDS,
    },

    POWER_GRADIENT: {
        min: 0,
        max: 65000,
        unit: GridUnit.PERMILLE_IN_PER_SEC,
    },
} as const;

export interface ActivePowerModeModel {
    apmOutputActivePower: number;
    apmPowerGradient: number;

    apmPfOverFrequencyCurveEnable: boolean;
    apmPfOverFrequencyStartPoint: number | null;
    apmPfOverFrequencySlope: number | null;
    apmPfOverFrequencyDelayTime: number | null;

    apmPfOverFrequencyDeactivationThresholdFstop: boolean;
    apmPfOverFrequencyHysteresisPoint: number | null;
    apmPfOverFrequencyDelayWaitingTime: number | null;
    apmPfOverFrequencyHysteresisSlope: number | null;
    apmPfUnderFrequencyCurveEnable: boolean;
    apmPfUnderFrequencyThreshold: number | null;
    apmPfUnderFrequencySlope: number | null;
    apmPfUnderFrequencyDelayTime: number | null;

    apmPfUnderFrequencyDeactivationThresholdFstop: boolean;
    apmPfUnderFrequencyHysteresisPoint: number | null;
    apmPfUnderFrequencyDelayWaitingTime: number | null;
    apmPfUnderFrequencyHysteresisSlope: number | null;

    puCurveEnable: boolean;
    apmPuV1Voltage: number | null;
    apmPuV1ActivePower: number | null;
    apmPuV2Voltage: number | null;
    apmPuV2ActivePower: number | null;
    apmPuV3Voltage: number | null;
    apmPuV3ActivePower: number | null;
    apmPuV4Voltage: number | null;
    apmPuV4ActivePower: number | null;
    apmPuOutputResponseMode: RecoveryMode;
    apmPuPt1LowPassFilterTimeConstant: number | null;
    apmPuPt1LowPassFilterConstantGradientMode: number | null;
}

export interface ReactivePowerModeModel {
    rpmMode: ReactivePowerMode;
    rpmFixPf: FeedInSetting;
    rpmFixQ: number | null;

    rpmQuCurveMode: CurveMode;
    rpmQuVoltageDeadBand: number | null;
    rpmQuOverexcitedSlope: number | null;
    rpmQuUnderexcitedSlope: number | null;
    rpmQuV1Voltage: number;
    rpmQuV1ReactivePower: number;
    rpmQuV2Voltage: number;
    rpmQuV2ReactivePower: number | null;
    rpmQuV3Voltage: number;
    rpmQuV3ReactivePower: number | null;
    rpmQuV4Voltage: number;
    rpmQuV4ReactivePower: number;
    rpmQuTimeConstant: number;
    rpmQuExtendedFunctions: boolean;
    rpmQuLockInPower: number | null;
    rpmQuLockOutPower: number | null;

    rpmCosPhiMode: CurveMode;
    rpmCosPhiOverexcitedSlope: number | null;
    rpmCosPhiUnderexcitedSlope: number | null;
    rpmCosPhipPowerA: number;
    rpmCosPhipCosPhiA: number;
    rpmCosPhipPowerB: number;
    rpmCosPhipCosPhiB: number;
    rpmCosPhipPowerC: number;
    rpmCosPhipCosPhiC: number;
    rpmCosPhipPowerD: number;
    rpmCosPhipCosPhiD: number;
    rpmCosPhipPowerE: number;
    rpmCosPhipCosPhiE: number;
    rpmCosPhipTimeConstant: number;
    rpmCosPhipExtendedFunctions: boolean;
    rpmCosPhipLockInVolt: number | null;
    rpmCosPhipLockOutVolt: number | null;

    rpmQpCurveMode: CurveMode;
    rpmQpOverexcitedSlope: number | null;
    rpmQpUnderexcitedSlope: number | null;
    rpmQpPowerP1: number | null;
    rpmQpReactivePowerP1: number | null;
    rpmQpPowerP2: number | null;
    rpmQpReactivePowerP2: number | null;
    rpmQpPowerP3: number | null;
    rpmQpReactivePowerP3: number | null;
    rpmQpPowerP4: number;
    rpmQpReactivePowerP4: number | null;
    rpmQpPowerP5: number;
    rpmQpReactivePowerP5: number;
    rpmQpPowerP6: number;
    rpmQpReactivePowerP6: number;
    rpmQpTimeConstant: number | null;
}

export interface ProtectionParametersModel {
    vppOvStage1TriggerValue: number;
    vppOvStage1TripTime: number;
    vppUvStage1TripValue: number;
    vppUvStage1TripTime: number;
    vppOvStage2TriggerValue: number;
    vppOvStage2TripTime: number;
    vppUvStage2TripValue: number;
    vppUvStage2TripTime: number;
    vppOvStage3TriggerValue: number | null;
    vppOvStage3TripTime: number | null;
    vppUvStage3TripValue: number | null;
    vppUvStage3TripTime: number | null;
    vppOvStage4TriggerValue: number | null;
    vppOvStage4TripTime: number | null;
    vppUvStage4TripValue: number | null;
    vppUvStage4TripTime: number | null;

    VPP_10MIN_OV_TRIP_THRESHOLD: number;
    VPP_10MIN_OV_TRIP_TIME: number | null;

    fppOfStage1TriggerValue: number;
    fppOfStage1TripTime: number;
    fppUfStage1TripValue: number;
    fppUfStage1TripTime: number;
    fppOfStage2TriggerValue: number;
    fppOfStage2TripTime: number;
    fppUfStage2TripValue: number | null;
    fppUfStage2TripTime: number | null;
    fppOfStage3TriggerValue: number | null;
    fppOfStage3TripTime: number | null;
    fppUfStage3TripValue: number | null;
    fppUfStage3TripTime: number | null;
    fppOfStage4TriggerValue: number | null;
    fppOfStage4TripTime: number | null;
    fppUfStage4TripValue: number | null;
    fppUfStage4TripTime: number | null;
}

export interface ConnectionParametersModel {
    cpRampUpUpperVoltage: number;
    cpRampUpLowerVoltage: number;
    cpRampUpUpperFrequency: number;
    cpRampUpLowerFrequency: number;
    cpRampUpObservationTime: number;
    cpSoftRampUpGradientEnable: boolean;
    cpSoftRampUpGradient: number;

    cpReconnectionUpperVoltage: number;
    cpReconnectionLowerVoltage: number;
    cpReconnectionUpperFrequency: number;
    cpReconnectionLowerFrequency: number;
    cpReconnectionObservationTime: number;
    cpReconnectionGradientEnable: boolean;
    cpReconnectionGradient: number;
}

export interface VoltageRideThroughModel {
    vrtLvrtEnable: boolean;
    vrtUv1Voltage: number;
    vrtUv1Time: number | null;
    vrtUv2Voltage: number;
    vrtUv2Time: number;
    vrtUv3Voltage: number;
    vrtUv3Time: number;
    vrtUv4Voltage: number;
    vrtUv4Time: number;
    vrtUv5Voltage: number;
    vrtUv5Time: number;
    vrtUv6Voltage: number;
    vrtUv6Time: number;
    vrtUv7Voltage: number;
    vrtUv7Time: number;
    vrtEnterLvrtThreshold: number;
    vrtExitLvrtEndpoint: number;
    vrtK1Slope: number;
    vrtLvrtZeroCurrentModeEnable: boolean;
    vrtLvrtZeroCurrentModeEntryThreshold: number | null;

    vrtHvrtEnable: boolean;
    vrtOv1Voltage: number;
    vrtOv1Time: number;
    vrtOv2Voltage: number;
    vrtOv2Time: number;
    vrtOv3Voltage: number;
    vrtOv3Time: number;
    vrtOv4Voltage: number;
    vrtOv4Time: number;
    vrtOv5Voltage: number;
    vrtOv5Time: number;
    vrtOv6Voltage: number;
    vrtOv6Time: number;
    vrtOv7Voltage: number;
    vrtOv7Time: number;
    vrtEnterHighCrossingThreshold: number;
    hvrtExitHighCrossingThreshold: number;
    hvrtK2Slope: number;
    vrtHvrtZeroCurrentModeEnable: boolean;
    vrtHvrtZeroCurrentModeEntryThreshold: number | null;

    vrtCurrentDistributionMode: CurrentDistributionMode;
    vrtActivePowerRecoveryMode: RecoveryMode;
    vrtActivePowerRecoverySpeed: number | null;
    vrtActivePowerRecoverySlope: number | null;
    vrtReactivePowerRecoveryModeEnd: RecoveryMode;
    vrtReactivePowerRecoverySpeed: number | null;
    vrtReactivePowerRecoverySlope: number | null;
}

export interface FrequencyRideThroughModel {
    frtEnable: boolean;
    frtUf1Frequency: number | null;
    frtUf1Time: number | null;
    frtUf2Frequency: number | null;
    frtUf2Time: number | null;
    frtUf3Frequency: number | null;
    frtUf3Time: number | null;
    frtOf1Frequency: number | null;
    frtOf1Time: number | null;
    frtOf2Frequency: number | null;
    frtOf2Time: number | null;
    frtOf3Frequency: number | null;
    frtOf3Time: number | null;
}

export interface AdvancedGridSettingsModel
    extends
        ActivePowerModeModel,
        ReactivePowerModeModel,
        ProtectionParametersModel,
        ConnectionParametersModel,
        VoltageRideThroughModel,
        FrequencyRideThroughModel {}

export interface GridSettingsSection {
    id: string;
    uiLabel: string;
    fields: TypedFormlyFieldConfig<AdvancedGridSettingsModel>[];
}

export function getDefaultAdvancedGridSettings(): AdvancedGridSettingsModel {
    return {
        apmOutputActivePower: 1000,
        apmPowerGradient: 100,
        apmPfOverFrequencyCurveEnable: true,
        apmPfOverFrequencyStartPoint: 50200,
        apmPfOverFrequencySlope: 400,
        apmPfOverFrequencyDelayTime: null,
        apmPfOverFrequencyDeactivationThresholdFstop: false,
        apmPfOverFrequencyHysteresisPoint: null,
        apmPfOverFrequencyDelayWaitingTime: null,
        apmPfOverFrequencyHysteresisSlope: null,
        apmPfUnderFrequencyCurveEnable: true,
        apmPfUnderFrequencyThreshold: 49800,
        apmPfUnderFrequencySlope: 400,
        apmPfUnderFrequencyDelayTime: null,
        apmPfUnderFrequencyDeactivationThresholdFstop: false,
        apmPfUnderFrequencyHysteresisPoint: null,
        apmPfUnderFrequencyDelayWaitingTime: null,
        apmPfUnderFrequencyHysteresisSlope: null,
        puCurveEnable: false,
        apmPuV1Voltage: 1100,
        apmPuV1ActivePower: 1000,
        apmPuV2Voltage: 1100,
        apmPuV2ActivePower: 1000,
        apmPuV3Voltage: 1100,
        apmPuV3ActivePower: 1000,
        apmPuV4Voltage: 1150,
        apmPuV4ActivePower: null,
        apmPuOutputResponseMode: RecoveryMode.PT_1_BEHAVIOUR,
        apmPuPt1LowPassFilterTimeConstant: 100,
        apmPuPt1LowPassFilterConstantGradientMode: null,

        rpmMode: ReactivePowerMode.NONE,
        rpmFixPf: FeedInSetting.Leading_1_OR_NONE,
        rpmFixQ: null,

        rpmQuCurveMode: CurveMode.STANDARD,
        rpmQuVoltageDeadBand: null,
        rpmQuOverexcitedSlope: null,
        rpmQuUnderexcitedSlope: null,
        rpmQuV1Voltage: 960,
        rpmQuV1ReactivePower: 485,
        rpmQuV2Voltage: 1000,
        rpmQuV2ReactivePower: null,
        rpmQuV3Voltage: 1000,
        rpmQuV3ReactivePower: null,
        rpmQuV4Voltage: 1040,
        rpmQuV4ReactivePower: -485,
        rpmQuTimeConstant: 3300,
        rpmQuExtendedFunctions: false,
        rpmQuLockInPower: null,
        rpmQuLockOutPower: null,

        rpmCosPhiMode: CurveMode.STANDARD,
        rpmCosPhiOverexcitedSlope: null,
        rpmCosPhiUnderexcitedSlope: null,
        rpmCosPhipPowerA: 200,
        rpmCosPhipCosPhiA: 1000,
        rpmCosPhipPowerB: 500,
        rpmCosPhipCosPhiB: 1000,
        rpmCosPhipPowerC: 1000,
        rpmCosPhipCosPhiC: -900,
        rpmCosPhipPowerD: 1000,
        rpmCosPhipCosPhiD: -900,
        rpmCosPhipPowerE: 100,
        rpmCosPhipCosPhiE: -900,
        rpmCosPhipTimeConstant: 3300,
        rpmCosPhipExtendedFunctions: false,
        rpmCosPhipLockInVolt: null,
        rpmCosPhipLockOutVolt: null,

        rpmQpCurveMode: CurveMode.STANDARD,
        rpmQpOverexcitedSlope: null,
        rpmQpUnderexcitedSlope: null,
        rpmQpPowerP1: null,
        rpmQpReactivePowerP1: null,
        rpmQpPowerP2: null,
        rpmQpReactivePowerP2: null,
        rpmQpPowerP3: null,
        rpmQpReactivePowerP3: null,
        rpmQpPowerP4: 500,
        rpmQpReactivePowerP4: null,
        rpmQpPowerP5: 600,
        rpmQpReactivePowerP5: -50,
        rpmQpPowerP6: 900,
        rpmQpReactivePowerP6: -330,
        rpmQpTimeConstant: null,

        vppOvStage1TriggerValue: 1250,
        vppOvStage1TripTime: 80,
        vppUvStage1TripValue: 800,
        vppUvStage1TripTime: 2000,
        vppOvStage2TriggerValue: 1250,
        vppOvStage2TripTime: 80,
        vppUvStage2TripValue: 300,
        vppUvStage2TripTime: 700,
        vppOvStage3TriggerValue: null,
        vppOvStage3TripTime: null,
        vppUvStage3TripValue: null,
        vppUvStage3TripTime: null,
        vppOvStage4TriggerValue: null,
        vppOvStage4TripTime: null,
        vppUvStage4TripValue: null,
        vppUvStage4TripTime: null,
        VPP_10MIN_OV_TRIP_THRESHOLD: 1100,
        VPP_10MIN_OV_TRIP_TIME: null,
        fppOfStage1TriggerValue: 51500,
        fppOfStage1TripTime: 4800,
        fppUfStage1TripValue: 47500,
        fppUfStage1TripTime: 80,
        fppOfStage2TriggerValue: 52500,
        fppOfStage2TripTime: 80,
        fppUfStage2TripValue: null,
        fppUfStage2TripTime: null,
        fppOfStage3TriggerValue: null,
        fppOfStage3TripTime: null,
        fppUfStage3TripValue: null,
        fppUfStage3TripTime: null,
        fppOfStage4TriggerValue: null,
        fppOfStage4TripTime: null,
        fppUfStage4TripValue: null,
        fppUfStage4TripTime: null,

        cpRampUpUpperVoltage: 1100,
        cpRampUpLowerVoltage: 900,
        cpRampUpUpperFrequency: 50200,
        cpRampUpLowerFrequency: 47500,
        cpRampUpObservationTime: 60,
        cpSoftRampUpGradientEnable: false,
        cpSoftRampUpGradient: 200,
        cpReconnectionUpperVoltage: 1100,
        cpReconnectionLowerVoltage: 950,
        cpReconnectionUpperFrequency: 50100,
        cpReconnectionLowerFrequency: 49900,
        cpReconnectionObservationTime: 300,
        cpReconnectionGradientEnable: false,
        cpReconnectionGradient: 600,

        vrtLvrtEnable: true,
        vrtUv1Voltage: 150,
        vrtUv1Time: null,
        vrtUv2Voltage: 150,
        vrtUv2Time: 2200,
        vrtUv3Voltage: 750,
        vrtUv3Time: 30000,
        vrtUv4Voltage: 850,
        vrtUv4Time: 600000,
        vrtUv5Voltage: 900,
        vrtUv5Time: 600000,
        vrtUv6Voltage: 900,
        vrtUv6Time: 600000,
        vrtUv7Voltage: 900,
        vrtUv7Time: 600000,
        vrtEnterLvrtThreshold: 900,
        vrtExitLvrtEndpoint: 920,
        vrtK1Slope: 20,
        vrtLvrtZeroCurrentModeEnable: false,
        vrtLvrtZeroCurrentModeEntryThreshold: null,

        vrtHvrtEnable: true,
        vrtOv1Voltage: 1250,
        vrtOv1Time: 1000,
        vrtOv2Voltage: 1200,
        vrtOv2Time: 1000,
        vrtOv3Voltage: 1200,
        vrtOv3Time: 50000,
        vrtOv4Voltage: 1150,
        vrtOv4Time: 50000,
        vrtOv5Voltage: 1150,
        vrtOv5Time: 60000,
        vrtOv6Voltage: 1150,
        vrtOv6Time: 60000,
        vrtOv7Voltage: 1150,
        vrtOv7Time: 60000,
        vrtEnterHighCrossingThreshold: 1100,
        hvrtExitHighCrossingThreshold: 1080,
        hvrtK2Slope: 20,
        vrtHvrtZeroCurrentModeEnable: false,
        vrtHvrtZeroCurrentModeEntryThreshold: null,

        vrtCurrentDistributionMode: CurrentDistributionMode.REACTIVE_PRIORITY,
        vrtActivePowerRecoveryMode: RecoveryMode.DISABLE,
        vrtActivePowerRecoverySpeed: null,
        vrtActivePowerRecoverySlope: null,
        vrtReactivePowerRecoveryModeEnd: RecoveryMode.DISABLE,
        vrtReactivePowerRecoverySpeed: null,
        vrtReactivePowerRecoverySlope: null,

        frtEnable: false,
        frtUf1Frequency: null,
        frtUf1Time: null,
        frtUf2Frequency: null,
        frtUf2Time: null,
        frtUf3Frequency: null,
        frtUf3Time: null,
        frtOf1Frequency: null,
        frtOf1Time: null,
        frtOf2Frequency: null,
        frtOf2Time: null,
        frtOf3Frequency: null,
        frtOf3Time: null,
    };
}
