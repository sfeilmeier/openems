package io.openems.edge.battery.fenecon.f2b.fisker.statemachine;

import java.time.Clock;

import io.openems.edge.battery.fenecon.f2b.fisker.BatteryFeneconF2bFiskerImpl;
import io.openems.edge.battery.fenecon.f2b.fisker.enums.ActualState;
import io.openems.edge.common.statemachine.AbstractContext;

public class Context extends AbstractContext<BatteryFeneconF2bFiskerImpl> {

	protected final Clock clock;

	public Context(BatteryFeneconF2bFiskerImpl parent, Clock clock) {
		super(parent);
		this.clock = clock;
	}

	/**
	 * Check if F2B state machine in standby.
	 * 
	 * @return true if F2B state machine in Standby
	 */
	public boolean isStandby() {
		return this.getParent().getActualState() == ActualState.STANDBY;
	}

	/**
	 * Check is running.
	 * 
	 * @return true if battery is in started
	 */
	public boolean isStarted() {
		return this.getParent().getActualState() == ActualState.HV_ON;
	}

	/**
	 * Check is shutdown.
	 * 
	 * @return true if battery is stopped
	 */
	public boolean isStopped() {
		return this.getParent().getActualState() == ActualState.OFF;
	}

	/**
	 * Check if battery has any fault or in error state.
	 * 
	 * @return true if battery has at an error.
	 */
	public boolean hasFaults() {
		return this.getParent().hasFaults();
	}

}