import { StrictFormlyFieldConfig } from "src/app/shared/components/formly/formly-utils";
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
    NONE = "UNSELECTED",
    FIX_PF = "FIX_PF",
    FIX_Q = "FIX_Q",
    QU_CURVE = "QU_CURVE",
    COS_PHI_P_CURVE = "COS_PHI_P_CURVE",
    QP_CURVE = "QP_CURVE",
}

export enum CurveMode {
    BASIC = "BASIC",
    SLOPE = "SLOPE",
}

export enum CurrentDistributionMode {
    REACTIVE_POWER_PRIO = "REACTIVE_POWER_PRIO",
    ACTIVE_POWER_PRIO = "ACTIVE_POWER_PRIO",
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
    APM_OUTPUT_ACTIVE_POWER: number;
    APM_POWER_GRADIENT: number;

    APM_PF_OVER_FREQUENCY_CURVE_ENABLE: boolean;
    APM_PF_OVER_FREQUENCY_START_POINT: number | null;
    APM_PF_OVER_FREQUENCY_SLOPE: number | null;
    APM_PF_OVER_FREQUENCY_DELAY_TIME: number | null;

    APM_PF_OVER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP: boolean;
    APM_PF_OVER_FREQUENCY_HYSTERESIS_POINT: number | null;
    APM_PF_OVER_FREQUENCY_DELAY_WAITING_TIME: number | null;
    APM_PF_OVER_FREQUENCY_HYSTERESIS_SLOPE: number | null;
    APM_PF_UNDER_FREQUENCY_CURVE_ENABLE: boolean;
    APM_PF_UNDER_FREQUENCY_THRESHOLD: number | null;
    APM_PF_UNDER_FREQUENCY_SLOPE: number | null;
    APM_PF_UNDER_FREQUENCY_DELAY_TIME: number | null;

    APM_PF_UNDER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP: boolean;
    APM_PF_UNDER_FREQUENCY_HYSTERESIS_POINT: number | null;
    APM_PF_UNDER_FREQUENCY_DELAY_WAITING_TIME: number | null;
    APM_PF_UNDER_FREQUENCY_HYSTERESIS_SLOPE: number | null;

    PU_CURVE_ENABLE: boolean;
    APM_PU_V1_VOLTAGE: number | null;
    APM_PU_V1_ACTIVE_POWER: number | null;
    APM_PU_V2_VOLTAGE: number | null;
    APM_PU_V2_ACTIVE_POWER: number | null;
    APM_PU_V3_VOLTAGE: number | null;
    APM_PU_V3_ACTIVE_POWER: number | null;
    APM_PU_V4_VOLTAGE: number | null;
    APM_PU_V4_ACTIVE_POWER: number | null;
    APM_PU_OUTPUT_RESPONSE_MODE: RecoveryMode;
    APM_PU_PT1_LOW_PASS_FILTER_TIME_CONSTANT: number | null;
    APM_PU_PT1_LOW_PASS_FILTER_CONSTANT_GRADIENT_MODE: number | null;
}

export interface ReactivePowerModeModel {
    RPM_MODE: ReactivePowerMode;
    RPM_FIX_PF: FeedInSetting;
    RPM_FIX_Q: number | null;

    RPM_QU_CURVE_MODE: CurveMode;
    RPM_QU_VOLTAGE_DEAD_BAND: number | null;
    RPM_QU_OVEREXCITED_SLOPE: number | null;
    RPM_QU_UNDEREXCITED_SLOPE: number | null;
    RPM_QU_V1_VOLTAGE: number;
    RPM_QU_V1_REACTIVE_POWER: number;
    RPM_QU_V2_VOLTAGE: number;
    RPM_QU_V2_REACTIVE_POWER: number | null;
    RPM_QU_V3_VOLTAGE: number;
    RPM_QU_V3_REACTIVE_POWER: number | null;
    RPM_QU_V4_VOLTAGE: number;
    RPM_QU_V4_REACTIVE_POWER: number;
    RPM_QU_TIME_CONSTANT: number;
    RPM_QU_EXTENDED_FUNCTIONS: boolean;
    RPM_QU_LOCK_IN_POWER: number | null;
    RPM_QU_LOCK_OUT_POWER: number | null;

