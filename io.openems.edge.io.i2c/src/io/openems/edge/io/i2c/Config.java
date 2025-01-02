package io.openems.edge.io.i2c;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

@ObjectClassDefinition(//
		name = "IO I2C", //
		description = "Component that allows write access to I2C Smbus registers")
@interface Config {

	@AttributeDefinition(name = "Component-ID", description = "Unique ID of this Component")
	String id() default "analogOutput0";

	@AttributeDefinition(name = "Alias", description = "Human-readable name of this Component; defaults to Component-ID")
	String alias() default "";

	@AttributeDefinition(name = "Is enabled?", description = "Is this Component enabled?")
	boolean enabled() default true;

	@AttributeDefinition(name = "Output Channel", description = "What Outputchannel is controlled?")
	AnalogOutput outputChannel() default AnalogOutput.MODBERRY_CHANNEL_1;

	String webconsole_configurationFactory_nameHint() default "IO I2C [{id}]";

}