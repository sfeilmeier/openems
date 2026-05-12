package io.openems.edge.system.fenecon.industrial.xl.statemachine;

import static io.openems.edge.system.fenecon.industrial.xl.SystemFeneconIndustrialXl.ChannelId.F2B_UPDATE_STATE_MACHINE;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.utils.EnumUtils;
import io.openems.edge.battery.fenecon.f2b.cluster.common.BatteryFeneconF2bCluster;
import io.openems.edge.common.startstop.StartStoppable;
import io.openems.edge.common.statemachine.StateHandler;
import io.openems.edge.system.fenecon.industrial.xl.statemachine.StateMachine.State;

public class F2bUpdateHandler extends StateHandler<State, Context> {

	private static final Logger LOG = LoggerFactory.getLogger(F2bUpdateHandler.class);

	private List<BatteryFeneconF2bCluster> batteryClusters;

	protected record F2bUpdateState(F2bUpdateSystemSubState subState) {
	}

	private int currentClusterIndex;
	private boolean updateTriggered;
	private CompletableFuture<Void> updateDelayFuture;
	private CompletableFuture<Boolean> installTftpFuture;

	protected F2bUpdateState f2bUpdateState;

	@Override
	protected void onEntry(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		system.stop();

		this.batteryClusters = context.getParent().getBatteryClusters();
		this.currentClusterIndex = 0;
		this.updateTriggered = false;
		this.f2bUpdateState = new F2bUpdateState(F2bUpdateSystemSubState.STOP_BATTERIES);
	}

	@Override
	public State runAndGetNextState(Context context) throws OpenemsNamedException {
		final var system = context.getParent();
		var nextSubState = this.getNextSubState();
		system.channel(F2B_UPDATE_STATE_MACHINE).setNextValue(nextSubState);

		if (nextSubState != this.f2bUpdateState.subState) {
			this.f2bUpdateState = new F2bUpdateState(nextSubState);
		}

		if (nextSubState == F2bUpdateSystemSubState.ERROR) {
			return State.STOPPED;
		}

		if (nextSubState == F2bUpdateSystemSubState.FINISHED) {
			return State.STOPPED;
		}
		return State.F2B_UPDATE;
	}

	private F2bUpdateSystemSubState getNextSubState() {
		return switch (this.f2bUpdateState.subState) {
		case STOP_BATTERIES -> {
			this.batteryClusters.forEach(BatteryFeneconF2bCluster::stopBatteries);
			if (!this.batteryClusters.stream().allMatch(StartStoppable::isStopped)) {
				yield F2bUpdateSystemSubState.STOP_BATTERIES;
			}
			yield F2bUpdateSystemSubState.INSTALL_TFTP;
		}
		case INSTALL_TFTP -> this.installTftp();
		case UPDATE_F2BS -> this.updateF2bs();
		case ERROR, UNDEFINED -> F2bUpdateSystemSubState.ERROR;
		case FINISHED -> F2bUpdateSystemSubState.FINISHED;
		};
	}

	// Install TFTP if not already installed
	private F2bUpdateSystemSubState installTftp() {
		if (this.installTftpFuture == null) {
			this.installTftpFuture = CompletableFuture.supplyAsync(() -> {
				try {
					this.ensurePackageInstalled("tftpd-hpa");
					this.ensurePackageInstalled("tftp");
					return true;

				} catch (IOException e) {
					LOG.error("Failed to install TFTP packages", e);
					return false;

				} catch (InterruptedException e) {
					LOG.error("Interrupted while installing packages", e);
					Thread.currentThread().interrupt();
					return false;
				}
			});

			return F2bUpdateSystemSubState.INSTALL_TFTP;
		}

		if (!this.installTftpFuture.isDone()) {
			return F2bUpdateSystemSubState.INSTALL_TFTP;
		}

		try {
			boolean success = this.installTftpFuture.get();
			this.installTftpFuture = null;
			return success ? F2bUpdateSystemSubState.UPDATE_F2BS : F2bUpdateSystemSubState.ERROR;

		} catch (Exception e) {
			LOG.error("Failed to complete TFTP installation", e);
			this.installTftpFuture = null;
			return F2bUpdateSystemSubState.ERROR;
		}
	}

	private F2bUpdateSystemSubState updateF2bs() {
		if (this.currentClusterIndex >= this.batteryClusters.size()) {
			return this.hasErrors() ? F2bUpdateSystemSubState.ERROR : F2bUpdateSystemSubState.FINISHED;
		}

		var currentCluster = this.batteryClusters.get(this.currentClusterIndex);

		if (!this.updateTriggered) {
			LOG.info("Starting F2B update for cluster {}", currentCluster.id());
			currentCluster._startF2bUpdate();

			this.updateDelayFuture = CompletableFuture.runAsync(() -> {
			}, CompletableFuture.delayedExecutor(2, TimeUnit.SECONDS));
			this.updateTriggered = true;
			return F2bUpdateSystemSubState.UPDATE_F2BS;
		}

		if (!this.updateDelayFuture.isDone() || !currentCluster.isF2bUpdateFinished()) {
			LOG.warn("Waiting for F2B update to finish for cluster {}", currentCluster.id());
			return F2bUpdateSystemSubState.UPDATE_F2BS;
		}

		if (currentCluster.getFwUpdateErrorChannel().value().get()) {
			LOG.error("F2B update failed for cluster {}", currentCluster.id());
			return F2bUpdateSystemSubState.ERROR;
		}

		LOG.info("F2B update successful for cluster {}", currentCluster.id());

		this.currentClusterIndex++;
		this.updateTriggered = false;
		this.updateDelayFuture = null;
		return F2bUpdateSystemSubState.UPDATE_F2BS;
	}

	/**
	 * Ensure that the given package is installed, if not install it.
	 * 
	 * @param pkg the packageName to be installed.
	 * @throws IOException          if an I/O error occurs while checking or
	 *                              installing the package.
	 * @throws InterruptedException if the current thread is interrupted while
	 *                              waiting for the installation process to
	 *                              complete.
	 */
	private void ensurePackageInstalled(String pkg) throws IOException, InterruptedException {
		if (!this.isPackageInstalled(pkg)) {
			LOG.info("Installing {}", pkg);
			new ProcessBuilder("sudo", "apt", "install", pkg, "--assume-yes") //
					.inheritIO() //
					.start() //
					.waitFor();
		} else {
			LOG.info("{} already installed", pkg);
		}
	}

	/**
	 * Check whether the package is installed.
	 *
	 * @param packageName the packageName to be installed.
	 * @return true if package has been already installed.
	 */
	private boolean isPackageInstalled(String packageName) {
		try {
			var process = new ProcessBuilder("dpkg", "-s", packageName) //
					.redirectErrorStream(true) //
					.start();

			int exitCode = process.waitFor();
			return exitCode == 0;

		} catch (IOException e) {
			LOG.error("Failed to check package {}", packageName, e);
			return false;
		} catch (InterruptedException e) {
			LOG.error("Interrupted while checking package {}", packageName, e);
			Thread.currentThread().interrupt();
			return false;
		}
	}

	@Override
	protected String debugLog() {
		return State.F2B_UPDATE.asCamelCase() + "-" + EnumUtils.nameAsCamelCase(this.f2bUpdateState.subState);
	}

	private boolean hasErrors() {
		return this.batteryClusters.stream().anyMatch(cluster -> cluster.getFwUpdateErrorChannel().value().get());
	}
}