Extend selenium-grid
====================

Functionaly testing and application usualy requires you to do the same over and
over.

It is possible to extend driver with your own methods in external files, loaded
using the cli `--before` parameter.

``` sh
$ selenium-grid --recursive --pre tests/extensions.js tests/functional
```

Tutorial
--------

### Connect to twitter

For this example, at least 2 files are required:

* `tests/extensions/twitter.js` to declare the twitter specific methods
* `tests/functional/twitter.js` to declare a test.

**Configure the grid**

Create a `selenium-grid.json` file with your twitter credentials, the desired
capabilities and your saucelabs/selenium configuration:

``` json
{
    "browsers": "The desired capabilities.",
    "browsers": "This setup is made for saucelabs.",
    "browsers": "For Selenium, platform would be XP",
    "browsers": [
        { "browserName": "internet explorer", "version": "8", "platform": "Windows XP" },
        { "browserName": "chrome", "version": "27" },
        { "browserName": "firefox", "version": "23" }
    ],

    "remoteCfg": "This is selenium configuration",
    "remoteCfg": {
        "protocol": "http:",
        "hostname": "127.0.0.1",
        "port": "4444",
        "path": "/wd/hub",
        "auth": "username:password"
    },
    "remoteCfg": "This is saucelabs configuration",
    "remoteCfg": {
        "hostname": "ondemand.saucelabs.com",
        "port": 80,
        "username": "YOUR USERNAME",
        "accessKey": "YOUR-ACCESS-KEY"
    },

    "twitter": "Configure Twitter extension.",
    "twitter": "This part is used in scenarios.",
    "twitter": {
        "username": "YOUR USERNAME",
        "password": "YOUR PASSWORD"
    }
}
```

**Extend the browser**

In `tests/extensions/twitter.js` write the following:

``` javascript
var x = require('./src/index').xpath;
var driver = require('./src/index').Driver;
// cache configuration for later use.
var configuration = config;

// add a new `signinTwitter` method to driver.
driver.prototype.signinTwitter = function (username, password) {
    // fill missing username and password
    // with configuration value.
    username = username || configuration.twitter.username;
    password = password || configuration.twitter.password;

    // if no username or password was found, then throw an error
    if (!username || !password) {
        throw new Error([
            'Unable to find your twitter credentials.',
            'Please fill the twitter config key with username and password.'
        ].join('\n'));
    }

    // fluent interface requires to return this.
    return this
        // open twitter home page
        .get('https://twitter.com/')
        // fill form and validate
        .thenFill(x('//*[@id="front-container"]/div[3]/div[2]/form'), {
            'session[username_or_email]': username,
            'session[password]': password
        }, true);
};
```

**Create a basic scenario**

In `tests/functional/twitter.js` write the following:

``` javascript
describe('twitter', function (browser, config) {

    browser
        .signinTwitter(/*config.twitter.username, config.twitter.password*/)
        .thenTitle(function (title, next) {
            this.log(title, next);
        });
});
```

**Run your scenario**

``` sh
$ selenium-grid tests/functional/twitter.js --before tests/extensions/twitter.js
```
