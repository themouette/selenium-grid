describe('BrowserRunner', function () {
    var BrowserRunner = require('../../src/runner/browser');
    var ScenarioRunner = require('../../src/runner/scenario');
    var BrowserError = require('../../src/error/browser');

    var _ = require('lodash');
    var chai = require('chai');
    var sinon = require('sinon');
    var assert = chai.assert;

    describe('lifecycle', function () {
        var browserCfg = {browserName: 'firefox'};

        it('should run all scenarios', function(done) {
            var run = function (browser, done) {
                assert.deepEqual(browser, browserCfg);
                done();
            };
            var scenarios = [
                getMockedScenario(run),
                getMockedScenario(run),
                getMockedScenario(run)
            ];

            var runner = new BrowserRunner(browserCfg, scenarios, 2);

            runner.run(function (err) {
                assert.notOk(err);
                scenarios.forEach(function (mock) {
                    assert.ok(mock.run.calledOnce);
                });
                done();
            });
        });
        it('should wait async process to be over', function(done) {
            var called = 0;
            var run = function (browser, doneCb) {
                setTimeout(function () {
                    called++;
                    doneCb();
                }, 5);
            };
            var scenarios = [
                getMockedScenario(run),
                getMockedScenario(run),
                getMockedScenario(run)
            ];

            var runner = new BrowserRunner(browserCfg, scenarios, 2);

            runner.run(function (err) {
                assert.notOk(err);
                assert.equal(called, 3);
                done();
            });
        });
        it('should trigger "before" and "after" events', function(done) {
            var called = 0;
            var beforeSpy = sinon.spy();
            var afterSpy = sinon.spy();
            var run = function (browser, doneCb) {
                setTimeout(function () {
                    called++;
                    doneCb();
                }, 5);
            };
            var scenarios = [
                getMockedScenario(run),
                getMockedScenario(run),
                getMockedScenario(run)
            ];

            var runner = new BrowserRunner(browserCfg, scenarios, 2);
            runner.on('before', function () {
                beforeSpy();
                assert.equal(called, 0);
            });
            runner.on('after', function () {
                afterSpy();
                assert.equal(called, 3);
            });

            runner.run(function (err) {
                assert.notOk(err);
                assert.equal(called, 3);
                assert.ok(beforeSpy.calledOnce);
                assert.ok(afterSpy.calledOnce);
                done();
            });
        });
    });

    describe('event listeners', function () {
        var browserCfg = {browserName: 'firefox'};
        it('should call before event', function(done) {
            var runner = new BrowserRunner(browserCfg, [], 2);
            runner.on('before', function () {
                done();
            });
            runner.run(function () {});
        });
        it('should call after event', function(done) {
            var runner = new BrowserRunner(browserCfg, [], 2);
            runner.on('after', function () {
                done();
            });
            runner.run(function () {});
        });
    });

    describe('error bubbling', function () {
        var browserCfg = {browserName: 'firefox'};
        var message = 'something';

        it('should report any error that occured in Scenario', function(done) {
            var run = function (browser, doneCb) {
                throw new Error(message);
            };

            var scenarios = [
                getMockedScenario(run),
                getMockedScenario(run),
                getMockedScenario(run)
            ];

            var runner = new BrowserRunner(browserCfg, scenarios, 2);

            runner.run(function (err) {
                assert.instanceOf(err, BrowserError);
                assert.isArray(err.errors);
                assert.lengthOf(err.errors, 3);
                err.errors.forEach(function (err) {
                    assert.equal(err.message, message);
                });
                done();
            });
        });
        it('should report any error that occurs in before and stop', function(done) {
            var run = function (browser, doneCb) {
                throw new Error(message2);
            };

            var scenarios = [
                getMockedScenario(run),
                getMockedScenario(run),
                getMockedScenario(run)
            ];

            var runner = new BrowserRunner(browserCfg, scenarios, 2);
            runner.on('before', function () {
                throw new Error(message);
            });

            runner.run(function (err) {
                assert.instanceOf(err, Error);
                assert.equal(err.message, message);
                scenarios.forEach(function (mock) {
                    assert.notOk(mock.run.called);
                });
                done();
            });
        });
    });

    function getMockedScenario(run) {
        var mock = new ScenarioRunner({}, {});
        var stub = sinon.stub(mock, 'run', run);

        return mock;
    }
});