    RPM_COS_PHI_MODE: CurveMode;
    RPM_COS_PHI_OVEREXCITED_SLOPE: number | null;
    RPM_COS_PHI_UNDEREXCITED_SLOPE: number | null;
    RPM_COS_PHIP_POWER_A: number;
    RPM_COS_PHIP_COS_PHI_A: number;
    RPM_COS_PHIP_POWER_B: number;
    RPM_COS_PHIP_COS_PHI_B: number;
    RPM_COS_PHIP_POWER_C: number;
    RPM_COS_PHIP_COS_PHI_C: number;
    RPM_COS_PHIP_POWER_D: number;
    RPM_COS_PHIP_COS_PHI_D: number;
    RPM_COS_PHIP_POWER_E: number;
    RPM_COS_PHIP_COS_PHI_E: number;
    RPM_COS_PHIP_TIME_CONSTANT: number;
    RPM_COS_PHIP_EXTENDED_FUNCTIONS: boolean;
    RPM_COS_PHIP_LOCK_IN_VOLT: number | null;
    RPM_COS_PHIP_LOCK_OUT_VOLT: number | null;

    RPM_QP_CURVE_MODE: CurveMode;
    RPM_QP_OVEREXCITED_SLOPE: number | null;
    RPM_QP_UNDEREXCITED_SLOPE: number | null;
    RPM_QP_POWER_P1: number | null;
    RPM_QP_REACTIVE_POWER_P1: number | null;
    RPM_QP_POWER_P2: number | null;
    RPM_QP_REACTIVE_POWER_P2: number | null;
    RPM_QP_POWER_P3: number | null;
    RPM_QP_REACTIVE_POWER_P3: number | null;
    RPM_QP_POWER_P4: number;
    RPM_QP_REACTIVE_POWER_P4: number | null;
    RPM_QP_POWER_P5: number;
    RPM_QP_REACTIVE_POWER_P5: number;
    RPM_QP_POWER_P6: number;
    RPM_QP_REACTIVE_POWER_P6: number;
    RPM_QP_TIME_CONSTANT: number | null;
}

export interface ProtectionParametersModel {
    VPP_OV_STAGE1_TRIGGER_VALUE: number;
    VPP_OV_STAGE1_TRIP_TIME: number;
    VPP_UV_STAGE1_TRIP_VALUE: number;
    VPP_UV_STAGE1_TRIP_TIME: number;
    VPP_OV_STAGE2_TRIGGER_VALUE: number;
    VPP_OV_STAGE2_TRIP_TIME: number;
    VPP_UV_STAGE2_TRIP_VALUE: number;
    VPP_UV_STAGE2_TRIP_TIME: number;
    VPP_OV_STAGE3_TRIGGER_VALUE: number | null;
    VPP_OV_STAGE3_TRIP_TIME: number | null;
    VPP_UV_STAGE3_TRIP_VALUE: number | null;
    VPP_UV_STAGE3_TRIP_TIME: number | null;
    VPP_OV_STAGE4_TRIGGER_VALUE: number | null;
    VPP_OV_STAGE4_TRIP_TIME: number | null;
    VPP_UV_STAGE4_TRIP_VALUE: number | null;
    VPP_UV_STAGE4_TRIP_TIME: number | null;

    VPP_10MIN_OV_TRIP_THRESHOLD: number;
    VPP_10MIN_OV_TRIP_TIME: number | null;

    FPP_OF_STAGE1_TRIGGER_VALUE: number;
    FPP_OF_STAGE1_TRIP_TIME: number;
    FPP_UF_STAGE1_TRIP_VALUE: number;
    FPP_UF_STAGE1_TRIP_TIME: number;
    FPP_OF_STAGE2_TRIGGER_VALUE: number;
    FPP_OF_STAGE2_TRIP_TIME: number;
    FPP_UF_STAGE2_TRIP_VALUE: number | null;
    FPP_UF_STAGE2_TRIP_TIME: number | null;
    FPP_OF_STAGE3_TRIGGER_VALUE: number | null;
    FPP_OF_STAGE3_TRIP_TIME: number | null;
    FPP_UF_STAGE3_TRIP_VALUE: number | null;
    FPP_UF_STAGE3_TRIP_TIME: number | null;
    FPP_OF_STAGE4_TRIGGER_VALUE: number | null;
    FPP_OF_STAGE4_TRIP_TIME: number | null;
    FPP_UF_STAGE4_TRIP_VALUE: number | null;
    FPP_UF_STAGE4_TRIP_TIME: number | null;
}

