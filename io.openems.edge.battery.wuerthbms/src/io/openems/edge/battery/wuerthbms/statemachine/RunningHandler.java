package io.openems.edge.battery.wuerthbms.statemachine;

import static io.openems.edge.common.channel.ChannelUtils.getValues;

import io.openems.common.timedata.Timeout;
import io.openems.edge.battery.wuerthbms.WuerthBms;
import io.openems.edge.battery.wuerthbms.WuerthBmsImpl;
import io.openems.edge.battery.wuerthbms.statemachine.StateMachine.State;
import io.openems.edge.bridge.modbus.api.ModbusComponent;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.statemachine.StateHandler;

public class RunningHandler extends StateHandler<State, Context> {

	private final Timeout timeout = Timeout.ofSeconds(5);

	@Override
	protected void onEntry(Context context) {
		this.timeout.start(context.clock);
	}

	@Override
	public State runAndGetNextState(Context context) {
		final var battery = context.getParent();
		if (battery.hasFaults()) {
			return State.ERROR;
		}

		if (this.timeout.elapsed(context.clock)) {
			this.updateBmsCommunication(battery);
		}
		battery._setStartStop(StartStop.START);
		return State.RUNNING;
	}

	/**
	 * Sets {@link WuerthBms.ChannelId#NOT_STABLE_COMMUNICATION} to true in the
	 * following cases; Battery started and at least one of
	 * {@link WuerthBmsImpl.BatteryValues} is null. And
	 * {@link WuerthBms.ChannelId#BMS_COMMUNICATION_FAILED} if the
	 * {@link ModbusComponent.ChannelId#MODBUS_COMMUNICATION_FAILED} accordingly.
	 *
	 * @param battery the battery.
	 */
	private void updateBmsCommunication(WuerthBmsImpl battery) {
		var areBatteryValuesDefined = getValues(battery, WuerthBmsImpl.BatteryValues.class).isPresent();
		battery._setNotStableCommunication(!areBatteryValuesDefined);
		battery._setBmsCommunicationFailed(battery.getModbusCommunicationFailed());
	}
}