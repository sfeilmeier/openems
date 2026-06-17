export enum GridMode {
    UNDEFINED = 0,
    ON_GRID = 1,
    OFF_GRID = 2,
    GENERATOR = 3,
}
export enum Mode {
    MANUAL_ON = "MANUAL_ON",
    MANUAL_OFF = "MANUAL_OFF",
    AUTOMATIC = "AUTOMATIC",
    MANUAL = "MANUAL",
    OFF = "OFF",
    CHARGE_ONCE = "CHARGE_ONCE",
    DISCHARGE_ONCE = "DISCHARGE_ONCE",
}
export enum EnerixControlMode {
    OFF = "OFF",
    REMOTE_CONTROL = "REMOTE_CONTROL",
}
export const ChartAnnotationState = {
    ON: 1,
    OFF: 0,
    OFF_HIDDEN: null,
};
export enum BatteryMode {
    UNDEFINED = -1, //
    NO_BATTERY = 0, //
    STANDBY = 1, //
    DISCHARGING = 2, //
    CHARGING = 3,
}
export enum GoodWe {
    UNDEFINED = -1, //
    GOODWE_GW10K_BT = 10, //
    GOODWE_GW8K_BT = 11, //
    GOODWE_GW5K_BT = 12, //
    GOODWE_GW10K_ET = 20, //
    GOODWE_GW8K_ET = 21, //
    GOODWE_GW5K_ET = 22, //
    FENECON_FHI_10_DAH = 30, //
    FENECON_FHI_20_DAH = 120, //
    FENECON_FHI_29_9_DAH = 130,
}
export enum WorkMode {
    TIME = "TIME",
    NONE = "NONE",
    ENERGY = "ENERGY",
    TEMPERATURE = "TEMPERATURE",
}
export enum BackupEnable {
    AKTIVIERT = 1,
    DEAKTIVIERT = 2,
}
export enum BatteryStateMachine {
    UNDEFINED = -1, //
    GO_RUNNING = 10, //
    RUNNING = 11, //
    GO_STOPPED = 20, //
    STOPPED = 21, //
    ERROR = 30, //
}
export enum DredCmd {
    UNDEFINED = -1, //
    DRED0 = 0x00ff, //
    DRED1 = 0x0001, //
    DRED2 = 0x0002, //
    DRED3 = 0x0004, //
    DRED4 = 0x0008, //
    DRED5 = 0x0010, //
    DRED6 = 0x0020, //
    DRED7 = 0x0040, //
    DRED8 = 0x0080, //
}
export enum SafetyCountryCode {
    UNDEFINED = -1, //
    ITALY = 0, //
    CZECH = 1, //
    GERMANY = 2, //
    SPAIN = 3,
    GREECE_MAINLAND = 4, //
    DENMARK = 5, //
    BELGIUM = 6, //
    ROMANIA = 7, //
    G83_G59 = 8, //
    AUSTRALIA = 9, //
    FRANCE = 0x0a, //
    CHINA = 0x0b, //
    GRID_DEFAULT_60HZ = 0x0c, //
    POLAND = 0x0d, //
    SOUTH_AFRICA = 0x0e, //
    AUSTRALIA_L = 0x0f, //
    BRAZIL = 0x10, //
    THAILAND_MEA = 0x11, //
    THAILAND_PEA = 0x12, //
    MAURITIUS = 0x13, //
    HOLLAND = 0x14, //
    NORTHERN_IRELAND = 0x15, //
    CHINESE_STANDARD_HIGHER = 0x16, //
    FRENCH_50HZ = 0x17, //
    FRENCH_60HZ = 0x18, //
    AUSTRALIA_ERGON = 0x19, //
    AUSTRALIA_ENERGEX = 0x1a, //
    HOLLAND_16_20A = 0x1b, //
    KOREA = 0x1c, //
    CHINA_STATION = 0x1d, //
    AUSTRIA = 0x1e, //
    INDIA = 0x1f, //
    GRID_DEFAULT_50HZ = 0x20, //
    WAREHOUSE = 0x21, //
    PHILIPPINES = 0x22, //
    IRELAND = 0x23, //
    TAIWAN = 0x24, //
    BULGARIA = 0x25, //
    BARBADOS = 0x26, //
    G59_3 = 0x28, //
    SWEDEN = 0x29, //
    CHILE = 0x2a, //
    BRAZIL_LV = 0x2b, //
    NEWZEALAND = 0x2c, //
    IEEE1547_208VAC = 0x2d, //
    IEEE1547_220VAC = 0x2e, //
    IEEE1547_240VAC = 0x2f, //
    DEFAULT_60_HZ_LV = 0x30, //
    DEFAULT_50_HZ_LV = 0x31, //
    AUSTRALIA_WESTERN = 0x32, //
    AUSTRALIA_MICRO_GRID = 0x33, //
    JP_50_HZ = 0x34, //
    JP_60_HZ = 0x35, //
    INDIA_HIGHER = 0x36, //
    DEWA_LV = 0x37, //
    DEWA_MV = 0x38, //
    SLOVAKIA = 0x39, //
    GREEN_GRID = 0x3a, //
    HUNGARY = 0x3b, //
    SRILANKA = 0x3c, //
    SPAIN_ISLANDS = 0x3d, //
    ERAGON_30_K = 0x3e, //
    ENERGE_30_K = 0x3f, //
    IEEE1547_230VAC = 0x40, //
    IEC61727_60HZ = 0x41, //
    SWITZERLAND = 0x42, //
    CEI_016 = 0x43, //
    AUSTRALIA_HORIZON = 0x44, //
    CYPRUS = 0x45, //
    AUSTRALIA_SAPN = 0x46, //
    AUSTRALIA_AUSGRID = 0x47, //
    AUSTRALIA_ESSENTIAL = 0x48, //
    AUSTRALIA_PWCORE_CITI_PW = 0x49, //
}

export enum EnabledDisabledState {
    DISABLED = 0,
    ENABLED = 1,
}

export enum BatteryInverterState {
    UNDEFINED = -1,
    OFF = 1,
    SLEEPING = 2,
    STARTING = 3,
    MPPT = 4,
    THROTTLED = 5,
    SHUTTING_DOWN = 6,
    FAULT = 7,
    STANDBY = 8,
    PRECHARGE = 9,
    GRID_PRE_CONNECTED = 10,
    GRID_CONNECTED = 11,
    NO_ERROR_PENDING = 12,
}

export enum OverrideStatus {
    ACTIVE = 0,
    INACTIVE = 1,
    ERROR = 2,
    DONE = 3,
}
