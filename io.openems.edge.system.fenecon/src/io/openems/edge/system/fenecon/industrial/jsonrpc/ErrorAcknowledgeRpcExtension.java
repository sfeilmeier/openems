package io.openems.edge.system.fenecon.industrial.jsonrpc;

import static io.openems.common.session.Role.INSTALLER;

import org.osgi.service.component.annotations.Component;

import io.openems.common.jsonrpc.serialization.EmptyObject;
import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.edge.common.jsonapi.ComponentJsonApiExtension;
import io.openems.edge.common.jsonapi.EdgeGuards;
import io.openems.edge.common.jsonapi.JsonApiBuilder;

@Component
public class ErrorAcknowledgeRpcExtension implements ComponentJsonApiExtension<ErrorAcknowledgeRpc> {

	@Override
	public Class<? extends ErrorAcknowledgeRpc> extendClass() {
		return ErrorAcknowledgeRpc.class;
	}

	@Override
	public void buildJsonApiRoutes(ErrorAcknowledgeRpc service, JsonApiBuilder builder) {
		builder.handleRequest(EndpointRequestType.ofEmpty("systemErrorAcknowledge"), //
				endpoint -> endpoint.setGuards(EdgeGuards.roleIsAtleast(INSTALLER)), //
				call -> {
					service.defineChannelsForErrorAcknowledge().forEach(c -> c.setNextValue(null));
					service.forceStateMachineUndefined();
					service.executeEssErrorAcknowledge();
					return EmptyObject.INSTANCE;
				});
	}

}
