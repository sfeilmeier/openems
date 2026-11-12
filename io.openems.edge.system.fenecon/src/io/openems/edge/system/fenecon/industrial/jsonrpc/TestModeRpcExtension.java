package io.openems.edge.system.fenecon.industrial.jsonrpc;

import org.osgi.service.component.annotations.Component;

import io.openems.common.session.Role;
import io.openems.edge.common.jsonapi.ComponentJsonApiExtension;
import io.openems.edge.common.jsonapi.EdgeGuards;
import io.openems.edge.common.jsonapi.JsonApiBuilder;
import io.openems.edge.system.fenecon.industrial.jsonrpc.TestMode.TestAction;

/**
 * Registers the {@code testMode} JSON-RPC endpoint.
 *
 * <p>
 * If the request action is {@link TestAction.Exit}, the currently active test
 * mode is terminated and the system is moved to stopped state.
 *
 * <p>
 * Starting a new test requires that:
 * <ul>
 * <li>no other test is currently running</li>
 * <li>the system is stopped or in idle state</li>
 * </ul>
 */
@Component
public class TestModeRpcExtension implements ComponentJsonApiExtension<TestModeRpc> {

	@Override
	public Class<? extends TestModeRpc> extendClass() {
		return TestModeRpc.class;
	}

	@Override
	public void buildJsonApiRoutes(TestModeRpc service, JsonApiBuilder builder) {
		builder.handleRequest(//
				new TestMode(), //
				endpoint -> endpoint.setGuards(EdgeGuards.roleIsAtleast(Role.INSTALLER)), //
				call -> {
					final var nextRequest = call.getRequest();
					synchronized (service) {
						if (nextRequest.action() instanceof TestAction.Exit) {
							return service.handleExit(nextRequest);
						}

						if (service.getTestRequest() != null) {
							return new TestMode.Response(//
									"ignored", //
									"A test is already running: ", //
									service.getTestRequest().action());
						}
						if (!service.isStateStopped() && !service.isIdle()) {
							return new TestMode.Response(//
									"ignored", //
									"Stop operation or Idle state required before proceeding!", //
									null);
						}
						service.setTestRequest(nextRequest);
						service.forceTestModeIdle();
						return new TestMode.Response("started", null, service.getTestRequest().action());
					}
				});
	}

}
