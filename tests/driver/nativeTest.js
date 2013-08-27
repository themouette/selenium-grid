describe('Driver native methods', function () {

    var nativeExtension = require('../../src/driver/native').register;

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
                assert.throw(function () { cb(err); }, new RegExp(err));
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

            assert.throw(function () { browser[methodName](spy); }, new RegExp(err));

            assert.notOk(spy.called, 'existing callback should not be called');
        });

        it('should throw an error if native method does not exist', function() {
            var spy = sinon.spy();
            var error = sinon.spy();
            var browser = new Browser(null);
            browser.error = error;

            assert.throw(function () { browser[methodName](spy); }, new RegExp('non existing native method "status"'));

            assert.ok(error.called, 'An error should be reported');
            assert.notOk(spy.called, 'original callback should not be called');
        });
    });

    describe('should be exposed as promise prefixed methods', function() {

    });

    describe('should be exposed as unprefixed promise methods', function() {

    });
});
