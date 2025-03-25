package io.openems.edge.battery.fenecon.f2b.cluster.common;

import java.util.List;

import io.openems.common.channel.Level;
import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.fenecon.f2b.BatteryFeneconF2b;
import io.openems.edge.battery.fenecon.f2b.cluster.parallel.BatteryFeneconF2bClusterParallel;
import io.openems.edge.battery.fenecon.f2b.cluster.parallel.BatteryFeneconF2bClusterParallelImpl;
import io.openems.edge.battery.fenecon.f2b.cluster.serial.BatteryFeneconF2bClusterSerial;
import io.openems.edge.battery.fenecon.f2b.cluster.serial.BatteryFeneconF2bClusterSerialImpl;
import io.openems.edge.common.channel.Doc;
import io.openems.edge.common.channel.StateChannel;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;

public interface BatteryFeneconF2bCluster extends BatteryFeneconF2b, Battery, OpenemsComponent, StartStoppable {

	public enum ChannelId implements io.openems.edge.common.channel.ChannelId {
		TIMEOUT_WAIT_FOR_BATTERIES_STATUS(Doc.of(Level.FAULT) //
				.text("Waiting for batteries status!")), //
		ONE_BATTERY_NOT_RUNNING(Doc.of(Level.WARNING) //
				.text("One battery is not running!")),
		ONE_BATTERY_NOT_STOPPED(Doc.of(Level.FAULT) //
				.text("One battery is not stopped!")), //
		ONE_BATTERY_STOPPED(Doc.of(Level.WARNING) //
				.text("One battery is stopped!")), //
		ONE_BATTERY_HAS_ERROR(Doc.of(Level.WARNING) //
				.text("One battery has error!")), //
		AT_LEAST_ONE_BATTERY_IN_ERROR(Doc.of(Level.WARNING) //
				.text("At least one battery is in error!")), //
		ALL_BATTERIES_ARE_IN_FAULT(Doc.of(Level.FAULT) //
				.text("All batteries are in error!")), //
		;

		private final Doc doc;

		private ChannelId(Doc doc) {
			this.doc = doc;
		}

		@Override
		public Doc doc() {
			return this.doc;
		}
	}

	/**
	 * Gets the Channel for {@link ChannelId#TIMEOUT_WAIT_FOR_BATTERIES_STATUS}.
	 * 
	 * @return the Channel
	 */
	public default StateChannel getTimeoutWaitForBatteriesStatusChannel() {
		return this.channel(ChannelId.TIMEOUT_WAIT_FOR_BATTERIES_STATUS);
	}

