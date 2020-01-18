package io.openems.edge.predictor.load;

import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ConfigurationPolicy;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.metatype.annotations.Designate;

import io.openems.edge.common.component.AbstractOpenemsComponent;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.common.component.OpenemsComponent;

@Designate(ocd = Config.class, factory = true)
@Component(name = "Predictor.Load.LoadForecast", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE)
public class LoadForecast extends AbstractOpenemsComponent implements OpenemsComponent {

	@Reference
	protected ComponentManager componentManager;

	public LoadForecast() {
		super(OpenemsComponent.ChannelId.values(), //
				ForecastChannelId.values());
	}

	@Activate
	void activate(ComponentContext context, Config config) {
		super.activate(context, config.id(), config.alias(), config.enabled());
	}

	@Deactivate
	protected void deactivate() {
		super.deactivate();
	}
}