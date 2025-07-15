package io.openems.backend.oem.fenecon;

import static java.util.stream.Collectors.toMap;

import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import io.openems.common.types.EdgeConfig;
import io.openems.common.utils.JsonUtils;

public record SerialNumbers(Map<String, Map<String, String>> values) {

	/**
	 * Gets the serial numbers for the {@link EdgeConfig}.
	 * 
	 * @param edgeConfig the {@link EdgeConfig}
	 * @return the found serial numbers
	 */
	public static SerialNumbers from(EdgeConfig edgeConfig) {
		return edgeConfig.getComponent("_serialNumber").flatMap(component -> {
			return component.getProperty("data");
		}).flatMap(JsonUtils::getAsOptionalJsonObject).<Map<String, Map<String, String>>>map(t -> {
			return t.entrySet().stream().collect(toMap(Entry::getKey, e -> {
				final var serialNumbersOfComponent = e.getValue().getAsJsonObject();
				return serialNumbersOfComponent.entrySet().stream()
						.collect(toMap(Entry::getKey, e1 -> e1.getValue().getAsString()));
			}));
		}).map(SerialNumbers::new).orElse(null);
	}

	/**
	 * Gets the difference from the current serial numbers to the provided serial
	 * numbers. Result includes added and changed values.
	 * 
	 * @param other the other {@link SerialNumbers}
	 * @return the difference
	 */
	public SerialNumbers differenceTo(SerialNumbers other) {
		return getDifference(this, other);
	}

	public boolean isEmpty() {
		return this.values().isEmpty();
	}

	private static SerialNumbers getDifference(SerialNumbers serialNumbers1, SerialNumbers serialNumbers2) {
		final var values = new HashMap<String, Map<String, String>>();
		for (var component : serialNumbers2.values().entrySet()) {
			final var otherComponent = serialNumbers1.values().get(component.getKey());
			if (otherComponent == null) {
				values.put(component.getKey(), component.getValue());
				continue;
			}

			final var subMap = new HashMap<String, String>();
			for (var channel : component.getValue().entrySet()) {
				final var otherChannel = otherComponent.get(channel.getKey());

				if (otherChannel == null || !otherChannel.equals(channel.getValue())) {
					subMap.put(channel.getKey(), channel.getValue());
				}

			}

			if (!subMap.isEmpty()) {
				values.put(component.getKey(), subMap);
			}

		}

		return new SerialNumbers(values);
	}
}
