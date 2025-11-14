package io.openems.edge.system.fenecon.industrial.l;

import io.openems.common.test.AbstractComponentConfig;
import io.openems.common.utils.ConfigUtils;
import io.openems.edge.common.startstop.StartStopConfig;
import io.openems.edge.system.fenecon.industrial.l.envicool.Envicool;

@SuppressWarnings("all")
public class MyConfig extends AbstractComponentConfig implements Config {

	protected static class Builder {
		private String id;
		private StartStopConfig startStopConfig;
		private String essId;
		private String[] batteryIds;
		private String coolingUnitModbusId;
		private Envicool.Mode coolingUnitMode;
		private int coolingUnitModbusUnitId;
		private int coolingUnitCoolingSetPoint;
		private int coolingUnitHeatingSetPoint;
		private boolean isSmokeDetectionInstalled;

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

		public Builder setCoolingUnitModbusId(String coolingUnitModbusId) {
			this.coolingUnitModbusId = coolingUnitModbusId;
			return this;
		}

		public Builder setCoolingUnitMode(Envicool.Mode coolingUnitMode) {
			this.coolingUnitMode = coolingUnitMode;
			return this;
		}

		public Builder setCoolingUnitModbusUnitId(int coolingUnitModbusUnitId) {
			this.coolingUnitModbusUnitId = coolingUnitModbusUnitId;
			return this;
		}

		public Builder setCoolingUnitCoolingSetPoint(int coolingUnitCoolingSetPoint) {
			this.coolingUnitCoolingSetPoint = coolingUnitCoolingSetPoint;
			return this;
		}

		public Builder setCoolingUnitHeatingSetPoint(int coolingUnitHeatingSetPoint) {
			this.coolingUnitHeatingSetPoint = coolingUnitHeatingSetPoint;
			return this;
		}

		public Builder setIsSmokeDetectionInstalled(boolean isSmokeDetectionInstalled) {
			this.isSmokeDetectionInstalled = isSmokeDetectionInstalled;
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
	public String[] battery_ids() {
		return this.builder.batteryIds;
	}

	@Override
	public String coolingUnitModbus_id() {
		return this.builder.coolingUnitModbusId;
	}

	@Override
	public StartStopConfig startStop() {
		return this.builder.startStopConfig;
	}

	@Override
	public int coolingUnitModbusUnitId() {
		return this.builder.coolingUnitModbusUnitId;
	}

	@Override
	public Envicool.Mode coolingUnitMode() {
		return this.builder.coolingUnitMode;
	}

	@Override
	public int coolingUnitCoolingSetPoint() {
		return this.builder.coolingUnitCoolingSetPoint;
	}

	@Override
	public int coolingUnitHeatingSetPoint() {
		return this.builder.coolingUnitHeatingSetPoint;
	}

	public boolean isSmokeDetectionInstalled() {
		return this.builder.isSmokeDetectionInstalled;
	}

	@Override
	public String ess_id() {
		return this.builder.essId;
	}

	@Override
	public String ess_target() {
		return ConfigUtils.generateReferenceTargetFilter(this.id(), this.ess_id());
	}

	@Override
	public String Battery_target() {
		return ConfigUtils.generateReferenceTargetFilter(this.id(), this.battery_ids());
	}

	@Override
	public String CoolingUnitModbus_target() {
		return ConfigUtils.generateReferenceTargetFilter(this.id(), this.coolingUnitModbus_id());
	}
}