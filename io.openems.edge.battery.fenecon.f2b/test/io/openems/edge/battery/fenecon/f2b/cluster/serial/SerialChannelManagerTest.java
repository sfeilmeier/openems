package io.openems.edge.battery.fenecon.f2b.cluster.serial;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import java.util.List;

import org.junit.jupiter.api.Test;

public class SerialChannelManagerTest {

	@Test
	public void testCalculateSerialSoc() {
		int[][] socTestSamples = {
				// battery1, battery2, expected cluster SOC
				{ 0, 0, 0 }, //
				{ 0, 100, 50 }, //
				{ 10, 20, 12 }, //
				{ 30, 40, 34 }, //
				{ 49, 51, 50 }, //
				{ 50, 50, 50 }, //
				{ 50, 60, 56 }, //
				{ 60, 75, 70 }, //
				{ 81, 87, 86 }, //
				{ 98, 99, 99 }, //
				{ 100, 100, 100 }, //
		};

		for (int[] sample : socTestSamples) {
			var result = SerialChannelManager.calculateSerialSoc(List.of(sample[0], sample[1]));
			assertEquals("SOC of " + sample[0] + "/" + sample[1], Integer.valueOf(sample[2]), result);
		}
	}

	@Test
	public void testCalculateSerialSocEmpty() {
		assertNull(SerialChannelManager.calculateSerialSoc(List.of()));
	}

	@Test
	public void testCalculateSerialSocSingleBattery() {
		assertEquals(Integer.valueOf(40), SerialChannelManager.calculateSerialSoc(List.of(40)));
	}
}