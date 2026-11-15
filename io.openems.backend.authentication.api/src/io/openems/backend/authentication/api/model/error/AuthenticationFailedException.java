package io.openems.backend.authentication.api.model.error;

import java.io.Serial;

public class AuthenticationFailedException extends RuntimeException {

	@Serial
	private static final long serialVersionUID = 1L;

	public AuthenticationFailedException(String message) {
		super(message);
	}

	public AuthenticationFailedException(String message, Throwable cause) {
		super(message, cause);
	}

}
