#!/bin/bash

if [ "$EUID" -ne 0 ]; then 
    echo "run with elevated privileges; sudo or root!"
    exit 1
fi

set -e

# Avoid "apt-listchanges: Can't set locale" error
export LANG=C

export PACKAGE="fems"
FORCE_UPDATE=false
DEB_PATH="https://fenecon.de/fems-download/${PACKAGE}-latest.deb"
UPDATE_LOCK_FILE="/tmp/fems-update.lock"

# Parse command line paramaters
while getopts "fb:" arg; do
    case ${arg} in
        f)
            echo "# Activate FORCE_UPDATE mode"
            FORCE_UPDATE=true
            ;;
        b)
            echo "# Install SNAPSHOT from branch \"${OPTARG}\""
            DEB_PATH="https://fenecon.de/fems-download-dev/${OPTARG}/${PACKAGE}.deb"
            ;;
        ?)
            echo "Invalid option: -${OPTARG}."
            exit 2
            ;;
    esac
done

if [ "$FORCE_UPDATE" = true ]; then
    # FORCE_UPDATE mode
    # Remove dpkg-diverts
    for file in $(dpkg-divert --list '*openems*' | sed 's/.* diversion of \(.*\) to.*/\1/'); do
        echo "# Remove dpkg-divert for $file"
        rm $file
        dpkg-divert --remove --rename --local $file
    done

else
    # Do not update SNAPSHOT versions
    if [ $(curl --max-time 10 --silent http://x:user@localhost:8084/rest/channel/_meta/Version 2>&1 |
        grep '_meta/Version' | # Get JSON
        sed 's/^.*\"value\":\"\(.*\)\".*$/\1/' | # Get full Version
        grep -c '-') -ge 1 ]; then # Contains hyphen = SNAPSHOT; count >= 1
        echo "SNAPSHOT versions cannot be updated"
        exit 1
    fi
fi


function is_installed {
    dpkg-query -W -f='${Status}' $1 2>/dev/null | grep "ok installed" >/dev/null
    return $?
}

function apt_install {
    if ! is_installed $1; then
        echo "Install '$1'"
        apt-get install $1 --assume-yes || true
    fi
}

function apt_remove {
    if is_installed $1; then
        echo "Remove '$1'"
        apt-get remove $1 --assume-yes || true
    fi
}

function dpkg_install {
    local file=$1

    dpkg -i $file || apt-get install --fix-broken --assume-yes
}

function dpkg_download_install {
    local source=$1
    local filename=$(basename $1)

    echo "Download and install $filename"
    wget $source -O /tmp/$filename
    dpkg_install /tmp/$filename
    rm -f /tmp/$filename
}

function install_debian_apt_key {
    local version_number=$1
    local version_name=$2

    local keystore="/etc/apt/trusted.gpg.d/debian-archive-${version_name}.asc"

    if [ ! -f "$keystore" ]; then
        local keytmp=$(mktemp /tmp/archive-key.XXXXXX)
        wget "https://deb.fenecon.de/debian-keys/archive-key-${version_number}.asc" -O "${keytmp}"
        install -m 644 "${keytmp}" "${keystore}"
    fi
}

function install_raspbian_apt_key {
    local keytmp="/tmp/raspbian.public.key"
    local keystore="/etc/apt/trusted.gpg.d/raspbian.asc"
    
    if [ ! -f "$keystore" ]; then
        wget "https://deb.fenecon.de/debian-keys/raspbian.public.key" -O "${keytmp}"
        install -m 644 "${keytmp}" "${keystore}"
    fi
}

function apt_upgrade  {
    APT_LISTCHANGES_FRONTEND=none DEBIAN_FRONTEND=noninteractive \
    apt-get upgrade -y \
    -o Dpkg::Options::='--force-confdef' -o Dpkg::Options::='--force-confold'
}

