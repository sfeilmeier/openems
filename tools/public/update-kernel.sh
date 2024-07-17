#!/bin/bash

set -e

LOCK_FILE="/tmp/kernel-update.lock"
KERNEL_SRC="/etc/apt/sources.list.d/fems-kernel.list"

function check_config {
    if ! ( grep -q i2c-dev "/etc/modules" ); then
        echo "i2c-dev" >> "/etc/modules";
    fi

    if ! ( grep -q "gpio=17=dl" "/boot/config.txt" ); then
        echo "gpio=17=dl" >> "/boot/config.txt"
    fi

    sed -i 's|dtparam=i2c_arm=on|#dtparam=i2c_arm=on|g' /boot/config.txt
} #check_config

function check_packages {
    apt-get install -y --allow-change-held-packages fems-techbase-kernel fems-techbase-sys-mods;

    apt-mark manual fems-techbase-kernel fems-techbase-sys-mods;
    apt-mark hold fems-techbase-kernel;

    systemctl enable comctrl;

    udevadm control --reload-rules && udevadm trigger;
    comctrl -b;
} #check_packages

function check {
    check_packages;

    if [[ $( du -s /boot/ | awk '{print $1}' ) < 1000 ]]; then
        echo;
        echo -e "\033[0;31m#########################################\033[0m";
        echo -e "\033[0;31m BOOT DIRECTORY IS EMPTY! DON'T RESTART! \033[0m";
        echo -e "\033[0;31m#########################################\033[0m";
        exit 1
    fi

    check_config;
} #check

function get_hardware {
    local hardware=$( cat /proc/cpuinfo | grep Hardware );
    local model=$( cat /proc/cpuinfo | grep Model );

    case "$hardware" in
        *"BCM"*)
        case "$model" in
            *"Compute Module 4S"*) echo "cm4s";;
            *"Compute Module 3"*) echo "cm3";;
            *"Compute Module 4"*) echo "cm4" ;;
            *) echo "Broadcom";;
        esac 
        ;;
        *"Generic AM33"*) echo "beaglebone";;
        *"Freescale i.MX7"*) echo "compulab";;
        *) echo "unknown";;
    esac;
} #get_hardware

function upgrade {
    echo "deb [signed-by=/usr/share/keyrings/fenecon.gpg] http://fenecon.de/debian kernel main" > "$KERNEL_SRC";

    apt-get update;

    if ( dpkg -s fems-techbase-cm3 >/dev/null 2>&1 ); then
        apt-get install --allow-change-held-packages --only-upgrade -y fems-techbase-cm3;
    fi
    if ( dpkg -s fems-techbase-cm4 >/dev/null 2>&1 ); then
        apt-get install --allow-change-held-packages --only-upgrade -y fems-techbase-cm4;
    fi

    check
} #upgrade

function __cleanup {
    if [[ $? -ne 0 ]]; then
        echo;
        echo -e "\033[0;31m#######################\033[0m";
        echo -e "\033[0;31m KERNEL UPDATE FAILED! \033[0m";
        echo -e "\033[0;31m#######################\033[0m";
    fi
    [[ -f "$LOCK_FILE" ]] && rm "$LOCK_FILE"
    [[ -f "$KERNEL_SRC" ]] && rm "$KERNEL_SRC"
} #__cleanup

########## MAIN #############

if [ "$EUID" -ne 0 ]; then 
    echo "RUN AS ROOT!"
    exit 1
fi

if [ -f "$LOCK_FILE" ]; then 
    echo 'KERNEL UPDATE ALREADY RUNNING!'; 
    exit 1 
else
    trap __cleanup EXIT;
    touch "$LOCK_FILE";
fi

echo -e "\033[1mSTART KERNEL UPDATE\033[0m";

hw=$(get_hardware);

if ! [[ "$hw" == "cm"* ]]; then
    echo -e "\033[0;31mKERNEL UPDATE NOT AVAILABLE FOR HARDWARE \"$hw\"!\033[0m";
    exit 1;
fi

upgrade;

check;

echo;
echo -e "\033[0;32m##########################\033[0m";
echo -e "\033[0;32m KERNEL UPDATE SUCCESSFUL \033[0m";
echo -e "\033[0;32m##########################\033[0m";