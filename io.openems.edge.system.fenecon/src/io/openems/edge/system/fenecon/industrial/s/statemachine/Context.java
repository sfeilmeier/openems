package io.openems.edge.system.fenecon.industrial.s.statemachine;

import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.AbstractContext;
import io.openems.edge.ess.api.SymmetricEss;
import io.openems.edge.system.fenecon.industrial.s.SystemFeneconIndustrialSImpl;

public class Context extends AbstractContext<SystemFeneconIndustrialSImpl> {

	protected final SymmetricEss ess;
	protected final StartStop startStop;

	public Context(SystemFeneconIndustrialSImpl parent, SymmetricEss ess, StartStop startStop) {
		super(parent);
		this.ess = ess;
		this.startStop = startStop;
	}

	public boolean isStarted() {
		return this.startStop == StartStop.START;
	}

	public boolean isStopped() {
		return this.startStop == StartStop.STOP;
	}

}
