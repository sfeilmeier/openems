package io.openems.common.bridge.http.api;

public final class HttpAuthorization {

	public static final String VALUE_BEARER_PREFIX = "Bearer";

	/**
	 * Creates the content of the "Authorization" header for a Bearer token.
	 * 
	 * @param token the Bearer token
	 * @return the created content of the "Authorization" header
	 */
	public static String bearer(String token) {
		return VALUE_BEARER_PREFIX + " " + token;
	}

	private HttpAuthorization() {
	}
}
