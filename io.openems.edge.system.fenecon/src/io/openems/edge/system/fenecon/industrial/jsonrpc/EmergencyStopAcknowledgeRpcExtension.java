package io.openems.edge.system.fenecon.industrial.jsonrpc;

import org.osgi.service.component.annotations.Component;

import io.openems.common.jsonrpc.serialization.EmptyObject;
import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.common.session.Role;
import io.openems.edge.common.jsonapi.ComponentJsonApiExtension;
import io.openems.edge.common.jsonapi.EdgeGuards;
import io.openems.edge.common.jsonapi.JsonApiBuilder;

@Component
public class EmergencyStopAcknowledgeRpcExtension implements ComponentJsonApiExtension<EmergencyStopAcknowledgeRpc> {

	@Override
	public Class<? extends EmergencyStopAcknowledgeRpc> extendClass() {
		return EmergencyStopAcknowledgeRpc.class;
	}

	@Override
	public void buildJsonApiRoutes(EmergencyStopAcknowledgeRpc service, JsonApiBuilder builder) {
		builder.handleRequest(EndpointRequestType.ofEmpty("emergencyStopAcknowledge"), //
				endpoint -> endpoint.setGuards(EdgeGuards.roleIsAtleast(Role.INSTALLER)), //
				call -> {
					service.acknowledgeEmergencyStop();
					return EmptyObject.INSTANCE;
				});
	}

}
