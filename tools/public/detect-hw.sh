#!/bin/bash

set -e

HW_CONF="/etc/openems.d/hardware.conf"
HW_REVISION="/etc/hardware_revision"

function read_hardware {
  source "$HW_REVISION"

  case "$cpu" in
    "CM3") 
    echo "App.OpenemsHardware.CM3"
    ;;

    "CM4S")
    if [[ "$serialports" == *"3xRS485"* ]];
    then
      echo "App.OpenemsHardware.CM4S.Gen2"
    else
      echo "App.OpenemsHardware.CM4S"
    fi
    ;;

    "CM4") 
    if [[ "$serialports" == *"1xCanBus"* ]];
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
