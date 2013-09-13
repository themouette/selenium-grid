// skipped as it should be deported in the runner test, (bin)
describe.skip('Runner process', function () {
//    var run = require('../src/runner');
    var CompositeError = require('../src/error/composite');
    var _ = require('lodash');
    var chai = require('chai');
    var nock = require('nock');
    var fs = require('fs');
    var assert = chai.assert;

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
                    version: "latest"
                }]
            }, [{
                run: function (remote, desired, doneCb) {
                    assert.deepEqual(desired, {
                        browserName: "chrome",
                        version: "latest"
                    });
                    doneCb();
                }
            }], done);
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
                }]
            }, [{
                run: function (remote, desired, doneCb) {
                    done();
                    doneCb();
                }
            }], function (err) {
                    assert.ok(!err);
                    assert.ok(!server.isDone());
                    done();
                });
        });

        it('should throw an error if console is not available', function(done) {
            setupConsoleResponse(404);
            run({
                browsers: [{
                    browserName: "internet explorer",
                    version: 8
                }]
            }, [{
                run: function (remote, desired, doneCb) {doneCb();}
            }], function (err) {
                assert.ok(err.message);
                assert.match(err.message, /Could not connect/);
                done();
            });
        });

        it('should throw an error if no requested browser is available', function(done) {
            setupConsoleResponse();
            run({
                browsers: [{
                    browserName: "internet explorer",
                    version: 9
                }]
            }, [{
                run: function (remote, desired, doneCb) {doneCb();}
            }], function (err) {
                assert.ok(err.message);
                assert.match(err.message, /No matching browsers/);
                done();
            });
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

                afterScenario: function () {
                    calls.push("afterScenario");
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
            }],
            function (err) {
                try {
                    assert.ok(!err);
                    assert.deepEqual(calls, [
                        "test.before",
                        "test",
                        "test.after",
                        "afterScenario",
                        "afterBrowser"
                    ]);
                } catch(e) {
                    return done(e);
                }
                done();
            });
        });

        it('test.before and test.after recieve the desired browser', function(done) {
            setupConsoleResponse();
            run({
                browsers: [{
                    browserName: "chrome",
                    version: 'latest'
                }]
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
            }], done);
        });

        it('calls the afterScenario and afterBrowser', function(done) {
            var calls = [];
            setupConsoleResponse();
            run({
                browsers: [{
                    browserName: "chrome",
                    version: 'latest'
                }],

                afterScenario: function (err, test, desired) {
                    assert.deepEqual(desired, {
                        browserName: "chrome",
                        version: 'latest'
                    });
                    assert.ok(test.run);
                    calls.push("afterScenario");
                },
                afterBrowser: function (err, browser, desired) {
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
            }],
            function (err) {
                assert.ok(!err);
                assert.deepEqual(calls, [
                    "test.before",
                    "test",
                    "test.after",
                    "afterScenario",
                    "test.before",
                    "test",
                    "test.after",
                    "afterScenario",
                    "afterBrowser"
                ]);
                done();
            });
        });

    });

    describe('error catching', function () {
        var message = 'something';
        var message2 = 'something new';

        it('should bubble test error', function (done) {
            setupConsoleResponse();
            run({
                    browsers: [{
                        browserName: "chrome",
                        version: 'latest'
                    }],
                    after: function (err) {
                        done();
                    }
                }, [{
                    before: function() {
                        throw new Error(message);
                    },
                    run: function () {
                    },
                    after: function (err) {
                        assert.equal(err.message, message);
                    }
                }], function () {});
        });
        it('should bubble test.before error', function (done) {
            setupConsoleResponse();
            run({
                    browsers: [{
                        browserName: "chrome",
                        version: 'latest'
                    }],
                    after: function (err) {
                        done();
                    }
                }, [{
                    before: function() {
                        throw new Error(message);
                    },
                    run: function () {
                    },
                    after: function (err) {
                        assert.equal(err.message, message);
                    }
                }], function () { });
        });
        it('should be possible to alter error in test.after', function (done) {
            setupConsoleResponse();
            run({
                    browsers: [{
                        browserName: "chrome",
                        version: 'latest'
                    }],
                    afterScenario: function (err) {
                        assert.equal(err.message, message2);
                    }
                }, [{
                    before: function() {
                        throw new Error(message);
                    },
                    run: function () {
                    },
                    after: function(err) {
                        throw new Error(message2);
                    }
                }], function () {
                    done();
                });
        });
        it('should bubble test error to test.after AND afterScenario', function (done) {
            setupConsoleResponse();
            run({
                    browsers: [{
                        browserName: "chrome",
                        version: 'latest'
                    }],
                    afterScenario: function (err) {
                        assert.equal(err.message, message);
                    }
                }, [{
                    before: function() {
                        throw new Error(message);
                    },
                    run: function () {
                    },
                    after: function (err) {
                        assert.equal(err.message, message);
                    }
                }], function () {
                    done();
                });
        });
        it('should bubble test error to afterScenario', function (done) {
            setupConsoleResponse();
            run({
                    browsers: [{
                        browserName: "chrome",
                        version: 'latest'
                    }],
                    afterScenario: function (err) {
                        assert.equal(err.message, message);
                    }
                }, [{
                    before: function() {
                        throw new Error(message);
                    },
                    run: function () {
                    }
                }], function () {
                    done();
                });
        });
        it('should bubble test error to afterBrowser', function (done) {
            setupConsoleResponse();
            run({
                    browsers: [{
                        browserName: "chrome",
                        version: 'latest'
                    }],
                    afterBrowser: function (err, browser) {
                        assert.instanceOf(err, CompositeError);
                        assert.equal(err.message, 'Errors where catched for this browser.');
                        err.length = 1;
                        assert.equal(err.errors.pop().message, message);
                    }
                }, [{
                    before: function() { throw new Error(message); },
                    run: function () { }
                }], function () {
                    done();
                });
        });
        it('should bubble test error to after', function (done) {
            setupConsoleResponse();
            run({
                    browsers: [{
                        browserName: "chrome",
                        version: 'latest'
                    }]
                }, [{
                    before: function() { },
                    run: function () { throw new Error(message); }
                }],
                function (err) {
                    assert.equal(err.message, 'Errors were caught for this run.');
                    done();
                });
        });
    });

    describe('check test cases can be run through runner', function () {
        var TestCase = require('../src/scenario/testCase');
        it('should be possible to run a TestCase', function(done) {
            var called = false;
            var Case2 = TestCase.extend({
                run: function (remote, desired, cb) {
                    setTimeout(function () {
                        called = true;
                        cb();
                    }, 10);
                }
            });

            run({
                skipCapabilitiesCheck: true,
                browsers: [{
                    browserName: "chrome",
                    version: 'latest'
                }]
            }, [
                new Case2()
            ],  function (err) {
                assert.ok(called);
                done();
            });
        });
    });
});

function setupConsoleResponse(statuscode) {
    var html = fs.readFileSync(__dirname + '/../fixtures/html/console.html');
    return nock('http://127.0.0.1:4444')
        .get('/grid/console')
        .reply(statuscode || 200, html);
}
