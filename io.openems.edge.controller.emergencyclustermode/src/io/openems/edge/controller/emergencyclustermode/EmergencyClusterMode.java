package io.openems.edge.controller.emergencyclustermode;

import java.time.LocalDateTime;
import java.util.ArrayList;

import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.component.annotations.ReferencePolicyOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.osgi.service.metatype.annotations.Designate;
import org.osgi.service.component.annotations.ConfigurationPolicy;

import io.openems.common.exceptions.InvalidValueException;
import io.openems.common.exceptions.OpenemsException;
import io.openems.common.types.ChannelAddress;
import io.openems.edge.common.channel.Channel;
import io.openems.edge.common.channel.WriteChannel;
import io.openems.edge.common.component.AbstractOpenemsComponent;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.controller.api.Controller;
import io.openems.edge.ess.api.ManagedSymmetricEss;
import io.openems.edge.meter.api.SymmetricMeter;
import io.openems.edge.pvinverter.api.SymmetricPvInverter;

@Designate(ocd = Config.class, factory = true)
@Component(name = "Controller.EmergencyClusterMode", immediate = true, configurationPolicy = ConfigurationPolicy.REQUIRE)
public class EmergencyClusterMode extends AbstractOpenemsComponent implements Controller, OpenemsComponent {

	private final Logger log = LoggerFactory.getLogger(EmergencyClusterMode.class);
	
	// defaults
	private boolean isSwitchedToOffGrid = true;
	private boolean primaryEssSwitch = false; // Q2
	private boolean backupEssSwitch = false; // Q1
	private boolean pvOnGridSwitch = false; // Q4
	private boolean pvOffGridSwitch = false; // Q3
	private int switchDealy = 10000; // 10 sec
	private int pvSwitchDealy = 10000; // 10 sec
	private int pvLimit = 100;
	private long lastPvOffGridDisconnected = 0L;
	private long waitOn = 0L;
	private long waitOff = 0L;
	
	private boolean allowChargeFromAC;
	private boolean gridFeedLimitation;
	private boolean isRemoteControlled;
	private boolean remoteStart;
	private int maxGridFeedPower;
	private int remoteActivePower;
	private ManagedSymmetricEss activeEss;
	
	
	@Reference
	protected ConfigurationAdmin cm;
	
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private SymmetricMeter gridMeter;
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private SymmetricMeter pvMeter;
	
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private SymmetricPvInverter pvInverter;
	
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private OpenemsComponent backupEssSwitchOutputComponent = null;
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private OpenemsComponent backupEssSwitchInputComponent = null;
	private WriteChannel<Boolean> backupEssSwitchWrite = null;
	private Channel<Boolean> backupEssSwitchRead = null;
	
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private OpenemsComponent primaryEssSwitchOutputComponent = null;
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private OpenemsComponent primaryEssSwitchInputComponent = null;
	private WriteChannel<Boolean> primaryEssSwitchWrite = null;
	private Channel<Boolean> primaryEssSwitchRead = null;
	
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private OpenemsComponent pvOffGridSwitchOutputComponent = null;
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private OpenemsComponent pvOffGridSwitchInputComponent = null;
	private WriteChannel<Boolean> pvOffGridSwitchWrite = null;
	private Channel<Boolean> pvOffGridSwitchRead = null;
	
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private OpenemsComponent pvOnGridSwitchOutputComponent = null;
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private OpenemsComponent pvOnGridSwitchInputComponent = null;
	private WriteChannel<Boolean> pvOnGridSwitchWrite = null;
	private Channel<Boolean> pvOnGridSwitchRead = null;

	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private ManagedSymmetricEss primaryEss;
	@Reference(policy = ReferencePolicy.STATIC, policyOption = ReferencePolicyOption.GREEDY, cardinality = ReferenceCardinality.MANDATORY)
	private ManagedSymmetricEss backupEss;
	private EssClusterWrapper cluster;
	
	
	

