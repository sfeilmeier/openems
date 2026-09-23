package io.openems.edge.battery.fenecon.f2b.update;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.function.UnaryOperator;

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

public class F2bUpdateable implements Updateable {
	private static final int AVG_UPDATE_DURATION_IN_MINUTES = 15;

	private static final Logger LOG = LoggerFactory.getLogger(F2bUpdateable.class);
	private final ExecutorService executor = Executors.newSingleThreadExecutor(Thread.ofVirtual().factory());
	private final List<BatteryFeneconF2bCluster> clusters;
	private final Runnable closeChannelListener;

	private static final File TEMP_DIRECTORY = new File(System.getProperty("java.io.tmpdir"));
	private static final String BASE_URI = "https://fenecon.de/fems-tools/f2bUpdate/";

	private final Map<String, AtomicReference<F2bFirmwareVersion>> versions = new ConcurrentHashMap<>();
	private final Map<String, List<Consumer<F2bFirmwareVersion>>> versionListeners = new ConcurrentHashMap<>();

	private volatile F2bUpdateState updateState = new F2bUpdateState.NormalOperation();
	private final HardwareType hardwareType;

	public F2bUpdateable(List<BatteryFeneconF2bCluster> clusters, F2bHardwareType f2bHardwareType) {
		this.clusters = clusters;
		this.hardwareType = this.getHardwareTypeInfo(f2bHardwareType);
		final var cleanupListener = new ArrayList<Runnable>();

		for (var cluster : this.clusters) {

			final var battery = this.getFirstBattery(cluster);

			if (battery == null) {
				continue;
			}

			final var major = battery.getF2bApplicationMainVersion().orElse(null);
			final var minor = battery.getF2bApplicationSubVersion().orElse(null);
			this.versions.put(cluster.id(), new AtomicReference<>(new F2bFirmwareVersion(major, minor)));

			this.versionListeners.put(cluster.id(), new CopyOnWriteArrayList<>());

			var majorListener = battery.getF2bApplicationMainVersionChannel().onChange((oldValue, newValue) -> this
					.updateVersion(cluster.id(), version -> version.withVersionMajor(newValue.get())));

			var subListener = battery.getF2bApplicationSubVersionChannel().onChange((oldValue, newValue) -> this
					.updateVersion(cluster.id(), version -> version.withVersionSub(newValue.get())));

			cleanupListener
					.add(() -> battery.getF2bApplicationMainVersionChannel().removeOnChangeCallback(majorListener));

			cleanupListener.add(() -> battery.getF2bApplicationSubVersionChannel().removeOnChangeCallback(subListener));
		}

		this.closeChannelListener = () -> cleanupListener.forEach(Runnable::run);
	}

	/**
	 * Deactivates this {@link Updateable}.
	 */
	public void deactivate() {
		this.executor.shutdown();
		this.closeChannelListener.run();
	}

	private void updateVersion(String clusterId, UnaryOperator<F2bFirmwareVersion> updateFunction) {
		final var newVersion = this.versions //
				.get(clusterId) //
				.updateAndGet(updateFunction);

		for (var listener : this.versionListeners.get(clusterId)) {
			listener.accept(newVersion);
		}
	}

	@Override
	public UpdateableMetaInfo getMetaInfo(Language language) {
		return new UpdateableMetaInfo("F2B Update", "F2B Firmware Update", Role.ADMIN);
	}

	/**
	 * Executes the update.
	 */
	public void executeUpdate() {
		synchronized (this) {
			if (this.updateState instanceof F2bUpdateState.UpdateRunning) {
				return;
			}
			this.updateState = new F2bUpdateState.UpdateRunning(0, List.of());
		}

		this.executor.execute(() -> {
			try {
				this.executeInternal();
				this.updateState = new F2bUpdateState.NormalOperation();
			} catch (Exception e) {
				var errorText = TextProvider //
						.byTranslation(F2bUpdateable.class, "F2bUpdate.UpdateFailed") //
						.formatWithArguments(e.getMessage());
				this.updateState = new F2bUpdateState.UpdateFailed(errorText);
			}
		});
	}

