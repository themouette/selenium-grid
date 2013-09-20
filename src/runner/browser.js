var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var async = require('async');
var BrowserError = require('../error/browser');

module.exports = BrowserRunner;

function BrowserRunner(desired, scenarios, concurrency) {
    this.desired = desired;
    this.scenarios = scenarios;
    this.concurrency = concurrency || 2;
    EventEmitter.call(this);
}

util.inherits(BrowserRunner, EventEmitter);

BrowserRunner.prototype.preprocess = function () {
    this.errors = [];
    this.emit('before', this, this.desired);
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
    queue.drain = done;

    this.scenarios.forEach(function (scenario) {
        queue.push(scenario, _.bind(self.postScenario, self, scenario));
    });
};
BrowserRunner.prototype.runScenario = function (scenario, done) {
    try {
        scenario.run(this.desired, done);
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
        err = new BrowserError('Errors where caught for this browser.', this.errors, this.desired);
    }
    try {
        this.emit('after', err, this, this.desired);
    } catch (e) {
        // it is possible to modify error on after.
        err = e;
    }
    done(err);
};

