package io.openems.edge.battery.fenecon.f2b.update;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.common.session.Language;
import io.openems.common.session.Role;
import io.openems.common.utils.TextProvider;
import io.openems.edge.battery.fenecon.f2b.BatteryFeneconF2b;
import io.openems.edge.battery.fenecon.f2b.cluster.common.BatteryFeneconF2bCluster;
import io.openems.edge.battery.fenecon.f2b.common.enums.F2bHardwareType;
import io.openems.edge.bridge.modbus.api.AbstractOpenemsModbusComponent;
import io.openems.edge.bridge.modbus.api.BridgeModbusTcp;
import io.openems.edge.common.component.OpenemsComponent;
import io.openems.edge.common.update.ProgressHistory;
import io.openems.edge.common.update.ProgressPublisher;
import io.openems.edge.common.update.Updateable;
import io.openems.edge.common.update.jsonrpc.GetUpdateState;

/**
 * Service for updating an F2B cluster.
 * 
 * <p>
 * Usually it waits for a JSON-RPC (e.g. when an update button is clicked) to
 * execute a firmware update on the linked F2B cluster.
 */
public class F2bUpdateable implements Updateable {

	private static final Map<String, F2bFirmwareVersion> LATEST_VERSIONS = Map.of(//
			"FM29", new F2bFirmwareVersion(1, 3));
	private static final URI DOWNLOAD_BASE_URI = URI.create("https://fenecon.de/fems-tools/");
	private static final String FIRMWARE_DIRECTORY = System.getProperty("java.io.tmpdir");
	private static final int AVG_UPDATE_DURATION_IN_MINUTES = 10;
	private static final String LOG_TAG = "[F2B-Update]";
	private static final Logger LOG = LoggerFactory.getLogger(F2bUpdateable.class);

	private final List<BatteryFeneconF2bCluster> clusters;
	private final F2bHardwareType hardwareType;
	private final ExecutorService executor = Executors.newSingleThreadExecutor(Thread.ofVirtual().factory());

	private volatile F2bUpdateState updateState = new F2bUpdateState.Idle();

	public F2bUpdateable(List<BatteryFeneconF2bCluster> clusters, F2bHardwareType hardwareType) {
		this.clusters = clusters;
		this.hardwareType = hardwareType;
	}

	/**
	 * Deactivates this {@link Updateable}.
	 */
	public void deactivate() {
		this.executor.shutdown();
	}

	@Override
	public UpdateableMetaInfo getMetaInfo(Language language) {
		return new UpdateableMetaInfo("F2B Update", "F2B Firmware Update", Role.ADMIN);
	}

	/**
	 * Executes the update.
	 */
	@Override
	public void executeUpdate() {
		synchronized (this) {
			if (this.updateState instanceof F2bUpdateState.UpdateRunning) {
				return;
			}
			this.updateState = new F2bUpdateState.UpdateRunning(0, List.of());
		}

		this.executor.execute(() -> {
			try {
				this.updateF2bFirmware();
				this.updateState = new F2bUpdateState.Idle();
			} catch (Exception e) {
				var errorText = TextProvider //
						.byTranslation(F2bUpdateable.class, "F2bUpdate.UpdateFailed") //
						.formatWithArguments(e.getMessage());
				this.updateState = new F2bUpdateState.UpdateFailed(errorText);
			}
		});
	}

	private void updateF2bFirmware() {
		final var progress = this.createProgress();
		progress.setPercentage(1, "Starting F2B firmware update");
		this.downloadLatestFirmware(progress.subProgress(1, 10));

		try {
			for (final var pair : progress.forEachWithProgress(11, 95, this.clusters, "Update")) {
				this.updateCluster(pair.b(), pair.a(), 1);
			}
			progress.sleep(3000, 96, 99, "Validating installed version...");
			progress.setPercentage(100, "F2B firmware update successful");

		} catch (Exception e) {
			LOG.error("{} Update failed: {}", LOG_TAG, e.getMessage());
			progress.setPercentage(0, "Update failed");
		}
	}

	private ProgressPublisher createProgress() {
		final var progressHistory = new ProgressHistory();
		progressHistory.addOnChangeListener(history -> {
			final var last = history.last();
			LOG.info("{} Update State: {}", LOG_TAG, last);
			this.updateState = new F2bUpdateState.UpdateRunning(last.percentage(), history.asLog());
		});
		final var progress = new ProgressPublisher();
		progress.addListener(progressHistory::addProgress);
		return progress;
	}

