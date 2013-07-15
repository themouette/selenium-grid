describe('BrowserRunner', function () {
    var GridRunner = require('../../src/runner/grid');
    var BrowserError = require('../../src/error/browser');
    var GridError = require('../../src/error/grid');

    var _ = require('lodash');
    var chai = require('chai');
    var sinon = require('sinon');
    var assert = chai.assert;

    describe('lifecycle', function () {
        var browsers = [
            {browserName: 'chrome'},
            {browserName: 'firefox'},
            {browserName: 'opera'}];
        it('should run all scenarios on every browser', function(done) {
            var called = [
                {'chrome': false, 'firefox': false, 'opera': false},
                {'chrome': false, 'firefox': false, 'opera': false},
                {'chrome': false, 'firefox': false, 'opera': false}];
            var scenarios = [
                function (remoteCfg, desired, done) {called[0][desired.browserName] = true; done();},
                function (remoteCfg, desired, done) {called[1][desired.browserName] = true; done();},
                function (remoteCfg, desired, done) {called[2][desired.browserName] = true; done();}];
            var runner = new GridRunner({browsers: browsers}, scenarios);

            runner.run(function (err) {
                assert.notOk(err, 'no error detected');
                called.forEach(function (scenario, index) {
                    _.forEach(scenario, function (result, name) {
                        assert.ok(result, 'Called '+index+' for browser '+ name);
                    });
                });
                done();
            });
        });
        it('should wait for async to be called', function(done) {
            var spy = sinon.spy();
            var scenario = function (remoteCfg, desired, done) {
                setTimeout(function () {
                    spy();
                    done();
                }, 5);
            };
            var scenarios = [ scenario, scenario, scenario ];
            var runner = new GridRunner({browsers: browsers}, scenarios);

            runner.run(function (err) {
                assert.notOk(err, 'no error detected');
                assert.equal(spy.callCount, 9, 'did stop execution');
                done();
            });
        });
    });

    describe('error bubbling', function () {
        var message = 'something';

        it('should bubble scenario errors and keep execution going', function(done) {
            var spy = sinon.spy();
            var browsers = [
                {browserName: 'chrome'},
                {browserName: 'firefox'},
                {browserName: 'opera'}];
            var scenarios = [
                function (remoteCfg, desired, done) {spy();throw new Error(message);},
                function (remoteCfg, desired, done) {spy();done();},
                function (remoteCfg, desired, done) {spy();throw new Error(message);},
                function (remoteCfg, desired, done) {spy();setTimeout(done, 10);}];

            var runner = new GridRunner({browsers: browsers}, scenarios);

            runner.run(function (err) {
                assert.equal(spy.callCount, 12, 'did stop execution');

                assert.instanceOf(err, GridError);
                // all browser failed
                assert.equal(err.errors.length, 3);

                var browserError = err.errors[0];
                assert.instanceOf(browserError, BrowserError);
                // and 2 tests failed for each browser
                assert.equal(browserError.errors.length, 2);

                assert.instanceOf(browserError.errors[0], Error);
                assert.equal(browserError.errors[0].message, message);

                done();
            });
        });

        it('should bubble scenario *async* errors and keep execution going', function(done) {
            var spy = sinon.spy();
            var browsers = [
                {browserName: 'chrome'},
                {browserName: 'firefox'},
                {browserName: 'opera'}];
            var scenarios = [
                function (remoteCfg, desired, done) {
                    spy();
                    throw new Error(message);
                },
                function (remoteCfg, desired, done) {spy();done();},
                function (remoteCfg, desired, done) {
                    setTimeout(function () {
                        spy();
                        done(Error(message));
                    }, 10);
                },
                function (remoteCfg, desired, done) {spy();setTimeout(done, 10);}];

            var runner = new GridRunner({browsers: browsers}, scenarios);

            runner.run(function (err) {
                assert.equal(spy.callCount, 12, 'did stop execution');

                assert.instanceOf(err, GridError);
                // all browser failed
                assert.equal(err.errors.length, 3);

                var browserError = err.errors[0];
                assert.instanceOf(browserError, BrowserError);
                // and 2 tests failed for each browser
                assert.equal(browserError.errors.length, 2);

                assert.instanceOf(browserError.errors[0], Error);
                assert.equal(browserError.errors[0].message, message);

                done();
            });
        });
    });
});
