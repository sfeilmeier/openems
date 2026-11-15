package io.openems.edge.battery.wuerthbms.enums;

import io.openems.common.types.OptionsEnum;

public enum CvcmFaultCause implements OptionsEnum {

	UNDEFINED(-1, "Undefined"), //
	OVERCURRENT_COMPARATOR_OFF(0, "Overcurrent comparator off"), //
	TEMPDEP_CURRENT_MONITOR_OFF(1, "Tempdep current monitor off"), //
	SHUNT_CALIBRATION_FAILED(2, "Shunt calibration failed"), //
	SHUNT_CALIBRATION_TIMEOUT(3, "Shunt calibration timeout"), //
	LF_INIT_TEST(4, "LF init test"), //
	LF_FAULT_INJECTION_TEST(5, "LF fault injection test"), //
	LF_OVER_CURRENT_COMPARATOR_TEST(6, "LF over current comparator test"), //
	LF_SECOND_REFERENCE_TEST(7, "LF second reference test"), //
	LF_OPEN_WIRE_TEST(8, "LF open wire test"), //
	LF_PROM_TEST(9, "LF prom test"), //
	SPF_OPEN_WIRE_TEST(10, "SPF open wire test"), //
	SPF_SLOW_REGISTER_TEST(11, "SPF slow register test"), //
	SPF_RED_CALC_TEST(12, "SPF red calc test"), //
	SPF_RED_COMP_TEST(13, "SPF red comp test"), //
	SPF_DATA_PATH_TEST(14, "SPF data path test"), //
	SPF_OSCILLATOR_TEST(15, "SPF oscillator test"); //

	private final int value;
	private final String name;

	CvcmFaultCause(int value, String name) {
		this.value = value;
		this.name = name;
	}

	@Override
	public int getValue() {
		return this.value;
	}

	@Override
	public String getName() {
		return this.name;
	}

	@Override
	public OptionsEnum getUndefined() {
		return UNDEFINED;
	}

}
