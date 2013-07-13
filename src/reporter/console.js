var _ = require('lodash');
var util = require('util');
var BaseReporter = require('./base');

module.exports = ConsoleReporter;

function ConsoleReporter() {
    BaseReporter.call(this);
}
util.inherits(ConsoleReporter, BaseReporter);

ConsoleReporter.prototype.onAfterScenario = function (err, scenarioRunner, browserCfg) {
    console.log('run for ' + browserCfg.browserName);
};
ConsoleReporter.prototype.onAfter = function (grid) {
    console.log('Grid run is over.');
};
