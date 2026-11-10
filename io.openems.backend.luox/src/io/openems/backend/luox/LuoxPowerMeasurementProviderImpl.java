package io.openems.backend.luox;

import java.time.Instant;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import io.openems.backend.common.edge.EdgeManager;
import io.openems.backend.luox.api.LuoxBackendApi;
import io.openems.common.utils.JsonUtils;

@Component
public class LuoxPowerMeasurementProviderImpl implements LuoxPowerMeasurementProvider {

	private final EdgeManager edgeManager;

	@Activate
	public LuoxPowerMeasurementProviderImpl(//
			@Reference EdgeManager edgeManager //
	) {
		this.edgeManager = edgeManager;
	}

	@Override
	public LuoxBackendApi.Measurements getMeasurements(String edgeId) {
		final var edgeCache = this.edgeManager.getEdgeCacheForEdgeId(edgeId);
		if (edgeCache == null) {
			return null;
		}

		final var timestampedValue = edgeCache.getChannelValueWithTimestamp("_sum/GridActivePower");
		if (timestampedValue == null) {
			return null;
		}

		final var gridActivePower = JsonUtils.getAsOptionalInt(timestampedValue.value()).orElse(null);
		if (gridActivePower == null) {
			return null;
		}
		return new LuoxBackendApi.Measurements(Instant.ofEpochMilli(timestampedValue.timestamp()),
				convertToLuoxPowerOnGridValue(gridActivePower), null);
	}

	/**
	 * Converts an OpenEMS grid power value to the LUOX value convention.
	 *
	 * <p>
	 * OpenEMS uses the following semantics:
	 * <ul>
	 * <li>negative value = feed-in into the grid</li>
	 * <li>positive value = feed-out from the grid</li>
	 * </ul>
	 * </p>
	 *
	 * <p>
	 * LUOX uses the opposite semantics:
	 * <ul>
	 * <li>negative value = feed-out from the grid</li>
	 * <li>positive value = feed-in into the grid</li>
	 * </ul>
	 * </p>
	 *
	 * @param gridActivePower the OpenEMS grid active power value
	 * @return the equivalent LUOX grid power value
	 */
	private static int convertToLuoxPowerOnGridValue(int gridActivePower) {
		return -gridActivePower;
	}

}
