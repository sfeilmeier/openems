package io.openems.backend.authentication.oauth2;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

@ObjectClassDefinition(name = "Authentication.OAuth.Rest")
public @interface OAuthRestClientAuthenticationServiceConfig {

	@AttributeDefinition(name = "Name", description = "The name of the authentication service.")
	String name() default "";

	@AttributeDefinition(name = "Issuer URL", description = "The Issuer URL of the OAuth2 server. This is used to validate the tokens issued by the OAuth2 server.", defaultValue = "http://localhost:7900/realms/openems")
	String issuerUrl() default "http://localhost:7900/realms/openems";

	@AttributeDefinition(name = "Certificate URL", description = "The URL to retrieve the public keys used to verify the JWT tokens issued by the OAuth2 server. This is the OAuth2 JWKs endpoint.", defaultValue = "http://localhost:7900/realms/openems/protocol/openid-connect/certs")
	String certsUrl() default "http://localhost:7900/realms/openems/protocol/openid-connect/certs";

	@AttributeDefinition(name = "Certs Provider Rate Limiter Bucket size")
	int certsProviderRateLimitedBucketSize() default 10;

	@AttributeDefinition(name = "Certs Provider Rate Limiter refill rate per second")
	int certsProviderRateLimitedRefillRate() default 1;

	@AttributeDefinition(name = "Max number of concurrent connections", description = "Maximum number of concurrent request to the OAuth2 server")
	int maxConcurrentRequests() default 5;

}
