var _ = require('lodash');
var wd = require('wd');

var utils = require('./driver/utils');
var registerExtra = require('./driver/extra').register;
var registerNative = require('./driver/native').register;
var registerSelector = require('./driver/selector').register;

module.exports = Browser;

function Browser (config, desired, done) {
    this._driver = wd.remote(config);
    this._desired = desired;
    this._timeout = 1000;
    this._current = null;
    this._drain = function (err) {
        this._driver.quit(function () {
            done(err);
        });
    }.bind(this);
    this._steps = [];
}

// options
// set the actual timeout
Browser.prototype.timeout = function (nb) {
    this._timeout = nb;

    return this;
};

// Queue implementation.
Browser.prototype.then = Browser.prototype.push = function (callback) {
    this._steps.push(callback);
    if (!_.isNumber(this._current)) {
        _start.call(this);
    }
    return this;
};
Browser.prototype.now = Browser.prototype.unshift = function (callback) {
    this._steps.splice(this._current || 0, 0, callback);
    if (!_.isNumber(this._current)) {
        _start.call(this);
    }
    return this;
};

function _start() {
    this._current = 0;
    this._driver.init(this.desired, _process.bind(this));
}

function _process() {
    try {
        var done = _afterTask.bind(this);
        var task = this._steps[this._current];
        task.call(this, done);
    } catch (err) {
        done(err);
    }
}

function _afterTask(err) {
    if (err || this._current >= this._steps.length - 1) {
        return _teardown.call(this, err);
    }
    // process next
    this._current++;
    _process.call(this);
}

function _teardown(err) {
    this._drain(err);
}

registerExtra(Browser);
registerNative(Browser);
registerSelector(Browser);
