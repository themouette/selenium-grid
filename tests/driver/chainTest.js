describe('Driver chain', function () {
    var chai = require('chai');
    var sinon = require('sinon');
    var assert = chai.assert;

    var chainExtension = require('../../src/driver/chain').register;

    var TIMEOUT = 50;
    var browser;

    beforeEach(function () {
        function Browser() {
            this.setupPlugins();
            this._driver = {
                init: function (cfg, next){next();}};
        }
        chainExtension(Browser);
        browser = new Browser();
    });

    it('should not call drain while no step is added.', function (done) {
        this.timeout(10 + TIMEOUT);
        browser._drain = function () {
            assert.ok(false, 'drain should not be called');
        };
        // ensure it has time to be called
        setTimeout(done, 10);
    });
    it('should call driver init method.', function(done) {
        this.timeout(TIMEOUT);
        browser._driver.init = function () {
            done();
        };
        browser.then(function (next) {
            next();
        });
    });
    it('should start automaticly when new step is added.', function (done) {
        this.timeout(TIMEOUT);
        var spy = sinon.spy();
        browser._drain = function () {
            assert.ok(spy.called, 'drain should be called after step is finished');
            done();
        };
        browser.then(function (next) {
            spy();
            setTimeout(next, 1);
        });
    });
    it('should call drain after last step.', function(done) {
        this.timeout(TIMEOUT);
        var spy = sinon.spy();
        browser._drain = function () {
            assert.ok(spy.calledTwice, 'drain should be called after step is finished');
            done();
        };
        browser.then(function (next) {
            spy();
            setTimeout(next, 1);
        });
        browser.then(function (next) {
            spy();
            setTimeout(next, 1);
        });
    });
    it('should add steps as next with `now`.', function(done) {
        this.timeout(TIMEOUT);
        var calls = 0;
        var spy = sinon.spy();
        browser.then(function (next) {
            browser.now(function (next) {
                spy();
                setTimeout(next, 1);
            });
            setTimeout(next, 1);
        });
        browser.then(function (next) {
            assert.ok(spy.called, 'should be called after the "now" callback.');
            done();
        });
    });
    it('should start when usig now and no next.', function(done) {
        var spy = sinon.spy();
        browser._drain = function () {
            assert.ok(spy.called, 'drain should be called after step is finished');
            done();
        };
        browser.now(function (next) {
            spy();
            next();
        });

    });
    it('should execute steps in browser\'s context', function() {
        this.timeout(TIMEOUT);
        browser.then(function (next) {
            assert.equal(this, browser);
            done();
        });
    });
    it('should forward exceptions to _drain', function(done) {
        this.timeout(TIMEOUT);
        var message = "someting";
        browser._drain = function (err) {
            assert.equal(err, message);
            done();
        };
        browser.then(function (next) {
            throw message;
        });
    });
});
