package io.openems.edge.controller.emergencyclustermode;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.common.exceptions.InvalidValueException;
import io.openems.edge.ess.api.ManagedSymmetricEss;
import io.openems.edge.ess.api.SymmetricEss;
import io.openems.edge.ess.power.api.Phase;
import io.openems.edge.ess.power.api.PowerException;
import io.openems.edge.ess.power.api.Pwr;
import io.openems.edge.ess.power.api.Relationship;

/**
 * Simple cluster wrapper
 * */
class EssClusterWrapper {
	
	private final Logger log = LoggerFactory.getLogger(EssClusterWrapper.class);
	private List<ManagedSymmetricEss> esss = new ArrayList<>();
	
	public void add(ManagedSymmetricEss ess){
		esss.add(ess);
	}
	
	/**
	 * Check if both ESS are on grid
	 * 
	 * @return boolean
	 * */
	public boolean isOnGrid() {
		for (ManagedSymmetricEss ess : esss) {
			Optional<Enum<?>> gridMode = ess.getGridMode().value().asEnumOptional();
			if(gridMode.orElse(SymmetricEss.GridMode.OFF_GRID) == SymmetricEss.GridMode.OFF_GRID) {
				return false;
			}
		}
		
		return true;
	}
	
	/**
	 * @param int active
	 * @param int reactive
	 * */
	public void applyPower(int active, int reactive) throws InvalidValueException{
		try {
			for (ManagedSymmetricEss ess : esss) {
				ess.addPowerConstraintAndValidate("Balancing P", Phase.ALL, Pwr.ACTIVE, Relationship.EQUALS, active);
				ess.addPowerConstraintAndValidate("Balancing Q", Phase.ALL, Pwr.REACTIVE, Relationship.EQUALS, reactive);
			}
		} catch (PowerException e) {
			this.log.error(e.getMessage());
			throw new InvalidValueException(e.getMessage());
		}
		
	}
	
	/**
	 * @return int activePower
	 * */
	public int getActivePower() {
		int activePower = 0;
		try {
			for (ManagedSymmetricEss ess : esss) {
				activePower += ess.getActivePower().value().getOrError();
			}
		} catch (InvalidValueException e) {
			this.log.error(e.getMessage());
		}
		return activePower;
	}
	
	/**
	 * @return int maxChargePower
	 * */
	public int getAllowedCharge() {
		int maxChargePower = 0;
		for (ManagedSymmetricEss ess : esss) {
			maxChargePower += ess.getPower().getMaxPower(ess, Phase.ALL, Pwr.ACTIVE);
		}
		return maxChargePower;
	}
	
	/**
	 * @return int maxDischargePower
	 * */
	public int getAllowedDischarge() {
		int maxDischargePower = 0;
		for (ManagedSymmetricEss ess : esss) {
			maxDischargePower += ess.getPower().getMinPower(ess, Phase.ALL, Pwr.ACTIVE);
		}
		return maxDischargePower;
	}
	
	/**
	 * @return int totalSoc
	 * */
	public int getSoc() {
		int totalSoc = 0;
		try {
			for (ManagedSymmetricEss ess : esss) {
				totalSoc += ess.getSoc().value().getOrError();
			}
		} catch (InvalidValueException e) {
			this.log.error(e.getMessage());
		}
		return totalSoc / esss.size();
	}
}
