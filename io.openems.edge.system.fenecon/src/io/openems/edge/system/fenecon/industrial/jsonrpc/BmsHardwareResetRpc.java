package io.openems.edge.system.fenecon.industrial.jsonrpc;

import io.openems.edge.common.jsonapi.ComponentJsonApi;

/**
 * Wraps a JSON-RPC Request to hard reset the all BMS devices.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "bmsHardwareReset",
 *   "params": {}
 * }
 * </pre>
 */
public interface BmsHardwareResetRpc extends ComponentJsonApi {

	/**
	 * Activates the BMS hardware reset.
	 *
	 * <p>
	 * Implement this method to define the hardware-specific reset behavior, e.g.
	 * toggling a digital output or writing to a channel.
	 */
	void activateBmsHardwareReset();

}
