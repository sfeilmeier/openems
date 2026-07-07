package io.openems.edge.system.fenecon.industrial.m.dummy;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.batteryinverter.api.ManagedSymmetricBatteryInverter;
import io.openems.edge.batteryinverter.api.SymmetricBatteryInverter;
import io.openems.edge.batteryinverter.refu.store88k.BatteryInverterRefuStore88k;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.component.AbstractOpenemsComponent;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;

public class DummyBatteryInverterRefuStore88kImpl extends AbstractOpenemsComponent
		implements ManagedSymmetricBatteryInverter, SymmetricBatteryInverter, OpenemsComponent, StartStoppable,
		BatteryInverterRefuStore88k {

	public DummyBatteryInverterRefuStore88kImpl(String id) {

		super(//
				OpenemsComponent.ChannelId.values(), //
				StartStoppable.ChannelId.values(), //
				SymmetricBatteryInverter.ChannelId.values(), //
				ManagedSymmetricBatteryInverter.ChannelId.values(), //
				BatteryInverterRefuStore88k.ChannelId.values());
		for (Channel<?> channel : this.channels()) {
			channel.nextProcessImage();
		}
		super.activate(null, id, "", true);

	}

	@Override
	public int getPowerPrecision() {
		return 1;
	}

	@Override
	public void setStartStop(StartStop value) throws OpenemsNamedException {
		this._setStartStop(value);
	}

	@Override
	public void run(Battery battery, int setActivePower, int setReactivePower) throws OpenemsNamedException {
		this._setActivePower(setActivePower);
		this._setReactivePower(setReactivePower);
	}

	@Override
	public StartStop getStartStopTarget() {
		return null;
	}

}