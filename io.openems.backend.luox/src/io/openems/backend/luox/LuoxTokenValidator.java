package io.openems.backend.luox;

import java.net.MalformedURLException;
import java.net.URI;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProviderBuilder;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.auth0.jwt.interfaces.RSAKeyProvider;

public class LuoxTokenValidator {

	private final JWTVerifier verifier;

	public LuoxTokenValidator(//
			String issuerUrlString, //
			String certsUrlString //
	) throws MalformedURLException {
		this.verifier = createVerifier(issuerUrlString, certsUrlString);
	}

	/**
	 * Validates the given access token and returns the decoded JWT if valid.
	 * 
	 * @param accessToken the access token to validate
	 * @return the decoded JWT if valid
	 * @throws RuntimeException if the token is invalid
	 */
	public DecodedJWT validateAndGetToken(String accessToken) {
		try {
			return this.verifier.verify(accessToken);
		} catch (JWTCreationException | JWTVerificationException exception) {
			throw new RuntimeException("Invalid JWT token", exception);
		}
	}

	private static JWTVerifier createVerifier(String issuerUrlString, String certsUrlString)
			throws MalformedURLException {
		final var issuerUrl = URI.create(issuerUrlString);
		final var certsUrl = URI.create(certsUrlString);

		final var provider = new JwkProviderBuilder(certsUrl.toURL()) //
				.build();

		final var keyProvider = new RSAKeyProvider() {
			@Override
			public RSAPublicKey getPublicKeyById(String kid) {
				try {
					return (RSAPublicKey) provider.get(kid).getPublicKey();
				} catch (JwkException e) {
					throw new RuntimeException(e);
				}
			}

			@Override
			public RSAPrivateKey getPrivateKey() {
				return null;
			}

			@Override
			public String getPrivateKeyId() {
				return null;
			}
		};

		return JWT.require(Algorithm.RSA256(keyProvider)) //
				.withIssuer(issuerUrl.toString()) //
				.build();
	}

}