function install_freexian_apt_key {
    local keytmp="/tmp/freexian-archive-extended-lts.gpg"
    local keystore="/etc/apt/trusted.gpg.d/freexian-archive-extended-lts.gpg"

    if [ ! -f "$keystore" ]; then
        wget "https://deb.fenecon.de/debian-keys/freexian-archive.gpg" -O "${keytmp}"
        install -m 644 "${keytmp}" "${keystore}"
    fi
}

function vacuum {
    apt-get clean || true
    journalctl --rotate --vacuum-files=1 || true
    find /usr/share/{doc,man,locale} -not -name "copyright" -type f -delete || true
}

function __cleanup {
    if [ -f "$UPDATE_LOCK_FILE" ]; then
        rm -f "$UPDATE_LOCK_FILE"
    fi
}

function prevent_multiple_exec {
    if [ -f "$UPDATE_LOCK_FILE" ]; then
        echo "Update is still running!"
        exit 1
    fi

    trap __cleanup EXIT;
    touch $UPDATE_LOCK_FILE;
}

#################
#     MAIN      #
#################

prevent_multiple_exec;

VERSION=""
VERSION_CODENAME=""
if [ -e /etc/os-release ]; then
    source /etc/os-release

    if [ -z "$VERSION_CODENAME" ]; then
        case "$VERSION" in
            "8 (jessie)" ) VERSION_CODENAME=jessie;;
            "9 (stretch)" ) VERSION_CODENAME=stretch;;
        esac
    fi
fi

# Set fenecon apt source
case "$VERSION_CODENAME" in
    "jessie" | "stretch" | "buster" )
        install_freexian_apt_key;
        echo "deb https://deb.fenecon.de/debian-elts/ $VERSION_CODENAME main contrib non-free" > "/etc/apt/sources.list";;

    "bullseye")
        echo "deb https://deb.fenecon.de/debian/ $VERSION_CODENAME main contrib non-free" > "/etc/apt/sources.list";;

    "bookworm" | "trixie" )
        echo "deb https://deb.fenecon.de/debian/ $VERSION_CODENAME main contrib non-free-firmware" > "/etc/apt/sources.list";;
esac

# Remove alternate sources
find /etc/apt/sources.list.d -name "*.list" -delete

# Modberry add raspbian source
if [[ "$( cat /proc/cpuinfo | grep Hardware )" == *"BCM"* ]]; then
    install_raspbian_apt_key;
    echo "deb https://deb.fenecon.de/raspbian/ $VERSION_CODENAME main contrib non-free rpi" > "/etc/apt/sources.list.d/raspi.list"
fi

# Install apt keys
install_debian_apt_key 11 bullseye
install_debian_apt_key 12 bookworm
install_debian_apt_key 13 trixie

vacuum;
apt_remove build-essential;

# Fix brocken installation
if [[ "$(dpkg-query -W -f='${Status}\n' fems)" == *"half-installed"* ]]; then
    FEMS_VERSION="$(dpkg-query -W -f='${Version}\n' fems)"
    wget "https://fenecon.de/fems-archive/fems-${FEMS_VERSION}.deb" -O /tmp/fems.deb
    dpkg_install /tmp/fems.deb
fi

if [ -d "/home/imodcloud" ]; then
    echo "# Hold kernel and bootloader on Techbase"

    apt-mark hold raspberrypi-kernel
    apt-mark hold raspberrypi-bootloader
fi

if [ -e /etc/apt/apt.conf.d/01-fems-setup ]; then
    echo "# Remove deprecated fiona proxy"
    rm -f /etc/apt/apt.conf.d/01-fems-setup
fi

