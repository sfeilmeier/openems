package io.openems.backend.oem.fenecon;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toMap;

import java.util.Collections;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventHandler;
import org.osgi.service.event.propertytypes.EventTopics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.primitives.Ints;
import com.google.gson.JsonElement;

import io.openems.backend.common.debugcycle.DebugLoggable;
import io.openems.backend.common.metadata.Edge;
import io.openems.backend.common.metadata.Metadata;
import io.openems.common.event.EventReader;
import io.openems.common.types.EdgeConfig;

@Component
@EventTopics({ //
		Edge.Events.ON_UPDATE_CONFIG //
})
public class CreateSerialNumberProtocol implements EventHandler, DebugLoggable {

	private final Logger log = LoggerFactory.getLogger(CreateSerialNumberProtocol.class);

	private final LatestTaskPerKeyExecutor<String> executor = new LatestTaskPerKeyExecutor<>(
			(ThreadPoolExecutor) Executors.newFixedThreadPool(1, Thread.ofVirtual().factory()));
	private final AtomicInteger createdProtocolsCounter = new AtomicInteger();

	@Activate
	public CreateSerialNumberProtocol(@Reference Metadata metadata) {
	}

	@Override
	public void handleEvent(Event event) {
		final var eventReader = new EventReader(event);
		switch (eventReader.getTopic()) {
		case Edge.Events.ON_UPDATE_CONFIG -> {
			this.onUpdateConfig(eventReader.getProperty(Edge.Events.OnUpdateConfig.EDGE_ID),
					eventReader.getProperty(Edge.Events.OnUpdateConfig.OLD_CONFIG),
					eventReader.getProperty(Edge.Events.OnUpdateConfig.NEW_CONFIG));
		}
		}
	}

	private void onUpdateConfig(String edgeId, EdgeConfig oldConfig, EdgeConfig newConfig) {
		this.executor.execute(edgeId, () -> {
			final var oldSerialNumbers = SerialNumbers.from(oldConfig);
			if (oldSerialNumbers == null) {
				return;
			}
			final var newSerialNumbers = SerialNumbers.from(newConfig);
			if (newSerialNumbers == null) {
				this.log.warn("NewSerialNumbers are null {}", edgeId);
				return;
			}

			final var difference = oldSerialNumbers.differenceTo(newSerialNumbers);

			if (difference.isEmpty()) {
				return;
			}

			if (oldSerialNumbers.isEmpty()) {
				this.log.info("Skip creating protocol because initial serial numbers were empty. {}", edgeId);
				return;
			}

			final var homeSerialNumbers = HomeSerialNumberKey.from(difference);

			if (homeSerialNumbers.isEmpty()) {
				return;
			}

			// TODO translation should be directly done in the metadata implementation
			// because here we do not have the language the final protocol should have
			final var protocolValues = homeSerialNumbers.entrySet().stream()
					.collect(groupingBy(t -> "Batterie Turm " + (t.getKey().tower() + 1),
							toMap(t -> "Batteriemodul " + (t.getKey().module()) + " Seriennummer", Entry::getValue)));

			// TODO enable once live validated
			// this.metadata.createSerialNumberExtensionProtocol(edge.getId(),
			// protocolValues, List.of(//
			// new SetupProtocolItem("FEMS", "FEMS Nummer", edge.getId()) //
			// ));
			this.log.info("Created serial number protocol for {}, entries={}", edgeId, protocolValues);
			this.createdProtocolsCounter.incrementAndGet();
		});
	}

	@Override
	public String debugLog() {
		return "[CreateSerialNumberProtocol] " + this.executor.debugLog() //
				+ ", CreatedProtocols: " + this.createdProtocolsCounter.get();
	}

	@Override
	public Map<String, JsonElement> debugMetrics() {
		return null;
	}

	public record HomeSerialNumberKey(int tower, int module) {

		/**
		 * Parses {@link SerialNumbers} to {@link HomeSerialNumberKey
		 * HomeSerialNumbers}.
		 * 
		 * @param serialNumbers the {@link SerialNumbers} to parse
		 * @return the parsed values
		 */
		public static Map<HomeSerialNumberKey, String> from(SerialNumbers serialNumbers) {
			final var batteryValues = serialNumbers.values().get("battery0");
			if (batteryValues == null) {
				return Collections.emptyMap();
			}

			return batteryValues.entrySet().stream() //
					.map(t -> {
						final var homeSerialNumber = HomeSerialNumberKey.from(t.getKey());
						if (homeSerialNumber == null) {
							return null;
						}

						return Map.entry(homeSerialNumber, t.getValue());
					}) //
					.filter(Objects::nonNull) //
					.collect(Collectors.toMap(Entry::getKey, Entry::getValue));
		}

		/**
		 * Gets a {@link HomeSerialNumberKey} from a string of the pattern
		 * "Tower0Module0SerialNumber".
		 * 
		 * @param key the key to parse
		 * @return the parse {@link HomeSerialNumberKey} or null if value can not be
		 *         parsed.
		 */
		public static HomeSerialNumberKey from(String key) {
			final var towerIndex = key.indexOf("Tower");
			final var moduleIndex = key.indexOf("Module");
			final var serialNumberIndex = key.indexOf("SerialNumber");

			if (towerIndex == -1 || moduleIndex == -1 || serialNumberIndex == -1) {
				return null;
			}

			final var tower = Ints.tryParse(key.substring(towerIndex + 5, moduleIndex));
			final var module = Ints.tryParse(key.substring(moduleIndex + 6, serialNumberIndex));

			if (tower == null || module == null) {
				return null;
			}

			return new HomeSerialNumberKey(tower, module);
		}

	}

}
