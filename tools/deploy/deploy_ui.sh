#!/bin/bash
set -e

cd ../../ui

echo "Update repository"
echo
git reset --hard HEAD
git pull

echo
echo "Install dependencies"
echo
npm install

for theme in fenecon heckert; do
	echo
	echo "Building UI $theme"
	echo
	node_modules/.bin/ng build -c "${theme},${theme}-backend-prod,prod"
	echo
	echo "Create backup in '/opt/ui-${theme}-backup'"
	rm -Rf /opt/ui-$theme-backup
	mv /opt/ui-$theme /opt/ui-$theme-backup

	echo "Copy built UI to '/opt/ui-$theme'"
	cp -R target /opt/ui-$theme
done

echo
echo "Finished"
echo
