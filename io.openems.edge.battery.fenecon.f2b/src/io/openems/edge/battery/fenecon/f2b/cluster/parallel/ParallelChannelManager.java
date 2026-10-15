package io.openems.edge.battery.fenecon.f2b.cluster.parallel;

import static io.openems.edge.common.channel.ChannelUtils.setValue;

import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Consumer;

import io.openems.common.utils.IntUtils;
import io.openems.edge.battery.api.Battery;
import io.openems.edge.battery.fenecon.f2b.BatteryFeneconF2b;
import io.openems.edge.battery.fenecon.f2b.cluster.common.BatteryFeneconF2bCluster;
import io.openems.edge.battery.fenecon.f2b.cluster.common.ChannelManager;
import io.openems.edge.battery.protection.BatteryVoltageProtection;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.type.TypeUtils;

public class ParallelChannelManager extends ChannelManager {

	private final BatteryFeneconF2bClusterParallelImpl parent;
	private static final BiFunction<Integer, Integer, Integer> INTEGER_SUM = IntUtils::sumInteger;
	private static final BiFunction<Integer, Integer, Integer> INTEGER_MIN = IntUtils::minInteger;
	private static final BiFunction<Integer, Integer, Integer> INTEGER_MAX = IntUtils::maxInteger;
	private static final BiFunction<Integer, Integer, Integer> INTEGER_AVG = TypeUtils::averageInt;

	public ParallelChannelManager(BatteryFeneconF2bClusterParallelImpl parent) {
		super(parent);
		this.parent = parent;
	}

	@Override
	public void activate(List<BatteryFeneconF2b> batteries, BatteryFeneconF2bCluster cluster) {
		super.activate(batteries, cluster);
		this.setBatteryLimits(batteries, //
				Battery.ChannelId.CHARGE_MAX_CURRENT, //
				Battery.ChannelId.CURRENT, //
				IntUtils::sumInteger, //
				TypeUtils::subtract, //
				this.parent::_setChargeMaxCurrent);
		this.setBatteryLimits(batteries, //
				Battery.ChannelId.DISCHARGE_MAX_CURRENT, //
				Battery.ChannelId.CURRENT, //
				TypeUtils::subtract, //
				IntUtils::sumInteger, //
				this.parent::_setDischargeMaxCurrent);
		this.calculate(INTEGER_AVG, batteries, Battery.ChannelId.VOLTAGE);
		this.calculate(INTEGER_SUM, batteries, Battery.ChannelId.CURRENT);
		this.calculate(INTEGER_MIN, batteries, Battery.ChannelId.CHARGE_MAX_VOLTAGE);
		this.calculate(INTEGER_MAX, batteries, Battery.ChannelId.DISCHARGE_MIN_VOLTAGE);
		this.calculate(INTEGER_AVG, batteries, Battery.ChannelId.INNER_RESISTANCE);
		this.calculate(INTEGER_SUM, batteries, Battery.ChannelId.CAPACITY);
		this.calculate(INTEGER_MIN, batteries, BatteryVoltageProtection.ChannelId.BVP_CHARGE_BMS);
		this.calculate(INTEGER_MAX, batteries, BatteryVoltageProtection.ChannelId.BVP_DISCHARGE_BMS);
	}

	/**
	 * Calculates the aggregated SOC for the parallel cluster based on the average
	 * SOC of all batteries.
	 *
	 * <p>
	 * If the average SOC is greater than or equal to 50, the maximum SOC value
	 * among all batteries is used. Otherwise, the minimum SOC value is used.
	 *
	 * @param batteries the List of {@link BatteryFeneconF2b}
	 */
	@Override
	protected void calculateSoc(List<BatteryFeneconF2b> batteries) {
		final Consumer<Value<Boolean>> callback = (value) -> {
			var socList = batteries.stream()//
					.map(Battery::getSoc)//
					.filter(Value::isDefined)//
					.map(Value::get)//
					.toList();

			var avgSoc = TypeUtils.averageInt(socList);
			if (avgSoc == null) {
				setValue(this.parent, Battery.ChannelId.SOC, null);
				return;
			}

			var result = avgSoc >= 50//
					? socList.stream().max(Integer::compareTo).orElse(null)//
					: socList.stream().min(Integer::compareTo).orElse(null);
			setValue(this.parent, Battery.ChannelId.SOC, result);
		};

		for (var battery : batteries) {
			this.addOnSetNextValueListener(battery, Battery.ChannelId.SOC, callback);
		}
	}

}
