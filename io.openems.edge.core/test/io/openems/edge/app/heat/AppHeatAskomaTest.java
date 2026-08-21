package io.openems.edge.app.heat;

import static io.openems.edge.common.test.DummyUser.DUMMY_ADMIN;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.google.common.collect.ImmutableList;
import com.google.gson.JsonObject;

import io.openems.common.session.Role;
import io.openems.common.utils.JsonUtils;
import io.openems.edge.common.user.User;
import io.openems.edge.core.appmanager.AppManagerTestBundle;
import io.openems.edge.core.appmanager.Apps;
import io.openems.edge.core.appmanager.OpenemsAppInstance;
import io.openems.edge.core.appmanager.jsonrpc.AddAppInstance;

class AppHeatAskomaTest {

	private AppManagerTestBundle appManagerTestBundle;
	private AppHeatAskoma heatAskoma;

	@BeforeEach
	void beforeEach() throws Exception {
		this.appManagerTestBundle = new AppManagerTestBundle(null, null, t -> ImmutableList.of(//
				this.heatAskoma = Apps.heatAskoma(t) //
		), null, new AppManagerTestBundle.PseudoComponentManagerFactory());
	}

	@Test
	void testHasOnlyExpectedProperties() {
		this.appManagerTestBundle //
				.withApp(this.heatAskoma) //
				.hasOnlyProperties(//
						AppHeatAskoma.Property.HEAT_ID, //
						AppHeatAskoma.Property.MODBUS_ID, //
						AppHeatAskoma.Property.ALIAS, //
						AppHeatAskoma.Property.IP, //
						AppHeatAskoma.Property.MAX_HEAT_POWER);
	}

	@Test
	void testCreateApp() throws Exception {
		this.createApp(DUMMY_ADMIN);

		assertEquals(1, this.appManagerTestBundle.sut.getInstantiatedApps().size());

		final var instance = this.appManagerTestBundle.findFirst(this.heatAskoma.getAppId());
		assertEquals("App.Heat.Askoma", instance.appId);
	}

	@Test
	void testPermissions() {
		this.appManagerTestBundle.assertPermissions(this.heatAskoma, properties()) //
				.canSeeWithOnlyRoles(Role.ADMIN) //
				.canDeleteWithOnlyRoles(Role.ADMIN) //
				.canInstallWithOnlyRoles(Role.ADMIN);
	}

	private OpenemsAppInstance createApp(User user) throws Exception {
		return this.appManagerTestBundle.sut
				.handleAddAppInstanceRequest(user,
						new AddAppInstance.Request(this.heatAskoma.getAppId(), "key", "alias", properties()))
				.instance();
	}

	private static JsonObject properties() {
		return JsonUtils.buildJsonObject() //
				.addProperty("IP", "192.168.2.118") //
				.addProperty("MAX_HEAT_POWER", 30000) //
				.build();
	}
}
