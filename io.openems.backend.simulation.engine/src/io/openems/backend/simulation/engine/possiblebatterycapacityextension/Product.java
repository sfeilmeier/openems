package io.openems.backend.simulation.engine.possiblebatterycapacityextension;

import static io.openems.common.utils.CollectorUtils.toNavigableMap;

import java.util.Comparator;
import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.stream.IntStream;

import com.google.common.collect.ImmutableSortedMap;
import com.google.common.collect.Maps;

import io.openems.backend.simulation.engine.possiblebatterycapacityextension.PossibleBatteryCapacityExtensionUtil.ProductData;

public sealed interface Product {

	/**
	 * Gets the peak power for this product.
	 * 
	 * @return the peak power
	 */
	public default int getPeakPower() {
		return this.getProductTowerDetails().lastEntry().getValue().lastEntry().getValue().kWPeak();
	}

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

	/**
	 * Gets the capacity per module.
	 * 
	 * @return the capacity per module
	 */
	public int getCapacityPerModule();

	public abstract static sealed class Home implements Product permits Home10Gen1, Home6_10_15, Home20_30 {

		/**
		 * Gets the maximum power of the inverter in [W].
		 * 
		 * @param numberOfModulesPerTower the number of modules per tower
		 * @return the value
		 */
		protected abstract int power(int numberOfModulesPerTower);

		protected final Entry<Integer, ImmutableSortedMap<Integer, ProductData>> compatibility(int numberOfTowers,
				int fromNumberOfModulesPerTowers, int toNumberOfModulesPerTowers) {
			return Maps.immutableEntry(numberOfTowers,
					IntStream.rangeClosed(fromNumberOfModulesPerTowers, toNumberOfModulesPerTowers) //
							.mapToObj(Integer::valueOf)
							.collect(ImmutableSortedMap.<Integer, Integer, ProductData>toImmutableSortedMap(//
									Comparator.naturalOrder(), //
									numberOfModulesPerTower -> numberOfTowers * numberOfModulesPerTower, //
									numberOfModulesPerTower -> new ProductData(//
											this.power(numberOfModulesPerTower), //
											numberOfTowers * numberOfModulesPerTower * this.getCapacityPerModule()))));
		}
	}

	public static final class Home10Gen1 extends Home {

		public static final String TYPE = "home";

		@Override
		public int power(int numberOfModulesPerTower) {
			return switch (numberOfModulesPerTower) {
			case 4 -> 4480;
			case 5 -> 5600;
			case 6 -> 6720;
			case 7 -> 7840;
			case 8 -> 8960;
			case 9, 10 -> 10000;
			default -> throw new IllegalArgumentException("Unexpected value: " + numberOfModulesPerTower);
			};
		}

		@Override
		public int getCapacityPerModule() {
			return 2200;
		}

		@Override
		public NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails() {
			return ImmutableSortedMap.<Integer, ImmutableSortedMap<Integer, ProductData>>naturalOrder()
					.put(this.compatibility(1, 4, 10)) //
					.put(this.compatibility(2, 6, 10)) //
					.put(this.compatibility(3, 7, 10)) //
					.build();
		}
	}

	// CHECKSTYLE:OFF
	public abstract sealed class Home6_10_15 extends Home {
		// CHECKSTYLE:ON

		@Override
		public final int getCapacityPerModule() {
			return 2800;
		}

		@Override
		public final NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails() {
			return ImmutableSortedMap.<Integer, ImmutableSortedMap<Integer, ProductData>>naturalOrder()
					.put(this.compatibility(1, 3, 14)) //
					.put(this.compatibility(2, 8, 14)) //
					.put(this.compatibility(3, 11, 14)) //
					.put(this.compatibility(4, 12, 14)) //
					.build();
		}
	}

	public static final class Home6 extends Home6_10_15 {

		public static final String TYPE = "home-6";

		@Override
		public int power(int numberOfModulesPerTower) {
			return switch (numberOfModulesPerTower) {
			case 3 -> 4030;
			case 4 -> 5380;
			case 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 -> 6000;
			default -> throw new IllegalArgumentException("Unexpected value: " + numberOfModulesPerTower);
			};
		}
	}

	public static final class Home10Gen2 extends Home6_10_15 {

		public static final String TYPE = "home-10";

		@Override
		public int power(int numberOfModulesPerTower) {
			return switch (numberOfModulesPerTower) {
			case 3 -> 5380;
			case 4 -> 7170;
			case 5 -> 8960;
			case 6, 7, 8, 9, 10, 11, 12, 13, 14 -> 10000;
			default -> throw new IllegalArgumentException("Unexpected value: " + numberOfModulesPerTower);
			};
		}
	}

	public static final class Home15 extends Home6_10_15 {

		public static final String TYPE = "home-15";

		@Override
		public int power(int numberOfModulesPerTower) {
			return switch (numberOfModulesPerTower) {
			case 3 -> 5380;
			case 4 -> 7170;
			case 5 -> 8960;
			case 6 -> 10750;
			case 7 -> 12540;
			case 8 -> 14340;
			case 9, 10, 11, 12, 13, 14 -> 15000;
			default -> throw new IllegalArgumentException("Unexpected value: " + numberOfModulesPerTower);
			};
		}
	}

	// CHECKSTYLE:OFF
	public abstract sealed class Home20_30 extends Home {
		// CHECKSTYLE:ON

		@Override
		public final int getCapacityPerModule() {
			return 2800;
		}

		@Override
		public final NavigableMap<Integer, ImmutableSortedMap<Integer, ProductData>> getProductTowerDetails() {
			return ImmutableSortedMap.<Integer, ImmutableSortedMap<Integer, ProductData>>naturalOrder()
					.put(this.compatibility(1, 5, 15)) //
					.put(this.compatibility(2, 8, 15)) //
					.put(this.compatibility(3, 11, 15)) //
					.put(this.compatibility(4, 12, 15)) //
					.build();
		}
	}

	public static final class Home20 extends Home20_30 {

		public static final String TYPE = "home-20";

		@Override
		public int power(int numberOfModulesPerTower) {
			return switch (numberOfModulesPerTower) {
			case 5 -> 11200;
			case 6 -> 13440;
			case 7 -> 15680;
			case 8 -> 17920;
			case 9, 10, 11, 12, 13, 14, 15 -> 20000;
			default -> throw new IllegalArgumentException("Unexpected value: " + numberOfModulesPerTower);
			};
		}
	}

	public static final class Home30 extends Home20_30 {

		public static final String TYPE = "home-30";

		@Override
		public int power(int numberOfModulesPerTower) {
			return switch (numberOfModulesPerTower) {
			case 5 -> 11200;
			case 6 -> 13440;
			case 7 -> 15680;
			case 8 -> 17920;
			case 9 -> 20160;
			case 10 -> 22400;
			case 11 -> 24640;
			case 12 -> 26880;
			case 13 -> 29120;
			case 14, 15 -> 30000;
			default -> throw new IllegalArgumentException("Unexpected value: " + numberOfModulesPerTower);
			};
		}
	}

}