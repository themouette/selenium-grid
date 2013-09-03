describe('Driver native methods', function () {

    var nativeExtension = require('../../src/driver/native').register;
    var chainExtension = require('../../src/driver/chain').register;

    var _ = require('lodash');
    var chai = require('chai');
    var sinon = require('sinon');
    var assert = chai.assert;

    var message = 'something';
    var TIMEOUT = 10;

    describe('exposed as invokable methods', function() {
        var methodName = 'status';
        var err = 'error message';
        var Browser;

        beforeEach(function () {
            // create and extends Browser.
            Browser = function Browser(spy) {
                this._driver = {};
                this._driver[methodName] = spy;
            };
            nativeExtension(Browser);
        });

        it('should call driver\'s method', function() {
            var spy = sinon.spy();
            var browser = new Browser(spy);

            browser[methodName]();

            assert.ok(spy.called);
        });
        it('should add callback if missing', function(done) {
            this.timeout(TIMEOUT);
            var browser = new Browser(function (cb) {
                assert.isFunction(cb);
                done();
            });

            browser[methodName]();
        });
        it('default callback should transform error into exception', function(done) {
            this.timeout(TIMEOUT);
            var browser = new Browser(function (cb) {
                assert.throws(function () { cb(err); }, new RegExp(err));
                done();
            });

            browser[methodName]();
        });

        it('should wrapp existing callback', function() {
            var spy = sinon.spy();
            var browser = new Browser(function (cb) {
                cb(null, 1, "foo");
            });

            browser[methodName](spy);

            assert.ok(spy.called, 'existing callback should be called');
            assert.ok(spy.calledWith(1, "foo"), 'error argument should be removed');
        });
        it('should transform error into exception and prevent callback call', function() {
            var spy = sinon.spy();
            var browser = new Browser(function (cb) {
                cb(err);
            });

            assert.throws(function () { browser[methodName](spy); }, new RegExp(err));

            assert.notOk(spy.called, 'existing callback should not be called');
        });

        it('should throw an error if native method does not exist', function() {
            var spy = sinon.spy();
            var error = sinon.spy();
            var browser = new Browser(null);
            browser.error = error;

            assert.throws(function () { browser[methodName](spy); }, new RegExp('non existing native method "'+methodName+'"'));

            assert.ok(error.called, 'An error should be reported');
            assert.notOk(spy.called, 'original callback should not be called');
        });
    });

    describe('exposed as promise prefixed methods', function() {
        testThenMethod('status', 'thenStatus');
    });

    describe('exposed as unprefixed promise methods', function() {
        testThenMethod('get', 'get');
    });

    function testThenMethod(methodName, thenMethodName) {
        var browser;

        beforeEach(function () {
            function Browser() {
                this.setupPlugins();
                this._driver = {
                    init: function (cfg, next){next();}};
                this._driver[methodName] = function () {};
            }
            chainExtension(Browser);
            nativeExtension(Browser);
            browser = new Browser();
        });

        it('should call then', function() {
            var spy = sinon.spy();

            browser.then = spy;
            browser[thenMethodName]();

            assert.ok(spy.called);
        });
        it('should throw an exception if native method does not exists', function() {
            var then = sinon.spy();
            var error = sinon.spy();
            browser.then = then;
            browser.error = error;
            // ensure native method does not exist
            browser._driver[methodName] = null;

            assert.throws(function () { browser[thenMethodName](); }, new RegExp('non existing native method "'+methodName+'"'));

            assert.ok(error.called, "should call error");
            assert.notOk(then.called, "should not call then");
        });
        it('should call the native method with given arguments', function(done) {
            this.timeout(TIMEOUT);
            var spy = sinon.spy();
            browser._driver[methodName] = function (arg1, arg2, next) {
                assert.equal(arg1, 1);
                assert.equal(arg2, "foo");
                next();
            };
            browser._drain = function (err) {
                assert.notOk(err, 'there should not pass an error.');
                done();
            };

            browser[thenMethodName](1, "foo");
        });
        it('should forward errors to _drain', function(done) {
            this.timeout(TIMEOUT);
            var message = "something";

            browser._drain = function (err) {
                assert.equal(err, message, 'it should forward error.');
                done();
            };

            browser._driver[methodName] = function (cb) {
                setImmediate(function () {cb(message);});
            };

            browser[thenMethodName]();
            browser.then(function () {
                assert.ok(false, 'next method should not be called.');
            });
        });
        it('should catch and forward exceptions to _drain', function(done) {
            this.timeout(TIMEOUT);

            var message = "something";

            browser._drain = function (err) {
                assert.equal(err, message, 'it should forward error.');
                done();
            };

            browser._driver[methodName] = function () {
                throw message;
            };

            browser[thenMethodName]();
            browser.then(function () {
                assert.ok(false, 'next method should not be called.');
            });
        });
        it('should catch and forward callback exceptions to _drain', function(done) {
            this.timeout(TIMEOUT);

            var message = "something";

            browser._drain = function (err) {
                assert.equal(err, message, 'it should forward error.');
                done();
            };

            browser._driver[methodName] = function nativeMethod(cb) {
                cb(null);
            };

            browser[thenMethodName](function callback() {
                throw message;
            });
            browser.then(function () {
                assert.ok(false, 'next method should not be called.');
            });
        });
    }
});
