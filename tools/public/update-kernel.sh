#!/bin/bash

set -e

KERNEL_SOURCE="https://fenecon.de/debian-test/fems_techbase_kernel-latest.deb"
KERNEL_FILE="/tmp/kernel.deb"

SYSMODS_SOURCE="https://fenecon.de/debian-test/fems_techbase_sys_mods-latest.deb"
SYSMODS_FILE="/tmp/sys-mods.deb"

OLD_KERNEL_FILE="/tmp/old-kernel.deb"

LOCK_FILE="/tmp/kernel-update.lock"

function check_config {
    if ! ( grep -q i2c-dev "/etc/modules" ); then
        echo "i2c-dev" >> "/etc/modules";
    fi

    if ! ( grep -q "gpio=17=dl" "/boot/config.txt" ); then
        echo "gpio=17=dl" >> "/boot/config.txt"
    fi

    sed -i 's|dtparam=i2c_arm=on|#dtparam=i2c_arm=on|g' /boot/config.txt
} #check_config

function check {
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
    apt-get update;

    if ( dpkg -s fems-techbase-cm3 >/dev/null 2>&1 ) || ( dpkg -s fems-techbase-cm4 >/dev/null 2>&1 ); then
        wget --no-check-certificate "$KERNEL_SOURCE" -O "$KERNEL_FILE"
        wget --no-check-certificate "$SYSMODS_SOURCE" -O "$SYSMODS_FILE"
       
        dpkg -i --auto-deconfigure $KERNEL_FILE $SYSMODS_FILE || apt-get install -f -y --allow-remove-essential

        apt-mark manual fems-techbase-kernel fems-techbase-sys-mods || true;
        apt-mark hold fems-techbase-kernel || true;

        systemctl enable comctrl;

        udevadm control --reload-rules && udevadm trigger;
        comctrl -b;
    else
        echo "no old Kernel installed"
        exit 1
    fi
} #upgrade

function __cleanup {
    if [[ $? -ne 0 ]]; then
        echo;
        echo -e "\033[0;31m#######################\033[0m";
        echo -e "\033[0;31m KERNEL UPDATE FAILED! \033[0m";
        echo -e "\033[0;31m#######################\033[0m";
    fi
    [[ -f "$LOCK_FILE" ]] && rm "$LOCK_FILE"
    [[ -f "$KERNEL_FILE" ]] && rm "$KERNEL_FILE"
    [[ -f "$SYSMODS_FILE" ]] && rm "$SYSMODS_FILE"
    [[ -f "$OLD_KERNEL_FILE" ]] && rm "$OLD_KERNEL_FILE"
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