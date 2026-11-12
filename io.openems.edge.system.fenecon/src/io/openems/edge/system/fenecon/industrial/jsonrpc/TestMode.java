package io.openems.edge.system.fenecon.industrial.jsonrpc;

import static io.openems.common.jsonrpc.serialization.JsonSerializerUtil.jsonObjectSerializer;
import static io.openems.common.jsonrpc.serialization.JsonSerializerUtil.jsonSerializer;

import io.openems.common.jsonrpc.serialization.EndpointRequestType;
import io.openems.common.jsonrpc.serialization.JsonSerializer;
import io.openems.common.jsonrpc.serialization.PolymorphicSerializer;
import io.openems.common.utils.JsonUtils;
import io.openems.edge.system.fenecon.industrial.jsonrpc.TestMode.Request;
import io.openems.edge.system.fenecon.industrial.jsonrpc.TestMode.Response;

/**
 * Wraps a JSON-RPC Request to start a system test mode with specific action and
 * argument.
 *
 * <pre>
 * JSON-RPC Request:
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "testMode",
 *   "params": {
 *     "action": "essTest",
 *     "argument": ""
 *   }
 * }
 *
 * Successful Response:
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "result": {
 *     "status": "started",
 *     "message": null,
 *     "action": "essTest"
 *   }
 * }
 *
 * Ignored Response (e.g. if a test is already running):
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "result": {
 *     "status": "ignored",
 *     "message": "A test is already running: essTest",
 *     "action": "essTest"
 *   }
 * }
 * </pre>
 */
public class TestMode implements EndpointRequestType<Request, Response> {

	public sealed interface TestAction {
		public record EssTest() implements TestAction {

			/**
			 * Gets the type identifier of this class used for serialization.
			 * 
			 * @return the type identifier
			 */
			public static String getTypeName() {
				return "essTest";
			}

			/**
			 * Returns a {@link JsonSerializer} for a {@link TestMode.TestAction.EssTest}.
			 * 
			 * @return the created {@link JsonSerializer}
			 */
			public static JsonSerializer<TestMode.TestAction.EssTest> serializer() {
				return jsonObjectSerializer(TestMode.TestAction.EssTest.class, json -> {
					return new TestMode.TestAction.EssTest();
				}, obj -> {
					return JsonUtils.buildJsonObject() //
							.addProperty("type", EssTest.getTypeName()) //
							.build();
				});
			}

		}

		public record LampTest(//
		) implements TestAction {

			/**
			 * Gets the type identifier of this class used for serialization.
			 * 
			 * @return the type identifier
			 */
			public static String getTypeName() {
				return "lampTest";
			}

			/**
			 * Returns a {@link JsonSerializer} for a {@link TestMode.TestAction.LampTest}.
			 * 
			 * @return the created {@link JsonSerializer}
			 */
			public static JsonSerializer<TestMode.TestAction.LampTest> serializer() {
				return jsonObjectSerializer(TestMode.TestAction.LampTest.class, json -> {
					return new TestMode.TestAction.LampTest();
				}, obj -> {
					return JsonUtils.buildJsonObject() //
							.addProperty("type", LampTest.getTypeName()) //
							.build();
				});
			}

		}

		public record ManualBatteryStart(//
		) implements TestAction {

			/**
			 * Gets the type identifier of this class used for serialization.
			 * 
			 * @return the type identifier
			 */
			public static String getTypeName() {
				return "manualBatteryStart";
			}

			/**
			 * Returns a {@link JsonSerializer} for a
			 * {@link TestMode.TestAction.ManualBatteryStart}.
			 * 
			 * @return the created {@link JsonSerializer}
			 */
			public static JsonSerializer<TestMode.TestAction.ManualBatteryStart> serializer() {
				return jsonObjectSerializer(TestMode.TestAction.ManualBatteryStart.class, json -> {
					return new TestMode.TestAction.ManualBatteryStart();
				}, obj -> {
					return JsonUtils.buildJsonObject() //
							.addProperty("type", ManualBatteryStart.getTypeName()) //
							.build();
				});
			}

		}

		public record Exit() implements TestAction {

			/**
			 * Gets the type identifier of this class used for serialization.
			 * 
			 * @return the type identifier
			 */
			public static String getTypeName() {
				return "exit";
			}

			/**
			 * Returns a {@link JsonSerializer} for a {@link TestMode.TestAction.Exit}.
			 * 
			 * @return the created {@link JsonSerializer}
			 */
			public static JsonSerializer<TestMode.TestAction.Exit> serializer() {
				return jsonObjectSerializer(TestMode.TestAction.Exit.class, //
						json -> new TestMode.TestAction.Exit(), //
						obj -> JsonUtils.buildJsonObject() //
								.addProperty("type", Exit.getTypeName()) //
								.build());
			}

		}

		/**
		 * Returns a {@link JsonSerializer} for a {@link TestMode.TestAction}.
		 * 
		 * @return the created {@link JsonSerializer}
		 */
		public static JsonSerializer<TestMode.TestAction> serializer() {
			final var polymorphicSerializer = PolymorphicSerializer.<TestMode.TestAction>create() //
					.add(EssTest.class, EssTest.serializer(), EssTest.getTypeName()) //
					.add(LampTest.class, LampTest.serializer(), LampTest.getTypeName()) //
					.add(ManualBatteryStart.class, ManualBatteryStart.serializer(), ManualBatteryStart.getTypeName()) //
					.add(Exit.class, Exit.serializer(), Exit.getTypeName())//
					.build();

			return jsonSerializer(TestMode.TestAction.class, json -> {
				return json.polymorphic(polymorphicSerializer, t -> t.getAsJsonObjectPath().getStringPath("type"));
			}, obj -> {
				return polymorphicSerializer.serialize(obj);
			});
		}
	}

	@Override
	public String getMethod() {
		return "testMode";
	}

	@Override
	public JsonSerializer<Request> getRequestSerializer() {
		return Request.serializer();
	}

	@Override
	public JsonSerializer<Response> getResponseSerializer() {
		return Response.serializer();
	}

	public record Request(TestAction action) {
		/**
		 * Returns a {@link JsonSerializer} for a {@link TestMode.Request}.
		 * 
		 * @return the created {@link JsonSerializer}
		 */
		public static JsonSerializer<Request> serializer() {
			return jsonObjectSerializer(Request.class, //
					json -> new Request(//
							json.getObject("action", TestAction.serializer())), //
					obj -> JsonUtils.buildJsonObject() //
							.add("action", TestAction.serializer().serialize(obj.action()))//
							.build());
		}
	}

	public record Response(String status, String message, TestAction action) {
		/**
		 * Returns a {@link JsonSerializer} for a {@link TestMode.Response}.
		 * 
		 * @return the created {@link JsonSerializer}
		 */
		public static JsonSerializer<Response> serializer() {
			return jsonObjectSerializer(Response.class, json -> {
				return new Response(//
						json.getString("status"), //
						json.getStringOrNull("message"), //
						json.getObjectOrNull("action", TestAction.serializer()));//
			}, obj -> {
				return JsonUtils.buildJsonObject() //
						.addProperty("status", obj.status())//
						.addPropertyIfNotNull("message", obj.message())//
						.onlyIf(obj.action() != null, t -> {
							t.add("action", TestAction.serializer().serialize(obj.action()));
						}).build();
			});
		}

	}

}