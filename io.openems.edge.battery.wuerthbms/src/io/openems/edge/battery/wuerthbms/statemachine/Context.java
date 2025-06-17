package io.openems.edge.battery.wuerthbms.statemachine;

import java.time.Clock;
import java.time.Duration;

import io.openems.edge.battery.wuerthbms.WuerthBmsImpl;
import io.openems.edge.common.statemachine.AbstractContext;

public class Context extends AbstractContext<WuerthBmsImpl> {

	public static final Duration MAX_ALLOWED_START_TIME = Duration.ofSeconds(120);
	public static final Duration MAX_ALLOWED_STOP_TIME = Duration.ofSeconds(120);
	protected final Clock clock;

	public Context(WuerthBmsImpl component, Clock clock) {
		super(component);
		this.clock = clock;
	}

	protected boolean checkCurrent() {
		final var battery = this.getParent();
		final var current = battery.getCurrent();
		return current.isDefined() && current.get() <= 1;
	}

	/**
	 * Check is running.
	 * 
	 * @return true if battery is in started
	 */
	public boolean isStarted() {
		final var batteryState = this.getParent().getBatteryState();
		return switch (batteryState) {
		case CHARGE_STATE, DISCHARGE_STATE, IDLE_STATE -> true;
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
		case OFFLINE_STATE -> true;
		default -> false;
		};
	}
}
