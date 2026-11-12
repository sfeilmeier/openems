package io.openems.edge.system.fenecon.industrial.jsonrpc;

import io.openems.edge.common.jsonapi.ComponentJsonApi;

/**
 * Provides the hooks for the {@code testMode} JSON-RPC endpoint for executing
 * and managing system test modes.
 *
 * <p>
 * Only one test mode can be active at a time. New test requests are rejected
 * while another test is running. Test execution can only be started when the
 * system is either stopped or in idle state.
 *
 * @see TestModeRpcExtension
 */
public interface TestModeRpc extends ComponentJsonApi {

	/**
	 * Gets the currently active test request.
	 *
	 * @return the active {@link TestMode.Request}; or {@code null} if no test is
	 *         currently running
	 */
	public TestMode.Request getTestRequest();

	/**
	 * Sets the active test request.
	 *
	 * @param request the {@link TestMode.Request}
	 */
	public void setTestRequest(TestMode.Request request);

	/**
	 * Handles the exit state.
	 *
	 * <p>
	 * This method is used when exiting test mode.
	 *
	 * @param request the {@link TestMode.Request}
	 * @return response the {@link TestMode.Response}
	 *
	 */
	public TestMode.Response handleExit(TestMode.Request request);

	/**
	 * Forces the system into test-mode idle state.
	 *
	 * <p>
	 * This method is used to prepare the system for test execution.
	 */
	public void forceTestModeIdle();

	/**
	 * Checks if the system is currently stopped.
	 *
	 * @return {@code true} if the system is currently stopped
	 */
	public boolean isStateStopped();

	/**
	 * Checks if the system is currently in idle state.
	 *
	 * @return {@code true} if the system is currently in idle state
	 */
	public boolean isIdle();

}
