package io.openems.edge.system.fenecon.industrial.jsonrpc;

import java.util.List;

import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.jsonapi.ComponentJsonApi;
import io.openems.edge.ess.api.EssErrorAcknowledge;
import io.openems.edge.ess.api.SymmetricEss;

public interface ErrorAcknowledgeRpc extends ComponentJsonApi {

	/**
	 * Gets the list of {@link SymmetricEss} on which the error acknowledge is
	 * executed.
	 *
	 * @return the list of {@link SymmetricEss}
	 */
	public List<SymmetricEss> getEsssList();

	/**
	 * Defines channels of this component that should be reset on error acknowledge.
	 *
	 * @return the list of channels to reset.
	 */
	public List<Channel<?>> defineChannelsForErrorAcknowledge();

	/**
	 * Executes error acknowledge on all ESS components.
	 */
	public default void executeEssErrorAcknowledge() {
		this.getEsssList().stream()//
				.filter(EssErrorAcknowledge.class::isInstance)//
				.map(EssErrorAcknowledge.class::cast)//
				.forEach(EssErrorAcknowledge::executeErrorAcknowledge);
	}

	/**
	 * Forces the state machine to UNDEFINED state after an error acknowledge.
	 *
	 * <p>
	 * This method is optional. Override it if the component has a state machine
	 * that should be reset on error acknowledge.
	 */
	public default void forceStateMachineUndefined() {
	}

}
