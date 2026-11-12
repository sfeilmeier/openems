package io.openems.edge.system.fenecon.industrial.jsonrpc;

import org.osgi.service.component.annotations.Component;

import io.openems.common.jsonrpc.serialization.EmptyObject;
import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.common.session.Role;
import io.openems.edge.common.jsonapi.ComponentJsonApiExtension;
import io.openems.edge.common.jsonapi.EdgeGuards;
import io.openems.edge.common.jsonapi.JsonApiBuilder;

@Component
public class BmsHardwareResetRpcExtension implements ComponentJsonApiExtension<BmsHardwareResetRpc> {

	@Override
	public Class<? extends BmsHardwareResetRpc> extendClass() {
		return BmsHardwareResetRpc.class;
	}

	@Override
	public void buildJsonApiRoutes(BmsHardwareResetRpc service, JsonApiBuilder builder) {
		builder.handleRequest(//
				EndpointRequestType.ofEmpty("bmsHardwareReset"), //
				endpoint -> endpoint.setGuards(EdgeGuards.roleIsAtleast(Role.INSTALLER)), //
				call -> {
					service.activateBmsHardwareReset();
					return EmptyObject.INSTANCE;
				});
	}

}
