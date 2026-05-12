package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import java.time.Clock;
import java.util.Optional;

import io.openems.common.types.ChannelAddress;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.AbstractContext;
import io.openems.edge.ess.api.SymmetricEss;
import io.openems.edge.system.fenecon.industrial.xl.SystemFeneconIndustrialXlImpl;
import io.openems.edge.system.fenecon.industrial.xl.firealarmsystem.HekatronB9X2;
import io.openems.edge.system.fenecon.industrial.xl.jsonrpc.TestMode;

public class Context extends AbstractContext<SystemFeneconIndustrialXlImpl> {

	protected final SymmetricEss ess;
	protected final StartStop startStop;
	protected final TestMode.Request request;
	protected final ChannelAddress outputSsiRunning;
	protected final ChannelAddress outputSsiError;
	protected final ChannelAddress outputSsiRunningFlashing;
	protected final ChannelAddress outputSsiWarning;
	protected final HekatronB9X2 fireAlarmSystem;
	protected final Clock clock;

	public Context(//
			SystemFeneconIndustrialXlImpl parent, //
			SymmetricEss ess, //
			StartStop startStop, //
			TestMode.Request request, //
			ChannelAddress outputSsiRunning, //
			ChannelAddress outputSsiError, //
			ChannelAddress outputSsiRunningFlashing, //
			ChannelAddress outputSsiWarning, //
			HekatronB9X2 fireAlarmSystem, //
			Clock clock//
	) {
		super(parent);
		this.ess = ess;
		this.startStop = startStop;
		this.request = request;
		this.outputSsiRunning = outputSsiRunning;
		this.outputSsiError = outputSsiError;
		this.outputSsiRunningFlashing = outputSsiRunningFlashing;
		this.outputSsiWarning = outputSsiWarning;
		this.fireAlarmSystem = fireAlarmSystem;
		this.clock = clock;
	}

	protected boolean isStarted() {
		return this.startStop == StartStop.START;
	}

	protected boolean isStopped() {
		return this.startStop == StartStop.STOP;
	}

	public Optional<TestMode.Request> getTestParams() {
		return Optional.ofNullable(this.request);
	}

}
