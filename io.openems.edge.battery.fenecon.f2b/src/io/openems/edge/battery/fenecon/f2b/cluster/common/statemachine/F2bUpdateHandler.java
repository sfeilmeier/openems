package io.openems.edge.battery.fenecon.f2b.cluster.common.statemachine;

import static io.openems.edge.battery.fenecon.f2b.cluster.common.BatteryFeneconF2bCluster.ChannelId.F2B_UPDATE_STATE_MACHINE;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.utils.EnumUtils;
import io.openems.edge.battery.fenecon.f2b.BatteryFeneconF2b;
import io.openems.edge.battery.fenecon.f2b.cluster.common.BatteryFeneconF2bCluster;
import io.openems.edge.battery.fenecon.f2b.cluster.common.statemachine.StateMachine.State;
import io.openems.edge.bridge.modbus.api.AbstractOpenemsModbusComponent;
import io.openems.edge.bridge.modbus.api.BridgeModbusTcp;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.statemachine.StateHandler;

public class F2bUpdateHandler extends StateHandler<State, Context> {

	private CompletableFuture<Void> updateFuture;

	private static final Logger LOG = LoggerFactory.getLogger(F2bUpdateHandler.class);

	private static final String FEMS_HOME_PATH = "/home/fems/";
	private static final Pattern FILE_PATTERN = Pattern.compile("^App_F2B_FM29_(\\d+)V(\\d+)\\.bin$");

	private static final int MAX_RETRY_ATTEMPTS = 3;
	private int retryCounter = 1;

	private BatteryFeneconF2bCluster cluster;

	protected record F2bUpdateState(F2bUpdateSubState subState) {
	}

	protected F2bUpdateState f2bUpdateState;

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		this.retryCounter = 1;
		this.f2bUpdateState = new F2bUpdateState(F2bUpdateSubState.RESET_F2B);
		this.cluster = context.getParent();
		this.cluster.stop();
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		var nextSubState = this.getNextSubState();
		this.cluster.channel(F2B_UPDATE_STATE_MACHINE).setNextValue(nextSubState);

		if (nextSubState != this.f2bUpdateState.subState) {
			this.f2bUpdateState = new F2bUpdateState(nextSubState);
		}

		if (nextSubState == F2bUpdateSubState.ERROR) {
			return State.STOPPED;
		}

