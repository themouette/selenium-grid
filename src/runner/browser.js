var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var async = require('async');
var BrowserError = require('../error/browser');

module.exports = BrowserRunner;

function BrowserRunner(browsercfg, scenarios, concurrency) {
    this.browser = browsercfg;
    this.scenarios = scenarios;
    this.concurrency = concurrency || 2;
    EventEmitter.call(this);
}

util.inherits(BrowserRunner, EventEmitter);

BrowserRunner.prototype.preprocess = function () {
    this.errors = [];
    this.emit('before', this, this.browser);
};
BrowserRunner.prototype.run = function (doneCb) {
    try {
        var done = _.bind(this.postprocess, this, doneCb);
        this.preprocess();
        this.doRun(done);
    } catch (err) {
        done(err);
    }
};
BrowserRunner.prototype.doRun = function (done) {
    if (!this.scenarios || !this.scenarios.length) {
        return done();
    }

    var self = this;
    var queue = async.queue(_.bind(this.runScenario, this), this.concurrency);
    queue.drain = _.bind(this.postprocess, this, done);

    this.scenarios.forEach(function (scenario) {
        queue.push(scenario, _.bind(self.postScenario, self, scenario));
    });
};
BrowserRunner.prototype.runScenario = function (scenario, done) {
    try {
        scenario.run(this.browser, done);
    } catch (err) {
        done(err);
    }
};
BrowserRunner.prototype.postScenario = function (scenario, err) {
    if (err) {
        this.errors.push(err);
    }
};
BrowserRunner.prototype.postprocess = function (done, err) {
    if (!err && this.errors.length) {
        err = new BrowserError('Errors where catched for this browser.', this.errors, this.browser);
    }
    try {
        this.emit('after', this, err, this.browser);
    } catch (e) {
        // it is possible to modify error on after.
        err = e;
    }
    done(err);
};