	@Activate
	void activate(ComponentContext context, Config config) {
		super.activate(context, config.service_pid(), config.id(), config.enabled());
		
		ArrayList<Boolean> references = new ArrayList<Boolean>();
		// update filters
		try {
			// Solar Log
			references.add(OpenemsComponent.updateReferenceFilter(cm, config.service_pid(), "pvInverter", 
					config.pv_inverter_id()));
			
			// meters
			references.add(OpenemsComponent.updateReferenceFilter(cm, config.service_pid(), "gridMeter", 
					config.grid_meter_id()));
			references.add(OpenemsComponent.updateReferenceFilter(cm, config.service_pid(), "pvMeter", 
					config.pv_meter_id()));
						
			// esss
			references.add(OpenemsComponent.updateReferenceFilter(cm, config.service_pid(), "primaryEss", 
					config.primary_ess_id()));
			references.add(OpenemsComponent.updateReferenceFilter(cm, config.service_pid(), "backupEss", 
					config.backup_ess_id()));
			
			if (!references.contains(false)) {
				// all update references passes
				return;
			}
			
			// wago
			//Q1
			ChannelAddress outputChannelAddress = ChannelAddress.fromString(config.Q1_outputChannelAddress());
			ChannelAddress inputChannelAddress = ChannelAddress.fromString(config.Q1_inputChannelAddress());
			if(OpenemsComponent.updateReferenceFilter(this.cm, config.service_pid(), "backupEssSwitchOutputComponent", 
					outputChannelAddress.getComponentId())) {
				return;
			}
			if(OpenemsComponent.updateReferenceFilter(this.cm, config.service_pid(), "backupEssSwitchInputComponent", 
					inputChannelAddress.getComponentId())) {
				return;
			}
			this.backupEssSwitchWrite = this.backupEssSwitchOutputComponent.channel(outputChannelAddress.getChannelId());
			this.backupEssSwitchRead = this.backupEssSwitchInputComponent.channel(inputChannelAddress.getChannelId());
			
			//Q2
			outputChannelAddress = ChannelAddress.fromString(config.Q2_outputChannelAddress());
			inputChannelAddress = ChannelAddress.fromString(config.Q2_inputChannelAddress());
			if(OpenemsComponent.updateReferenceFilter(this.cm, config.service_pid(), "primaryEssSwitchOutputComponent", 
					outputChannelAddress.getComponentId())) {
				return;
			}
			if(OpenemsComponent.updateReferenceFilter(this.cm, config.service_pid(), "primaryEssSwitchInputComponent", 
					inputChannelAddress.getComponentId())) {
				return;
			}
			this.primaryEssSwitchWrite = this.backupEssSwitchOutputComponent.channel(outputChannelAddress.getChannelId());
			this.primaryEssSwitchRead = this.backupEssSwitchInputComponent.channel(inputChannelAddress.getChannelId());
			
			//Q3
			outputChannelAddress = ChannelAddress.fromString(config.Q3_outputChannelAddress());
			inputChannelAddress = ChannelAddress.fromString(config.Q3_inputChannelAddress());
			if(OpenemsComponent.updateReferenceFilter(this.cm, config.service_pid(), "pvOffGridSwitchOutputComponent", 
					outputChannelAddress.getComponentId())) {
				return;
			}
			if(OpenemsComponent.updateReferenceFilter(this.cm, config.service_pid(), "pvOffGridSwitchInputComponent", 
					inputChannelAddress.getComponentId())) {
				return;
			}
			this.pvOffGridSwitchWrite = this.backupEssSwitchOutputComponent.channel(outputChannelAddress.getChannelId());
			this.pvOffGridSwitchRead = this.backupEssSwitchInputComponent.channel(inputChannelAddress.getChannelId());
			
			//Q4
			outputChannelAddress = ChannelAddress.fromString(config.Q4_outputChannelAddress());
			inputChannelAddress = ChannelAddress.fromString(config.Q4_inputChannelAddress());
			if(OpenemsComponent.updateReferenceFilter(this.cm, config.service_pid(), "pvOnGridSwitchOutputComponent", 
					outputChannelAddress.getComponentId())) {
				return;
			}
			if(OpenemsComponent.updateReferenceFilter(this.cm, config.service_pid(), "pvOnGridSwitchInputComponent", 
					inputChannelAddress.getComponentId())) {
				return;
			}
			this.pvOnGridSwitchWrite = this.backupEssSwitchOutputComponent.channel(outputChannelAddress.getChannelId());
			this.pvOnGridSwitchRead = this.backupEssSwitchInputComponent.channel(inputChannelAddress.getChannelId());
			
		} catch (OpenemsException e) {
			e.printStackTrace();
		}
		
		// make some preparations here
		this.maxGridFeedPower = config.maxGridFeedPower();
		this.allowChargeFromAC = config.allowChargeFromAC();
		this.remoteActivePower = config.remoteActivePower();
		this.gridFeedLimitation = config.gridFeedLimitation();
		this.remoteStart = config.remoteStart();
		this.isRemoteControlled = config.isRemoteControlled();
		this.activeEss = this.primaryEss;
		this.cluster = new EssClusterWrapper();
		this.cluster.add(this.primaryEss);
		this.cluster.add(this.backupEss);
		
		// check current grid state
		if (this.cluster.isOnGrid()) {
			try {
				if (this.isSwitchedToOnGrid()) {
					this.pvOnGridSwitch = true;
					this.pvOffGridSwitch = false;
					this.primaryEssSwitch = true;
					this.backupEssSwitch = false;
					this.pvLimit = this.pvInverter.getActivePower().value().get();
					this.isSwitchedToOffGrid = false;
				} else {
					this.isSwitchedToOffGrid = true;
				}
			} catch (InvalidValueException e) {
				log.error(e.getMessage());
			}
			
		} else {
			this.isSwitchedToOffGrid = false;
		}
		
		this.log.debug("EmergencyClusterMode bundle activated");
	}

