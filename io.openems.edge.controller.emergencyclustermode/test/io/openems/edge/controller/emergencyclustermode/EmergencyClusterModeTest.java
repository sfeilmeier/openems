package io.openems.edge.controller.emergencyclustermode;

import org.junit.Test;

import io.openems.common.types.ChannelAddress;
import io.openems.edge.common.test.AbstractComponentConfig;
import io.openems.edge.common.test.DummyConfigurationAdmin;
import io.openems.edge.controller.test.ControllerTest;
import io.openems.edge.ess.test.DummyManagedSymmetricEss;
import io.openems.edge.meter.test.DummySymmetricMeter;
import io.openems.edge.pvinverter.test.DummySymmetricPvInverter;
import io.openems.edge.io.test.DummyInputOutput;

/*
 * Example JUNit test case
 *
 */

public class EmergencyClusterModeTest {

	@SuppressWarnings("all")
	private static class MyConfig extends AbstractComponentConfig implements Config {

		// 
		private final boolean allowChargeFromAC;
		private final boolean gridFeedLimitation;
		private final boolean remoteStart;
		private final boolean isRemoteControlled;
		private final int maxGridFeedPower;
		private final int remoteActivePower;
		
		// devices
		private final String pvInverter;
		private final String primaryEssId;
		private final String backupEssId;
		private final String gridMeterId;
		private final String pvMeterId;
		
		// switches
		private final String Q1_inputChannelAddress;
		private final String Q1_outputChannelAddress;
		private final String Q2_inputChannelAddress;
		private final String Q2_outputChannelAddress;
		private final String Q3_inputChannelAddress;
		private final String Q3_outputChannelAddress;
		private final String Q4_inputChannelAddress;
		private final String Q4_outputChannelAddress;

		public MyConfig(
				String id,
				boolean allowChargeFromAC,
				boolean gridFeedLimitation,
				boolean remoteStart,
				boolean isRemoteControlled,
				int maxGridFeedPower,
				int remoteActivePower,
				String pvInverter,
				String primaryEssId,
				String backupEssId,
				String gridMeterId,
				String pvMeterId,
				String Q1_inputChannelAddress,
				String Q1_outputChannelAddress,
				String Q2_inputChannelAddress,
				String Q2_outputChannelAddress,
				String Q3_inputChannelAddress,
				String Q3_outputChannelAddress,
				String Q4_inputChannelAddress,
				String Q4_outputChannelAddress) {
			super(Config.class, id);
			
			this.allowChargeFromAC = allowChargeFromAC;
			this.gridFeedLimitation = gridFeedLimitation;
			this.remoteStart = remoteStart;
			this.isRemoteControlled = isRemoteControlled;
			this.maxGridFeedPower = maxGridFeedPower;
			this.remoteActivePower = remoteActivePower;
			
			this.pvInverter = pvInverter;
			this.primaryEssId = primaryEssId;
			this.backupEssId = backupEssId;
			this.gridMeterId = gridMeterId;
			this.pvMeterId = pvMeterId;
			
			this.Q1_inputChannelAddress = Q1_inputChannelAddress;
			this.Q1_outputChannelAddress = Q1_outputChannelAddress;
			this.Q2_inputChannelAddress = Q2_inputChannelAddress;
			this.Q2_outputChannelAddress = Q2_outputChannelAddress;
			this.Q3_inputChannelAddress = Q3_inputChannelAddress;
			this.Q3_outputChannelAddress = Q3_outputChannelAddress;
			this.Q4_inputChannelAddress = Q4_inputChannelAddress;
			this.Q4_outputChannelAddress = Q4_outputChannelAddress;
		}

		@Override
		public boolean allowChargeFromAC() {
			return this.allowChargeFromAC;
		}

		@Override
		public boolean gridFeedLimitation() {
			return this.gridFeedLimitation;
		}

		@Override
		public boolean isRemoteControlled() {
			return this.isRemoteControlled;
		}

		@Override
		public boolean remoteStart() {
			return this.remoteStart;
		}

		@Override
		public int maxGridFeedPower() {
			return this.maxGridFeedPower;
		}

		@Override
		public int remoteActivePower() {
			return this.remoteActivePower;
		}

		@Override
		public String pv_inverter_id() {
			return this.pvInverter;
		}

		@Override
		public String pv_inverter_target() {
			return "";
		}

		@Override
		public String Q1_inputChannelAddress() {
			return this.Q1_inputChannelAddress;
		}

		@Override
		public String Q1_inputComponent_target() {
			return "";
		}

		@Override
		public String Q1_outputChannelAddress() {
			return this.Q1_outputChannelAddress;
		}

		@Override
		public String Q1_outputComponent_target() {
			return "";
		}

		@Override
		public String Q2_inputChannelAddress() {
			return this.Q2_inputChannelAddress;
		}

