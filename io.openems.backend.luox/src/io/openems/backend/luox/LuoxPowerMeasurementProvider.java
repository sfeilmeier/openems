package io.openems.backend.luox;

import io.openems.backend.luox.api.LuoxBackendApi;

public interface LuoxPowerMeasurementProvider {

	/**
	 * Gets the current power measurements an edge.
	 * 
	 * @param edgeId the edge id
	 * @return the current power measurements or null if the edge is not found or no
	 *         measurements are available
	 */
	LuoxBackendApi.Measurements getMeasurements(String edgeId);

}
