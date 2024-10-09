package io.openems.edge.system.fenecon.industrial.l.statemachine;

import io.openems.edge.common.statemachine.AbstractContext;
import io.openems.edge.ess.api.SymmetricEss;
import io.openems.edge.system.fenecon.industrial.l.SystemFeneconIndustrialLImpl;

public class Context extends AbstractContext<SystemFeneconIndustrialLImpl> {

	protected final SymmetricEss ess;

	public Context(SystemFeneconIndustrialLImpl parent, SymmetricEss ess) {
		super(parent);
		this.ess = ess;
	}
}