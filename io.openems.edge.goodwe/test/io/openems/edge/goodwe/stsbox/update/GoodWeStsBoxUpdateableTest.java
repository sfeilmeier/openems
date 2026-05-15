package io.openems.edge.goodwe.stsbox.update;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import io.openems.common.session.Language;
import io.openems.common.session.Role;
import io.openems.edge.bridge.modbus.test.DummyModbusBridge;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.test.DummyChannel;
import io.openems.edge.common.update.ProgressHistory;
import io.openems.edge.common.update.ProgressPublisher;
import io.openems.edge.common.update.Updateable;
import io.openems.edge.common.update.jsonrpc.GetUpdateState;
import io.openems.edge.goodwe.common.enums.GoodWeType;

class GoodWeStsBoxUpdateableTest {

	@Test
	void testGetMetaInfo() {
		final var metainfo = new Updateable.UpdateableMetaInfo("Update", "Update description", Role.ADMIN);
		final GoodWeStsBoxUpdateParams updateParams = mock();
		when(updateParams.getMetaInfo()).thenReturn(metainfo);

		final var updateable = new GoodWeStsBoxUpdateable(new DummyModbusBridge("modbus0"), updateParams, mock(),
				mock(), mock());

		assertEquals(metainfo, updateable.getMetaInfo(Language.DEFAULT));
	}

	@Test
	void testGetUpdateState() {
		final var goodWeStsBoxParams = new GoodWeStsBoxParams("update_type", "1.1", new GoodWeStsBoxVersion(1, 1),
				null);

		final GoodWeStsBoxUpdateParams updateParams = mock();
		when(updateParams.getParams(any())).thenReturn(goodWeStsBoxParams);

		final Channel<GoodWeType> goodWeType = mock();
		final Channel<Integer> firmwareVersion = DummyChannel.of("FirmwareVersion");
		final Channel<Integer> firmwareSubVersion = DummyChannel.of("FirmwareSubVersion");

		final var updateable = new GoodWeStsBoxUpdateable(new DummyModbusBridge("modbus0"), updateParams, goodWeType,
				firmwareVersion, firmwareSubVersion);

		assertInstanceOf(GetUpdateState.UpdateState.Unknown.class, updateable.getUpdateState(Language.DEFAULT));

		firmwareVersion.setNextValue(1);
		firmwareSubVersion.setNextValue(0);
		firmwareVersion.nextProcessImage();
		firmwareSubVersion.nextProcessImage();

		assertEquals(new GetUpdateState.UpdateState.Available("1.0", "1.1"),
				updateable.getUpdateState(Language.DEFAULT));

		firmwareSubVersion.setNextValue(1);
		firmwareSubVersion.nextProcessImage();

		assertEquals(new GetUpdateState.UpdateState.Updated("1.1"), updateable.getUpdateState(Language.DEFAULT));
	}

	@Test
	@Timeout(value = 30, unit = TimeUnit.SECONDS)
	void testWaitForVersionUpdate() throws Exception {
		final Channel<GoodWeType> goodWeType = mock();
		final Channel<Integer> firmwareVersion = DummyChannel.of("FirmwareVersion");
		final Channel<Integer> firmwareSubVersion = DummyChannel.of("FirmwareSubVersion");

		final var updateable = new GoodWeStsBoxUpdateable(new DummyModbusBridge("modbus0"), mock(), goodWeType,
				firmwareVersion, firmwareSubVersion);

		final var progressHistory = new ProgressHistory();
		final var publisher = new ProgressPublisher();
		publisher.addListener(progressHistory::addProgress);

		assertEquals(0, progressHistory.getSteps().size());
		final var future = updateable.waitForVersionUpdate(publisher, new GoodWeStsBoxVersion(1, 1));
		assertEquals(1, progressHistory.getSteps().size());

		assertFalse(future.isDone());

		firmwareVersion.setNextValue(1);
		firmwareVersion.nextProcessImage();
		assertFalse(future.isDone());

		firmwareSubVersion.setNextValue(1);
		firmwareSubVersion.nextProcessImage();

		assertTrue(future.isDone());
		assertEquals(2, progressHistory.getSteps().size());
	}

}