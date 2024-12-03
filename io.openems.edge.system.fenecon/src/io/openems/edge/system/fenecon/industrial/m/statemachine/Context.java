package io.openems.edge.system.fenecon.industrial.m.statemachine;

import io.openems.edge.common.statemachine.AbstractContext;
import io.openems.edge.ess.api.SymmetricEss;
import io.openems.edge.system.fenecon.industrial.m.SystemFeneconIndustrialMImpl;

public class Context extends AbstractContext<SystemFeneconIndustrialMImpl> {

	protected final SymmetricEss ess;

	public Context(SystemFeneconIndustrialMImpl parent, SymmetricEss ess) {
		super(parent);
		this.ess = ess;
	}
}
