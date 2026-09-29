package io.openems.edge.system.fenecon.industrial.m;

import io.openems.common.test.AbstractComponentConfig;
import io.openems.common.utils.ConfigUtils;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.system.fenecon.industrial.enums.FluidCoolingMode;
import io.openems.edge.system.fenecon.industrial.m.enums.CoolingType;

@SuppressWarnings("all")
public class MyConfig extends AbstractComponentConfig implements Config {

	protected static class Builder {
		private String id;
		private StartStopConfig startStopConfig;
		private FluidCoolingMode coolingUnitMode;
		private CoolingType coolingType;
		private String essId;
		private String[] batteryIds;
		private String coolingUnitEnable;

		private Builder() {
		}

		public Builder setId(String id) {
			this.id = id;
			return this;
		}

		public Builder setStartStopConfig(StartStopConfig startStopConfig) {
			this.startStopConfig = startStopConfig;
			return this;
		}

		public Builder setCoolingUnitMode(FluidCoolingMode coolingUnitMode) {
			this.coolingUnitMode = coolingUnitMode;
			return this;
		}

		public Builder setCoolingType(CoolingType coolingtype) {
			this.coolingType = coolingtype;
			return this;
		}

		public Builder setEssId(String essId) {
			this.essId = essId;
			return this;
		}

		public Builder setBatteryIds(String... batteryIds) {
			this.batteryIds = batteryIds;
			return this;
		}

		public Builder setCoolingUnitEnable(String coolingUnitEnable) {
			this.coolingUnitEnable = coolingUnitEnable;
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
	public StartStopConfig startStop() {
		return this.builder.startStopConfig;
	}

	@Override
	public FluidCoolingMode coolingUnitMode() {
		return this.builder.coolingUnitMode;
	}

	@Override
	public CoolingType coolingType() {
		return this.builder.coolingType;
	}

	@Override
	public String ess_id() {
		return this.builder.essId;
	}

	@Override
	public String[] battery_ids() {
		return this.builder.batteryIds;
	}

	@Override
	public String coolingUnitEnable() {
		return this.builder.coolingUnitEnable;
	}

	@Override
	public String ess_target() {
		return ConfigUtils.generateReferenceTargetFilter(this.id(), this.ess_id());
	}

	@Override
	public String Battery_target() {
		return ConfigUtils.generateReferenceTargetFilter(this.id(), this.battery_ids());
	}

}
