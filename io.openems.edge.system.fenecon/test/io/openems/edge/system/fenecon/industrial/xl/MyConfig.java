package io.openems.edge.system.fenecon.industrial.xl;

import io.openems.common.test.AbstractComponentConfig;
import io.openems.common.utils.ConfigUtils;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.system.fenecon.industrial.xl.hydac.FluidCoolingMode;

@SuppressWarnings("all")
public class MyConfig extends AbstractComponentConfig implements Config {

	protected static class Builder {
		private String id;
		private StartStopConfig startStopConfig;
		private String essId;
		private String[] batteryIds;
		private String tempId;
		private String fireAlarmSysId;
		private String airCoolingId;
		private int airCoolingSetPoint;
		private String fluidCoolingId;
		private FluidCoolingMode fluidCoolingMode;
		private int fluidCoolingSetPoint;

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

		public Builder setEssId(String essId) {
			this.essId = essId;
			return this;
		}

		public Builder setBatteryIds(String... batteryIds) {
			this.batteryIds = batteryIds;
			return this;
		}

		public Builder setTempId(String tempId) {
			this.tempId = tempId;
			return this;
		}

		public Builder setFireAlarmSysId(String fireAlarmSysId) {
			this.fireAlarmSysId = fireAlarmSysId;
			return this;
		}

		public Builder setAirCoolingId(String airCoolingId) {
			this.airCoolingId = airCoolingId;
			return this;
		}

		public Builder setAirCoolingSetPoint(int airCoolingSetPoint) {
			this.airCoolingSetPoint = airCoolingSetPoint;
			return this;
		}

		public Builder setFluidCoolingId(String fluidCoolingId) {
			this.fluidCoolingId = fluidCoolingId;
			return this;
		}

		public Builder setFluidCoolingMode(FluidCoolingMode fluidCoolingMode) {
			this.fluidCoolingMode = fluidCoolingMode;
			return this;
		}

		public Builder setFluidCoolingSetPoint(int fluidCoolingSetPoint) {
			this.fluidCoolingSetPoint = fluidCoolingSetPoint;
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
	public String ess_id() {
		return this.builder.essId;
	}

	@Override
	public String[] battery_ids() {
		return this.builder.batteryIds;
	}

	@Override
	public String temp_id() {
		return this.builder.tempId;
	}

	@Override
	public String fireAlarmSystem_id() {
		return this.builder.fireAlarmSysId;
	}

	@Override
	public String airCooling_id() {
		return this.builder.airCoolingId;
	}

	@Override
	public int airCoolingSetPoint() {
		return this.builder.airCoolingSetPoint;
	}

	@Override
	public String fluidCooling_id() {
		return this.builder.fluidCoolingId;
	}

	@Override
	public FluidCoolingMode fluidCoolingMode() {
		return this.builder.fluidCoolingMode;
	}

	@Override
	public int fluidCoolingSetPoint() {
		return this.builder.fluidCoolingSetPoint;
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