#!/bin/bash
# Author : Teddy Skarin

# 1. Create ProgressBar function
# 1.1 Input is currentState($1) and totalState($2)
function ProgressBar {
	# Process data
	local progress=$(( ( $1 * 100 ) / $2 ))
	local done=$(( ( $progress * 4 ) / 10 ))
	local left=$(( 40 - $done ))
	# Build progressbar string lengths
	local done_str=$(printf "%${done}s")
	local left_str=$(printf "%${left}s")

	# 1.2 Build progressbar strings and print the ProgressBar line
	# 1.2.1 Output example:
	# 1.2.1.1 Progress : [########################################] 100%
	printf "\rProgress : [${done_str// /#}${left_str// /-}] ${progress}%%"

}

# Variables
_start=1

# This accounts as the "totalState" variable for the ProgressBar function
_end=100

# Proof of concept
for number in $(seq ${_start} ${_end})
do
	sleep $1
	ProgressBar ${number} ${_end}
done
printf '\nFinished!\n'