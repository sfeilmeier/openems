package io.openems.edge.system.fenecon.industrial.m;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.groupingBy;

import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

import io.openems.edge.common.channel.AbstractChannelListenerManager;
import io.openems.edge.common.channel.value.Value;
import io.openems.edge.common.startstop.StartStop;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.ess.api.SymmetricEss;

public class ChannelManager extends AbstractChannelListenerManager {

	public ChannelManager() {
	}

	/**
	 * Called on Component activate().
	 * 
	 * @param esss          the list of SymmetricEss ess.
	 * @param _setStartStop the parent {@link StartStop} method.
	 */
	protected void activate(List<SymmetricEss> esss, Consumer<StartStop> _setStartStop) {
		this.calculateStartStop(esss, _setStartStop);
	}

	/**
	 * Calculate effective StartStop status of {@link SymmetricEss}.
	 *
	 * @param esss          the List of {@link SymmetricEss}
	 * @param _setStartStop the parent {@link StartStop} method.
	 */
	private void calculateStartStop(List<SymmetricEss> esss, Consumer<StartStop> _setStartStop) {
		final var startStoppableEss = esss.stream() //
				.filter(StartStoppable.class::isInstance) //
				.map(StartStoppable.class::cast) //
				.toList();

		final BiConsumer<Value<Integer>, Value<Integer>> callback = (oldValue, newValue) -> {
			final var essMap = startStoppableEss.stream() //
					.collect(groupingBy(StartStoppable::getStartStop));
			if (essMap.isEmpty()) {
				_setStartStop.accept(StartStop.UNDEFINED);
				return;
			}
			if (!essMap.getOrDefault(StartStop.START, emptyList()).isEmpty()) {
				_setStartStop.accept(StartStop.START);
				return;
			}
			if (!essMap.getOrDefault(StartStop.STOP, emptyList()).isEmpty()) {
				_setStartStop.accept(StartStop.STOP);
				return;
			}
			_setStartStop.accept(StartStop.UNDEFINED);
		};
		startStoppableEss.forEach(ess -> {
			this.addOnChangeListener(ess, StartStoppable.ChannelId.START_STOP, callback);
		});
	}
}