package io.openems.backend.simulation.engine.possiblebatterycapacityextension;

import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

import com.google.common.collect.ImmutableSortedMap;

import io.openems.backend.simulation.engine.possiblebatterycapacityextension.PossibleBatteryCapacityExtensionUtil.ProductData;

public sealed interface Product {

	/**
	 * Gets the maximum modules per tower.
	 * 
	 * @param numberOfTowers the number of tower
	 * @return the maximum number of modules per tower
	 */
	public default int getMaxNumberOfModulesPerTower(int numberOfTowers) {
		return this.getProductTowerDetails().get(numberOfTowers).lastKey();
	}

	/**
	 * Gets the product details.
	 * 
	 * @return product details
	 */
	public NavigableMap<Integer, ProductData> getProductDetails();

	/**
	 * Gets the product details.
	 * 
	 * @return product details
	 */
	public NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails();

	/**
	 * Gets the Product from a product type.
	 * 
	 * @param producttype the product type
	 * @return the Product
	 */
	public static Product getProduct(String producttype) {
		return switch (producttype) {
		case Home.TYPE -> new Home();
		default -> null;
		};
	}

	public static final class Home implements Product {

		public static final String TYPE = "home";

		@Override
		public NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails() {
			return ImmutableSortedMap.<Integer, ImmutableSortedMap<Integer, ProductData>>naturalOrder()
					.put(1, ImmutableSortedMap.<Integer, ProductData>naturalOrder().put(4, new ProductData(4480, 8800))
							.put(5, new ProductData(5600, 11000)) //
							.put(6, new ProductData(6720, 13200)) //
							.put(7, new ProductData(7840, 15400)) //
							.put(8, new ProductData(8960, 17600)) //
							.put(9, new ProductData(10000, 19800)) //
							.put(10, new ProductData(10000, 22000)) //
							.build())
					.put(2, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(12, new ProductData(10000, 26400)) //
							.put(14, new ProductData(10000, 30800)) //
							.put(16, new ProductData(10000, 35200)) //
							.put(18, new ProductData(10000, 39600)) //
							.put(20, new ProductData(10000, 44000)) //
							.build())
					.put(3, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(21, new ProductData(10000, 46200)) //
							.put(24, new ProductData(10000, 52800)) //
							.put(27, new ProductData(10000, 59400)) //
							.put(30, new ProductData(10000, 66000)) //
							.build())
					.build();
		}

		@Override
		public NavigableMap<Integer, ProductData> getProductDetails() {
			return this.getProductTowerDetails().values().stream() //
					.flatMap(t -> t.entrySet().stream()) //
					.collect(Collectors.toMap(Entry::getKey, Entry::getValue, (t, u) -> u, TreeMap::new));
		}
	}
}