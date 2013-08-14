var wd = require('wd');
var TestCase = require('./testCase');
var Wrapper = require('../wrapper/wd');

var WDTestCase = TestCase.extend({
    constructor: function () {
        TestCase.prototype.constructor.apply(this, arguments);
        this.steps = [];
    },
    // timeout for raw wd methods (ms)
    // raw methods are the _ ones.
    timeout: 10000,
    run: function (remote, desired, done) {
        var browser = this.createBrowser(remote, desired, done);
        this.doRun(browser.init(desired), remote, desired);
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
        this.steps.forEach(function (step) {
            step.run(browser, remote, desired);
        });
    },
    addSuite: function (suite) {
        this.steps.push(suite);
    },
    addStep: function (description, step) {
        this.steps.push({
            name: description,
            run: step
        });
    }
});

module.exports = WDTestCase;
