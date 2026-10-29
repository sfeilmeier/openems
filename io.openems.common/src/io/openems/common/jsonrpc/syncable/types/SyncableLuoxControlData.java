package io.openems.common.jsonrpc.syncable.types;

import static io.openems.common.jsonrpc.serialization.JsonSerializerUtil.jsonObjectSerializer;
import static io.openems.common.utils.JsonUtils.buildJsonObject;

import java.time.Instant;

import com.google.gson.JsonNull;

import io.openems.common.jsonrpc.serialization.JsonSerializer;
import io.openems.common.jsonrpc.serialization.PolymorphicSerializer;
import io.openems.common.utils.JsonUtils;

public sealed interface SyncableLuoxControlData {

	/**
	 * Returns a {@link JsonSerializer} for a {@link SyncableLuoxControlData}.
	 *
	 * @return the created {@link JsonSerializer}
	 */
	static JsonSerializer<SyncableLuoxControlData> serializer() {
		final var polymorphicSerializer = PolymorphicSerializer.<SyncableLuoxControlData>create() //
				.add(NoContractMapping.class, NoContractMapping.serializer(), NoContractMapping.TYPE) //
				.add(NoLimitation.class, NoLimitation.serializer(), NoLimitation.TYPE) //
				.add(Limitation.class, Limitation.serializer(), Limitation.TYPE) //
				.build();
		return jsonObjectSerializer(SyncableLuoxControlData.class, json -> {
			return json.getJsonElementPath("data") //
					.polymorphic(polymorphicSerializer, t -> t.getAsJsonObjectPath().getStringPath("type"));
		}, obj -> {
			if (obj == null) {
				return JsonNull.INSTANCE;
			}
			return JsonUtils.buildJsonObject() //
					.add("data", polymorphicSerializer.serialize(obj)) //
					.build();
		});
	}

	record NoContractMapping() implements SyncableLuoxControlData {

		public static final String TYPE = "noContractMapping";

		/**
		 * Returns a {@link JsonSerializer} for a {@link NoContractMapping}.
		 *
		 * @return the created {@link JsonSerializer}
		 */
		public static JsonSerializer<NoContractMapping> serializer() {
			return jsonObjectSerializer(NoContractMapping.class, //
					json -> new NoContractMapping(), //
					obj -> buildJsonObject() //
							.addProperty("type", TYPE) //
							.build());
		}

	}

	record NoLimitation() implements SyncableLuoxControlData {

		public static final String TYPE = "noLimitation";

		/**
		 * Returns a {@link JsonSerializer} for a {@link NoLimitation}.
		 *
		 * @return the created {@link JsonSerializer}
		 */
		public static JsonSerializer<NoLimitation> serializer() {
			return jsonObjectSerializer(NoLimitation.class, //
					json -> new NoLimitation(), //
					obj -> buildJsonObject() //
							.addProperty("type", TYPE) //
							.build());
		}

	}

	/**
	 * Limits the feed into the grid. This command MUST be valid only for 5 minutes
	 * and then the plant MUST return to normal operation (100% feed-in).
	 *
	 * @param remainingFeed    the percentage [%] value the plant is limited to (0 -
	 *                         no feed-in, 100 - full feed-in)
	 * @param remainingFeedDno the percentage [%] value the plant is limited by the
	 *                         network provider to (0 - no feed-in, 100 - full
	 *                         feed-in)
	 * @param timestamp        the timestamp when the limitation started
	 */
	record Limitation(//
			int remainingFeed, //
			Integer remainingFeedDno, //
			Instant timestamp //
	) implements SyncableLuoxControlData {

		public static final String TYPE = "limitation";

		/**
		 * Returns a {@link JsonSerializer} for a {@link Limitation}.
		 *
		 * @return the created {@link JsonSerializer}
		 */
		public static JsonSerializer<Limitation> serializer() {
			return jsonObjectSerializer(Limitation.class, json -> {
				return new Limitation(//
						json.getInt("remainingFeed"), //
						json.getOptionalInt("remainingFeedDno").orElse(null), //
						json.getInstant("timestamp") //
				);
			}, obj -> {
				return buildJsonObject() //
						.addProperty("type", TYPE) //
						.addProperty("remainingFeed", obj.remainingFeed()) //
						.addPropertyIfNotNull("remainingFeedDno", obj.remainingFeedDno()) //
						.addProperty("timestamp", obj.timestamp()) //
						.build();
			});
		}

	}

}
