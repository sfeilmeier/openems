package io.openems.edge.battery.fenecon.f2b.update;

import java.util.Comparator;

public record F2bFirmwareVersion(//
		Integer versionMajor, //
		Integer versionSub //
) {

	/**
	 * Copies this version and replaces the major version.
	 *
	 * @param versionMajor the new major firmware version
	 * @return the new {@link F2bFirmwareVersion}
	 */
	public F2bFirmwareVersion withVersionMajor(Integer versionMajor) {
		return new F2bFirmwareVersion(versionMajor, this.versionSub);
	}

	/**
	 * Copies this version and replaces the sub version.
	 *
	 * @param versionSub the new sub firmware version
	 * @return the new {@link F2bFirmwareVersion}
	 */
	public F2bFirmwareVersion withVersionSub(Integer versionSub) {
		return new F2bFirmwareVersion(this.versionMajor(), versionSub);
	}

	/**
	 * Checks if version is older than the given version.
	 * 
	 * @param other the version to compare with
	 * @return true if this version is older than the given version; else false
	 */
	public boolean isOlderThan(F2bFirmwareVersion other) {
		if (other == null) {
			return false;
		}

		var nullsLast = Comparator.<Integer>nullsLast(Comparator.naturalOrder());
		return Comparator.comparing(F2bFirmwareVersion::versionMajor, nullsLast) //
				.thenComparing(F2bFirmwareVersion::versionSub, nullsLast) //
				.compare(this, other) < 0;
	}

	@Override
	public String toString() {
		return this.versionMajor + "." + this.versionSub;
	}

	public boolean isDefined() {
		return this.versionMajor() != null && this.versionSub() != null;
	}

}
