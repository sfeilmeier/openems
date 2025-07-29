package io.openems.edge.system.fenecon.industrial.l.statemachine;

import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.AbstractContext;
import io.openems.edge.ess.api.SymmetricEss;
import io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialLImpl;

import java.time.Clock;

public class Context extends AbstractContext<SystemFeneconIndustrialLImpl> {

	protected final SymmetricEss ess;
	protected final StartStop startStop;
	protected final Clock clock;

	public Context(SystemFeneconIndustrialLImpl parent, SymmetricEss ess, StartStop startStop, Clock clock) {
		super(parent);
		this.ess = ess;
		this.startStop = startStop;
		this.clock = clock;
	}

	public boolean isStarted() {
		return this.startStop == StartStop.START;
	}

	public boolean isStopped() {
		return this.startStop == StartStop.STOP;
	}

}