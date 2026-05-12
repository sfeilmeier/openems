package io.openems.edge.app.integratedsystem;

import static io.openems.edge.common.test.DummyUser.DUMMY_ADMIN;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

import com.google.common.collect.ImmutableList;

import io.openems.common.utils.JsonUtils;
import io.openems.edge.app.integratedsystem.fenecon.industrial.xl.Ixl010;
import io.openems.edge.core.appmanager.AppManagerTestBundle;
import io.openems.edge.core.appmanager.AppManagerTestBundle.PseudoComponentManagerFactory;
import io.openems.edge.core.appmanager.Apps;
import io.openems.edge.core.appmanager.jsonrpc.AddAppInstance;

public class TestFeneconIndustrialXl {

	private AppManagerTestBundle testBundle;

	private Ixl010 feneconIndustrialXl;

	@Before
	public void setUp() throws Exception {
		this.testBundle = new AppManagerTestBundle(null, null, t -> {
			return ImmutableList.of(//
					this.feneconIndustrialXl = Apps.feneconIndustrialXlIxl010(t));
		}, null, new PseudoComponentManagerFactory());
	}

	@Test
	public void testInstallation() throws Exception {
		this.installIndustrialXl();
	}

	private void installIndustrialXl() throws Exception {
		this.testBundle.sut.handleAddAppInstanceRequest(DUMMY_ADMIN,
				new AddAppInstance.Request(this.feneconIndustrialXl.getAppId(), "key", "alias",
						JsonUtils.buildJsonObject() //
								.build()));

		assertEquals(1, this.testBundle.sut.getInstantiatedApps().size());
		for (var instance : this.testBundle.sut.getInstantiatedApps()) {
			final var numberOfDependencies = switch (instance.appId) {
			case "App.FENECON.Industrial.Xl.IXL010" -> 0;
			default -> throw new RuntimeException(instance.appId);
			};

			if (numberOfDependencies == 0) {
				assertTrue(instance.dependencies == null || instance.dependencies.size() == 0);
			} else {
				assertTrue(instance.dependencies.size() == numberOfDependencies);
			}
		}
	}
}