	private void executeInternal() throws Exception {
		final var progressHistory = new ProgressHistory();

		progressHistory.addOnChangeListener(history -> {
			final var last = history.last();
			LOG.info("Update State: {}", last);
			this.updateState = new F2bUpdateState.UpdateRunning(last.percentage(), history.asLog());
		});

		final var progress = new ProgressPublisher();
		progress.addListener(progressHistory::addProgress);
		progress.setPercentage(5, "Downloading latest F2B firmware version...");
		this.downloadLatestF2bFirmwareVersion(progress);
		progress.sleep(5000, 12, 14, "Latest F2B firmware version downloaded, starting update per cluster...");

		try {
			this.runUpdate(progress.subProgress(14, 99));
			progress.setPercentage(100, "Update successful");

		} catch (Exception e) {
			LOG.error("Update {} failed", e.getMessage());
			progress.setPercentage(5, "Retrying update...");
		}
	}

	private void downloadLatestF2bFirmwareVersion(ProgressPublisher progress) {
		if (this.hardwareType == HardwareType.FM_29) {
			var uri = this.buildFirmwareUri();
			try {
				HttpClient client = HttpClient.newHttpClient();
				var request = HttpRequest.newBuilder() //
						.uri(uri) //
						.build();

				HttpResponse<Path> response = client.send(request,
						HttpResponse.BodyHandlers.ofFile(this.getFirmwarePath()));
				progress.setPercentage(9, "Downloading file from: " + uri);

				if (response.statusCode() == 200) {
					progress.setPercentage(10, "Firmware downloaded successfully: " + response.body());
					LOG.info("Firmware downloaded successfully: {}", response.body());
				} else {
					throw new IOException("Download failed. HTTP-StatusCode: " + response.statusCode());
				}
			} catch (Exception e) {
				LOG.error("Failed to download firmware from {}: {}", uri, e.getMessage());
				throw new RuntimeException("Failed to download firmware: from" + uri + e.getMessage(), e);
			}
		}
	}

	private void runUpdate(ProgressPublisher progress) throws Exception {
		final var fileName = this.buildFirmwareName();

		for (final var pair : progress.forEachWithProgress(12, 82, this.clusters, "Update")) {
			this.updateSingleCluster(pair.b(), pair.a(), fileName, 1);
		}
	}

