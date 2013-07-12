var _ = require('lodash');

module.exports = ScenarioRunner;

function ScenarioRunner(scenario, remoteCfg) {
    this.scenario = scenario;
    this.remoteCfg = remoteCfg;
}

ScenarioRunner.prototype.preprocess = function (desired) {
    if (_.isFunction(this.scenario.before)) {
        this.scenario.before(desired);
    }
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
        this.scenario.run(this.remoteCfg, desired, done);
    } else if (_.isFunction(this.scenario)) {
        this.scenario(this.remoteCfg, desired, done);
    } else {
        throw new Error('Unable to run test ' + this.scenario.name);
    }
};
ScenarioRunner.prototype.postprocess = function (done, desired, err) {
    if (_.isFunction(this.scenario.after)) {
        try {
            this.scenario.after(err, desired);
        } catch (e) {
            // it is possible to modify error on after.
            err = e;
        }
    }
    done(err);
};
