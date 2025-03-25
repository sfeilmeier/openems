package io.openems.edge.battery.fenecon.f2b.cluster.common.statemachine;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.timedata.Timeout;
import io.openems.edge.battery.fenecon.f2b.cluster.common.Constants;
import io.openems.edge.battery.fenecon.f2b.cluster.common.statemachine.StateMachine.State;
import io.openems.edge.common.statemachine.StateHandler;

public class GoStoppedHandler extends StateHandler<State, Context> {

	private final Timeout timeout = Timeout.ofSeconds(Constants.MAX_ALLOWED_START_TIME);

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		this.timeout.start(context.clock);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var cluster = context.getParent();
		// Has Faults -> error handling
		if (cluster.hasFaults()) {
			return State.ERROR;
		}

		if (this.timeout.elapsed(context.clock)) {
			cluster._setTimeoutStopBattery(true);
		}

		cluster.stopBatteries();

		// Check if all batteries are stopped
		if (cluster.areAllBatteriesStopped()) {
			return State.STOPPED;
		}

		return State.GO_STOPPED;
	}
}
