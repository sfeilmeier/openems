package io.openems.edge.kostal.piko.provisioning;

import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import io.openems.common.utils.JsonUtils;
import io.openems.common.websocket.DefaultMessages;
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
	public void getNextStep(JsonObject jMessageId, JsonObject jMessage, Consumer<JsonObject> callback) {
		Optional<Integer> step = JsonUtils.getAsOptionalInt(jMessage, "step");
		switch (step.orElse(0)) {
		default:
			/*
			 * Initialize Wizard
			 */
			JsonObject jResult = new JsonObject();
			jResult.addProperty("elementId", this.getClassName());
			jResult.addProperty("step", 1);
			JsonArray jView = new JsonArray();
			JsonObject jViewElement = new JsonObject();
			jViewElement.addProperty("type", "title");
			jViewElement.addProperty("text", "Please enter the required information for your KOSTAL PIKO");
			jView.add(jViewElement);
			jViewElement = new JsonObject();
			jViewElement.addProperty("type", "input");
			jViewElement.addProperty("id", "ip");
			jViewElement.addProperty("text", "IP-Address");
			jView.add(jViewElement);
			jViewElement = new JsonObject();
			jViewElement.addProperty("type", "input");
			jViewElement.addProperty("id", "ess_id");
			jViewElement.addProperty("text", "ID of energy storage system");
			jViewElement.addProperty("default", "ess0");
			jView.add(jViewElement);
			jViewElement = new JsonObject();
			jViewElement.addProperty("type", "input");
			jViewElement.addProperty("id", "gridMeter_id");
			jViewElement.addProperty("text", "ID of grid meter");
			jViewElement.addProperty("default", "meter0");
			jView.add(jViewElement);
			jViewElement = new JsonObject();
			jViewElement.addProperty("type", "input");
			jViewElement.addProperty("id", "charger_id");
			jViewElement.addProperty("text", "ID of PV charger");
			jViewElement.addProperty("default", "charger0");
			jView.add(jViewElement);
			jResult.add("view", jView);
			callback.accept(DefaultMessages.provisioning(jMessageId, "wizard", jResult));
		}
	}

}
