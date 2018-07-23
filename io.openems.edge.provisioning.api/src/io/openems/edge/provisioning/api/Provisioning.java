package io.openems.edge.provisioning.api;

import java.util.function.Consumer;

import org.osgi.annotation.versioning.ProviderType;

import com.google.gson.JsonObject;

@ProviderType
public interface Provisioning {

	/**
	 * Returns the Service Component Name.
	 * 
	 * @return
	 */
	String getClassName();

	public String getName();

	public void getNextStep(JsonObject jMessageId, JsonObject jMessage, Consumer<JsonObject> callback);

}
