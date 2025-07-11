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
		private String emergencyStopState;
		private String acknowledgeEmergencyStop;
		private String spdTripped;
		private String fuseTripped;
		private String psuTriggered;
		private boolean isSmokeDetectionInstalled;
		private String smokeDetection;
		private String smokeDetectionFailure;
		private String bmsHardReset;

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

		public Builder setEmergencyStopState(String emergencyStopState) {
			this.emergencyStopState = emergencyStopState;
			return this;
		}

		public Builder setAcknowledgeEmergencyStop(String acknowledgeEmergencyStop) {
			this.acknowledgeEmergencyStop = acknowledgeEmergencyStop;
			return this;
		}

		public Builder setSpdTripped(String spdTripped) {
			this.spdTripped = spdTripped;
			return this;
		}

		public Builder setFuseTripped(String fuseTripped) {
			this.fuseTripped = fuseTripped;
			return this;
		}

		public Builder setPsuTriggered(String psuTriggered) {
			this.psuTriggered = psuTriggered;
			return this;
		}

		public Builder setIsSmokeDetectionInstalled(boolean isSmokeDetectionInstalled) {
			this.isSmokeDetectionInstalled = isSmokeDetectionInstalled;
			return this;
		}

		public Builder setSmokeDetection(String smokeDetection) {
			this.smokeDetection = smokeDetection;
			return this;
		}

		public Builder setSmokeDetectionFailure(String smokeDetectionFailure) {
			this.smokeDetectionFailure = smokeDetectionFailure;
			return this;
		}

		public Builder setBmsHardReset(String bmsHardReset) {
			this.bmsHardReset = bmsHardReset;
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

	@Override
	public String emergencyStopState() {
		return this.builder.emergencyStopState;
	}

	@Override
	public String acknowledgeEmergencyStop() {
		return this.builder.acknowledgeEmergencyStop;
	}

	@Override
	public String spdTripped() {
		return this.builder.spdTripped;
	}

	@Override
	public String fuseTripped() {
		return this.builder.fuseTripped;
	}

	@Override
	public String psuTriggered() {
		return this.builder.psuTriggered;
	}

	@Override
	public boolean isSmokeDetectionInstalled() {
		return this.builder.isSmokeDetectionInstalled;
	}

	@Override
	public String smokeDetection() {
		return this.builder.smokeDetection;
	}

	@Override
	public String smokeDetectionFailure() {
		return this.builder.smokeDetectionFailure;
	}

	@Override
	public String bmsHardReset() {
		return this.builder.bmsHardReset;
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