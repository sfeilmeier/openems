package io.openems.backend.luox;

import java.lang.reflect.Array;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.interfaces.Claim;
import com.google.gson.JsonElement;

import io.openems.common.exceptions.OpenemsException;
import io.openems.common.utils.JsonUtils;

public class JsonClaim implements Claim {

	private final JsonElement jsonElement;

	public JsonClaim(JsonElement jsonElement) {
		this.jsonElement = jsonElement;
	}

	@Override
	public boolean isNull() {
		return !this.isMissing() && this.jsonElement.isJsonNull();
	}

	@Override
	public boolean isMissing() {
		return this.jsonElement == null;
	}

	@Override
	public Boolean asBoolean() {
		return this.jsonElement.getAsBoolean();
	}

	@Override
	public Integer asInt() {
		return this.jsonElement.getAsInt();
	}

	@Override
	public Long asLong() {
		return this.jsonElement.getAsLong();
	}

	@Override
	public Double asDouble() {
		return this.jsonElement.getAsDouble();
	}

	@Override
	public String asString() {
		return this.jsonElement.getAsString();
	}

	@Override
	public Date asDate() {
		throw new RuntimeException("Not implemented yet");
	}

	@Override
	@SuppressWarnings("unchecked")
	public <T> T[] asArray(Class<T> aClass) throws JWTDecodeException {
		return this.asList(aClass).toArray((T[]) Array.newInstance(aClass, this.jsonElement.getAsJsonArray().size()));
	}

	@Override
	public <T> List<T> asList(Class<T> aClass) throws JWTDecodeException {
		return JsonUtils.stream(this.jsonElement.getAsJsonArray()) //
				.map(t -> {
					try {
						return (T) JsonUtils.getAsType(aClass, t);
					} catch (OpenemsException e) {
						throw new RuntimeException(e);
					}
				}) //
				.toList();
	}

	@Override
	public Map<String, Object> asMap() throws JWTDecodeException {
		throw new RuntimeException("Not implemented yet");
	}

	@Override
	public <T> T as(Class<T> aClass) throws JWTDecodeException {
		try {
			return (T) JsonUtils.getAsType(aClass, this.jsonElement);
		} catch (OpenemsException e) {
			throw new RuntimeException(e);
		}
	}
}
