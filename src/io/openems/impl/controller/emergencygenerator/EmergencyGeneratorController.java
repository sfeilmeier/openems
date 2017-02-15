/*******************************************************************************
 * OpenEMS - Open Source Energy Management System
 * Copyright (c) 2016, 2017 FENECON GmbH and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * Contributors:
 *   FENECON GmbH - initial API and implementation and initial documentation
 *******************************************************************************/
package io.openems.impl.controller.emergencygenerator;

import java.util.Optional;

import io.openems.api.channel.Channel;
import io.openems.api.channel.ConfigChannel;
import io.openems.api.channel.WriteChannel;
import io.openems.api.controller.Controller;
import io.openems.api.device.nature.ess.EssNature;
import io.openems.api.doc.ConfigInfo;
import io.openems.api.exception.InvalidValueException;
import io.openems.api.exception.WriteChannelException;
import io.openems.core.ThingRepository;

public class EmergencyGeneratorController extends Controller {

	@ConfigInfo(title = "The ess where the soc should be read from.", type = Ess.class)
	public ConfigChannel<Ess> ess = new ConfigChannel<Ess>("ess", this);

	@ConfigInfo(title = "The grid meter to detect if the system is Off-Grid or On-Grid.", type = Meter.class)
	public ConfigChannel<Meter> meter = new ConfigChannel<Meter>("meter", this);

	@ConfigInfo(title = "if the soc falls under this value and the system is Off-Grid the generator starts", type = Long.class)
	public ConfigChannel<Long> minSoc = new ConfigChannel<Long>("minSoc", this);
	@ConfigInfo(title = "if the system is Off-Grid and the generator is running the generator stops if the soc level increase over the maxSoc.", type = Long.class)
	public ConfigChannel<Long> maxSoc = new ConfigChannel<Long>("maxSoc", this);
	@ConfigInfo(title = "true if the digital output should be inverted.", type = Boolean.class)
	public ConfigChannel<Boolean> invertOutput = new ConfigChannel<>("invertOutput", this);

	private ThingRepository repo = ThingRepository.getInstance();

	@SuppressWarnings("unchecked")
	@ConfigInfo(title = "the address of the Digital Output where the generator is connected to.", type = String.class)
	public ConfigChannel<String> outputChannelAddress = new ConfigChannel<String>("outputChannelAddress", this)
			.addChangeListener((channel, newValue, oldValue) -> {
				Optional<String> channelAddress = (Optional<String>) newValue;
				if (channelAddress.isPresent()) {
					Optional<Channel> ch = repo.getChannelByAddress(channelAddress.get());
					if (ch.isPresent()) {
						outputChannel = (WriteChannel<Boolean>) ch.get();
					} else {
						log.error("Channel " + channelAddress.get() + " not found");
					}
				} else {
					log.error("'outputChannelAddress' is not configured!");
				}
			});

	private WriteChannel<Boolean> outputChannel;

	private boolean generatorOn = true;

	public EmergencyGeneratorController() {
		super();
	}

	public EmergencyGeneratorController(String thingId) {
		super(thingId);
	}

	@Override
	public void run() {
		try {
			// Check if grid is available
			if (!meter.value().voltage.valueOptional().isPresent()
					|| !(meter.value().voltage.value() >= 200 && meter.value().voltage.value() <= 260)) {
				// no meassurable voltage => Off-Grid
				if (ess.value().gridMode.labelOptional().equals(Optional.of(EssNature.OFF_GRID)) && !generatorOn
						&& ess.value().soc.value() <= minSoc.value()) {
					// switch generator on
					startGenerator();
					generatorOn = true;
				} else if (ess.value().gridMode.labelOptional().equals(Optional.of(EssNature.ON_GRID)) && generatorOn
						&& ess.value().soc.value() >= maxSoc.value()) {
					// switch generator off
					stopGenerator();
					generatorOn = false;
				} else if (generatorOn) {
					startGenerator();
				} else if (!generatorOn) {
					stopGenerator();
				}
			} else {
				// Grid voltage is the allowed range
				// switch generator off
				stopGenerator();
			}
		} catch (InvalidValueException e) {
			log.error("Failed to read value!", e);
		} catch (WriteChannelException e) {
			log.error("Error due write to output [" + outputChannelAddress.valueOptional().orElse("<none>") + "]", e);
		}
	}

	private void startGenerator() throws WriteChannelException, InvalidValueException {
		if (outputChannel.value() != true ^ invertOutput.value()) {
			outputChannel.pushWrite(true ^ invertOutput.value());
		}
	}

	private void stopGenerator() throws InvalidValueException, WriteChannelException {
		if (outputChannel.value() != false ^ invertOutput.value()) {
			outputChannel.pushWrite(false ^ invertOutput.value());
		}
	}

}