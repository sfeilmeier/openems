package io.openems.edge.battery.nuvationbms.statemachine;

import java.time.Clock;

import io.openems.edge.battery.nuvationbms.NuvationBmsImpl;
import io.openems.edge.battery.nuvationbms.NuvationSunSpecModel.S802BatSt;
import io.openems.edge.common.statemachine.AbstractContext;

public class Context extends AbstractContext<NuvationBmsImpl> {

	public static final int TIMEOUT = 120;
	protected final Clock clock;

	public Context(NuvationBmsImpl component, Clock clock) {
		super(component);
		this.clock = clock;
	}

	/**
	 * Check is running.
	 * 
	 * @return true if battery is in started
	 */
	public boolean isStarted() {
		final var batteryState = this.getParent().getBatteryState();
		return switch (batteryState) {
		case S802BatSt.INITIALIZING, S802BatSt.CONNECTED -> true;
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
		case S802BatSt.DISCONNECTED -> true;
		default -> false;
		};
	}

}
