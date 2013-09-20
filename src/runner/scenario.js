var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = ScenarioRunner;

function ScenarioRunner(scenario, config) {
    this.config = config;
    this.scenario = scenario;
    EventEmitter.call(this);
}
util.inherits(ScenarioRunner, EventEmitter);

ScenarioRunner.prototype.preprocess = function (desired) {
    if (_.isFunction(this.scenario.before)) {
        this.scenario.before(desired);
    }
    this.emit('before', this, desired);
};
ScenarioRunner.prototype.run = function (desired, doneCb) {
    try {
        var done = _.bind(this.postprocess, this, doneCb, desired);
        this.preprocess(desired);
        this.doRun(desired, done);
    } catch (err) {
        done(err);
    }
};
ScenarioRunner.prototype.doRun = function (desired, done) {
    if (_.isFunction(this.scenario.run)) {
        this.scenario.run(this.config, desired, done);
    } else if (_.isFunction(this.scenario)) {
        this.scenario(this.config, desired, done);
    } else {
        throw new Error('Unable to run test ' + this.scenario.name);
    }
};
ScenarioRunner.prototype.postprocess = function (done, desired, err) {
    try {
        if (_.isFunction(this.scenario.after)) {
            this.scenario.after(err, desired);
        }
        this.emit('after', err, this, desired);
    } catch (e) {
        // it is possible to modify error on after.
        err = e;
    }
    done(err);
};

ScenarioRunner.prototype.getName = function () {
    return this.scenario.name || this.id || '<unknown>';
};
