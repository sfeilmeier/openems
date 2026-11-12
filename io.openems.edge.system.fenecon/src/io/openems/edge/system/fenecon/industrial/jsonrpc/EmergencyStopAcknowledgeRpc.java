package io.openems.edge.system.fenecon.industrial.jsonrpc;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.edge.common.jsonapi.ComponentJsonApi;

/**
 * Wraps a JSON-RPC request to acknowledge an emergency stop condition.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "emergencyStopAcknowledge",
 *   "params": {}
 * }
 * </pre>
 */
public interface EmergencyStopAcknowledgeRpc extends ComponentJsonApi {

	/**
	 * Acknowledges the active emergency stop condition.
	 *
	 * <p>
	 * Implement this method to define the hardware-specific acknowledge behavior,
	 * e.g. sending an acknowledge command via Modbus or writing to a control
	 * channel.
	 *
	 * @throws OpenemsNamedException if the acknowledge operation fails
	 */
	void acknowledgeEmergencyStop() throws OpenemsNamedException;

}
