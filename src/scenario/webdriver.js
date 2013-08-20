var _ = require('lodash');
var wd = require('wd');
var TestCase = require('./testCase');
var Wrapper = require('../wrapper/wd');

var WDTestCase = TestCase.extend({
    constructor: function () {
        TestCase.apply(this, arguments);
        this.steps = [];
    },
    // timeout for raw wd methods (ms)
    // raw methods are the _ ones.
    timeout: 10000,
    run: function (remote, desired, done) {
        var browser = this.createBrowser(remote, desired, done);
        this.doRun(browser.init(_.extend(desired, {name: this.name})), remote, desired);
    },
    createBrowser: function (remote, desired, done) {
        var browser = wd.remote(remote);
        return new Wrapper(browser, function (err) {
            browser.quit(function () {
                done(err);
            });
        }, this.timeout);
    },
    doRun: function (browser, remote, desired) {
        console.log('no test given');
    }
});

module.exports = WDTestCase;
