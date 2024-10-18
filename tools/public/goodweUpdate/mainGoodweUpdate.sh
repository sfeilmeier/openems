#!/bin/bash
#
# Script to automatically updates a GoodWe Inverter.
#
# Please exchange the Type and the Version to install different Firmware for different GoodWe types
#
# Example (GoodWe10, 09_03_24) in command-line:
# wget http://fenecon.de/debian-test/goodweUpdate/mainGoodweUpdate.sh -O /tmp/mainGoodweUpdate.sh && bash -x /tmp/mainGoodweUpdate.sh goodwe10 09_03_24 /dev/busUSB2 9600
#
# Monitoring:
# echo "wget http://fenecon.de/debian-test/goodweUpdate/mainGoodweUpdate.sh -O /tmp/mainGoodweUpdate.sh && bash -x /tmp/mainGoodweUpdate.sh goodwe10 09_03_24 /dev/busUSB2 9600 > /tmp/goodweLog 2>& 1" | at now
#
#
# Example (GoodWe20 or 30, 14_04_24):
# wget http://fenecon.de/debian-test/goodweUpdate/mainGoodweUpdate.sh -O /tmp/mainGoodweUpdate.sh && bash -x /tmp/mainGoodweUpdate.sh goodwe20_30 14_04_24 /dev/busUSB2 9600
#
# echo "wget http://fenecon.de/debian-test/goodweUpdate/mainGoodweUpdate.sh -O /tmp/mainGoodweUpdate.sh && bash -x /tmp/mainGoodweUpdate.sh goodwe20_30 14_04_24 /dev/busUSB2 9600 > /tmp/goodweLog 2>& 1" | at now
#
# Log for Monitoring: tail /tmp/goodweLog

set -e

TYPE=$1
VERSION=$2
PORT=$3
BAUD_RATE=$4
DETAILED_LOG=${5:-false}

TMP_FOLDER="/tmp/goodweupdate"
LOCK_FILE="$TMP_FOLDER/lock"

function downloadGoodWeUpdate {
	echo "Download GoodWe Update"
	wget http://fenecon.de/debian-test/goodweUpdate/$TYPE/goodweUpdate.jar -O "$TMP_FOLDER/update.jar"
	
	echo "Download GoodWe ARM Firmware"	
	wget http://fenecon.de/debian-test/goodweUpdate/$TYPE/$VERSION/arm.bin -O "$TMP_FOLDER/arm.bin"
	
	echo "Download GoodWe DSP Firmware"	
	wget http://fenecon.de/debian-test/goodweUpdate/$TYPE/$VERSION/dsp.bin -O "$TMP_FOLDER/dsp.bin"
}

function runGoodWeUpdate {
	echo "Start GoodWe Update"	
	java -jar "$TMP_FOLDER/update.jar" $PORT $BAUD_RATE "$TMP_FOLDER/arm.bin" "$TMP_FOLDER/dsp.bin" $DETAILED_LOG
}

__cleanup() {
	if [[ $? -ne 0 ]]; then
        echo;
        echo -e "\033[0;31m# ################################################# #\033[0m";
        echo -e "\033[0;31m# ############# GoodWe UPDATE FAILED! ############# #\033[0m";
        echo -e "\033[0;31m# ################################################# #\033[0m";
		echo;
		echo -e "\033[0;31mGoodWe Update fehlgeschlagen! Bitte erneut versuchen!\033[0m";
		echo;
		echo "Bitte pruefen, dass:"
		echo " - das FEMS Zugang zum Internet hat"
		echo " - der PORT dem Standard /dev/busUSB2 entspricht (Bei unklarheit, um Hilfe fragen)"
		echo " - eine Verbindung zum Wechselrichter gegeben ist"

		systemctl start openems --no-block || true;
    else
        echo;
        echo "# ################################################# #";
        echo "# ################### FINISHED #################### #";
        echo "# ################################################# #";

		echo "Restart Openems"
		systemctl restart openems --no-block || true;
    fi

	if [ -f "$LOCK_FILE" ]; then 
		rm "$LOCK_FILE"; 
	fi
}

#### MAIN ####

if [ -f "$LOCK_FILE" ];
then
	echo "Goodwe Update still running!"
	exit;
fi

if [ -z "$TYPE" ] || [ -z "$VERSION" ] || [ -z "$PORT" ] || [ -z "$BAUD_RATE" ]; then
	echo "Nicht genügend parameter."
	echo -e "Verwendung: mainGoodweUpdate.sh TYPE     VERSION  PORT         BAUDRATE"
	echo -e "Bsp.:       mainGoodweUpdate.sh goodwe10 09_03_24 /dev/busUSB2 9600"
	exit 1
fi

mkdir -p "$TMP_FOLDER"

trap __cleanup EXIT;
touch "$LOCK_FILE";

echo "Start GoodWe Update"
downloadGoodWeUpdate;

echo "Stop Openems"
systemctl stop openems --no-block;

runGoodWeUpdate;