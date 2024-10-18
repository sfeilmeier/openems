# Script to automatically update a ATL Battery

```shell
wget http://fenecon.de/fems-tools/atlUpdate/atlUpdate.sh -O /tmp/atlUpdate.sh && bash /tmp/atlUpdate.sh /dev/busUSB1 19200 24_10_18
```

## Force Update

```shell
wget http://fenecon.de/fems-tools/atlUpdate/atlUpdate.sh -O /tmp/atlUpdate.sh && bash /tmp/atlUpdate.sh /dev/busUSB1 19200 24_10_18 true
```

## Only for testing: java -jar atlUpdate.jar /dev/busUSB2 19200 0.4

```shell
#java -jar JARNAME.jar PORTNAME BAUDRATE UPDATE_FILE (FORCE_UPDATE)
java -jar atlUpdate.jar ttyUSB0 19200 c:\home\udpatefile.bin false
```
