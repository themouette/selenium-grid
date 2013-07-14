Webdriver
=========

[Wd](https://github.com/admc/wd) is the most active webdriver library in node.js.
It is possible to write scenarios using wd very quickly with `selenium-grid`
Webdriver scenario.

Example
-------

``` javascript
var grid = require('selenium-grid');
var WdScenario = grid.scenario.Webdriver;
var chai = require('chai');

var MyFirstScenario = WdScenario.extend({
    name: 'my very first scenario',
    doRun: function (browser) {
        browser
            .get('http://google.fr')
            .title(function (title) {
                chai.assert.equal(title, 'Google');
            });
    }
});

module.exports = new MyFirstScenario();
```

Hey, but where's my error ?
---------------------------

Wd callbacks provide the error so you can handle it by yourself.
In `selenium-grid`, we believe that this error has to be handled by the grid,
not you.

It is still possible to access wd raw methods, just use the `_` prefix.

``` javascript
    doRun: function (browser) {
        browser
            .get('http://google.fr')
            ._title(function (err, title, done) {
                if (err) {return done(err);}
                // error catching is still activated though...
                chai.assert.equal(title, 'Google');
            });
    }
```

Missing methods
---------------

As wd chain API does not catch errors, we use a wrapper of ou own, so list of
accessible callbacks has to be maintained manually.

If a method is missing, it can be added in the
[src/scenario/webdriver](https://github.com/themouette/selenium-grid/blob/master/src/scenario/webdriver.js)
file.
