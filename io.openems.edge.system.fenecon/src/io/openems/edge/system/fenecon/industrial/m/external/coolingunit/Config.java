package io.openems.edge.system.fenecon.industrial.m.external.coolingunit;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

@ObjectClassDefinition(//
		name = "System Fenecon Industrial M Aircondition", //
		description = "Implements the fenecon industrial M Aircondition")
public @interface Config {

	@AttributeDefinition(name = "Component-ID", description = "Unique ID of this Component.")
	String id() default "coolingUnit0";

	@AttributeDefinition(name = "Alias", description = "Human-readable name of this Component; defaults to Component-ID.")
	String alias() default "";

	@AttributeDefinition(name = "Is enabled?", description = "Is this Component enabled?")
	boolean enabled() default true;

	@AttributeDefinition(name = "Battery Inverters", description = "List of Battery inverters")
	String[] batteryInverters();

	@AttributeDefinition(name = "Digital input cooling unit", description = "IO for switching cooling unit status.")
	String coolingUnitInput();

	@AttributeDefinition(name = "Digital output cooling unit", description = "IO for switching on/ off cooling unit.")
	String coolingUnitOutput();

	@AttributeDefinition(name = "Threshold temperature in [degreeCelsius]", description = "The threshold temperature value to swrich on the AC.")
	int thresholdTemperature();

	String webconsole_configurationFactory_nameHint() default "System Fenecon Industrial M Aircondition [{id}]";

}
