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

``` sh
{
    "browsers": [
        { "browserName": "internet explorer", "version": "8", "platform": "XP" },
        { "browserName": "chrome", "version": "latest" },
        { "browserName": "firefox", "version": "latest" }
    ],
    "remoteCfg": {
        "host": "ondemand.saucelabs.com",
        "port": 80
    }
}
```

Launch tests
------------

``` sh
$ node_modules/selenium-grid/bin/selenium-grid
```

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