echo "# Setup dependencies"
rm -f /etc/apt/trusted.gpg.d/*.lock

if [ ! -e /usr/lib/apt/methods/https ]; then
    echo "# Fix apt method driver for https"
    ln -s http /usr/lib/apt/methods/https
fi

# Do not block at libc6 configure
echo 'libc6 libraries/restart-without-asking boolean true' | sudo debconf-set-selections

free_bytes=$(df /boot/ --output=avail -B1 | tail -1)
if [[ $free_bytes -lt 1024 ]]; then
    echo "#"
    echo "# /boot is full"
    echo "# Running kernel version: $(uname -r)"
    KERNEL_MAJOR=$(uname -r | cut -d'-' -f1)
    KERNEL_RUNNING=$(uname -r | cut -d'-' -f2)
    KERNEL_OLD=$(readlink -f /boot/vmlinuz.old | cut -d'-' -f3)
    KERNEL_NEXT=$(readlink -f /boot/vmlinuz | cut -d'-' -f3)
    for i in $(seq 1 $((KERNEL_NEXT-1))); do
        if [ $i -ne $KERNEL_RUNNING -a $i -ne $KERNEL_OLD ]; then
            echo "# Delete kernel version $KERNEL_MAJOR-$i"
            rm -fv /boot/initrd.img-$KERNEL_MAJOR-$i-*
            rm -fv /boot/vmlinuz-$KERNEL_MAJOR-$i-*
            rm -fv /boot/System.map-$KERNEL_MAJOR-$i-*
        fi
    done
    echo "#"
fi

dpkg --configure -a --force-confnew || true

apt-get install --fix-broken --assume-yes || true

apt_install dirmngr
apt_install gnupg

apt-get autoremove --assume-yes || true
apt-get --fix-broken install --assume-yes || true

case "$VERSION_CODENAME" in
    "jessie") 
    apt-get update || true
    ;;

    *) 
    apt-get --allow-releaseinfo-change update || true
    ;;
esac

apt_upgrade

apt_install at
apt_install ncdu

if is_installed fems-techbase-sys-mods; then
    if dpkg --compare-versions $(dpkg-query -W -f='${Version}' fems-techbase-sys-mods) lt 1.1.1;
    then
        dpkg_download_install https://fenecon.de/fems-download/fems_techbase_sys_mods-latest.deb
    fi
fi

if ! is_installed temurin-21-jre; then
    apt_install p11-kit
    apt_install fonts-dejavu
    apt_install libasound2

    echo "# Install JRE 21"
    dpkg_download_install https://fenecon.de/fems-download/deb/adoptium-ca-certificates-latest.deb
    dpkg_download_install https://fenecon.de/fems-download/deb/temurin-21-jre-armhf-latest.deb
    update-alternatives --set 'java' '/usr/lib/jvm/temurin-21-jre-armhf/bin/java'
fi

apt_remove temurin-17-jre
apt_remove adoptopenjdk-16-hotspot-jre
apt_remove openjdk-8-jre-headless

if [ ! -s /etc/ssl/certs/adoptium/cacerts ]; then
    dpkg-reconfigure adoptium-ca-certificates
fi

apt-get install --fix-broken --assume-yes || true

vacuum;

if [ ! -f "/etc/openems.d/hardware.conf" ]; then
    wget https://fenecon.de/fems-tools/detect-hw.sh -O /tmp/detect-hw.sh
    bash /tmp/detect-hw.sh
fi

export CURRENT_VERSION="$(dpkg-query --showformat='${Version}' --show $PACKAGE)"
export LATEST_VERSION="$(wget -qO- https://fenecon.de/debian-test/${PACKAGE}-latest.version)"
if [ "$CURRENT_VERSION" = "$LATEST_VERSION" -a "$FORCE_UPDATE" = false ]; then
    echo "# $PACKAGE: latest version [$LATEST_VERSION] is already installed"
else
    echo "# $PACKAGE: Updating from version [$CURRENT_VERSION] to [$LATEST_VERSION]"
    rm -Rf /tmp/org.osgi.framework.storage
    wget $DEB_PATH -O /tmp/${PACKAGE}.deb

    apt_remove openems-core
    apt_remove openems-core-fems

    if [ -e /usr/lib/openems/openems.jar ]; then
        echo "# Backup /usr/lib/openems/openems.jar"
        cp /usr/lib/openems/openems.jar /usr/lib/openems/openems.jar-backup-on-update
    fi
    dpkg_install /tmp/${PACKAGE}.deb
    rm -f /tmp/${PACKAGE}.deb
fi

echo "# Finished"