	/**
	 * Gets the {@link StateChannel} for
	 * {@link ChannelId#TIMEOUT_WAIT_FOR_BATTERIES_STATUS}.
	 * 
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getTimeoutWaitForBatteriesStatus() {
		return this.getTimeoutWaitForBatteriesStatusChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#TIMEOUT_WAIT_FOR_BATTERIES_STATUS} Channel.
	 * 
	 * @param value the next value
	 */
	public default void _setTimeoutWaitForBatteriesStatus(Boolean value) {
		this.getTimeoutWaitForBatteriesStatusChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#ONE_BATTERY_NOT_RUNNING}.
	 * 
	 * @return the Channel
	 */
	public default StateChannel getOneBatteryNotRunningChannel() {
		return this.channel(ChannelId.ONE_BATTERY_NOT_RUNNING);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#ONE_BATTERY_NOT_RUNNING}.
	 * 
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getOneBatteryNotRunning() {
		return this.getOneBatteryNotRunningChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#ONE_BATTERY_NOT_RUNNING} Channel.
	 * 
	 * @param value the next value
	 */
	public default void _setOneBatteryNotRunning(boolean value) {
		this.getOneBatteryNotRunningChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#ONE_BATTERY_NOT_STOPPED}.
	 * 
	 * @return the Channel
	 */
	public default StateChannel getOneBatteryNotStoppedChannel() {
		return this.channel(ChannelId.ONE_BATTERY_NOT_STOPPED);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#ONE_BATTERY_NOT_STOPPED}.
	 * 
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getOneBatteryNotStopped() {
		return this.getOneBatteryNotStoppedChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#ONE_BATTERY_NOT_STOPPED} Channel.
	 * 
	 * @param value the next value
	 */
	public default void _setOneBatteryNotStopped(boolean value) {
		this.getOneBatteryNotStoppedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#ONE_BATTERY_STOPPED}.
	 * 
	 * @return the Channel
	 */
	public default StateChannel getOneBatteryStoppedChannel() {
		return this.channel(ChannelId.ONE_BATTERY_STOPPED);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#ONE_BATTERY_STOPPED}.
	 * 
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getOneBatteryStopped() {
		return this.getOneBatteryStoppedChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#ONE_BATTERY_STOPPED} Channel.
	 * 
	 * @param value the next value
	 */
	public default void _setOneBatteryStopped(boolean value) {
		this.getOneBatteryStoppedChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#ONE_BATTERY_HAS_ERROR}.
	 * 
	 * @return the Channel
	 */
	public default StateChannel getOneBatteryHasErrorChannel() {
		return this.channel(ChannelId.ONE_BATTERY_HAS_ERROR);
	}

	/**
	 * Gets the {@link StateChannel} for {@link ChannelId#ONE_BATTERY_HAS_ERROR}.
	 * 
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getOneBatteryHasError() {
		return this.getOneBatteryHasErrorChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#ONE_BATTERY_HAS_ERROR} Channel.
	 * 
	 * @param value the next value
	 */
	public default void _setOneBatteryHasError(boolean value) {
		this.getOneBatteryHasErrorChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#AT_LEAST_ONE_BATTERY_IN_ERROR}.
	 * 
	 * @return the Channel
	 */
	public default StateChannel getAtLeastOneBatteryInErrorChannel() {
		return this.channel(ChannelId.AT_LEAST_ONE_BATTERY_IN_ERROR);
	}

	/**
	 * Gets the {@link StateChannel} for
	 * {@link ChannelId#AT_LEAST_ONE_BATTERY_IN_ERROR}.
	 * 
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getAtLeastOneBatteryInError() {
		return this.getAtLeastOneBatteryInErrorChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#AT_LEAST_ONE_BATTERY_IN_ERROR} Channel.
	 * 
	 * @param value the next value
	 */
	public default void _setAtLeastOneBatteryInError(boolean value) {
		this.getAtLeastOneBatteryInErrorChannel().setNextValue(value);
	}

	/**
	 * Gets the Channel for {@link ChannelId#ALL_BATTERIES_ARE_IN_FAULT}.
	 * 
	 * @return the Channel
	 */
	public default StateChannel getAllBatteriesAreInFaultChannel() {
		return this.channel(ChannelId.ALL_BATTERIES_ARE_IN_FAULT);
	}

	/**
	 * Gets the {@link StateChannel} for
	 * {@link ChannelId#ALL_BATTERIES_ARE_IN_FAULT}.
	 * 
	 * @return the Channel {@link Value}
	 */
	public default Value<Boolean> getAllBatteriesAreInFault() {
		return this.getAllBatteriesAreInFaultChannel().value();
	}

	/**
	 * Internal method to set the 'nextValue' on
	 * {@link ChannelId#ALL_BATTERIES_ARE_IN_FAULT} Channel.
	 * 
	 * @param value the next value
	 */
	public default void _setAllBatteriesAreInFault(boolean value) {
		this.getAllBatteriesAreInFaultChannel().setNextValue(value);
	}

	/**
	 * Gets the target Start/Stop mode from config or StartStop-Channel.
	 * 
	 * @return {@link StartStop}
	 */
	public StartStop getStartStopTarget();

	/**
	 * True on all batteries are stopped, false on one of the battery not stopped.
	 * 
	 * @return boolean
	 */
	public boolean areAllBatteriesStopped();

	/**
	 * True on all batteries are started, false on one of the battery not started.
	 * 
	 * @return boolean
	 */
	public boolean areAllBatteriesStarted();

	/**
	 * True on one battery started and one stopped, else false.
	 * 
	 * @return boolean
	 */
	public boolean isOneBatteryStartedAndOneStopped();

	/**
	 * Start batteries one of the other. If one battery started, tries to start the
	 * next one in the queue.
	 */
	public void startBatteries() throws OpenemsNamedException;

	/**
	 * Stop batteries one of the other. If one battery stopped, tries to stop the
	 * next one in the queue.
	 */
	public void stopBatteries();

	/**
	 * Gets a list of not started batteries.
	 * 
	 * @return Started batteries {@link List}.
	 */
	public List<BatteryFeneconF2b> getNotStartedBatteries();

	/**
	 * Gets a list of not stopped batteries.
	 * 
	 * @return Stopped batteries {@link List}.
	 */
	public List<BatteryFeneconF2b> getNotStoppedBatteries();

	/**
	 * Are there any faults reported by any battery components?
	 *
	 * <p>
	 * Evaluates all Batteries {@link StateChannel}s and returns true if any Channel
	 * with {@link Level#FAULT} is set.
	 *
	 * @return true if there is a Fault.
	 */
	public boolean getAndUpdateHasAnyBatteryFault();

	/**
	 * Are there any faults reported by all battery components?
	 *
	 * <p>
	 * Evaluates all Batteries {@link StateChannel}s and returns true if any Channel
	 * with {@link Level#FAULT} is set for all batteries.
	 *
	 * @return true all batteries are in Fault.
	 */
	public boolean getAndUpdateHasAllBatteriesFault();

	/**
	 * Gets the main contactor target which set by
	 * {@link #setMainContactor(Boolean)} method.
	 * 
	 * @return main contactor target.
	 */
	public boolean isHvContactorUnlocked();

	/**
	 * Gets the {@link BatteryFeneconF2bCluster cluster } class. It can be
	 * {@link BatteryFeneconF2bClusterSerialImpl} or
	 * {@link BatteryFeneconF2bClusterParallelImpl}
	 * 
	 * @return itself
	 */
	public BatteryFeneconF2bCluster getBatteryFeneconF2bCluster();

	/**
	 * Is the battery cluster component instance of
	 * {@link BatteryFeneconF2bClusterSerial}.
	 * 
	 * @return true is cluster is {@link BatteryFeneconF2bClusterSerial}
	 */
	public boolean isSerialCluster();

	/**
	 * Is the battery cluster component instance of
	 * {@link BatteryFeneconF2bClusterParallel}.
	 * 
	 * @return true is cluster is {@link BatteryFeneconF2bClusterParallel}
	 */
	public boolean isParallelCluster();

}
