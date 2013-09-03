var _ = require('lodash');
var wd = require('wd');

var utils = require('./driver/utils');
var registerChain = require('./driver/chain').register;
var registerExtra = require('./driver/extra').register;
var registerNative = require('./driver/native').register;
var registerSelector = require('./driver/selector').register;
var registerAssert = require('./driver/assert').register;

module.exports = Browser;

function Browser (config, desired, done) {
    this.setupPlugins();
    this._driver = wd.remote(config);
    this._desired = desired;
    this._timeout = 1000;
    this._drain = function (err) {
        this._driver.quit(function () {
            done(err);
        });
    }.bind(this);
}

// An extension point for plugin initialization
Browser.prototype.setupPlugins = function () {};

// options
// set the actual timeout
Browser.prototype.timeout = function (nb) {
    this._timeout = nb;

    return this;
};

registerChain(Browser);
registerExtra(Browser);
registerNative(Browser);
registerSelector(Browser);
registerAssert(Browser);
