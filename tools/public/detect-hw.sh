#!/bin/bash

### INFO. HW REVISION EXAMPLE
#
# The file /etc/hardware_revision should contain:
# HOST_MAC=18:83:C4:3D:FD:55
# HW_NUMBER=00000000ffffffff
# CORE_VERSION=2408261449
# FIRMWARE_VERSION=2409161111
# LIB_VERSION=2405071155
# MB_VER=V2/x500
# NPE_PLATFORM=X500CM4
# SOFTMGR_VERSION=2312181545
# TESTER_ID=9
# GPRS_VERSION=2411130837
# UNIQUE_CONFIGURATION=fenec7_dev
# UNIQUE_TESTER_ID=fenec7_dev
# iMC_PASS=4TGORWWQ
# CONFIGURATION_DEVICE= RS485-AMA0 RS485-SC0 4DI 4DO VOUT3V3 USER_LED SWITCH 2SIM 2ETH RTC 2AO RS485-FTDI0
# NPE_MODEL=Modberry-500-M4S08
# NPE_ID=fenec_12_62549
# NPE_HARDWARE=NPE-X500-M4S08
# CONFIG=feneccm4s
# CONFIG_BOARD_TYPE=bcc
# CONFIG_BOARD_CODE=6e7d2a69949265af810fbd2209fb862f62d5
# PCB_ID_LENGTH=20
# PCB_ID=0425X5HFV1.0.0P62549

set -e

HW_CONF="/etc/openems.d/hardware.conf"
HW_REVISION="/etc/hardware_revision"

function read_hardware {
  HARDWARE=$(grep "^NPE_HARDWARE=" "$HW_REVISION" | cut -d'=' -f2)
  CONFIGURATION=$(grep "^CONFIGURATION_DEVICE=" "$HW_REVISION" | cut -d'=' -f2)

  case "$HARDWARE" in
    "NPE-X500-M3*") 
    echo "App.OpenemsHardware.CM3"
    ;;

    "NPE-X500-M4S*")
    if [[ "$CONFIGURATION" == *"2AO"* && "$CONFIGURATION" == *"RS485-FTDI0"* ]];
    then
      echo "App.OpenemsHardware.CM4S.Gen2"
    else
      echo "App.OpenemsHardware.CM4S"
    fi
    ;;

    "NPE-X500-M4*") 
    if [[ "$CONFIGURATION" == *"CanBus"* ]];
    then
      echo "App.OpenemsHardware.CM4Max"
    else
      echo "App.OpenemsHardware.CM4"
    fi
    ;;
    
    *) echo "unknown"
  esac  
} #read_hardware

function detect_internal_serial_adapter {
  if [ -e "/dev/busUSB3" ]; then
    local model=$(udevadm info --query=property --name /dev/busUSB3 | grep "ID_USB_MODEL=")
    if [[ "${model^^}" =~ "BASIC_UART" ]]; then
      echo "true";
    else
      echo "false";
    fi
  else
    echo "false";
  fi
}

function detect_hardware {
  local hardware=$( cat /proc/cpuinfo | grep Hardware );
  local model=$( cat /proc/cpuinfo | grep Model );

  case "$hardware" in
    *"BCM"*)
    case "$model" in
      *"Compute Module 3"*) echo "App.OpenemsHardware.CM3";;

      *"Compute Module 4S"*) 
        local serial_adapter="$( detect_internal_serial_adapter )"
        if [ "$serial_adapter" == "true" ]; then
          echo "App.OpenemsHardware.CM4S.Gen2"
        else
          echo "App.OpenemsHardware.CM4S"
        fi
        ;;
      
      *"Compute Module 4"*) echo "App.OpenemsHardware.CM4";;
      *) echo "unknown";;
    esac
    ;;

    *"Generic AM33"*) 
    echo "App.OpenemsHardware.BeagleBoneBlack"
    ;;

    *"Freescale i.MX7"*) 
    echo "App.OpenemsHardware.Compulab"
    ;;

    *) 
    echo "unknown"
    ;;
  esac
} #detect_hardware

#########################
########  MAIN  #########
#########################

OVERWRITE=true
APP_ID=""

while getopts "s" arg; do
  case ${arg} in
    s)
      echo "# Skip if already set."
      OVERWRITE=false
      ;;
    ?)
      echo "Invalid option: -${OPTARG}."
      exit 2
      ;;
  esac
done

if [ -f "$HW_REVISION" ]; then
  APP_ID="$(read_hardware)"
fi

if [ -z "$APP_ID" ]; then
  APP_ID="$(detect_hardware)"
fi

if [ -z "$APP_ID" ] || [ "$APP_ID" == "unknown" ]; then
  echo "could not determine hardware!"
  exit 1
fi

echo "Detected $APP_ID"
echo

if [ -f "$HW_CONF" ] && [ "$OVERWRITE" == "false" ]; then
  echo "Hardware config is already set. Not updating."
  exit 0
fi

echo "appId=$APP_ID" > "$HW_CONF"
echo "Hardware config updated."
