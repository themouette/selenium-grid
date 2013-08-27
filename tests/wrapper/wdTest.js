describe('webdriver wrapper', function () {
    return ;
    var Wrapper = require('../../src/wrapper/wd');

    var _ = require('lodash');
    var chai = require('chai');
    var sinon = require('sinon');
    var assert = chai.assert;

    var message = 'something';

    describe('promise API', function () {
        it('should allow to enqueue callbacks', function(done) {
            var spy = sinon.spy();
            var subject = getWrapper(function final(err) {
                assert.notOk(err, 'no error received');
                assert.equal(spy.callCount, 3, 'all callbacks should have been processed');
                done();
            });

            subject
                .then(function (next) {
                    assert.notOk(spy.called, 'this will be called for the first time');
                    spy();
                    next();
                })
                .then(function (next) {
                    assert.ok(spy.calledOnce, 'this is second call');
                    setTimeout(function () {
                        spy();
                        next();
                    }, 0);
                })
                .then(function (next) {
                    assert.ok(spy.calledTwice, 'this is the third call');
                    spy();
                    next();
                });
        });
        it('should interrupt when error is given to callback', function(done) {
            var spy = sinon.spy();
            var subject = getWrapper(function final(err) {
                assert.ok(err, 'error should be transmitted');
                assert.equal(err.message, message, 'this should be thrown error');
                assert.ok(spy.calledOnce, 'this should be called only once');
                done();
            });

            subject
                .then(function (next) {
                    assert.notOk(spy.called, 'this should be the first call');
                    spy();
                    next(new Error(message));
                })
                .then(function (next) {
                    assert.notOk(true, 'this callback should not be called');
                    next();
                });
        });
        it('should allow to prepend callbacks', function(done) {
            var spy = sinon.spy();
            var subject = getWrapper(function final(err) {
                assert.notOk(err, 'no error received');
                assert.equal(spy.callCount, 3, 'all callbacks should have been processed');
                done();
            });

            subject
                .then(function (next) {
                    assert.ok(spy.calledTwice, 'this is the third call');
                    spy();
                    next();
                })
                .now(function (next) {
                    assert.ok(spy.calledOnce, 'this is second call');
                    setTimeout(function () {
                        spy();
                        next();
                    }, 0);
                })
                .now(function (next) {
                    assert.notOk(spy.called, 'this will be called for the first time');
                    spy();
                    next();
                });
        });

        function getWrapper(done) {
            var browser = null;
            return new Wrapper(browser, done, 1000);
        }
    });

    describe('mocked api', function () {
        it('should enqueue commands', function(done) {
            var spy = sinon.spy();
            var subject = getWrapper(function final(err) {
                assert.equal(spy.callCount, 2);
                done(err);
            });

            subject
                // callback called with "title"
                .title(function (title) {
                    spy();
                    assert.equal(title, 'title', 'called with title');
                })
                // pass className parameter
                .elementByClassName('foo', function (el) {
                    spy();
                    assert.equal(el, 'foo', 'should preserve paramters');
                });
        });
        it('should append callback when needed', function(done) {
            var spy = sinon.spy();
            var subject = getWrapper(function final(err) {
                assert.equal(spy.callCount, 1);
                done(err);
            });

            subject
                // expects given element
                .click('expected click el')
                .click('expected click el', function () {
                    spy();
                });
        });
        it('should trap callback exceptions', function(done) {
            var subject = getWrapper(function final(err) {
                assert.ok(err, 'error was trapped');
                assert.equal(err.message, message, 'error is the expected one');
                done();
            });

            subject
                // callback called with "title"
                .title(function (title) {
                    throw new Error(message);
                })
                // pass className parameter
                .elementByClassName('foo', function (el) {
                    assert.ok(false, 'execution should be stopped');
                });
        });
        it('should trap wd exceptions', function(done) {
            var subject = getWrapper(function final(err) {
                assert.ok(err, 'error was trapped');
                assert.equal(err.message, message, 'error is the expected one');
                done();
            });

            subject
                // callback called with "title"
                .elementByCss('anything')
                // pass className parameter
                .elementByClassName('foo', function (el) {
                    assert.ok(false, 'execution should be stopped');
                });
        });
        it('should not forward errors from server', function(done) {
            var subject = getWrapper(function final(err) {
                assert.ok(err, 'error was trapped');
                assert.equal(err.message, message, 'error is the expected one');
                done();
            });

            subject
                // callback called with "title"
                .elementByTagName(message, function() {
                    assert.ok(false, 'execution should be stopped');
                })
                // anything else that should not be called
                .title(function (title) {
                    assert.ok(false, 'execution should be stopped');
                });
        });

        function getWrapper(done) {
            var browser = {
                title: function (callback) {
                    setTimeout(function () {
                        callback(null, 'title');
                    }, 0);
                },
                elementByClassName: function (className, callback) {
                    setTimeout(function () {
                        callback(null, className);
                    }, 0);
                },
                click: function (el, cb) {
                    assert.equal(el, 'expected click el');
                    assert.isFunction(cb, 'append callback if none given.');
                    cb();
                },
                elementByCss: function (el, cb) {
                    throw new Error(message);
                },
                elementByTagName: function (el, cb) {
                    cb(new Error(el));
                }
            };
            return new Wrapper(browser, done, 1000);
        }
    });

    describe('raw API', function () {
        it('should keep the error parameter and append a next callback', function(done) {
            var spy = sinon.spy();
            var subject = getWrapper(function final(err) {
                assert.ok(spy.calledTwice, 'title was called.');
                done(err);
            });

            subject
                ._title(function (err, title, next) {
                    spy();
                    assert.equal(title, 'title', 'called with title');
                    next();
                })
                .title(function (title) {
                    spy();
                });
        });
        it('should timeout', function(done) {
            this.timeout(30);
            var spy = sinon.spy();
            var subject = getWrapper(function final(err) {
                assert.ok(spy.calledOnce, 'title was called.');
                assert.ok(err, 'error was trapped');
                assert.match(err.message, /Timeout reached/, 'error is the expected one');
                done();
            });

            subject.timeout = 10;

            subject
                ._title(function (err, title, next) {
                    spy();
                    assert.equal(title, 'title', 'called with title');
                })
                .title(function (title) {
                    assert.ok(false, 'execution should be stopped');
                });
        });
        it('should pass given exceptions', function(done) {
            var spy = sinon.spy();
            var subject = getWrapper(function final(err) {
                assert.ok(spy.calledOnce, 'title was called.');
                assert.notOk(err, 'no error should propagate');
                done();
            });

            subject
                ._elementByClassName(message, function (err, el, next) {
                    assert.ok(err, 'error was passed');
                    assert.equal(err.message, message, 'error is the expected one');
                    next();
                })
                // error was handled, so
                .title(function (title) {
                    spy();
                });
        });
        it('should trap callbacks exceptions', function(done) {
            var spy = sinon.spy();
            var subject = getWrapper(function final(err) {
                assert.ok(spy.calledOnce, 'title was called.');
                assert.ok(err, 'error was trapped');
                assert.equal(err.message, message, 'error is the expected one');
                done();
            });

            subject
                ._title(function (err, title, next) {
                    spy();
                    throw new Error(message);
                })
                .title(function (title) {
                    assert.ok(false, 'execution should be stopped');
                });
        });
        it('should trap wd exceptions', function(done) {
            var spy = sinon.spy();
            var subject = getWrapper(function final(err) {
                assert.notOk(spy.called, 'title should not be called.');
                assert.ok(err, 'error was trapped');
                assert.equal(err.message, message, 'error is the expected one');
                done();
            });

            subject
                ._click(message, function (err, next) {
                    assert.ok(false, 'execution should be stopped');
                });
        });

        function getWrapper(done) {
            var browser = {
                title: function (callback) {
                    setTimeout(function () {
                        callback(null, 'title');
                    }, 0);
                },
                elementByClassName: function (className, callback) {
                    setTimeout(function () {
                        callback(new Error(className), className);
                    }, 0);
                },
                click: function (msg) {
                    throw new Error(msg);
                }
            };
            return new Wrapper(browser, done, 1000);
        }
    });
});
