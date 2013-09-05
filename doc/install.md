Install
=======

To use `selenium-grid`, you need a selenium hub and at least one node (both can
be on the same machine).

Download standalone selenium server from [selenium downloads
page](https://code.google.com/p/selenium/downloads/list) on both node(s) and hub
machines.

Node machine might require extra drivers, IE driver is available on selenium
website, and chrome driver is available on [chromium download
page](https://code.google.com/p/chromedriver/downloads/list)

## Running hub

``` bash
java -jar selenium-server-standalone-2.33.0.jar -role hub \
    -timeout 30 -browserTimeout 60
```

## Running node

This script runs on a windows machine. You can download virtual machines on the
[modern.ie](http://modern.ie) website.

``` bash
TITLE selenium node
java -jar Selenium\selenium-server-standalone-2.33.0.jar ^
    -role node ^
    -hub http://192.168.1.25:4444/grid/register ^
    -Dwebdriver.ie.driver="%CD%\Selenium\IEDriverServer.exe" ^
    -Dwebdriver.chrome.driver="%CD%\Selenium\chromedriver.exe" ^
    -browser "browserName=internet explorer,version=8,platform=XP,maxInstances=5" ^
    -browser "browserName=chrome,version=latest,platform=XP,maxInstances=5" ^
    -browser "browserName=firefox,version=latest,platform=XP,maxInstances=5"
```

To run a mac/linux node, use following:

``` bash
#/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLATFORM="MAC"

java -jar "${DIR}/selenium-server-standalone-2.35.0.jar" \
    -role node \
    -hub http://cl-ssabatier:4444/grid/register \
    -Dwebdriver.chrome.driver="${DIR}/chromedriver" \
    -browser "browserName=safari,version=latest,platform=${PLATFORM},maxInstances=5" \
    -browser "browserName=chrome,version=latest,platform=${PLATFORM},maxInstances=5" \
    -browser "browserName=firefox,version=latest,platform=${PLATFORM},maxInstances=5"
```

List of supported platforms and browsers: https://code.google.com/p/selenium/wiki/DesiredCapabilities

