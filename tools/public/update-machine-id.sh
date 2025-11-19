#!/bin/bash
#
# Run script:
# wget https://fenecon.de/fems-tools/update-machine-id.sh -O /tmp/update-machine-id.sh && bash /tmp/update-machine-id.sh
#

ETC_MACHINE_ID="/etc/machine-id"
DBUS_MACHINE_ID="/var/lib/dbus/machine-id"
TMP_MACHINE_ID=
UPDATE_LOCK_FILE="/tmp/machine-id.lock"

if [ "$EUID" -ne 0 ]; then
    echo "[ERROR] run with elevated privileges; sudo or root!"
    exit 1
fi

function cmd_is_installed {
    if command -v "$1" >/dev/null 2>&1; then true; else false; fi
}

function __cleanup {
    if [[ $? -ne 0 ]]; then
        echo;
        echo "[ERROR] Machine ID update failed!"
        if [ -n "$TMP_MACHINE_ID" ]; then
            cp -v "$TMP_MACHINE_ID" "$ETC_MACHINE_ID"
            ln -sf "$ETC_MACHINE_ID" "$DBUS_MACHINE_ID"
        fi
    fi

    if [ -f "$UPDATE_LOCK_FILE" ]; then
        rm -f "$UPDATE_LOCK_FILE"
    fi
}

function prevent_multiple_exec {
    if [ -f "$UPDATE_LOCK_FILE" ]; then
        echo "[WARNING] Update is still running!"
        exit 1
    fi

    trap __cleanup EXIT;
    touch $UPDATE_LOCK_FILE;
}

################
###   MAIN   ###
################

prevent_multiple_exec;

set -e

echo "[INFO] update machine-id"

if ! cmd_is_installed "systemd-machine-id-setup"; then
    echo "[ERROR] 'systemd-machine-id-setup' is not installed"
    exit 1
fi

TMP_MACHINE_ID=$(mktemp /tmp/machine-id.XXXXXX)

cp "$ETC_MACHINE_ID" "$TMP_MACHINE_ID"

rm -f "$ETC_MACHINE_ID"
rm -f "$DBUS_MACHINE_ID"
systemd-machine-id-setup

if [ ! -f "$ETC_MACHINE_ID" ]; then
    echo "[ERROR] Machine ID missing, after update";
    exit 1;
fi

mkdir -p "$(dirname "$DBUS_MACHINE_ID")"
ln -sf "$ETC_MACHINE_ID" "$DBUS_MACHINE_ID"

echo "[INFO] Machine ID updated!";