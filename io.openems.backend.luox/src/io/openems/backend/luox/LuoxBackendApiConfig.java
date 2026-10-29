package io.openems.backend.luox;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

@ObjectClassDefinition(name = "LUOX Control Api")
public @interface LuoxBackendApiConfig {

	@AttributeDefinition(name = "LUOX Issuer Url", description = "Issuer URL for validating the JWT token.")
	String luoxIssuerUrl() default "https://auth.lumenaza.de/realms/lumenaza_system";

	@AttributeDefinition(name = "LUOX Certs Url", description = "Certs URL for validating the JWT token.")
	String luoxCertsUrl() default "https://auth.lumenaza.de/realms/lumenaza_system/protocol/openid-connect/certs";

	@AttributeDefinition(name = "Task Pool Size")
	int taskPoolSize() default 5;

}