	@Deactivate
	protected void deactivate() {
		super.deactivate();
	}

	@Override
	public void run() {
		if (this.remoteStart) {
			try {
				if (this.cluster.isOnGrid()) {
					this.onGrid();
				} else {
					this.offGrid();
				}
				
				this.pvInverter.getActivePowerLimit().setNextWriteValue(this.pvLimit);
				this.pvOnGridSwitchWrite.setNextWriteValue(this.pvOnGridSwitch);
				this.pvOffGridSwitchWrite.setNextWriteValue(this.pvOffGridSwitch);
				this.primaryEssSwitchWrite.setNextWriteValue(this.primaryEssSwitch);
				this.backupEssSwitchWrite.setNextWriteValue(this.backupEssSwitch);
			} catch (OpenemsException e) {
				this.log.error("Error on reading remote Stop Element", e);
			}
			
		} else {
			this.log.info("Remote start is not available");
		}
	}
	
	// when ess detects on grid mode
	private void onGrid() {
		if (this.isSwitchedToOffGrid) {
			this.log.info("Switch to On-Grid");
			// system detects that grid is on, but it is currently switched off grid
		    // it means that all ESS and PV needs to be switched to onGrid
			try {
				if (this.allEssDisconnected() && !this.pvOffGridSwitchRead.value().getOrError() && !this.pvOnGridSwitchRead.value().getOrError()) {
					if (this.waitOn + this.switchDealy <= System.currentTimeMillis()) {
						this.primaryEssSwitch = false;
						this.pvLimit = this.pvInverter.getActivePower().value().getOrError();
						this.pvOnGridSwitch = true;
						this.activeEss = null;
						this.isSwitchedToOffGrid = false;
					} else {
						// wait for 10 seconds after switches are disconnected
					}
				} else {
					this.primaryEssSwitch = true;
					this.backupEssSwitch = false;
					this.pvOffGridSwitch = this.pvOnGridSwitch = false;
					this.waitOn = System.currentTimeMillis();
				}
			} catch (InvalidValueException e) {
				this.log.error("Failed to switch to OnGrid mode because there are invalid values!", e);
			}
			
		} else {
			// system detects that grid is on, and it is switched to
		    // On Grid
			try {
				int calculatedPower = this.cluster.getActivePower() + this.gridMeter.getActivePower().value().getOrError();
				int calculatedEssActivePower = calculatedPower;
				
				if (this.isRemoteControlled) {
					int maxPower = Math.abs(this.remoteActivePower);
					if (calculatedEssActivePower > maxPower) {
						calculatedEssActivePower = maxPower;
					} else if (calculatedEssActivePower < maxPower * -1){
						calculatedEssActivePower = maxPower * -1;
					}
				}
				
				int essSoc = this.cluster.getSoc();
				if (calculatedEssActivePower >= 0) {
					// discharge
					// adjust calculatedEssActivePower to max allowed discharge power
					if (this.cluster.getAllowedDischarge() < calculatedEssActivePower) {
						calculatedEssActivePower = this.cluster.getAllowedDischarge();
					}
				} else {
					// charge
					if (this.allowChargeFromAC) {
						// This is upper part of battery which is primarily used for charging during peak PV production (after 11:00h)
						int reservedSoc = 50;
						if (LocalDateTime.now().getHour() <= 11 && essSoc > 100 - reservedSoc && this.gridMeter.getActivePower().value().getOrError() < this.maxGridFeedPower) {
							//reduced charging formula – reduction based on current SOC and reservedSoc
							calculatedEssActivePower = calculatedEssActivePower / (reservedSoc * 2) * (reservedSoc - (essSoc - (100 - reservedSoc)));
						} else {
							//full charging formula – no restrictions except max charging power that batteries can accept
							if (calculatedEssActivePower < this.cluster.getAllowedCharge()) {
								calculatedEssActivePower = this.cluster.getAllowedCharge();
							}
						}
					} else {
						// charging disallowed
						calculatedEssActivePower = 0;
					}
				}
				
				if (this.gridFeedLimitation) {
					// actual formula pvCounter.power + (calculatedEssActivePower- cluster.allowedChargePower+ maxGridFeedPower+gridCounter.power)
					this.pvLimit = this.pvMeter.getActivePower().value().getOrError() + 
							(calculatedEssActivePower - this.cluster.getAllowedCharge() + this.maxGridFeedPower + this.gridMeter.getActivePower().value().getOrError());
					if (this.pvLimit < 0) {
						this.pvLimit = 0;
					}
				} else {
					this.pvLimit = this.pvInverter.getActivePower().value().getOrError();
				}
				
				this.cluster.applyPower(calculatedEssActivePower, 0);
				
			} catch (InvalidValueException e) {
				this.log.error("An error occured on controll the storages!", e);
				this.pvLimit = 0;
				try {
					this.cluster.applyPower(0, 0);
				} catch (InvalidValueException ee) {
					log.error("Failed to stop ess!");
				}
			}
			
		}
	}
	
