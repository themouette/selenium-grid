var wd = require('wd');
var TestCase = require('./testCase');
var Wrapper = require('../wrapper/wd');

module.exports = TestCase.extend({
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
            browser.quit();
            done(err);
        }, this.timeout);
    },
    doRun: function (browser, remote, desired) {
    }
});