		@Override
		public String Q2_inputComponent_target() {
			return "";
		}

		@Override
		public String Q2_outputChannelAddress() {
			return this.Q2_outputChannelAddress;
		}

		@Override
		public String Q2_outputComponent_target() {
			return "";
		}

		@Override
		public String Q3_inputChannelAddress() {
			return this.Q3_inputChannelAddress;
		}

		@Override
		public String Q3_inputComponent_target() {
			return "";
		}

		@Override
		public String Q3_outputChannelAddress() {
			return this.Q3_outputChannelAddress;
		}

		@Override
		public String Q3_outputComponent_target() {
			return "";
		}

		@Override
		public String Q4_inputChannelAddress() {
			return this.Q4_inputChannelAddress;
		}

		@Override
		public String Q4_inputComponent_target() {
			return "";
		}

		@Override
		public String Q4_outputChannelAddress() {
			return this.Q4_outputChannelAddress;
		}

		@Override
		public String Q4_outputComponent_target() {
			return "";
		}

		@Override
		public String grid_meter_id() {
			return this.gridMeterId;
		}

		@Override
		public String grid_meter_target() {
			return "";
		}

		@Override
		public String pv_meter_id() {
			return this.pvMeterId;
		}

		@Override
		public String pv_meter_target() {
			return "";
		}

		@Override
		public String primary_ess_id() {
			return this.primaryEssId;
		}

		@Override
		public String primary_ess_target() {
			return "";
		}

		@Override
		public String backup_ess_id() {
			return this.backupEssId;
		}

		@Override
		public String backup_ess_target() {
			return "";
		}

	}
	
	@Test
	public void testOnGrid() throws Exception {
		EmergencyClusterMode controller = this.setUp();
		
		new ControllerTest(
				controller,
				controller.primaryEss,
				controller.backupEss,
				controller.gridMeter,
				controller.pvMeter,
				controller.pvInverter,
				controller.backupEssSwitchInputComponent,
				controller.backupEssSwitchOutputComponent,
				controller.primaryEssSwitchInputComponent,
				controller.primaryEssSwitchOutputComponent,
				controller.pvOffGridSwitchInputComponent,
				controller.pvOffGridSwitchOutputComponent,
				controller.pvOnGridSwitchInputComponent,
				controller.pvOnGridSwitchOutputComponent)
		.run();
	}
	
	@Test 
	public void testOffGrid() throws Exception {
		
	}
	
	private EmergencyClusterMode setUp() throws Exception {
		
		// init controller
		EmergencyClusterMode controller = new EmergencyClusterMode();
		
		// add references
		controller.cm = new DummyConfigurationAdmin();
		controller.primaryEss = new DummyManagedSymmetricEss("ess0");
		controller.backupEss = new DummyManagedSymmetricEss("ess1");
		controller.gridMeter = new DummySymmetricMeter("meter0");
		controller.pvMeter = new DummySymmetricMeter("meter1");
		controller.pvInverter = new DummySymmetricPvInverter("inverter0");
		DummyInputOutput inputOutput = new DummyInputOutput("io0");
		controller.backupEssSwitchInputComponent = inputOutput;
		controller.backupEssSwitchOutputComponent = inputOutput;
		controller.primaryEssSwitchInputComponent = inputOutput;
		controller.primaryEssSwitchOutputComponent = inputOutput;
		controller.pvOffGridSwitchInputComponent = inputOutput;
		controller.pvOffGridSwitchOutputComponent = inputOutput;
		controller.pvOnGridSwitchInputComponent = inputOutput;
		controller.pvOnGridSwitchOutputComponent = inputOutput;
		
		// activate
		ChannelAddress output0 = new ChannelAddress("io0", "InputOutput0");
		ChannelAddress output1 = new ChannelAddress("io0", "InputOutput1");
		ChannelAddress output2 = new ChannelAddress("io0", "InputOutput2");
		ChannelAddress output3 = new ChannelAddress("io0", "InputOutput3");
		ChannelAddress output4 = new ChannelAddress("io0", "InputOutput4");
		ChannelAddress output5 = new ChannelAddress("io0", "InputOutput5");
		ChannelAddress output6 = new ChannelAddress("io0", "InputOutput6");
		ChannelAddress output7 = new ChannelAddress("io0", "InputOutput7");
		
		MyConfig config = new MyConfig(
				"ctrlEmergencyClusterMode0",
				true,
				true,
				true,
				true,
				40000,
				40000,
				"inverter0",
				"ess0",
				"ess1",
				"meter0",
				"meter1",
				output0.toString(),
				output1.toString(),
				output2.toString(),
				output3.toString(),
				output4.toString(),
				output5.toString(),
				output6.toString(),
				output7.toString()
		);
		
		controller.activate(null, config);
		// twice, so that reference target is set
		controller.activate(null, config);
		
		return controller;
	}
}