	private void downloadLatestFirmware(ProgressPublisher progress) {
		progress.setPercentage(1, "Starting download of latest F2B Firmware version");
		if (this.hardwareType == F2bHardwareType.F2B_FM29_1V0 //
				|| this.hardwareType == F2bHardwareType.F2B_FM29_1V2 //
				|| this.hardwareType == F2bHardwareType.F2B_FM29_1V3) {

			var uri = DOWNLOAD_BASE_URI.resolve(this.getFirmwareFileName());

			try (HttpClient client = HttpClient.newHttpClient()) {
				var request = HttpRequest.newBuilder() //
						.uri(uri) //
						.build();

				progress.setPercentage(10, "Firmware file source: " + uri);
				progress.setPercentage(11, "Downloading...");
				HttpResponse<Path> response = client.send(request,
						HttpResponse.BodyHandlers.ofFile(this.getFirmwareFilePath()));

				if (response.statusCode() == 200) {
					progress.setPercentage(100, "Download successful (" + response.body() + ")");
					LOG.info("{} Firmware downloaded successfully ({})", LOG_TAG, response.body());
				} else {
					throw new IOException("Download failed. HTTP-StatusCode: " + response.statusCode());
				}

			} catch (Exception e) {
				LOG.warn("{} Failed to download firmware from {}: {}", LOG_TAG, uri, e.getMessage());
				throw new RuntimeException("Failed to download firmware from " + uri + ": " + e.getMessage(), e);
			}
		}
	}

	private void updateCluster(BatteryFeneconF2bCluster cluster, ProgressPublisher progress, int attempt)
			throws Exception {
		try {
			LOG.info("{} ({}) Starting update (attempt #{})", LOG_TAG, cluster.id(), attempt);
			progress.setPercentage(1, "(" + cluster.id() + ") Starting update (attempt #" + attempt + ")");
			var battery = this.getFirstBattery(cluster);

			Objects.requireNonNull(battery, "Battery is null");
			battery.setF2bReset(true);
			progress.sleep(5000, 18, 19, "(" + cluster.id() + ") Resetting F2B cluster...");
			progress.setPercentage(20, "(" + cluster.id() + ") F2B cluster reset finished");

			this.uploadWithTftp(cluster.id(), this.getModbusBridgeIpAddress(battery), progress.subProgress(21, 99));

			progress.setPercentage(100, "(" + cluster.id() + ") Update finished");
			LOG.info("{} Cluster {} update successful", LOG_TAG, cluster.id());

		} catch (Exception e) {
			LOG.warn("{} Cluster {} update failed: {}", LOG_TAG, cluster.id(), e.getMessage());

			if (attempt >= 3) {
				cluster.setFwUpdateError(true);
				throw e;
			}

			this.clearUpdateErrors(cluster);
			this.updateCluster(cluster, progress, ++attempt);
		}
	}

	private void uploadWithTftp(String clusterId, String ip, ProgressPublisher progress)
			throws IOException, InterruptedException {
		progress.setPercentage(1, "(" + clusterId + ") Starting TFTP upload");
		var processBuilder = new ProcessBuilder("tftp", ip);
		processBuilder.redirectErrorStream(true);
		var process = processBuilder.start();
		progress.setPercentage(30, "(" + clusterId + ") Uploading with TFTP...");

		try (var writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
				var reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
			writer.write("mode binary\n");
			writer.write("rexmt 20\n");
			writer.write("timeout 25\n");
			writer.write("verbose\n");
			writer.write("put " + this.getFirmwareFilePath() + " " + this.getFirmwareFileName() + "\n");
			writer.write("quit\n");
			writer.flush();

			String line;
			while ((line = reader.readLine()) != null) {
				LOG.info("{} ({}) TFTP {}", LOG_TAG, clusterId, line);
			}
		}
		progress.setPercentage(90);

		int exitCode = process.waitFor();

		LOG.info("{} ({}) TFTP finished with exitCode {}", LOG_TAG, clusterId, exitCode);
		progress.setPercentage(100, "(" + clusterId + ") TFTP upload finished");

		if (exitCode != 0) {
			throw new IOException("(" + clusterId + ") TFTP failed with exit code " + exitCode);
		}
	}

