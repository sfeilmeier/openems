#!/bin/bash

set -e

KERNEL_SOURCE="https://fenecon.de/fems-download/fems_techbase_kernel-latest.deb"
KERNEL_FILE="/tmp/kernel.deb"

SYSMODS_SOURCE="https://fenecon.de/fems-download/fems_techbase_sys_mods-latest.deb"
SYSMODS_FILE="/tmp/sys-mods.deb"

LOCK_FILE="/tmp/kernel-update.lock"

function __cleanup {
    if [[ $? -ne 0 ]]; then
        echo;
        echo -e "\033[0;31m####################\033[0m";
        echo -e "\033[0;31m KERNEL FIX FAILED! \033[0m";
        echo -e "\033[0;31m####################\033[0m";
    fi
    [[ -f "$LOCK_FILE" ]] && rm "$LOCK_FILE"
    [[ -f "$KERNEL_FILE" ]] && rm "$KERNEL_FILE"
    [[ -f "$SYSMODS_FILE" ]] && rm "$SYSMODS_FILE"
} #__cleanup

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

function fix_config_txt {
    if ! ( grep '\[cm3\]' test.conf > /dev/null 2>&1 ) && ( grep '\[pi3\]' test.conf > /dev/null 2>&1 ); 
    then
        return;
    fi

    cat <<EOF > /tmp/config.txt
# For more options and information see http://rpf.io/configtxt
# Disable unused display settings
disable_overscan=1
camera_auto_detect=0
display_auto_detect=0
disable_splash=1

[pi4]
arm_boost=1

[all]

[cm4]
otg_mode=1

[all]

[cm4s]
otg_mode=1
dtoverlay=pi3-miniuart-bt
dtoverlay=rtc_cm4s_tb_v11_mcp7941x

[all]

[pi3]
dtoverlay=dwc2,dr_mode=host
dtoverlay=pi3-miniuart-bt
dtoverlay=rtc_cm3_tb_v11,mcp7941x
# Do not turbo GPU
disable_auto_turbo=1

[all]
dtparam=i2c0=on
i2c0_baudrate=400000
dtoverlay=i2c0,pins_44_45=1
dtparam=i2c1=on
i2c1_baudrate=400000

dtoverlay=disable-wifi

# enable AMA0 RS485
gpio=17=dl
EOF

    install -m 644 /tmp/config.txt /boot/config.txt
} #fix_config_txt

function is_newer {
    local package=$1
    local file=$2

    installed_version=$(dpkg-query -W -f='${Version}' "$package" 2>/dev/null || echo "0")
    new_version=$(dpkg-deb --show --showformat='${Version}' "$file")

    if dpkg --compare-versions "$new_version" gt "$installed_version"; then
        echo "true"
    else
        echo "false"
    fi
} #is_newer

function install_package {
    local source="$1"
    local file="$2"
    local package="$3"

    wget "$source" -O "$file"

    if [ "$(is_newer $package $file)" == "true" ]; then
        apt-get install -y $file;
    else
        echo "newest version of '$package' already installed"
    fi

    rm "$file"
} #install_package

########### MAIN ##########

if [ "$EUID" -ne 0 ]; then 
    echo "RUN AS ROOT!"
    exit 1
fi

if [ -f "$LOCK_FILE" ]; then 
    echo 'KERNEL FIX ALREADY RUNNING!'; 
    exit 1 
else
    trap __cleanup EXIT;
    touch "$LOCK_FILE";
fi

hw=$(get_hardware);
if ! [[ $hw == "cm"* ]]; then
    echo -e "\033[0;31mFIX NOT AVAILABLE FOR HARDWARE \"$hw\"!\033[0m";
    exit 1
fi
if ( ! dpkg -s fems-techbase-kernel >/dev/null 2>&1 ); then
    echo -e "\033[0;31mNEW KERNEL NOT INSTALLED!\033[0m";
    exit 1
fi

apt-get update;

install_package "$KERNEL_SOURCE" "$KERNEL_FILE" "fems-techbase-kernel"
install_package "$SYSMODS_SOURCE" "$SYSMODS_FILE" "fems-techbase-sys-mods"

udevadm control --reload-rules && udevadm trigger;
comctrl -b;

if ! ( grep -q i2c-dev "/etc/modules" ); then
    echo "i2c-dev" >> "/etc/modules";
fi;

if ! ( grep -q "gpio=17=dl" "/boot/config.txt" ); then
    echo "gpio=17=dl" >> "/boot/config.txt";
fi;

fix_config_txt;

systemctl enable comctrl;

if [[ $( du -s /boot/ | awk '{print $1}' ) < 1000 ]]; then
    echo;
    echo -e "\033[0;31m#########################################\033[0m";
    echo -e "\033[0;31m BOOT DIRECTORY IS EMPTY! DON'T RESTART! \033[0m";
    echo -e "\033[0;31m#########################################\033[0m";
    exit 1;
fi

apt-mark manual fems-techbase-kernel fems-techbase-sys-mods;
apt-mark hold fems-techbase-kernel;