	// when ess detects off grid mode
	private void offGrid(){
		if (this.isSwitchedToOffGrid) {
			// the system detects that is is off grid and it is
		    // switched to off gird mode
			if (this.pvInverter.getActivePower().value().get() <= 35000 && this.pvMeter.getActivePower().value().get() <= 37000) {
				if (this.lastPvOffGridDisconnected + this.pvSwitchDealy <= System.currentTimeMillis()) {
					this.pvOffGridSwitch = true;
				} else {
					this.pvOffGridSwitch = false;
				}
			} else {
				this.pvOffGridSwitch = false;
				this.lastPvOffGridDisconnected = System.currentTimeMillis();
			}
			
			try {
				if (this.activeEss.getSoc().value().get() <= 5) {
					if (this.allEssDisconnected()) {
						if (this.waitOff + this.switchDealy <= System.currentTimeMillis()) {
							this.activeEss = this.backupEss;
							this.backupEssSwitch = true;
						} else {
							// wait for 10 seconds after switches are disconnected
						}
					} else {
						this.primaryEssSwitch = true;
						this.backupEssSwitch = false;
						this.pvOffGridSwitch = false;
						this.waitOff = System.currentTimeMillis();
					}
				}
				
				// disconnect PV if active soc is >= 90%
				if (this.activeEss.getSoc().value().get() >= 95) {
					this.pvOffGridSwitch = false;
				}
				// reconnect PV if active soc goes under 75%
				if (this.activeEss.getSoc().value().get() <= 75 && this.lastPvOffGridDisconnected + this.pvSwitchDealy <= System.currentTimeMillis() ) {
					this.pvOffGridSwitch = true;
				}
			} catch (InvalidValueException e) {
				this.log.error("Can't switch to the next storage, because ther are invalid values", e);
			}
			
		} else {
			// the system detects that is is off grid and it is
		    // NOT switched to off gird mode (UPS is running)
		    // it means that all ESS and PV needs to be switched to offGrid
			try {
				if (this.allEssDisconnected() && !this.pvOffGridSwitchRead.value().get() && !this.pvOnGridSwitchRead.value().get()) {
					if (this.waitOff <= System.currentTimeMillis()) {
						this.primaryEssSwitch = false;
						this.activeEss = this.primaryEss;
						if (this.activeEss.getSoc().value().get() < 95 && this.pvInverter.getActivePower().value().get() <= 35000) {
							this.pvOffGridSwitch = true;
						}
						this.isSwitchedToOffGrid = true;
					}
				} else {
					this.primaryEssSwitch = true;
					this.backupEssSwitch = false;
					this.pvOffGridSwitch = this.pvOnGridSwitch = false;
					this.pvLimit = 35000;
					this.waitOff = System.currentTimeMillis();
				}
			} catch (InvalidValueException e) {
				this.log.error("Can't switch to OffGrid because there are invalid values!");
			}
		}
	}

	/**
	 * Checks if both ESS devices are disconnected from grid
	 * -> primaryEssSwitch is NC so it must be true to be opened <-
	 * 
	 * @return boolean
	 * */
	private boolean allEssDisconnected() throws InvalidValueException {
		if (this.primaryEssSwitchRead.value().getOrError()) {
			return false;
		}
		if (!this.backupEssSwitchRead.value().getOrError()) {
			return false;
		}
		return true;
	}
	
	/**
	 * Check if system is in On Grid mode: 
	 * - Q1 and Q3 are off
	 * - Q2 and Q4 are on (Q2 -> false)
	 * 
	 * @return boolean
	 * */
	private boolean isSwitchedToOnGrid() throws InvalidValueException {
		if (this.primaryEssSwitchRead.value().getOrError()) {
			return false;
		}
		if (!this.backupEssSwitchRead.value().getOrError()) {
			return false;
		}
		if (this.pvOffGridSwitchRead.value().getOrError()) {
			return false;
		}
		if (!this.pvOnGridSwitchRead.value().getOrError()) {
			return false;
		}
		
		return true;
	}
}