	private Path getFirmwareFilePath() {
		return Path.of(FIRMWARE_DIRECTORY, this.getFirmwareFileName());
	}

	private String getFirmwareFileName() {
		return String.format("App_F2B_%s_%dV%d.bin", //
				this.hardwareType.getHardwareModelName(), //
				LATEST_VERSIONS.get(this.hardwareType.getHardwareModelName()).versionMajor(), //
				LATEST_VERSIONS.get(this.hardwareType.getHardwareModelName()).versionSub());
	}

	@Override
	public GetUpdateState.UpdateState getUpdateState(Language lang) {
		return switch (this.updateState) {
		case F2bUpdateState.Idle() -> //
			this.checkClusterUpdateStates();
		case F2bUpdateState.UpdateRunning(var percentCompleted, var logs) -> //
			new GetUpdateState.UpdateState.Running(percentCompleted, AVG_UPDATE_DURATION_IN_MINUTES, logs);
		case F2bUpdateState.UpdateFailed(var errorText) -> //
			new GetUpdateState.UpdateState.Error(errorText.getText(lang));
		};
	}

	private GetUpdateState.UpdateState checkClusterUpdateStates() {
		if (this.clusters.isEmpty()) {
			LOG.warn("{} Clusters are empty", LOG_TAG);
			return new GetUpdateState.UpdateState.Unknown();
		}

		for (var cluster : this.clusters) {
			var clusterUpdateState = this.checkFirmware(cluster);
			if (clusterUpdateState instanceof GetUpdateState.UpdateState.Available
					|| clusterUpdateState instanceof GetUpdateState.UpdateState.Unknown) {
				return clusterUpdateState;
			}
		}

		var battery = this.getFirstBattery(this.clusters.getFirst());
		if (battery == null) {
			return new GetUpdateState.UpdateState.Unknown();
		}

		return new GetUpdateState.UpdateState.Updated(battery.getF2bApplicationVersion());
	}

	private GetUpdateState.UpdateState checkFirmware(BatteryFeneconF2bCluster cluster) {
		var battery = this.getFirstBattery(cluster);
		if (battery == null) {
			LOG.warn("{} Battery of cluster {} is null", LOG_TAG, cluster.id());
			return new GetUpdateState.UpdateState.Unknown();
		}

		var batteryHardwareType = battery.getF2bHardwareTypeEnum();
		var batteryFirmwareVersion = new F2bFirmwareVersion(//
				battery.getF2bApplicationMainVersion().get(), //
				battery.getF2bApplicationSubVersion().get());

		if (!batteryFirmwareVersion.isDefined()) {
			return new GetUpdateState.UpdateState.Unknown();
		}

		var latest = LATEST_VERSIONS.get(batteryHardwareType.getHardwareModelName());
		if (batteryFirmwareVersion.isOlderThan(latest)) {
			return new GetUpdateState.UpdateState.Available(batteryFirmwareVersion.toString(), latest.toString());
		}

		return new GetUpdateState.UpdateState.Updated(batteryFirmwareVersion.toString());
	}

	private sealed interface F2bUpdateState {
		record Idle() implements F2bUpdateState {
		}

		record UpdateRunning(int percentCompleted, List<String> logs) implements F2bUpdateState {
		}

		record UpdateFailed(TextProvider errorText) implements F2bUpdateState {
		}
	}

	private void clearUpdateErrors(BatteryFeneconF2bCluster cluster) {
		cluster.setFwUpdateError(false);
		cluster.getFwUpdateErrorChannel().channelDoc().text("");
	}

	private String getModbusBridgeIpAddress(BatteryFeneconF2b battery) {
		if (battery instanceof AbstractOpenemsModbusComponent modbusComponent) {
			var bridge = modbusComponent.getBridgeModbus();

			if (bridge instanceof BridgeModbusTcp tcpBridge) {
				return tcpBridge.getIpAddress().getHostAddress();
			}
		}
		return null;
	}

	private BatteryFeneconF2b getFirstBattery(BatteryFeneconF2bCluster cluster) {
		return cluster.getBatteries().stream().min(Comparator.comparing(OpenemsComponent::id)).orElse(null);
	}
}
