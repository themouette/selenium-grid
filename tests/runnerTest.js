var run = require('../src/runner');
var _ = require('lodash');
var chai = require('chai');
var nock = require('nock');
var fs = require('fs');
var assert = chai.assert;

describe('Runner process', function () {

    beforeEach(function () {
        nock.cleanAll();
    });

    describe('browserlist filtering', function () {

        it ('should be possible to filter browsers', function (done) {
            setupConsoleResponse();
            run({
                skipCapabilitiesCheck: false,
                browsers: [{
                    browserName: "internet explorer",
                    version: 9
                }, {
                    browserName: "chrome",
                    version: 'latest'
                }],
                after: done
            }, [{
                run: function (remote, desired, doneCb) {
                    assert.deepEqual(desired, {
                        browserName: "chrome",
                        version: 'latest'
                    });
                    doneCb();
                }
            }]);
        });


        it('should be possible to bypass browser filtering', function(done) {
            done = _.after(3, done);
            var server = setupConsoleResponse();
            run({
                skipCapabilitiesCheck: true,
                browsers: [{
                    browserName: "internet explorer",
                    version: 9
                }, {
                    browserName: "internet explorer",
                    version: 8
                }],
                after: function (err) {
                    assert.ok(!err);
                    assert.ok(!server.isDone());
                    done();
                }
            }, [{
                run: function (remote, desired, doneCb) {
                    done();
                    doneCb();
                }
            }]);
        });

        it('should throw an error if console is not available', function(done) {
            setupConsoleResponse(404);
            run({
                browsers: [{
                    browserName: "internet explorer",
                    version: 8
                }],
                after: function (err) {
                    assert.ok(err.message);
                    assert.match(err.message, /Could not connect/);
                    done();
                }
            }, [{
                run: function (remote, desired, doneCb) {doneCb();}
            }]);
        });

        it('should throw an error if no requested browser is available', function(done) {
            setupConsoleResponse();
            run({
                browsers: [{
                    browserName: "internet explorer",
                    version: 9
                }],
                after: function (err) {
                    assert.ok(err.message);
                    assert.match(err.message, /No matching browsers/);
                    done();
                }
            }, [{
                run: function (remote, desired, doneCb) {doneCb();}
            }]);
        });
    });

    describe('lifecycle', function () {

        it('should trigger "after" callback last', function(done) {
            var calls = [];
            setupConsoleResponse();
            run({
                browsers: [{
                    browserName: "chrome",
                    version: 'latest'
                }],

                after: function (err) {
                    assert.ok(!err);
                    assert.deepEqual(calls, [
                        "test.before",
                        "test",
                        "test.after",
                        "afterEach",
                        "afterBrowser"
                    ]);
                    done();
                },
                afterEach: function () {
                    calls.push("afterEach");
                },
                afterBrowser: function () {
                    calls.push("afterBrowser");
                }
            }, [{
                before: function () {
                    calls.push("test.before");
                },
                after: function () {
                    calls.push("test.after");
                },
                run: function (remote, desired, doneCb) {
                    calls.push("test");
                    doneCb();
                }
            }]);
        });

        it('test.before and test.after recieve the desired browser', function(done) {
            setupConsoleResponse();
            run({
                browsers: [{
                    browserName: "chrome",
                    version: 'latest'
                }],

                after: function (err) {
                    assert.ok(!err);
                    done();
                }
            }, [{
                before: function (desired) {
                    assert.deepEqual(desired, {
                        browserName: "chrome",
                        version: 'latest'
                    });
                },
                after: function (err, desired) {
                    assert.deepEqual(desired, {
                        browserName: "chrome",
                        version: 'latest'
                    });
                },
                run: function (remote, desired, doneCb) {
                    doneCb();
                }
            }]);
        });

        it('calls the afterEach and afterBrowser', function(done) {
            var calls = [];
            setupConsoleResponse();
            run({
                browsers: [{
                    browserName: "chrome",
                    version: 'latest'
                }],

                after: function (err) {
                    assert.ok(!err);
                    assert.deepEqual(calls, [
                        "test.before",
                        "test",
                        "test.after",
                        "afterEach",
                        "test.before",
                        "test",
                        "test.after",
                        "afterEach",
                        "afterBrowser"
                    ]);
                    done();
                },
                afterEach: function (err, desired, test) {
                    assert.deepEqual(desired, {
                        browserName: "chrome",
                        version: 'latest'
                    });
                    assert.ok(test.run);
                    calls.push("afterEach");
                },
                afterBrowser: function (err, desired) {
                    assert.deepEqual(desired, {
                        browserName: "chrome",
                        version: 'latest'
                    });
                    calls.push("afterBrowser");
                }
            }, [{
                before: function () {
                    calls.push("test.before");
                },
                after: function () {
                    calls.push("test.after");
                },
                run: function (remote, desired, doneCb) {
                    calls.push("test");
                    doneCb();
                }
            }, {
                before: function () {
                    calls.push("test.before");
                },
                after: function () {
                    calls.push("test.after");
                },
                run: function (remote, desired, doneCb) {
                    calls.push("test");
                    doneCb();
                }
            }]);
        });

    });
});

function setupConsoleResponse(statuscode) {
    var html = fs.readFileSync(__dirname + '/../fixtures/html/console.html');
    return nock('http://127.0.0.1:4444')
        .get('/grid/console')
        .reply(statuscode || 200, html);
}
