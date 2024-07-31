package io.openems.edge.app.integratedsystem;

import static io.openems.edge.common.test.DummyUser.DUMMY_ADMIN;
import static org.junit.Assert.assertNotNull;

import org.junit.Before;
import org.junit.Test;

import com.google.common.collect.ImmutableList;

import io.openems.common.utils.JsonUtils;
import io.openems.edge.app.integratedsystem.fenecon.industrial.l.Ilk710;
import io.openems.edge.core.appmanager.AppManagerTestBundle;
import io.openems.edge.core.appmanager.AppManagerTestBundle.PseudoComponentManagerFactory;
import io.openems.edge.core.appmanager.Apps;
import io.openems.edge.core.appmanager.jsonrpc.AddAppInstance;

public class TestFeneconIndustrialL {

	private AppManagerTestBundle testBundle;

	private Ilk710 feneconIndustrialL;

	@Before
	public void setUp() throws Exception {
		this.testBundle = new AppManagerTestBundle(null, null, t -> {
			return ImmutableList.of(//
					this.feneconIndustrialL = Apps.feneconIndustrialLIlk710(t) //
			);
		}, null, new PseudoComponentManagerFactory());
	}

	@Test
	public void testInstallation() throws Exception {
		final var test = this.testBundle.sut.handleAddAppInstanceRequest(DUMMY_ADMIN,
				new AddAppInstance.Request(this.feneconIndustrialL.getAppId(), "key", "alias",
						JsonUtils.buildJsonObject() //
								.build()));
		assertNotNull(test);
	}

}
