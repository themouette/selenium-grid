describe('ScenarioRunner', function () {
    var ScenarioRunner = require('../../src/runner/scenario');

    var _ = require('lodash');
    var chai = require('chai');
    var assert = chai.assert;

    describe('lifecycle', function () {
        var browsercfg = {},
            remotecfg = {},
            cb = function () {};
        it('should run scenario as a function', function(done) {
            var runner = new ScenarioRunner(function scenario(remoteCfg, desired, doneCb) {
                done();
            }, remotecfg);
            runner.run(browsercfg, cb);
        });
        it('should run scenario as a run method', function(done) {
            var runner = new ScenarioRunner({
                run: function scenario(remoteCfg, desired, doneCb) {
                    done();
                }
            }, remotecfg);
            runner.run(browsercfg, cb);
        });
        it('should throw an error if no scenario can be executed', function() {
            var runner = new ScenarioRunner({}, remotecfg);
            runner.run(browsercfg, function (err) {
                assert.instanceOf(err, Error);
                assert.match(err.message, /Unable to run test/);
            });
        });
        it('should call scenario.before, then run, then scenario.after', function(done) {
            var stack = [];
            var runner = new ScenarioRunner({
                before: function () {
                    stack.push('before');
                },
                run: function scenario(remoteCfg, desired, doneCb) {
                    stack.push('run');
                    doneCb();
                },
                after: function (err) {
                    stack.push('after');
                }
            }, remotecfg);
            runner.run(browsercfg, function () {
                assert.deepEqual(stack, ['before', 'run', 'after']);
                done();
            });
        });
    });

    describe('error bubbling', function () {
        var browsercfg = {},
            remotecfg = {},
            message = 'something',
            message2 = 'something else';

        function assertError(err, msg) {
            assert.instanceOf(err, Error);
            assert.equal(err.message, msg);
        }

        it('should catch error from scenario.before', function(done) {
            var runner = new ScenarioRunner({
                before: function () {
                    throw new Error(message);
                },
                run: function scenario(remoteCfg, desired, doneCb) {
                    doneCb();
                },
                after: function (err) {
                    assertError(err, message);
                }
            }, remotecfg);

            runner.run(browsercfg, function (err) {
                assertError(err, message);
                done();
            });
        });
        it('should catch error from scenario.run', function(done) {
            var runner = new ScenarioRunner({
                run: function scenario(remoteCfg, desired, doneCb) {
                    throw new Error(message);
                },
                after: function (err) {
                    assertError(err, message);
                }
            }, remotecfg);

            runner.run(browsercfg, function (err) {
                assertError(err, message);
                done();
            });
        });
        it('should be possible to transform error from after', function(done) {
            var runner = new ScenarioRunner({
                run: function scenario(remoteCfg, desired, doneCb) {
                    throw new Error(message);
                },
                after: function (err) {
                    assertError(err, message);
                    throw new Error(message2);
                }
            }, remotecfg);

            runner.run(browsercfg, function (err) {
                assertError(err, message2);
                done();
            });

        });
    });
});
