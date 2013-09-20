var _ = require('lodash');
var wd = require('wd');
var TestCase = require('./testCase');
var Driver = require('../driver');

var WDTestCase = TestCase.extend({
    constructor: function () {
        TestCase.apply(this, arguments);
    },
    // timeout for raw wd methods (ms)
    // raw methods are the _ ones.
    timeout: 10000,
    run: function (config, desired, done) {
        var browser = this.createBrowser(config, desired, done);
        this.doRun(browser, config, desired);
    },
    createBrowser: function (config, desired, done) {
        var remote = getRemoteCfg(config);
        desired = _.defaults({name: this.name}, desired);
        var browser = new Driver(remote, desired, done);
        return browser;
    },
    doRun: function (browser, config, desired) {
        console.log('please define steps');
    }
});

module.exports = WDTestCase;

function getRemoteCfg(config) {
    return config.remoteCfg || {};
}
