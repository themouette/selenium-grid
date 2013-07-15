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
        this.doRun(browser.init(desired), remote, desired);
    },
    createBrowser: function (remote, desired, done) {
        var browser = wd.remote(remote);
        return new Wrapper(browser, function (err) {
            browser.quit();
            done(err);
        }, this.timeout);
    },
    doRun: function (browser, remote, desired) {
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
    'status',
    'init',
    'session',
    'altSessionCapabilities',
    'sessionCapabilities',
//    'quit',
    'setPageLoadTimeout',
    'setAsyncScriptTimeout',
    'setImplicitWaitTimeout',
    'windowHandle',
    'windowHandles',
    'url',
    'get',
    'forward',
    'back',
    'refresh',
    'execute',
    'safeExecute',
    'eval',
    'safeEval',
    'executeAsync',
    'safeExecuteAsync',
    'takeScreenshot',
    'frame',
    'window',
    'close',
    'windowSize',
    'setWindowSize',
    'getWindowSize',
    'setWindowPosition',
    'getWindowPosition',
    'maximize',
    'allCookies',
    'setCookie',
    'deleteAllCookies',
    'deleteCookie',
    'source',
    'title',
    // /session/:sessionId/element
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
    // /session/:sessionId/elements
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
    'active',
    //
    'keys',
    'getOrientation',
    'alertText',
    'alertKeys',
    'acceptAlert',
    'dismissAlert',
    'moveTo',
    'click',
    'buttonDown',
    'buttonUp',
    'doubleclick',
    'flick',
    'setLocalStorageKey',
    'clearLocalStorage',
    'getLocalStorageKey',
    'removeLocalStorageKey',
    'newWindow',
    'windowName',
    'getPageIndex',
    'uploadFile',
    'waitForCondition',
    'waitForConditionInBrowser',
    'waitForElement',
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
    'waitForVisible',
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
    'isVisible'
];

_.each(commands, function (command) {
    Wrapper.prototype[command] = function () {
        var args = arguments;

        this.then(function (next) {
            var params = wrapStepArguments(args, next);
            this._browser[command].apply(this._browser, params);
        });
        return this;
    };
    Wrapper.prototype['_'+command] = function () {
        var args = _.toArray(arguments);
        var timeout = this.timeout;

        this.then(function (next) {
            var params = wrapNativeArguments(args, next, timeout);
            this._browser[command].apply(this._browser, params);
        });
        return this;
    };
});

function wrapStepArguments(args, next) {
    args = _.toArray(args);
    var cb;
    // if last argument is a callback, replace it
    // with queue callback.
    if (_.isFunction(_.last(args))) {
        cb = args.pop();
    }

    args = args.concat([wrapStepCallback(cb, next)]);

    return args;
}

function wrapStepCallback(cb, next) {
    return function (err) {
        if (err) { return next(err);}
        if (cb) {
            try {
                // shift error argument
                var params = _.tail(arguments);
                // and call argument
                cb.apply(this, params);
            } catch (e) {
                return next(e);
            }
        }
        return next();
    };
}

function errorTimeout(done, timeout) {
    // create a timeout
    var timer = setTimeout(function () {
        done(new Error('Timeout reached, did you forget to call `done` ?'));
    }, timeout);
    // done function cancels timeout
    return function (err) {
        clearTimeout(timer);
        done(err);
    };
}

function wrapNativeArguments(args, done, timeout) {
    var timer = errorTimeout(done, timeout);
    var cb;
    // if last argument is a callback, replace it
    // with queue callback.
    if (_.isFunction(_.last(args))) {
        cb = args.pop();
    }

    args = args.concat([wrapNativeCallback(cb, timer)]);

    return args;
}
function wrapNativeCallback(cb, done) {
    return function (err) {
        if (!cb) {
            // if no callback is provided
            return done(err);
        }
        try {
            // timed out callback
            // shift error argument
            var args = _.toArray(arguments).concat([done]);
            // and call argument
            cb.apply(this, args);
        } catch (e) {
            return done(e);
        }
    };
}