export interface ConnectionParametersModel {
    CP_RAMP_UP_UPPER_VOLTAGE: number;
    CP_RAMP_UP_LOWER_VOLTAGE: number;
    CP_RAMP_UP_UPPER_FREQUENCY: number;
    CP_RAMP_UP_LOWER_FREQUENCY: number;
    CP_RAMP_UP_OBSERVATION_TIME: number;
    CP_SOFT_RAMP_UP_GRADIENT_ENABLE: boolean;
    CP_SOFT_RAMP_UP_GRADIENT: number;

    CP_RECONNECTION_UPPER_VOLTAGE: number;
    CP_RECONNECTION_LOWER_VOLTAGE: number;
    CP_RECONNECTION_UPPER_FREQUENCY: number;
    CP_RECONNECTION_LOWER_FREQUENCY: number;
    CP_RECONNECTION_OBSERVATION_TIME: number;
    CP_RECONNECTION_GRADIENT_ENABLE: boolean;
    CP_RECONNECTION_GRADIENT: number;
}

export interface VoltageRideThroughModel {
    VRT_LVRT_ENABLE: boolean;
    VRT_UV1_VOLTAGE: number;
    VRT_UV1_TIME: number | null;
    VRT_UV2_VOLTAGE: number;
    VRT_UV2_TIME: number;
    VRT_UV3_VOLTAGE: number;
    VRT_UV3_TIME: number;
    VRT_UV4_VOLTAGE: number;
    VRT_UV4_TIME: number;
    VRT_UV5_VOLTAGE: number;
    VRT_UV5_TIME: number;
    VRT_UV6_VOLTAGE: number;
    VRT_UV6_TIME: number;
    VRT_UV7_VOLTAGE: number;
    VRT_UV7_TIME: number;
    VRT_ENTER_LVRT_THRESHOLD: number;
    VRT_EXIT_LVRT_ENDPOINT: number;
    VRT_K1_SLOPE: number;
    VRT_LVRT_ZERO_CURRENT_MODE_ENABLE: boolean;
    VRT_LVRT_ZERO_CURRENT_MODE_ENTRY_THRESHOLD: number | null;

    VRT_HVRT_ENABLE: boolean;
    VRT_OV1_VOLTAGE: number;
    VRT_OV1_TIME: number;
    VRT_OV2_VOLTAGE: number;
    VRT_OV2_TIME: number;
    VRT_OV3_VOLTAGE: number;
    VRT_OV3_TIME: number;
    VRT_OV4_VOLTAGE: number;
    VRT_OV4_TIME: number;
    VRT_OV5_VOLTAGE: number;
    VRT_OV5_TIME: number;
    VRT_OV6_VOLTAGE: number;
    VRT_OV6_TIME: number;
    VRT_OV7_VOLTAGE: number;
    VRT_OV7_TIME: number;
    VRT_ENTER_HIGH_CROSSING_THRESHOLD: number;
    HVRT_EXIT_HIGH_CROSSING_THRESHOLD: number;
    HVRT_K2_SLOPE: number;
    VRT_HVRT_ZERO_CURRENT_MODE_ENABLE: boolean;
    VRT_HVRT_ZERO_CURRENT_MODE_ENTRY_THRESHOLD: number | null;

    VRT_CURRENT_DISTRIBUTION_MODE: CurrentDistributionMode;
    VRT_ACTIVE_POWER_RECOVERY_MODE: RecoveryMode;
    VRT_ACTIVE_POWER_RECOVERY_SPEED: number | null;
    VRT_ACTIVE_POWER_RECOVERY_SLOPE: number | null;
    VRT_REACTIVE_POWER_RECOVERY_MODE_END: RecoveryMode;
    VRT_REACTIVE_POWER_RECOVERY_SPEED: number | null;
    VRT_REACTIVE_POWER_RECOVERY_SLOPE: number | null;
}

export interface FrequencyRideThroughModel {
    FRT_ENABLE: boolean;
    FRT_UF1_FREQUENCY: number | null;
    FRT_UF1_TIME: number | null;
    FRT_UF2_FREQUENCY: number | null;
    FRT_UF2_TIME: number | null;
    FRT_UF3_FREQUENCY: number | null;
    FRT_UF3_TIME: number | null;
    FRT_OF1_FREQUENCY: number | null;
    FRT_OF1_TIME: number | null;
    FRT_OF2_FREQUENCY: number | null;
    FRT_OF2_TIME: number | null;
    FRT_OF3_FREQUENCY: number | null;
    FRT_OF3_TIME: number | null;
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
    fields: StrictFormlyFieldConfig<AdvancedGridSettingsModel>[];
}

