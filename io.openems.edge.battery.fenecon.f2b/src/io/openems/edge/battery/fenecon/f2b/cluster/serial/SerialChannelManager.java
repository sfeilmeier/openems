package io.openems.edge.battery.fenecon.f2b.cluster.serial;

import static io.openems.common.utils.IntUtils.sumInteger;
import static io.openems.edge.common.channel.ChannelUtils.setValue;

import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Consumer;

import io.openems.common.utils.IntUtils;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.fenecon.f2b.BatteryFeneconF2b;
import io.openems.edge.battery.fenecon.f2b.bmw.BatteryFeneconF2bBmw;
import io.openems.edge.battery.fenecon.f2b.cluster.common.BatteryFeneconF2bCluster;
import io.openems.edge.battery.fenecon.f2b.cluster.common.ChannelManager;
import io.openems.edge.battery.protection.BatteryVoltageProtection;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.type.TypeUtils;

public class SerialChannelManager extends ChannelManager {

	private final BatteryFeneconF2bClusterSerialImpl parent;

	private static final BiFunction<Integer, Integer, Integer> INTEGER_MIN = IntUtils::minInteger;
	private static final BiFunction<Integer, Integer, Integer> INTEGER_SUM = IntUtils::sumInteger;
	private static final BiFunction<Integer, Integer, Integer> INTEGER_AVG = TypeUtils::averageInt;

	public SerialChannelManager(BatteryFeneconF2bClusterSerialImpl parent) {
		super(parent);
		this.parent = parent;
	}

	@Override
	public void activate(List<BatteryFeneconF2b> batteries, BatteryFeneconF2bCluster cluster) {
		super.activate(batteries, cluster);
		this.setBatteryLimits(batteries, //
				Battery.ChannelId.CHARGE_MAX_VOLTAGE, //
				Battery.ChannelId.VOLTAGE, //
				TypeUtils::subtract, //
				IntUtils::sumInteger, //
				this.parent::_setChargeMaxVoltage);
		this.setBatteryLimits(batteries, //
				Battery.ChannelId.DISCHARGE_MIN_VOLTAGE, //
				Battery.ChannelId.VOLTAGE, //
				TypeUtils::subtract, //
				TypeUtils::subtract, //
				this.parent::_setDischargeMinVoltage);
		this.calculate(INTEGER_SUM, batteries, Battery.ChannelId.VOLTAGE);
		this.calculate(INTEGER_AVG, batteries, Battery.ChannelId.CURRENT);
		this.calculate(INTEGER_MIN, batteries, Battery.ChannelId.CHARGE_MAX_CURRENT);
		this.calculate(INTEGER_MIN, batteries, Battery.ChannelId.DISCHARGE_MAX_CURRENT);
		this.calculate(INTEGER_SUM, batteries, Battery.ChannelId.INNER_RESISTANCE);
		this.calculate(INTEGER_SUM, batteries, Battery.ChannelId.CAPACITY);
		this.calculate(INTEGER_SUM, batteries, BatteryVoltageProtection.ChannelId.BVP_CHARGE_BMS);
		this.calculate(INTEGER_SUM, batteries, BatteryVoltageProtection.ChannelId.BVP_DISCHARGE_BMS);
		this.updateBmwClusterVoltage(batteries);
	}

	/**
	 * Sets the cluster voltage based on the summation of link voltages before
	 * batteries started.
	 * 
	 * @param batteries the batteries
	 */
	public void updateBmwClusterVoltage(List<BatteryFeneconF2b> batteries) {
		final Consumer<Value<Boolean>> callback = (value) -> {
			final var cluster = this.parent;
			if (cluster.areAllBatteriesStopped()) {
				cluster._setInternalVoltage(null);
				return;
			}
			var batteryList = batteries.stream()//
					.filter(BatteryFeneconF2bBmw.class::isInstance) //
					.map(BatteryFeneconF2bBmw.class::cast) //
					.toList();
			Integer batteryVoltage = null;
			for (var battery : batteryList) {
				if (!battery.getInternalVoltage().isDefined()) {
					return;
				}
				batteryVoltage = sumInteger(batteryVoltage, battery.getInternalVoltage().get());
			}
			cluster._setInternalVoltage(TypeUtils.divide(batteryVoltage, 10));
		};

		for (var battery : batteries) {
			this.addOnSetNextValueListener(battery, BatteryFeneconF2b.ChannelId.INTERNAL_VOLTAGE, callback);
		}
	}

	@Override
	protected void calculateSoc(List<BatteryFeneconF2b> batteries) {
		final Consumer<Value<Boolean>> callback = (value) -> {
			var socList = batteries.stream()//
					.map(Battery::getSoc)//
					.filter(Value::isDefined)//
					.map(Value::get)//
					.toList();
			setValue(this.parent, Battery.ChannelId.SOC, calculateSerialSoc(socList));
		};

		for (var battery : batteries) {
			this.addOnSetNextValueListener(battery, Battery.ChannelId.SOC, callback);
		}
	}

	/**
	 * Calculates the cluster SOC of serial connected batteries.
	 *
	 * <p>
	 * The result is interpolated between the lowest and the highest SOC, weighted
	 * by the average SOC.
	 *
	 * @param socList the SOC values of all batteries
	 * @return the cluster SOC; or null if the list is empty
	 */
	protected static Integer calculateSerialSoc(List<Integer> socList) {
		if (socList.isEmpty()) {
			return null;
		}

		final var stats = socList.stream() //
				.mapToInt(Integer::intValue) //
				.summaryStatistics();

		var socAvg = TypeUtils.averageInt(socList);
		var tendency = socAvg / 100f;
		return Math.round(stats.getMin() + tendency * (stats.getMax() - stats.getMin()));
	}

}
