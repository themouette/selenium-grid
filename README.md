Selenium grid
=============

Pilot a selenium grid from nodejs and run several scenarios in parallel.

[![Build
Status](https://travis-ci.org/themouette/selenium-grid.png?branch=master)](https://travis-ci.org/themouette/selenium-grid)

Example
-------

An example can be found in the
[example](https://github.com/themouette/selenium-grid/blob/master/example) directory.

Simply run `bin/selenium-grid example/**/*.js`.

Install
-------

Via npm:

``` sh
$ npm install selenium-grid
```

via Git:

``` sh
$ git clone https://github.com/themouette/selenium-grid.git && npm install
```

Configuration
-------------

Add a `.selenium-grid.json` in your home directory or a `selenium-grid.json` to
your project root.

``` json
{
    "browsers": [
        { "browserName": "internet explorer", "version": "8", "platform": "XP" },
        { "browserName": "chrome", "version": "latest" },
        { "browserName": "firefox", "version": "latest" }
    ],
    "remoteCfg": {
        "protocol": "http:",
        "hostname": "127.0.0.1",
        "port": "4444",
        "path": "/wd/hub"
    }
}
```

If you use saucelabs, just use following configuration:

``` json
{
    "browsers": [
        { "browserName": "internet explorer", "version": "8", "platform": "Windows XP" },
        { "browserName": "chrome", "version": "27" },
        { "browserName": "firefox", "version": "23" }
    ],
    "remoteCfg": {
        "host": "ondemand.saucelabs.com",
        "port": 80,
        "username": "YOUR USERNAME",
        "accessKey": "YOUR-ACCESS-KEY"
    }
}
```

Launch tests
------------

``` sh
$ node_modules/selenium-grid/bin/selenium-grid --recursive tests/functional
```

To learn more about command line arguments, use
`node_modules/selenium-grid/bin/selenium-grid --help`

### Before

To extend browser capabilities or do anything else before test executions,
simply use the `before` option.

Runner instance will be made available through `grid` variable:

``` javascript
//pre.js

// You can register on any grid event

// executed before grid initialization
grid.on('before', function (grid) {});
// executed before launching any test on desired browser
grid.on('browser.before', function (browserRunner, desired) {});
// executed before every scenario
grid.on('scenario.before', function (scenarioRunner, desired) {});

grid.on('scenario.after', function (err, scenarioRunner, desired) {});
grid.on('browser.after', function (err, browserRunner, desired) {});
grid.on('after', function (err, grid) {});

// or do anything else you want, such as initialize your own reporter, launch a
// server...
```

### example output

![](https://github.com/themouette/selenium-grid/blob/master/img/output.png)

License
-------

This project is released under MIT license.

Refer to the
[LICENCE](https://github.com/themouette/selenium-grid/blob/master/LICENSE) file
for more informations.



Inspiration
-----------

* https://github.com/vvo/selenium-runner
* https://github.com/davglass/selenium-grid-status
