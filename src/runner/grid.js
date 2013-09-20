var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var async = require('async');

var ScenarioRunner = require('./scenario');
var BrowserRunner = require('./browser');
var GridError = require('../error/grid');

var bindings = {
    'before': 'before',
    'browser.before': 'beforeBrowser',
    'scenario.before': 'beforeScenario',
    'scenario.after': 'afterScenario',
    'browser.after': 'afterBrowser',
    'after': 'after'
};

module.exports = GridRunner;

function GridRunner(config, scenarios) {
    EventEmitter.call(this);
    this.config = config || {};
    _.bindAll(this,
                'beforeBrowser', 'beforeScenario',
                'afterBrowser', 'afterScenario');
    this.initScenarios(scenarios);
    this.initBrowsers();
    this.registerEvents();
}

util.inherits(GridRunner, EventEmitter);

GridRunner.prototype.registerEvents = function () {
    var self = this;
    _.each(bindings, function (property, event) {
        if (self.config[property]) {
            self.on(event, self.config[property]);
        }
    });
};
GridRunner.prototype.initScenarios = function (scenarios) {
    this.errors = [];
    this.scenarios = scenarios.map(this.createScenarioRunner, this);
};
GridRunner.prototype.createScenarioRunner = function (scenario, index) {
    var onBefore = this.beforeScenario;
    var onAfter = this.afterScenario;
    var runner = new ScenarioRunner(scenario, this.config);
    runner.on('before', onBefore);
    runner.on('after', onAfter);
    // set a default id
    runner.id || (runner.id = index);
    return runner;
};
GridRunner.prototype.beforeScenario = function (scenarioRunner, browserCfg) {
    this.emit.apply(this, ['scenario.before'].concat(_.toArray(arguments)));
};
GridRunner.prototype.afterScenario = function (err, scenarioRunner, browserCfg) {
    this.emit.apply(this, ['scenario.after'].concat(_.toArray(arguments)));
};
GridRunner.prototype.initBrowsers = function () {
    var browsers = getBrowserConfig(this);
    this.browsers = browsers.map(this.createBrowserRunner, this);
};
GridRunner.prototype.createBrowserRunner = function (browserCfg, index) {
    var onBefore = this.beforeBrowser;
    var onAfter = this.afterBrowser;
    var scenarios = this.scenarios;
    var concurrency = getBrowserConcurency(this);
    var runner = new BrowserRunner(browserCfg, scenarios, concurrency);
    runner.on('before', onBefore);
    runner.on('after', onAfter);
    runner.id || (runner.id = index);
    return runner;
};
GridRunner.prototype.beforeBrowser = function (browserRunner, browserCfg) {
    this.emit.apply(this, ['browser.before'].concat(_.toArray(arguments)));
};
GridRunner.prototype.afterBrowser = function (err, browserRunner, browserCfg) {
    this.emit.apply(this, ['browser.after'].concat(_.toArray(arguments)));
};

GridRunner.prototype.preprocess = function () {
    this.emit('before', this);
};
GridRunner.prototype.run = function (doneCb) {
    try {
        var done = _.bind(this.postprocess, this, doneCb);
        this.preprocess();
        this.doRun(done);
    } catch (err) {
        done(err);
    }
};
GridRunner.prototype.doRun = function (done) {
    if (!this.browsers || !this.browsers.length) {
        return done();
    }

    var queue = async.queue(_.bind(this.runBrowser, this), this.browsers.length);
    var self = this;
    queue.drain = done;

    this.browsers.forEach(function (browser) {
        queue.push(browser, function (err) {
            if (err) { self.errors.push(err); }
        });
    });
};
GridRunner.prototype.runBrowser = function (browser, done) {
    try {
        browser.run(done);
    } catch (err) {
        try {
            done(err);
        } catch (e) {
            console.log('Unale to handle error ' + err);
            console.log(e.stack);
            console.log('it throws ' + e);
        }
    }
};
// be carefull, err is not passed to queue drain
GridRunner.prototype.postprocess = function (done, err) {
    if (!err && this.errors.length) {
        err = new GridError('Errors were caught for this run.', this.errors);
    }
    try {
        this.emit('after', err, this);
    } catch (e) {
        err = e;
    }
    done(err);
};

function getBrowserConfig(grid) {
    return grid.config.browsers || [];
}
function getBrowserConcurency(grid) {
    return grid.config.concurrency || 2;
}
