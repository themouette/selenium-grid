var wd = require('wd');
var async = require('async');
var _ = require('lodash');
var TestCase = require('./testCase');

module.exports = TestCase.extend({
    // timeout for raw wd methods (ms)
    // raw methods are the _ ones.
    timeout: 10000,
    run: function (remote, desired, done) {
        var browser = this.createBrowser(remote, desired, done);
        this.doRun(browser.init(desired));
    },
    createBrowser: function (remote, desired, done) {
        var browser = wd.remote(remote);
        return new Wrapper(browser, function (err) {
            browser.quit();
            done(err);
        }, this.timeout);
    },
    doRun: function (browser) {
    }
});

function Wrapper(browser, done, timeout) {
    this._browser = browser;
    this._q = {
        steps: [],
        current: null,
        drain: done
    };
    this.timeout = timeout || 1000;
}

Wrapper.prototype.then = Wrapper.prototype.push = function (callback) {
    this._q.steps.push(callback);
    if (!_.isNumber(this._q.current)) {
        _start.call(this);
    }
    return this;
};
Wrapper.prototype.now = Wrapper.prototype.unshift = function (callback) {
    this._q.steps.splice(this._q.current || 0, 0, callback, _afterTask.bind(this));
    if (!_.isNumber(this._q.current)) {
        _start.call(this);
    }
    return this;
};

function _start() {
    this._q.current = 0;
    _process.call(this);
}

function _process() {
    try {
        var done = _afterTask.bind(this);
        var task = this._q.steps[this._q.current];
        task.call(this, done);
    } catch (err) {
        done(err);
    }
}

function _afterTask(err) {
    if (err || this._q.current >= this._q.steps.length - 1) {
        return _teardown.call(this, err);
    }
    // process next
    this._q.current++;
    _process.call(this);
}

function _teardown(err) {
    this._q.drain(err);
}

var commands = [
    'init',
    'get',
    'waitForElement',
    'title',
    'takeScreenshot',
    'element',
    'elementByClassName',
    'elementByClassName',
    'elementByCssSelector',
    'elementById',
    'elementByName',
    'elementByLinkText',
    'elementByPartialLinkText',
    'elementByTagName',
    'elementByXPath',
    'elementByCss',
    'elementByClassNameOrNull',
    'elementByClassNameOrNull',
    'elementByCssSelectorOrNull',
    'elementByIdOrNull',
    'elementByNameOrNull',
    'elementByLinkTextOrNull',
    'elementByPartialLinkTextOrNull',
    'elementByTagNameOrNull',
    'elementByXPathOrNull',
    'elementByCssOrNull',
    'elementByClassNameIfExists',
    'elementByClassNameIfExists',
    'elementByCssSelectorIfExists',
    'elementByIdIfExists',
    'elementByNameIfExists',
    'elementByLinkTextIfExists',
    'elementByPartialLinkTextIfExists',
    'elementByTagNameIfExists',
    'elementByXPathIfExists',
    'elementByCssIfExists',
    'hasElementByClassName',
    'hasElementByClassName',
    'hasElementByCssSelector',
    'hasElementById',
    'hasElementByName',
    'hasElementByLinkText',
    'hasElementByPartialLinkText',
    'hasElementByTagName',
    'hasElementByXPath',
    'hasElementByCss',
    'waitForElementByClassName',
    'waitForElementByClassName',
    'waitForElementByCssSelector',
    'waitForElementById',
    'waitForElementByName',
    'waitForElementByLinkText',
    'waitForElementByPartialLinkText',
    'waitForElementByTagName',
    'waitForElementByXPath',
    'waitForElementByCss',
    'waitForVisibleByClassName',
    'waitForVisibleByClassName',
    'waitForVisibleByCssSelector',
    'waitForVisibleById',
    'waitForVisibleByName',
    'waitForVisibleByLinkText',
    'waitForVisibleByPartialLinkText',
    'waitForVisibleByTagName',
    'waitForVisibleByXPath',
    'waitForVisibleByCss',
    'elementsByClassName',
    'elementsByClassName',
    'elementsByCssSelector',
    'elementsById',
    'elementsByName',
    'elementsByLinkText',
    'elementsByPartialLinkText',
    'elementsByTagName',
    'elementsByXPath',
    'elementsByCss',
];

_.each(commands, function (command) {
    Wrapper.prototype[command] = function () {
        var args = _.toArray(arguments);
        var cb;
        // if last argument is a callback, replace it
        // with queue callback.
        if (_.isFunction(_.last(args))) {
            cb = args.pop();
        }
        this.then(function (done) {
            function callback(err) {
                if(err) {
                    return done(err);
                }
                if (cb) {
                    try {
                        cb.apply(this, _.tail(arguments));
                    } catch (e) {
                        return done(e);
                    }
                }
                done();
            }
            var params = args.concat([callback]);
            this._browser[command].apply(this._browser, params);
        });
        return this;
    };
    Wrapper.prototype['_'+command] = function () {
        var args = _.toArray(arguments);
        var cb, timeout = this.timeout;
        // if last argument is a callback, replace it
        // with queue callback.
        if (_.isFunction(_.last(args))) {
            cb = args.pop();
        }
        this.then(function (done) {
            function callback(err) {
                if (cb) {
                    var timer = errorTimeout(done, timeout);
                    var _args = _.toArray(arguments).concat([timer]);
                    try {
                        cb.apply(this, _args);
                    } catch (e) {
                        done(e);
                    }
                } else {
                    done();
                }
            }
            var params = args.concat([callback]);
            this._browser[command].apply(this._browser, params);
        });
        return this;
    };
});

function errorTimeout(done, timeout) {
    var timer = setTimeout(function () {
        done(new Error('Timeout reached, did you forget to call `done` ?'));
    }, timeout);
    return function (err) {
        clearTimeout(timer);
        done(err);
    };
}
