#!/bin/bash
#
# Run script:
# wget https://fenecon.de/fems-tools/update-distro.sh -O /tmp/update-distro.sh
# nohup bash /tmp/update-distro.sh > /tmp/distro-nohup.log 2>&1 &
# tail -f /tmp/distro-nohup.log
#

if [ "$EUID" -ne 0 ]; then
  echo "run with elevated privileges; sudo or root!"
  exit 1
fi

set -ex

UPDATE_LOCK_FILE="/tmp/distro-update.lock"
UPDATE_INFO_FILE="/tmp/distro-update.info"
UPDATE_LOG_FILE="/var/log/distro-update.log"


function check_system {
  if [ -z "$VERSION_NEXT" ]; then
    echo "nothing to upgrade!"
    exit 0
  fi;
  
  if [ -d "/home/imodcloud" ]; then
    echo "# Do not update kernel on Techbase"
    apt-mark hold raspberrypi-kernel raspberrypi-bootloader
  fi
  
  # free some space
  apt-get remove build-essential --assume-yes || true
  apt-get clean || true
  journalctl --rotate --vacuum-files=1 || true
  find /usr/share/{doc,man,locale} -not -name "copyright" -type f -delete || true
  
  # check if atleast 100M are free
  free_bytes=$(df / --output=avail -B1 | tail -1)
  if [[ $free_bytes -lt 104857600  ]]; then
    echo "not enough free storage"
    exit 1
  fi;
} #check_system

function next_version {
  local VERSION_CODENAME=""
  if [ -e /etc/os-release ]; then
    source /etc/os-release
    if [ -z "$VERSION_CODENAME" ]; then
      VERSION_CODENAME=$(echo "$VERSION" | grep -oP '\(\K[^\)]+')
    fi
  fi
  
  # Check for distro update
  [ -f /tmp/sources.list ] && rm /tmp/sources.list
  local VERSION_NEXT=""
  
  case "$VERSION_CODENAME" in
    "jessie") VERSION_NEXT="stretch";;
    "stretch") VERSION_NEXT="buster";;
    "buster") VERSION_NEXT="bullseye";;
    "bullseye") VERSION_NEXT="bookworm";;
  esac
  
  echo "$VERSION_NEXT"
} #next_version

function apt_get {
  APT_LISTCHANGES_FRONTEND=none DEBIAN_FRONTEND=noninteractive \
  apt-get "$@" \
  -o Dpkg::Options::='--force-confdef' -o Dpkg::Options::='--force-confold'
} #apt_get

function apt_update {
  apt-get update || apt-get update --allow-releaseinfo-change
} #apt_update

function ensure_updated {
  apt_update;
  apt_get upgrade -y;
  apt_get autoremove -y;
  apt_get clean;
} #ensure_updated

function dist_upgrade {
  apt-mark manual fems;
  apt-mark hold fems;
  
  apt_update;
  apt_get upgrade -y --without-new-pkgs;
  
  apt_get dist-upgrade -y;
  
  apt_get autoremove -y;
  apt_get clean;
  
  apt-mark unhold fems;
} #upgrade

function is_installed {
  dpkg-query -W -f='${Status}' "$1" 2>/dev/null | grep "ok installed" >/dev/null
  return $?
} #is_installed

function start_service {
  local service=$1
  
  # Check if service is enabled
  if ! ( /bin/systemctl --quiet is-enabled $service > /dev/null ); then
    # Enable
    echo "Enabling $service"
    /bin/systemctl enable $service.service
  fi
  
  echo "Start $service"
  /bin/systemctl start --no-block $service.service
} #start_service

function service_installed {
  systemctl list-unit-files | grep "${1}.service" >/dev/null
  return $?
} #service_installed

