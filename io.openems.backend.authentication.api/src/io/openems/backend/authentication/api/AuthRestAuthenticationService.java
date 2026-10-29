package io.openems.backend.authentication.api;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

public interface AuthRestAuthenticationService {

	/**
	 * Authenticate the request based on the provided headers. If authentication
	 * fails, the returned future will be completed exceptionally.
	 * 
	 * @param headers        the request headers
	 * @param requiredScopes the scopes required for the request
	 * @return a future that completes when authentication is done
	 */
	CompletableFuture<Void> authenticate(Map<String, String> headers, Set<String> requiredScopes);

}
