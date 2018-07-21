package io.openems.edge.kostal.piko.provisioning;

import java.util.Map;
import java.util.function.Consumer;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;

import com.google.gson.JsonObject;

import io.openems.edge.provisioning.api.Provisioning;

@Component(immediate = true)
public class KostalPikoProvisioning implements Provisioning {

	private String className = "";

	@Activate
	protected void activate(Map<String, Object> properties) {
		this.className = properties.get("component.name").toString();
	}

	@Override
	public String getClassName() {
		return this.className;
	}

	@Override
	public String getName() {
		return "KOSTAL PIKO";
	}

	@Override
	public void getNextStep(JsonObject jMessage, Consumer<JsonObject> callback) {
		System.out.println("getNextStep: " + jMessage.toString());
		callback.accept(new JsonObject());
	}

}
