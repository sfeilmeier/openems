package io.openems.backend.simulation.engine.possiblebatterycapacityextension;

import static org.junit.Assert.assertEquals;

import java.util.NavigableMap;

import org.junit.Test;

import com.google.common.collect.ImmutableSortedMap;

import io.openems.backend.simulation.engine.possiblebatterycapacityextension.PossibleBatteryCapacityExtensionUtil.ProductData;

public class ProductTest {

	private static long count(NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> ptd) {
		return ptd.entrySet().stream().flatMap(e -> e.getValue().values().stream()).count();
	}

	private static ProductData lastProductData(NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> ptd) {
		return ptd.lastEntry().getValue().lastEntry().getValue();
	}

	@Test
	public void testHome10Gen1() {
		var sut = Product.getProduct("home");
		var ptd = sut.getProductTowerDetails();
		assertEquals(16, count(ptd));
		var last = lastProductData(ptd);
		var peakPower = sut.getPeakPower();
		assertEquals(10000, peakPower);
		assertEquals(66000, last.capacity());
		var capacityPerModule = sut.getCapacityPerModule();
		assertEquals(2200, capacityPerModule);
	}

	@Test
	public void testHome6() {
		var sut = Product.getProduct("home-6");
		var ptd = sut.getProductTowerDetails();
		assertEquals(26, count(ptd));
		var last = lastProductData(ptd);
		var peakPower = sut.getPeakPower();
		assertEquals(6000, peakPower);
		assertEquals(156800, last.capacity());
		var capacityPerModule = sut.getCapacityPerModule();
		assertEquals(2800, capacityPerModule);
	}

	@Test
	public void testHome10Gen2() {
		var sut = Product.getProduct("home-10");
		var ptd = sut.getProductTowerDetails();
		assertEquals(26, count(ptd));
		var last = lastProductData(ptd);
		var peakPower = sut.getPeakPower();
		assertEquals(10000, peakPower);
		assertEquals(156800, last.capacity());
		var capacityPerModule = sut.getCapacityPerModule();
		assertEquals(2800, capacityPerModule);
	}

	@Test
	public void testHome15() {
		var sut = Product.getProduct("home-15");
		var ptd = sut.getProductTowerDetails();
		assertEquals(26, count(ptd));
		var last = lastProductData(ptd);
		var peakPower = sut.getPeakPower();
		assertEquals(15000, peakPower);
		assertEquals(156800, last.capacity());
		var capacityPerModule = sut.getCapacityPerModule();
		assertEquals(2800, capacityPerModule);
	}

	@Test
	public void testHome20() {
		var sut = Product.getProduct("home-20");
		var ptd = sut.getProductTowerDetails();
		assertEquals(28, count(ptd));
		var last = lastProductData(ptd);
		var peakPower = sut.getPeakPower();
		assertEquals(20000, peakPower);
		assertEquals(168000, last.capacity());
		var capacityPerModule = sut.getCapacityPerModule();
		assertEquals(2800, capacityPerModule);
	}

	@Test
	public void testHome30() {
		var sut = Product.getProduct("home-30");
		var ptd = sut.getProductTowerDetails();
		assertEquals(28, count(ptd));
		var last = lastProductData(ptd);
		var peakPower = sut.getPeakPower();
		assertEquals(30000, peakPower);
		assertEquals(168000, last.capacity());
		var capacityPerModule = sut.getCapacityPerModule();
		assertEquals(2800, capacityPerModule);
	}
}
