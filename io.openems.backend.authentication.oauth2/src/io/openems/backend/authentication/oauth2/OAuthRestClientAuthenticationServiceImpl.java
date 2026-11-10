package io.openems.backend.authentication.oauth2;

import static io.openems.common.utils.StringUtils.startsWithIgnoreCase;
import static io.openems.common.utils.ThreadPoolUtils.shutdownAndAwaitTermination;

import java.net.MalformedURLException;
import java.net.URI;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ConfigurationPolicy;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;

import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProviderBuilder;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.auth0.jwt.interfaces.RSAKeyProvider;

import io.openems.backend.authentication.api.AuthRestAuthenticationService;
import io.openems.backend.authentication.api.model.error.AuthenticationFailedException;
import io.openems.backend.metrics.prometheus.DebugExecutor;
import io.openems.common.bridge.http.api.HttpAuthorization;
import io.openems.common.bridge.http.api.HttpHeader;
import io.openems.common.logger.ContextLogger;

@Designate(ocd = OAuthRestClientAuthenticationServiceConfig.class, factory = true)
@Component(//
		name = "Authentication.OAuth.Rest", //
		configurationPolicy = ConfigurationPolicy.REQUIRE, //
		immediate = true //
)
public class OAuthRestClientAuthenticationServiceImpl implements AuthRestAuthenticationService {

	private final Logger log;

	private final JWTVerifier verifier;
	private final DebugExecutor executor;

	@Activate
	@SuppressWarnings("unused")
	public OAuthRestClientAuthenticationServiceImpl(//
			OAuthRestClientAuthenticationServiceConfig config //
	) throws MalformedURLException {
		this(new ContextLogger(OAuthRestClientAuthenticationServiceImpl.class, config.name()), createVerifier(config),
				createExecutor(config));
	}

	OAuthRestClientAuthenticationServiceImpl(//
			Logger log, //
			JWTVerifier verifier, //
			DebugExecutor executor //
	) {
		this.log = log;
		this.verifier = verifier;
		this.executor = executor;
	}

	@Deactivate
	private void deactivate() {
		shutdownAndAwaitTermination(this.executor, 5);
	}

	@Override
	public CompletableFuture<Void> authenticate(Map<String, String> headers, Set<String> requiredScopes) {
		return this.executor.submit("authenticate", () -> {
			final var authHeader = headers.get(HttpHeader.HEADER_AUTHORIZATION);
			if (authHeader == null || !startsWithIgnoreCase(authHeader, HttpAuthorization.VALUE_BEARER_PREFIX + " ")) {
				throw new AuthenticationFailedException("Missing or invalid Authorization header");
			}
			final var tokenString = authHeader.substring(HttpAuthorization.VALUE_BEARER_PREFIX.length() + 1);
			final var jwt = this.processAccessToken(tokenString);

			if (requiredScopes.isEmpty()) {
				return;
			}

			final var scope = jwt.getClaim("scope");
			if (scope == null) {
				throw new AuthenticationFailedException("Missing required scopes: " + requiredScopes);
			}
			final var scopes = Set.of(scope.asString().split(" "));
			if (!scopes.containsAll(requiredScopes)) {
				throw new AuthenticationFailedException("Missing required scopes: " + requiredScopes);
			}

		});
	}

	private DecodedJWT processAccessToken(String accessToken) {
		try {
			return this.verifier.verify(accessToken);
		} catch (JWTCreationException | JWTVerificationException exception) {
			// Invalid Signing configuration / Couldn't convert Claims.
			this.log.debug("JWT failed", exception);
			throw new AuthenticationFailedException("Invalid JWT token", exception);
		}
	}

	private static DebugExecutor createExecutor(OAuthRestClientAuthenticationServiceConfig config) {
		// TODO virtual threads should not be pooled
		return new DebugExecutor(config.name(), Executors.newFixedThreadPool(config.maxConcurrentRequests(),
				Thread.ofVirtual().name("Auth.Rest-%d").factory()));
	}

	private static JWTVerifier createVerifier(OAuthRestClientAuthenticationServiceConfig config)
			throws MalformedURLException {
		final var issuerUrl = URI.create(config.issuerUrl());
		final var certsUrl = URI.create(config.certsUrl());

		final var provider = new JwkProviderBuilder(certsUrl.toURL()) //
				.rateLimited(config.certsProviderRateLimitedBucketSize(), config.certsProviderRateLimitedRefillRate(),
						TimeUnit.SECONDS) //
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