export function getDefaultAdvancedGridSettings(): AdvancedGridSettingsModel {
    return {
        APM_OUTPUT_ACTIVE_POWER: 1000,
        APM_POWER_GRADIENT: 100,
        APM_PF_OVER_FREQUENCY_CURVE_ENABLE: true,
        APM_PF_OVER_FREQUENCY_START_POINT: 50200,
        APM_PF_OVER_FREQUENCY_SLOPE: 400,
        APM_PF_OVER_FREQUENCY_DELAY_TIME: null,
        APM_PF_OVER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP: false,
        APM_PF_OVER_FREQUENCY_HYSTERESIS_POINT: null,
        APM_PF_OVER_FREQUENCY_DELAY_WAITING_TIME: null,
        APM_PF_OVER_FREQUENCY_HYSTERESIS_SLOPE: null,
        APM_PF_UNDER_FREQUENCY_CURVE_ENABLE: true,
        APM_PF_UNDER_FREQUENCY_THRESHOLD: 49800,
        APM_PF_UNDER_FREQUENCY_SLOPE: 400,
        APM_PF_UNDER_FREQUENCY_DELAY_TIME: null,
        APM_PF_UNDER_FREQUENCY_DEACTIVATION_THRESHOLD_FSTOP: false,
        APM_PF_UNDER_FREQUENCY_HYSTERESIS_POINT: null,
        APM_PF_UNDER_FREQUENCY_DELAY_WAITING_TIME: null,
        APM_PF_UNDER_FREQUENCY_HYSTERESIS_SLOPE: null,
        PU_CURVE_ENABLE: false,
        APM_PU_V1_VOLTAGE: 1100,
        APM_PU_V1_ACTIVE_POWER: 1000,
        APM_PU_V2_VOLTAGE: 1100,
        APM_PU_V2_ACTIVE_POWER: 1000,
        APM_PU_V3_VOLTAGE: 1100,
        APM_PU_V3_ACTIVE_POWER: 1000,
        APM_PU_V4_VOLTAGE: 1150,
        APM_PU_V4_ACTIVE_POWER: null,
        APM_PU_OUTPUT_RESPONSE_MODE: RecoveryMode.PT_1_BEHAVIOUR,
        APM_PU_PT1_LOW_PASS_FILTER_TIME_CONSTANT: 100,
        APM_PU_PT1_LOW_PASS_FILTER_CONSTANT_GRADIENT_MODE: null,

        RPM_MODE: ReactivePowerMode.NONE,
        RPM_FIX_PF: FeedInSetting.Leading_1_OR_NONE,
        RPM_FIX_Q: null,

        RPM_QU_CURVE_MODE: CurveMode.BASIC,
        RPM_QU_VOLTAGE_DEAD_BAND: null,
        RPM_QU_OVEREXCITED_SLOPE: null,
        RPM_QU_UNDEREXCITED_SLOPE: null,
        RPM_QU_V1_VOLTAGE: 960,
        RPM_QU_V1_REACTIVE_POWER: 485,
        RPM_QU_V2_VOLTAGE: 1000,
        RPM_QU_V2_REACTIVE_POWER: null,
        RPM_QU_V3_VOLTAGE: 1000,
        RPM_QU_V3_REACTIVE_POWER: null,
        RPM_QU_V4_VOLTAGE: 1040,
        RPM_QU_V4_REACTIVE_POWER: -485,
        RPM_QU_TIME_CONSTANT: 3300,
        RPM_QU_EXTENDED_FUNCTIONS: false,
        RPM_QU_LOCK_IN_POWER: null,
        RPM_QU_LOCK_OUT_POWER: null,

        RPM_COS_PHI_MODE: CurveMode.BASIC,
        RPM_COS_PHI_OVEREXCITED_SLOPE: null,
        RPM_COS_PHI_UNDEREXCITED_SLOPE: null,
        RPM_COS_PHIP_POWER_A: 200,
        RPM_COS_PHIP_COS_PHI_A: 1000,
        RPM_COS_PHIP_POWER_B: 500,
        RPM_COS_PHIP_COS_PHI_B: 1000,
        RPM_COS_PHIP_POWER_C: 1000,
        RPM_COS_PHIP_COS_PHI_C: -900,
        RPM_COS_PHIP_POWER_D: 1000,
        RPM_COS_PHIP_COS_PHI_D: -900,
        RPM_COS_PHIP_POWER_E: 100,
        RPM_COS_PHIP_COS_PHI_E: -900,
        RPM_COS_PHIP_TIME_CONSTANT: 3300,
        RPM_COS_PHIP_EXTENDED_FUNCTIONS: false,
        RPM_COS_PHIP_LOCK_IN_VOLT: null,
        RPM_COS_PHIP_LOCK_OUT_VOLT: null,

        RPM_QP_CURVE_MODE: CurveMode.BASIC,
        RPM_QP_OVEREXCITED_SLOPE: null,
        RPM_QP_UNDEREXCITED_SLOPE: null,
        RPM_QP_POWER_P1: null,
        RPM_QP_REACTIVE_POWER_P1: null,
        RPM_QP_POWER_P2: null,
        RPM_QP_REACTIVE_POWER_P2: null,
        RPM_QP_POWER_P3: null,
        RPM_QP_REACTIVE_POWER_P3: null,
        RPM_QP_POWER_P4: 500,
        RPM_QP_REACTIVE_POWER_P4: null,
        RPM_QP_POWER_P5: 600,
        RPM_QP_REACTIVE_POWER_P5: -50,
        RPM_QP_POWER_P6: 900,
        RPM_QP_REACTIVE_POWER_P6: -330,
        RPM_QP_TIME_CONSTANT: null,

        VPP_OV_STAGE1_TRIGGER_VALUE: 1250,
        VPP_OV_STAGE1_TRIP_TIME: 80,
        VPP_UV_STAGE1_TRIP_VALUE: 800,
        VPP_UV_STAGE1_TRIP_TIME: 2000,
        VPP_OV_STAGE2_TRIGGER_VALUE: 1250,
        VPP_OV_STAGE2_TRIP_TIME: 80,
        VPP_UV_STAGE2_TRIP_VALUE: 300,
        VPP_UV_STAGE2_TRIP_TIME: 700,
        VPP_OV_STAGE3_TRIGGER_VALUE: null,
        VPP_OV_STAGE3_TRIP_TIME: null,
        VPP_UV_STAGE3_TRIP_VALUE: null,
        VPP_UV_STAGE3_TRIP_TIME: null,
        VPP_OV_STAGE4_TRIGGER_VALUE: null,
        VPP_OV_STAGE4_TRIP_TIME: null,
        VPP_UV_STAGE4_TRIP_VALUE: null,
        VPP_UV_STAGE4_TRIP_TIME: null,
        VPP_10MIN_OV_TRIP_THRESHOLD: 1100,
        VPP_10MIN_OV_TRIP_TIME: null,
        FPP_OF_STAGE1_TRIGGER_VALUE: 51500,
        FPP_OF_STAGE1_TRIP_TIME: 4800,
        FPP_UF_STAGE1_TRIP_VALUE: 47500,
        FPP_UF_STAGE1_TRIP_TIME: 80,
        FPP_OF_STAGE2_TRIGGER_VALUE: 52500,
        FPP_OF_STAGE2_TRIP_TIME: 80,
        FPP_UF_STAGE2_TRIP_VALUE: null,
        FPP_UF_STAGE2_TRIP_TIME: null,
        FPP_OF_STAGE3_TRIGGER_VALUE: null,
        FPP_OF_STAGE3_TRIP_TIME: null,
        FPP_UF_STAGE3_TRIP_VALUE: null,
        FPP_UF_STAGE3_TRIP_TIME: null,
        FPP_OF_STAGE4_TRIGGER_VALUE: null,
        FPP_OF_STAGE4_TRIP_TIME: null,
        FPP_UF_STAGE4_TRIP_VALUE: null,
        FPP_UF_STAGE4_TRIP_TIME: null,

        CP_RAMP_UP_UPPER_VOLTAGE: 1100,
        CP_RAMP_UP_LOWER_VOLTAGE: 900,
        CP_RAMP_UP_UPPER_FREQUENCY: 50200,
        CP_RAMP_UP_LOWER_FREQUENCY: 47500,
        CP_RAMP_UP_OBSERVATION_TIME: 60,
        CP_SOFT_RAMP_UP_GRADIENT_ENABLE: false,
        CP_SOFT_RAMP_UP_GRADIENT: 200,
        CP_RECONNECTION_UPPER_VOLTAGE: 1100,
        CP_RECONNECTION_LOWER_VOLTAGE: 950,
        CP_RECONNECTION_UPPER_FREQUENCY: 50100,
        CP_RECONNECTION_LOWER_FREQUENCY: 49900,
        CP_RECONNECTION_OBSERVATION_TIME: 300,
        CP_RECONNECTION_GRADIENT_ENABLE: false,
        CP_RECONNECTION_GRADIENT: 600,

        VRT_LVRT_ENABLE: true,
        VRT_UV1_VOLTAGE: 150,
        VRT_UV1_TIME: null,
        VRT_UV2_VOLTAGE: 150,
        VRT_UV2_TIME: 2200,
        VRT_UV3_VOLTAGE: 750,
        VRT_UV3_TIME: 30000,
        VRT_UV4_VOLTAGE: 850,
        VRT_UV4_TIME: 600000,
        VRT_UV5_VOLTAGE: 900,
        VRT_UV5_TIME: 600000,
        VRT_UV6_VOLTAGE: 900,
        VRT_UV6_TIME: 600000,
        VRT_UV7_VOLTAGE: 900,
        VRT_UV7_TIME: 600000,
        VRT_ENTER_LVRT_THRESHOLD: 900,
        VRT_EXIT_LVRT_ENDPOINT: 920,
        VRT_K1_SLOPE: 20,
        VRT_LVRT_ZERO_CURRENT_MODE_ENABLE: false,
        VRT_LVRT_ZERO_CURRENT_MODE_ENTRY_THRESHOLD: null,

        VRT_HVRT_ENABLE: true,
        VRT_OV1_VOLTAGE: 1250,
        VRT_OV1_TIME: 1000,
        VRT_OV2_VOLTAGE: 1200,
        VRT_OV2_TIME: 1000,
        VRT_OV3_VOLTAGE: 1200,
        VRT_OV3_TIME: 50000,
        VRT_OV4_VOLTAGE: 1150,
        VRT_OV4_TIME: 50000,
        VRT_OV5_VOLTAGE: 1150,
        VRT_OV5_TIME: 60000,
        VRT_OV6_VOLTAGE: 1150,
        VRT_OV6_TIME: 60000,
        VRT_OV7_VOLTAGE: 1150,
        VRT_OV7_TIME: 60000,
        VRT_ENTER_HIGH_CROSSING_THRESHOLD: 1100,
        HVRT_EXIT_HIGH_CROSSING_THRESHOLD: 1080,
        HVRT_K2_SLOPE: 20,
        VRT_HVRT_ZERO_CURRENT_MODE_ENABLE: false,
        VRT_HVRT_ZERO_CURRENT_MODE_ENTRY_THRESHOLD: null,

        VRT_CURRENT_DISTRIBUTION_MODE: CurrentDistributionMode.REACTIVE_POWER_PRIO,
        VRT_ACTIVE_POWER_RECOVERY_MODE: RecoveryMode.DISABLE,
        VRT_ACTIVE_POWER_RECOVERY_SPEED: null,
        VRT_ACTIVE_POWER_RECOVERY_SLOPE: null,
        VRT_REACTIVE_POWER_RECOVERY_MODE_END: RecoveryMode.DISABLE,
        VRT_REACTIVE_POWER_RECOVERY_SPEED: null,
        VRT_REACTIVE_POWER_RECOVERY_SLOPE: null,

        FRT_ENABLE: false,
        FRT_UF1_FREQUENCY: null,
        FRT_UF1_TIME: null,
        FRT_UF2_FREQUENCY: null,
        FRT_UF2_TIME: null,
        FRT_UF3_FREQUENCY: null,
        FRT_UF3_TIME: null,
        FRT_OF1_FREQUENCY: null,
        FRT_OF1_TIME: null,
        FRT_OF2_FREQUENCY: null,
        FRT_OF2_TIME: null,
        FRT_OF3_FREQUENCY: null,
        FRT_OF3_TIME: null,
    };
}
