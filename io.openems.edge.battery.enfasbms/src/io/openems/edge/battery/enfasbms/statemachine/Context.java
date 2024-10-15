package io.openems.edge.battery.enfasbms.statemachine;

import java.time.Clock;

import io.openems.edge.battery.enfasbms.EnfasBmsImpl;
import io.openems.edge.common.statemachine.AbstractContext;

public class Context extends AbstractContext<EnfasBmsImpl> {

	public static final int TIMEOUT = 120;
	protected final Clock clock;

	public Context(EnfasBmsImpl component, Clock clock) {
		super(component);
		this.clock = clock;
	}

	protected boolean checkCurrent() {
		final var battery = this.getParent();
		return battery.getCurrent().isDefined() && battery.getCurrent().get() <= 1;
	}

	/**
	 * Check is running.
	 * 
	 * @return true if battery is in started
	 */
	public boolean isStarted() {
		final var batteryState = this.getParent().getBatteryState();
		return switch (batteryState) {
		case BMS_CHARGE_STATE, BMS_DISCHARGE_STATE, BMS_IDLE_STATE -> true;
		default -> false;
		};
	}

	/**
	 * Check is shutdown.
	 * 
	 * @return true if battery is stopped
	 */
	public boolean isStopped() {
		return switch (this.getParent().getBatteryState()) {
		case BMS_OFFLINE_STATE -> true;
		default -> false;
		};
	}

	/**
	 * Check if battery has any fault or in error state.
	 * 
	 * @return true if battery has at an error.
	 */
	public boolean hasFaults() {
		final var systemGlobalState = this.getParent().getBatteryState();
		final var state = switch (systemGlobalState) {
		case BMS_ERROR_STATE, BMS_SAFE_STATE -> true;
		default -> false;
		};
		return state || this.getParent().hasFaults();
	}
}