	private void updateSingleCluster(BatteryFeneconF2bCluster cluster, ProgressPublisher progress, String fileName,
			int attempt) throws Exception {

		try {
			LOG.info("Updating cluster {} (attempt {})", cluster.id(), attempt);

			var battery = this.getFirstBattery(cluster);

			progress.sleep(2000, 21, 22, "Triggering F2B reset for: " + cluster.id());
			battery.setF2bReset(true);

			String ip = this.getModbusBridgeIpAddress(battery);

			progress.setPercentage(50, "TFTP upload " + cluster.id());
			this.executeTftp(ip, fileName);

			progress.sleep(30000, 52, 55,
					"TFTP upload finished... waiting for update to complete for cluster " + cluster.id());

			LOG.info("Cluster {} update successful", cluster.id());

		} catch (Exception e) {
			LOG.error("Cluster {} update failed", cluster.id(), e);

			// if failed three times, stop updating cluster and set error
			if (attempt >= 3) {
				cluster.setFwUpdateError(true);
				throw e;
			}
			this.clearUpdateErrors(cluster);
			// if it fails, try again and increase count
			this.updateSingleCluster(cluster, progress, fileName, attempt + 1);
		}
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
			writer.write("put " + this.getFirmwarePath() + " " + fileName + "\n");
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

	@Override
	public GetUpdateState.UpdateState getUpdateState(Language lang) {
		return switch (this.updateState) {
		case F2bUpdateState.NormalOperation() -> //
			this.calculateAvailableUpdatesStatus();
		case F2bUpdateState.UpdateRunning(var percentCompleted, var logs) -> //
			new GetUpdateState.UpdateState.Running(percentCompleted, AVG_UPDATE_DURATION_IN_MINUTES, logs);
		case F2bUpdateState.UpdateFailed(var errorText) -> //
			new GetUpdateState.UpdateState.Error(errorText.getText(lang));
		};
	}

	private GetUpdateState.UpdateState calculateAvailableUpdatesStatus() {
		for (var cluster : this.clusters) {

			var updateState = this.calculateClusterUpdateState(cluster);

			if (updateState instanceof GetUpdateState.UpdateState.Available
					|| updateState instanceof GetUpdateState.UpdateState.Unknown) {
				return updateState;
			}
		}

		if (this.clusters.isEmpty()) {
			return new GetUpdateState.UpdateState.Unknown();
		}

		var version = this.versions.get(this.clusters.getFirst().id()).get();
		return new GetUpdateState.UpdateState.Updated(version.toString());
	}

	private GetUpdateState.UpdateState calculateClusterUpdateState(BatteryFeneconF2bCluster cluster) {
		var battery = this.getFirstBattery(cluster);
		if (battery == null) {
			return new GetUpdateState.UpdateState.Unknown();
		}

		var versionRef = this.versions.get(cluster.id());
		if (versionRef == null) {
			return new GetUpdateState.UpdateState.Unknown();
		}

		var version = versionRef.get();
		if (!version.isDefined()) {
			return new GetUpdateState.UpdateState.Unknown();
		}

		var hardwareType = this.getHardwareTypeInfo(battery.getF2bHardwareTypeEnum());
		if (hardwareType == null) {
			return new GetUpdateState.UpdateState.Unknown();
		}

		var latestVersion = hardwareType.getLatestFirmwareVersion();

		if (version.isOlderThan(latestVersion)) {
			return new GetUpdateState.UpdateState.Available(version.toString(), latestVersion.toString());
		}

		return new GetUpdateState.UpdateState.Updated(version.toString());
	}

	private sealed interface F2bUpdateState {
		record NormalOperation() implements F2bUpdateState {
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

	private HardwareType getHardwareTypeInfo(F2bHardwareType hardwareType) {

		if (hardwareType == null) {
			return null;
		}

		return switch (hardwareType) {
		case F2bHardwareType.F2B_FM29_1V0, F2bHardwareType.F2B_FM29_1V2 -> HardwareType.FM_29;
		default -> null;
		};
	}

	/**
	 * Creates the firmware download {@link URI}.
	 * 
	 * <p>
	 * Currently this method only supports firmware files for Fisker F2Bs. If
	 * additional F2B variants are introduced in the future, this implementation
	 * needs to be extended accordingly.
	 *
	 * @return the firmware download URI
	 */
	private URI buildFirmwareUri() {
		var firmwareName = this.buildFirmwareName();

		return URI.create(String.format("%sFisker/%s/%s/%s", BASE_URI, //
				this.hardwareType.getName(), //
				this.hardwareType.getLatestVersionDate(), //
				firmwareName));
	}

	/**
	 * Creates the firmware file name.
	 * 
	 * <p>
	 * Currently this method only generates file names for Fisker F2B firmware. If
	 * additional F2B variants are introduced in the future, this implementation
	 * needs to be extended accordingly.
	 *
	 * @return the firmware file name
	 */
	private String buildFirmwareName() {
		return String.format("App_F2B_%s_%dV%d.bin", //
				this.hardwareType.getName(), //
				this.hardwareType.getLatestFirmwareVersion().versionMajor(), //
				this.hardwareType.getLatestFirmwareVersion().versionSub());
	}

	private Path getFirmwarePath() {
		return TEMP_DIRECTORY.toPath().resolve(this.buildFirmwareName());
	}

}
