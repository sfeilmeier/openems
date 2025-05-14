package io.openems.backend.simulation.engine.possiblebatterycapacityextension;

import static io.openems.common.utils.CollectorUtils.toNavigableMap;

import java.util.Map.Entry;
import java.util.NavigableMap;

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
	public default NavigableMap<Integer, ProductData> getProductDetails() {
		return this.getProductTowerDetails().values().stream() //
				.flatMap(t -> t.entrySet().stream()) //
				.collect(toNavigableMap(Entry::getKey, Entry::getValue, (t, u) -> t));
	}

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
		case Home10Gen1.TYPE -> new Home10Gen1();
		case Home10Gen2.TYPE -> new Home10Gen2();
		case Home6.TYPE -> new Home6();
		case Home15.TYPE -> new Home15();
		case Home20.TYPE -> new Home20();
		case Home30.TYPE -> new Home30();
		default -> null;
		};
	}

	public static final class Home10Gen1 implements Product {

		public static final String TYPE = "home";

		@Override
		public NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails() {
			return ImmutableSortedMap.<Integer, ImmutableSortedMap<Integer, ProductData>>naturalOrder()
					.put(1, ImmutableSortedMap.<Integer, ProductData>naturalOrder() //
							.put(4, new ProductData(4480, 8800)) //
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
	}

	public static final class Home6 implements Product {

		public static final String TYPE = "home-6";

		@Override
		public NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails() {
			return ImmutableSortedMap.<Integer, ImmutableSortedMap<Integer, ProductData>>naturalOrder()
					.put(1, ImmutableSortedMap.<Integer, ProductData>naturalOrder() //
							.put(3, new ProductData(4030, 8400)) //
							.put(4, new ProductData(5380, 11200)) //
							.put(5, new ProductData(6000, 14000)) //
							.put(6, new ProductData(6000, 16800)) //
							.put(7, new ProductData(6000, 19600)) //
							.put(8, new ProductData(6000, 22400)) //
							.put(9, new ProductData(6000, 25200)) //
							.put(10, new ProductData(6000, 28000)) //
							.put(11, new ProductData(6000, 30800)) //
							.put(12, new ProductData(6000, 33600)) //
							.put(13, new ProductData(6000, 36400)) //
							.put(14, new ProductData(6000, 39200)) //
							.build())
					.put(2, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(16, new ProductData(6000, 44800)) //
							.put(18, new ProductData(6000, 50400)) //
							.put(20, new ProductData(6000, 56000)) //
							.put(22, new ProductData(6000, 61600)) //
							.put(24, new ProductData(6000, 67200)) //
							.put(26, new ProductData(6000, 72800)) //
							.put(28, new ProductData(6000, 78400)) //
							.build())
					.put(3, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(33, new ProductData(6000, 92400)) //
							.put(36, new ProductData(6000, 100800)) //
							.put(39, new ProductData(6000, 109200)) //
							.put(42, new ProductData(6000, 117600)) //
							.build())
					.put(4, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(48, new ProductData(6000, 134400)) //
							.put(52, new ProductData(6000, 145600)) //
							.put(56, new ProductData(6000, 156800)) //
							.build())
					.build();
		}
	}

	public static final class Home10Gen2 implements Product {

		public static final String TYPE = "home-10";

		@Override
		public NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails() {
			return ImmutableSortedMap.<Integer, ImmutableSortedMap<Integer, ProductData>>naturalOrder()
					.put(1, ImmutableSortedMap.<Integer, ProductData>naturalOrder() //
							.put(3, new ProductData(5380, 8400)) //
							.put(4, new ProductData(7170, 11200)) //
							.put(5, new ProductData(8960, 14000)) //
							.put(6, new ProductData(10000, 16800)) //
							.put(7, new ProductData(10000, 19600)) //
							.put(8, new ProductData(10000, 22400)) //
							.put(9, new ProductData(10000, 25200)) //
							.put(10, new ProductData(10000, 28000)) //
							.put(11, new ProductData(10000, 30800)) //
							.put(12, new ProductData(10000, 33600)) //
							.put(13, new ProductData(10000, 36400)) //
							.put(14, new ProductData(10000, 39200)) //
							.build())
					.put(2, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(16, new ProductData(10000, 44800)) //
							.put(18, new ProductData(10000, 50400)) //
							.put(20, new ProductData(10000, 56000)) //
							.put(22, new ProductData(10000, 61600)) //
							.put(24, new ProductData(10000, 67200)) //
							.put(26, new ProductData(10000, 72800)) //
							.put(28, new ProductData(10000, 78400)) //
							.build())
					.put(3, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(33, new ProductData(10000, 92400)) //
							.put(36, new ProductData(10000, 100800)) //
							.put(39, new ProductData(10000, 109200)) //
							.put(42, new ProductData(10000, 117600)) //
							.build())
					.put(4, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(48, new ProductData(10000, 134400)) //
							.put(52, new ProductData(10000, 145600)) //
							.put(56, new ProductData(10000, 156800)) //
							.build())
					.build();
		}
	}

	public static final class Home15 implements Product {

		public static final String TYPE = "home-15";

		@Override
		public NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails() {
			return ImmutableSortedMap.<Integer, ImmutableSortedMap<Integer, ProductData>>naturalOrder()
					.put(1, ImmutableSortedMap.<Integer, ProductData>naturalOrder() //
							.put(3, new ProductData(5380, 8400)) //
							.put(4, new ProductData(7170, 11200)) //
							.put(5, new ProductData(8960, 14000)) //
							.put(6, new ProductData(10750, 16800)) //
							.put(7, new ProductData(12540, 19600)) //
							.put(8, new ProductData(14340, 22400)) //
							.put(9, new ProductData(15000, 25200)) //
							.put(10, new ProductData(15000, 28000)) //
							.put(11, new ProductData(15000, 30800)) //
							.put(12, new ProductData(15000, 33600)) //
							.put(13, new ProductData(15000, 36400)) //
							.put(14, new ProductData(15000, 39200)) //
							.build())
					.put(2, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(16, new ProductData(14340, 44800)) //
							.put(18, new ProductData(15000, 50400)) //
							.put(20, new ProductData(15000, 56000)) //
							.put(22, new ProductData(15000, 61600)) //
							.put(24, new ProductData(15000, 67200)) //
							.put(26, new ProductData(15000, 72800)) //
							.put(28, new ProductData(15000, 78400)) //
							.build())
					.put(3, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(33, new ProductData(15000, 92400)) //
							.put(36, new ProductData(15000, 100800)) //
							.put(39, new ProductData(15000, 109200)) //
							.put(42, new ProductData(15000, 117600)) //
							.build())
					.put(4, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(48, new ProductData(15000, 134400)) //
							.put(52, new ProductData(15000, 145600)) //
							.put(56, new ProductData(15000, 156800)) //
							.build())
					.build();
		}
	}

	public static final class Home20 implements Product {

		public static final String TYPE = "home-20";

		@Override
		public NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails() {
			return ImmutableSortedMap.<Integer, ImmutableSortedMap<Integer, ProductData>>naturalOrder()
					.put(1, ImmutableSortedMap.<Integer, ProductData>naturalOrder() //
							.put(5, new ProductData(11200, 14000)) //
							.put(6, new ProductData(13440, 16800)) //
							.put(7, new ProductData(15680, 19600)) //
							.put(8, new ProductData(17920, 22400)) //
							.put(9, new ProductData(20000, 25200)) //
							.put(10, new ProductData(20000, 28000)) //
							.put(11, new ProductData(20000, 30800)) //
							.put(12, new ProductData(20000, 33600)) //
							.put(13, new ProductData(20000, 36400)) //
							.put(14, new ProductData(20000, 39200)) //
							.put(15, new ProductData(20000, 42000)) //
							.build())
					.put(2, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(16, new ProductData(17920, 44800)) //
							.put(18, new ProductData(20000, 50400)) //
							.put(20, new ProductData(20000, 56000)) //
							.put(22, new ProductData(20000, 61600)) //
							.put(24, new ProductData(20000, 67200)) //
							.put(26, new ProductData(20000, 72800)) //
							.put(28, new ProductData(20000, 78400)) //
							.put(30, new ProductData(20000, 84000)) //
							.build())
					.put(3, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(33, new ProductData(20000, 92400)) //
							.put(36, new ProductData(20000, 100800)) //
							.put(39, new ProductData(20000, 109200)) //
							.put(42, new ProductData(20000, 117600)) //
							.put(45, new ProductData(20000, 126000)) //
							.build())
					.put(4, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(48, new ProductData(20000, 134400)) //
							.put(52, new ProductData(20000, 145600)) //
							.put(56, new ProductData(20000, 156800)) //
							.put(56, new ProductData(20000, 168000)) //
							.build())
					.build();
		}
	}

	public static final class Home30 implements Product {

		public static final String TYPE = "home-30";

		@Override
		public NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails() {
			return ImmutableSortedMap.<Integer, ImmutableSortedMap<Integer, ProductData>>naturalOrder()
					.put(1, ImmutableSortedMap.<Integer, ProductData>naturalOrder() //
							.put(5, new ProductData(11200, 14000)) //
							.put(6, new ProductData(13440, 16800)) //
							.put(7, new ProductData(15680, 19600)) //
							.put(8, new ProductData(17920, 22400)) //
							.put(9, new ProductData(20160, 25200)) //
							.put(10, new ProductData(22400, 28000)) //
							.put(11, new ProductData(24640, 30800)) //
							.put(12, new ProductData(26880, 33600)) //
							.put(13, new ProductData(29120, 36400)) //
							.put(14, new ProductData(30000, 39200)) //
							.put(15, new ProductData(30000, 42000)) //
							.build())
					.put(2, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(16, new ProductData(17920, 44800)) //
							.put(18, new ProductData(20160, 50400)) //
							.put(20, new ProductData(22400, 56000)) //
							.put(22, new ProductData(24640, 61600)) //
							.put(24, new ProductData(26880, 67200)) //
							.put(26, new ProductData(29120, 72800)) //
							.put(28, new ProductData(30000, 78400)) //
							.put(28, new ProductData(30000, 84000)) //
							.build())
					.put(3, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(33, new ProductData(24640, 92400)) //
							.put(36, new ProductData(26880, 100800)) //
							.put(39, new ProductData(29120, 109200)) //
							.put(42, new ProductData(30000, 117600)) //
							.put(45, new ProductData(30000, 126000)) //
							.build())
					.put(4, ImmutableSortedMap.<Integer, ProductData>naturalOrder()
							.put(48, new ProductData(26880, 134400)) //
							.put(52, new ProductData(29120, 145600)) //
							.put(56, new ProductData(20000, 156800)) //
							.put(56, new ProductData(20000, 168000)) //
							.build())
					.build();
		}
	}

}