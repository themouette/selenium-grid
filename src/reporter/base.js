var _ = require('lodash');

module.exports = BaseReporter;

var bindings = {
    'before': 'onBefore',
    'browser.before': 'onBeforeBrowser',
    'scenario.before': 'onBeforeScenario',
    'scenario.after': 'onAfterScenario',
    'browser.after': 'onAfterBrowser',
    'after': 'onAfter'
};

function BaseReporter() {
    _.bindAll(this,
        'onBefore',
        'onBeforeBrowser',
        'onBeforeScenario',
        'onAfterScenario',
        'onAfterBrowser',
        'onAfter'
    );
}

BaseReporter.prototype.register = function (grid) {
    var self = this;
    _.each(bindings, function (callback, event) {
        grid.on(event, self[callback]);
    });
};
BaseReporter.prototype.unregister = function (grid) {
    var self = this;
    _.each(bindings, function (callback, event) {
        grid.off(event, self[callback]);
    });
};
BaseReporter.prototype.onBefore = function (grid) {};
BaseReporter.prototype.onBeforeBrowser = function (browserRunner, browserCfg) {};
BaseReporter.prototype.onBeforeScenario = function (scenarioRunner, browserCfg) {};
BaseReporter.prototype.onAfterScenario = function (err, scenarioRunner, browserCfg) {};
BaseReporter.prototype.onAfterBrowser = function (err, browserRunner, browserCfg) {};
BaseReporter.prototype.onAfter = function (grid) {};