function update_sources {
  install /tmp/sources.list /etc/apt/sources.list
  
  if [ -f /tmp/raspi.list ]; then
    mkdir -p /etc/apt/sources.list.d
    install /tmp/raspi.list /etc/apt/sources.list.d/raspi.list
  fi
  
  # Comment other sources
  for file in $(find /etc/apt/sources.list.d/ -mindepth 1 -maxdepth 1 -not -name "raspi.list"); do
    sed -i -e 's/^\([^#].*\)/# \1/g' $file
  done
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

function install_freexian_apt_key {
    local keytmp="/tmp/freexian-archive-extended-lts.gpg"
    local keystore="/etc/apt/trusted.gpg.d/freexian-archive-extended-lts.gpg"

    if [ ! -f "$keystore" ]; then
        wget "https://deb.fenecon.de/debian-keys/freexian-archive.gpg" -O "${keytmp}"
        install -m 644 "${keytmp}" "${keystore}"
    fi
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

####### UPDATE ##########

function update_to_stretch {
  install_freexian_apt_key;
  echo "deb https://deb.fenecon.de/debian-elts/ stretch main contrib non-free" > "/tmp/sources.list"
  
  if [[ "$HARDWARE" == *"BCM"* ]]; then
    install_raspbian_apt_key;
    echo "deb https://deb.fenecon.de/raspbian-legacy/ stretch main contrib non-free rpi" > "/tmp/raspi.list"
  fi
  
  echo "update all packages"
  ensure_updated;
  
  echo "update sources.list"
  apt_get install -y apt-transport-https
  update_sources;

  echo "stretch" > $UPDATE_INFO_FILE
  
  echo "upgrade distro"
  dist_upgrade;
  
  echo "install essential packages"
  apt_get install -y \
  bash curl wget aptitude xz-utils systemd vim unzip \
  at git iptables java-common lsof ncdu nginx-light ntpdate \
  python-pymodbus python-socksipychain screen ufw vim wget

  start_service systemd-resolved
  start_service systemd-networkd
  start_service systemd-timesyncd
  
  # Make sure systemd resolved is properly activated
  ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf || true
}

function update_to_buster {
  install_freexian_apt_key;
  echo "deb https://deb.fenecon.de/debian-elts/ buster main contrib non-free" > "/tmp/sources.list"
  
  if [[ "$HARDWARE" == *"BCM"* ]]; then
    install_raspbian_apt_key;
    echo "deb https://deb.fenecon.de/raspbian-legacy/ buster main contrib non-free rpi" > "/tmp/raspi.list"
  fi
  
  echo "update all packages"
  ensure_updated;
  
  echo "update sources.list"
  update_sources;

  echo "buster" > $UPDATE_INFO_FILE
  
  echo "upgrade distro"
  dist_upgrade;
  
  echo "install essential packages"
  apt_get install -y \
  bash curl wget aptitude xz-utils systemd vim unzip python3 \
  at git iptables java-common lsof ncdu nginx-light ntpdate \
  python-pymodbus python-socksipychain screen ufw vim wget
  
  start_service systemd-resolved
  start_service systemd-networkd
  start_service systemd-timesyncd
  
  # Make sure systemd resolved is properly activated
  ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf || true
}

function update_to_bullseye {
  install_debian_apt_key 11 bullseye;
  echo "deb https://deb.fenecon.de/debian/ bullseye main contrib non-free" > "/tmp/sources.list"
  
  if [[ "$HARDWARE" == *"BCM"* ]]; then
    install_raspbian_apt_key;
    echo "deb https://deb.fenecon.de/raspbian/ bullseye main contrib non-free rpi" > "/tmp/raspi.list"
  fi
  
  echo "update all packages"
  ensure_updated;
  
  echo "update sources.list"
  update_sources;

  echo "bullseye" > $UPDATE_INFO_FILE
  
  echo "upgrade distro"
  dist_upgrade;
  
  echo "install essential packages"
  apt_get install -y \
  bash curl wget aptitude xz-utils systemd vim unzip python-is-python3 python3 \
  at git iptables java-common lsof ncdu nginx-light ntpdate \
  python3-pymodbus python3-socksipychain screen ufw vim wget \
  systemd-timesyncd
  
  start_service systemd-resolved
  start_service systemd-networkd
  start_service systemd-timesyncd
  
  # Make sure systemd resolved is properly activated
  ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf || true
}

function update_to_bookworm {
  install_debian_apt_key 12 bookworm;
  echo "deb https://deb.fenecon.de/debian/ bookworm main contrib non-free-firmware" > "/tmp/sources.list"
  
  if [[ "$HARDWARE" == *"BCM"* ]]; then
    install_raspbian_apt_key;
    echo "deb https://deb.fenecon.de/raspbian/ bookworm main contrib non-free rpi" > "/tmp/raspi.list"
  fi
  
  echo "update all packages"
  ensure_updated;
  
  echo "update sources.list"
  update_sources;

  echo "bookworm" > $UPDATE_INFO_FILE
  
  echo "upgrade distro"
  dist_upgrade;
  
  echo "install essential packages"
  apt_get install -y \
  bash curl wget aptitude xz-utils systemd vim unzip python-is-python3 python3 \
  at git iptables java-common lsof ncdu nginx-light ntpdate \
  python3-pymodbus python3-socksipychain screen ufw vim wget \
  systemd-resolved systemd-timesyncd
  
  start_service systemd-resolved
  start_service systemd-networkd
  start_service systemd-timesyncd
  
  # Make sure systemd resolved is properly activated
  ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf || true
}

####### MAIN ############

prevent_multiple_exec;

if [ -f "$UPDATE_INFO_FILE" ]; then
  echo "Last atempt failed mid Upgrade!" 
  echo "A new run without manual adjustment will fail!"
  exit 1
fi;

HARDWARE="$( cat /proc/cpuinfo | grep Hardware )"
VERSION_NEXT="$( next_version )"

check_system;

echo "distro update to $VERSION_NEXT"

set -o pipefail

{
start_time=$(date +%s)

case "$VERSION_NEXT" in
  "stretch") update_to_stretch;;
  "buster") update_to_buster;;
  "bullseye") update_to_bullseye;;
  "bookworm") update_to_bookworm;;
esac

end_time=$(date +%s)
elapsed_time=$((end_time - start_time))

minutes=$((elapsed_time / 60))
seconds=$((elapsed_time % 60))

echo "Execution time: ${minutes} minutes and ${seconds} seconds"

} 2>&1 | tee "$UPDATE_LOG_FILE"

end_time=$(date +%s)

rm $UPDATE_INFO_FILE

reboot;