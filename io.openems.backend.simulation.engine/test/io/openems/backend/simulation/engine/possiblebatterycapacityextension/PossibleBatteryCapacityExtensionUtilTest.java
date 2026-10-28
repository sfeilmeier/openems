package io.openems.backend.simulation.engine.possiblebatterycapacityextension;

import static io.openems.backend.simulation.engine.possiblebatterycapacityextension.PossibleBatteryCapacityExtensionUtil.calculateDataPerModule;
import static org.junit.Assert.assertEquals;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.SortedMap;

import org.junit.Test;

import com.google.common.collect.ImmutableSortedMap;
import com.google.gson.JsonElement;

import io.openems.backend.simulation.engine.possiblebatterycapacityextension.PossibleBatteryCapacityExtensionUtil.DataPerModule;
import io.openems.common.types.ChannelAddress;
import io.openems.common.utils.JsonUtils;

public class PossibleBatteryCapacityExtensionUtilTest {

	@Test
	public void testCalculateDataPerYear() throws Exception {

		final double electricityPrice = 30.1;
		var data = getData();
		var product = new Product.Home10Gen1();
		var numberOfTowers = 1;

		assertEquals(calculateDataPerModule(data, 5, 6, electricityPrice, product, numberOfTowers),
				new DataPerModule(6, 12.3, 370.0, 6720, 13200));
		assertEquals(calculateDataPerModule(data, 5, 7, electricityPrice, product, 2),
				new DataPerModule(7, 7.9, 237.0, 7840, 15400));
		assertEquals(calculateDataPerModule(data, 5, 10, electricityPrice, product, 3),
				new DataPerModule(10, 1.3, 39.0, 10000, 22000));
	}

	private static SortedMap<ZonedDateTime, SortedMap<ChannelAddress, JsonElement>> getData() throws IOException {
		final var simulatedDataCsv = PossibleBatteryCapacityExtensionUtilTest.class.getResource("simulatedData.csv");
		try (final var inputStream = simulatedDataCsv.openStream();
				final var inputStreamReader = new InputStreamReader(inputStream);
				final var br = new BufferedReader(inputStreamReader)) {
			return br.lines() //
					.map(l -> l.split(";")) //
					.collect(ImmutableSortedMap
							.<String[], ZonedDateTime, SortedMap<ChannelAddress, JsonElement>>toImmutableSortedMap(//
									Comparator.naturalOrder(), //
									a -> ZonedDateTime.parse(a[0]), //
									a -> {
										try {
											var address = ChannelAddress.fromString("_sum/GridBuyActiveEnergy");
											var address2 = ChannelAddress.fromString("_sum/GridSellActiveEnergy");
											return ImmutableSortedMap.<ChannelAddress, JsonElement>naturalOrder() //
													.put(address, JsonUtils.parse(a[1])) //
													.put(address2, JsonUtils.parse(a[2])) //
													.build();
										} catch (Exception e) {
											throw new IllegalArgumentException(e.getMessage());
										}
									}));
		}
	}
}