		if (nextSubState == F2bUpdateSubState.FINISHED) {
			return State.STOPPED;
		}
		return State.F2B_UPDATE;
	}

	private F2bUpdateSubState getNextSubState() {
		return switch (this.f2bUpdateState.subState) {
		case RESET_F2B -> this.resetF2b();
		case UPDATE_F2B -> this.updateF2b();
		case FINISHED -> F2bUpdateSubState.FINISHED;
		case ERROR, UNDEFINED -> F2bUpdateSubState.ERROR;
		case RETRY -> {
			if (this.retryCounter > MAX_RETRY_ATTEMPTS) {
				LOG.error("Update failed after {} retries", MAX_RETRY_ATTEMPTS);
				yield F2bUpdateSubState.ERROR;
			}
			LOG.info("Retry attempt: {} for batteries: {}", this.retryCounter, this.cluster.id());
			this.clearUpdateErrors();
			this.updateFuture = null;
			this.retryCounter++;
			yield F2bUpdateSubState.RESET_F2B;
		}
		};
	}

	/**
	 * Find the latest F2B file in the given directory based on the version number
	 * in the file name.
	 * 
	 * @param directory the directory to search for F2B files
	 * @return the file name of the latest F2B file
	 * @throws IllegalStateException if no valid F2B file is found or if an error
	 *                               occurs while listing the files in the directory
	 */
	private String findLatestF2bFile(Path directory) {
		try (Stream<Path> files = Files.list(directory)) {
			return files //
					.map(Path::getFileName) //
					.map(Path::toString) //
					.map(this::toVersionedFile) //
					.filter(Objects::nonNull) //
					.max(Comparator //
							.comparingInt(VersionedFile::major) //
							.thenComparingInt(VersionedFile::minor)) //
					.map(VersionedFile::fileName) //
					.orElseThrow(() -> new IllegalStateException("No valid F2B file found"));
		} catch (Exception e) {
			LOG.error("Failed to list files in directory {}: {}", directory, e.getMessage());
			throw new IllegalStateException("Failed to list files in directory: " + e.getMessage(), e);
		}
	}

	/**
	 * Convert a file name to a VersionedFile object if it matches the expected
	 * pattern.
	 * 
	 * @param fileName the file name to convert
	 * @return a VersionedFile object if the file name matches the pattern or null
	 */
	private VersionedFile toVersionedFile(String fileName) {
		Matcher matcher = FILE_PATTERN.matcher(fileName);

		if (!matcher.matches()) {
			return null;
		}

		int major = Integer.parseInt(matcher.group(1));
		int minor = Integer.parseInt(matcher.group(2));

		return new VersionedFile(fileName, major, minor);
	}

	private record VersionedFile(String fileName, int major, int minor) {
	}

	private F2bUpdateSubState resetF2b() {
		try {
			var battery = this.getFirstBattery(this.cluster);
			battery.setF2bReset(true);
		} catch (OpenemsNamedException e) {
			LOG.error("Failed to send reset request to battery {}: {}", this.cluster.id(), e.getMessage());
			this.setFwUpdateErrorWithCause("F2B send reset request failed: " + e.getMessage());
		}
		LOG.info("F2B send reset request ID: {}", this.cluster.id());
		return F2bUpdateSubState.UPDATE_F2B;
	}

	private void executeTftp(String ip, String fileName) throws IOException, InterruptedException {
		var processBuilder = new ProcessBuilder("tftp", ip);
		processBuilder.redirectErrorStream(true);

		var process = processBuilder.start();

		try (var writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
				var reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {

			writer.write("mode binary\n");
			writer.write("rexmt 20\n");
			writer.write("timeout 25\n");
			writer.write("verbose\n");
			writer.write("put " + FEMS_HOME_PATH + fileName + " " + fileName + "\n");
			writer.write("quit\n");
			writer.flush();

			String line;
			while ((line = reader.readLine()) != null) {
				LOG.info("TFTP {}", line);
			}
		}

		int exitCode = process.waitFor();
		LOG.info("TFTP finished with exitCode {}", exitCode);

		if (exitCode != 0) {
			throw new IOException("TFTP failed with exit code " + exitCode);
		}
	}

	private F2bUpdateSubState updateF2b() {
		final var fileName = this.findLatestF2bFile(Path.of(FEMS_HOME_PATH));

		if (this.updateFuture == null) {
			this.updateFuture = CompletableFuture.runAsync(() -> {
				try {
					String ip = this.getModbusBridgeIpAddress(this.getFirstBattery(this.cluster));
					this.executeTftp(ip, fileName);

				} catch (Exception e) {
					LOG.error("F2B update failed for battery {}: {}", this.cluster.id(), e.getMessage());
					this.setFwUpdateErrorWithCause("Update failed for F2B: " + e.getMessage());
				}
			});
			return F2bUpdateSubState.UPDATE_F2B;
		}

		if (!this.updateFuture.isDone()) {
			return F2bUpdateSubState.UPDATE_F2B;
		}

		this.updateFuture = null;

		if (this.cluster.getFwUpdateErrorChannel().value().get()) {
			LOG.error("F2B update failed for cluster {}", this.cluster.id());
			return F2bUpdateSubState.RETRY;
		}

		return F2bUpdateSubState.FINISHED;
	}

	@Override
	protected String debugLog() {
		return State.F2B_UPDATE.asCamelCase() + "-" + EnumUtils.nameAsCamelCase(this.f2bUpdateState.subState);
	}

	private void setFwUpdateErrorWithCause(String message) {
		this.cluster.setFwUpdateError(true);
		this.cluster.getFwUpdateErrorChannel().channelDoc().text(message);
	}

	private void clearUpdateErrors() {
		this.cluster.setFwUpdateError(false);
		this.cluster.getFwUpdateErrorChannel().channelDoc().text("");
	}

	private String getModbusBridgeIpAddress(BatteryFeneconF2b battery) {
		if (battery instanceof AbstractOpenemsModbusComponent modbusComponent) {
			var bridge = modbusComponent.getBridgeModbus();

			if (bridge instanceof BridgeModbusTcp tcpBridge) {
				// Result looks like /172.23.22.31, removing leading slash
				return tcpBridge.getIpAddress().toString().replace("/", "");
			}
		}
		return null;
	}

	private BatteryFeneconF2b getFirstBattery(BatteryFeneconF2bCluster cluster) throws OpenemsNamedException {
		return cluster.getBatteries().stream().min(Comparator.comparing(OpenemsComponent::id)).orElse(null);
	}
}
