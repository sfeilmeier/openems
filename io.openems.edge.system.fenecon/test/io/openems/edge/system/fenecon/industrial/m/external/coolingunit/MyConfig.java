package io.openems.edge.system.fenecon.industrial.m.external.coolingunit;

import io.openems.common.test.AbstractComponentConfig;

@SuppressWarnings("all")
public class MyConfig extends AbstractComponentConfig implements Config {

	protected static class Builder {
		private String id;
		private String[] batteryInverters;
		private String coolingUnitBmwChannelAddress;
		private String airconditioningUnitChannelAddress;
		private int thresholdTemperature;

		private Builder() {
		}

		public Builder setId(String id) {
			this.id = id;
			return this;
		}

		public Builder setBatteryInverters(String[] batteryInverters) {
			this.batteryInverters = batteryInverters;
			return this;
		}

		public Builder setCoolingUnitBmwChannelAddress(String coolingUnitBmwChannelAddress) {
			this.coolingUnitBmwChannelAddress = coolingUnitBmwChannelAddress;
			return this;
		}

		public Builder setAirconditioningUnitChannelAddress(String airconditioningUnitChannelAddress) {
			this.airconditioningUnitChannelAddress = airconditioningUnitChannelAddress;
			return this;
		}

		public Builder setThresholdTempr(int thresholdTemperature) {
			this.thresholdTemperature = thresholdTemperature;
			return this;
		}

		public MyConfig build() {
			return new MyConfig(this);
		}
	}

	/**
	 * Create a Config builder.
	 *
	 * @return a {@link Builder}
	 */
	public static Builder create() {
		return new Builder();
	}

	private final Builder builder;

	private MyConfig(Builder builder) {
		super(Config.class, builder.id);
		this.builder = builder;
	}

	@Override
	public String[] batteryInverters() {
		return this.builder.batteryInverters;
	}

	@Override
	public String coolingUnitInput() {
		return this.builder.coolingUnitBmwChannelAddress;
	}

	@Override
	public String coolingUnitOutput() {
		return this.builder.airconditioningUnitChannelAddress;
	}

	@Override
	public int thresholdTemperature() {
		return this.builder.thresholdTemperature;
	}

}
