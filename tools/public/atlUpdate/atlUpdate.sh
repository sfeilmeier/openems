#!/bin/bash
#
# Script to automatically update a ATL Battery.
#
# wget http://fenecon.de/fems-tools/atlUpdate/atlUpdate.sh -O /tmp/atlUpdate.sh && bash /tmp/atlUpdate.sh /dev/busUSB1 19200 24_10_18
#
# Force Update
# wget http://fenecon.de/fems-tools/atlUpdate/atlUpdate.sh -O /tmp/atlUpdate.sh && bash /tmp/atlUpdate.sh /dev/busUSB1 19200 24_10_18 true 
#
#
# Only for testing: java -jar atlUpdate.jar /dev/busUSB2 19200 0.4
# java -jar JARNAME.jar     PORTNAME    BAUDRATE    UPDATE_FILE             (FORCE_UPDATE)
# java -jar AtlUpdate.jar   ttyUSB0     19200       c:\home\udpatefile.bin  false
#

set -e

PORT=$1
BAUD_RATE=$2
ATL_FW=$3
FORCE_MODE=${4:-false}

_LOCK_FILE="/tmp/atl-update.lock"
_BINARY_FILE="/tmp/atl-${ATL_FW}.bin"

__cleanup() {
    if [[ $? -ne 0 ]]; then
        echo;
        echo -e "\033[0;31m# ############################################## #\033[0m";
        echo -e "\033[0;31m# ############# ATL UPDATE FAILED! ############# #\033[0m";
        echo -e "\033[0;31m# ############################################## #\033[0m";
    else
        echo;
        echo "# ############################################## #";
        echo "# ################## FINISHED ################## #";
        echo "# ############################################## #";
    fi

	if [ -f "$_LOCK_FILE" ]; then
		rm "$_LOCK_FILE";
	fi

    echo "Restart Openems"
    systemctl restart openems --no-block;
}

if [ -f "$_LOCK_FILE" ];
then
	echo "Atl Update still running!"
	exit;
fi

#### Main ####

trap __cleanup EXIT;
touch "$_LOCK_FILE";

echo "Stop Openems"
systemctl stop openems --no-block;

echo "Main-Class: j2mod.App.class" > /tmp/input-file

echo "Start update script"	
wget "https://fenecon.de/fems-tools/atlUpdate/AtlUpdate.jar" -O "/tmp/AtlUpdate.jar"
wget "https://fenecon.de/fems-tools/atlUpdate/${ATL_FW}/atl.bin" -O "${_BINARY_FILE}"

java -jar /tmp/AtlUpdate.jar ${PORT} ${BAUD_RATE} ${_BINARY_FILE} ${FORCE_MODE}
