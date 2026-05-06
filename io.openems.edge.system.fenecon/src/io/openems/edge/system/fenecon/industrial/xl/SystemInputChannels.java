package io.openems.edge.system.fenecon.industrial.xl;

import static io.openems.common.types.ChannelAddress.fromString;

import java.util.function.Consumer;

import io.openems.common.channel.Debounce;
import io.openems.common.channel.Level;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.types.ChannelAddress;

public enum SystemInputChannels {
	ENABLE_COUPLING_SWITCH("io0/DigitalInputM0C1", SystemInputChannels.class, "enableCouplingSwitch", null, true,
			SystemFeneconIndustrialXlImpl::updateStatusSysOffChannels), //
	STATUS_24V_PDU_F2B_1("io0/DigitalInputM0C2", SystemInputChannels.class, "status24vPduF2b1", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_24V_PDU_F2B_2("io0/DigitalInputM0C3", SystemInputChannels.class, "status24vPduF2b2", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_24V_PDU_F2B_3("io0/DigitalInputM0C4", SystemInputChannels.class, "status24vPduF2b3", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_24V_PDU_CSYS("io0/DigitalInputM0C5", SystemInputChannels.class, "status24vPduCsys", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_SPD_CC_AC("io0/DigitalInputM0C6", SystemInputChannels.class, "statusSpdCcAc", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updateOverVoltageProtectionChannels), //
	STATUS_SPD_CCS("io0/DigitalInputM0C7", SystemInputChannels.class, "statusSpdCcs", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updateOverVoltageProtectionChannels), //
	BUFFERING_24V_F2B("io0/DigitalInputM0C8", SystemInputChannels.class, "buffering24vF2b", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_SPD_INV("io0/DigitalInputM0C9", SystemInputChannels.class, "statusSpdInv", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updateOverVoltageProtectionChannels), //
	STATUS_SWITCH_F2B_1("io0/DigitalInputM0C10", SystemInputChannels.class, "statusSwitchF2b1", Level.WARNING, false,
			SystemFeneconIndustrialXlImpl::updateNetworkDistributionChannels), //
	STATUS_SWITCH_F2B_2("io0/DigitalInputM0C11", SystemInputChannels.class, "statusSwitchF2b2", Level.WARNING, false,
			SystemFeneconIndustrialXlImpl::updateNetworkDistributionChannels), //
	STATUS_SWITCH_F2B_3("io0/DigitalInputM0C12", SystemInputChannels.class, "statusSwitchF2b3", Level.WARNING, false,
			SystemFeneconIndustrialXlImpl::updateNetworkDistributionChannels), //
	STATUS_DOOR_CSYS("io0/DigitalInputM0C13", SystemInputChannels.class, "statusDoorCsys", Level.INFO, true,
			SystemFeneconIndustrialXlImpl::updateDoorSwitchChannels), //
	STATUS_DOOR_BAT_1("io0/DigitalInputM0C14", SystemInputChannels.class, "statusDoorBat1", Level.INFO, true,
			SystemFeneconIndustrialXlImpl::updateDoorSwitchChannels), //
	STATUS_DOOR_BAT_2("io0/DigitalInputM0C15", SystemInputChannels.class, "statusDoorBat2", Level.INFO, true,
			SystemFeneconIndustrialXlImpl::updateDoorSwitchChannels), //
	STATUS_DOOR_BAT_3("io0/DigitalInputM0C16", SystemInputChannels.class, "statusDoorBat3", Level.INFO, true,
			SystemFeneconIndustrialXlImpl::updateDoorSwitchChannels), //
	STATUS_24V_PSU_CSYS("io0/DigitalInputM1C1", SystemInputChannels.class, "status24vPsuCsys", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updateDoorSwitchChannels), //
	STATUS_24V_UPS_CSYS("io0/DigitalInputM1C2", SystemInputChannels.class, "status24vUpsCsys", Level.WARNING, //
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_24V_PSU_F2B_1("io0/DigitalInputM1C3", SystemInputChannels.class, "status24vPsuF2b1", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_24V_PSU_F2B_2("io0/DigitalInputM1C4", SystemInputChannels.class, "status24vPsuF2b2", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_24V_PSU_F2B_3("io0/DigitalInputM1C5", SystemInputChannels.class, "status24vPsuF2b3", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_24V_UPS_F2B_1("io0/DigitalInputM1C6", SystemInputChannels.class, "status24vUpsF2b1", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_24V_UPS_F2B_2("io0/DigitalInputM1C7", SystemInputChannels.class, "status24vUpsF2b2", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_24V_UPS_F2B_3("io0/DigitalInputM1C8", SystemInputChannels.class, "status24vUpsF2b3", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updatePowerSupplyChannels), //
	STATUS_SPD_CC_CI("io0/DigitalInputM1C9", SystemInputChannels.class, "statusSpdCcCi", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updateOverVoltageProtectionChannels), //
	STATUS_SPD_DC_BAT_1("io0/DigitalInputM1C10", SystemInputChannels.class, "statusSpdDcBat1", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updateOverVoltageProtectionChannels), //
	STATUS_SPD_DC_BAT_2("io0/DigitalInputM1C11", SystemInputChannels.class, "statusSpdDcBat2", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updateOverVoltageProtectionChannels), //
	STATUS_SPD_DC_BAT_3("io0/DigitalInputM1C12", SystemInputChannels.class, "statusSpdDcBat3", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updateOverVoltageProtectionChannels), //
	STATUS_LEAK_MONITOR_1("io0/DigitalInputM1C13", SystemInputChannels.class, "statusLeakMonitor1", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updateLeakMonitorChannels), //
	STATUS_LEAK_MONITOR_2("io0/DigitalInputM1C14", SystemInputChannels.class, "statusLeakMonitor2", Level.WARNING, true,
			SystemFeneconIndustrialXlImpl::updateLeakMonitorChannels), //
	STATUS_LIGHTING("io0/DigitalInputM1C15", SystemInputChannels.class, "statusLighting", Level.INFO, false,
			SystemFeneconIndustrialXlImpl::updateContainerLightingChannels), //
	STATUS_SYS_OFF("io0/DigitalInputM1C16", SystemInputChannels.class, "statusSysOff", null, false,
			SystemFeneconIndustrialXlImpl::updateStatusSysOffChannels, 3, Debounce.TRUE_VALUES_IN_A_ROW_TO_SET_TRUE), //
	SYS_SERVICE_SWITCH("io0/DigitalInputM2C1", SystemInputChannels.class, "sysServiceSwitch", null, true,
			SystemFeneconIndustrialXlImpl::updateStatusSysOffChannels), //
	;

	private final String channelAddress;
	private final Class<?> clazz;
	private final String channelKey;
	private final Level level;
	private final boolean invert;
	private final Consumer<SystemFeneconIndustrialXlImpl> updateMethod;
	private final int debounceCycles;
	private final Debounce debounceMode;

	private SystemInputChannels(String channelAddress, Class<?> clazz, String channelKey, Level level,
			Consumer<SystemFeneconIndustrialXlImpl> callback) {
		this(channelAddress, clazz, channelKey, level, true, callback, 0, null);
	}

	private SystemInputChannels(String channelAddress, Class<?> clazz, String channelKey, Level level, boolean invert,
			Consumer<SystemFeneconIndustrialXlImpl> updateMethod) {
		this(channelAddress, clazz, channelKey, level, invert, updateMethod, 0, null);
	}

	private SystemInputChannels(String channelAddress, Class<?> clazz, String channelKey, Level level, boolean invert,
			Consumer<SystemFeneconIndustrialXlImpl> updateMethod, int debounceCycles, Debounce debounceMode) {
		this.channelAddress = channelAddress;
		this.clazz = clazz;
		this.channelKey = channelKey;
		this.level = level;
		this.invert = invert;
		this.updateMethod = updateMethod;
		this.debounceCycles = debounceCycles;
		this.debounceMode = debounceMode;
	}

	/**
	 * Parses a string "Component-ID/Channel-ID" to a ChannelAddress.
	 *
	 * @return the ChannelAddress
	 * @throws OpenemsNamedException on parse error
	 */
	public ChannelAddress getAddress() throws OpenemsNamedException {
		return fromString(this.channelAddress);
	}

	public Level getLevel() {
		return this.level;
	}

	public boolean isInvert() {
		return this.invert;
	}

	public Consumer<SystemFeneconIndustrialXlImpl> getUpdateMethod() {
		return this.updateMethod;
	}

	public Class<?> getClazz() {
		return this.clazz;
	}

	public String getChannelKey() {
		return this.channelKey;
	}

	public int getDebounceCycles() {
		return this.debounceCycles;
	}

	public Debounce getDebounceMode() {
		return this.debounceMode;
	}

}