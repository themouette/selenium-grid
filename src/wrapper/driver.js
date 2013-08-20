var _ = require('lodash');
var assert = require('chai').assert;
var wd = require('wd');

module.exports = Browser;
process.on('uncaughtException', function (e) {
    console.log('uncaught exception', e);
});

function Browser (config, desired, done) {
    var driver = this;
    this._driver = wd.remote(config);
    this._timeout = 1000;
    this._current = null;
    this._drain = function (err) {
        driver._driver.quit(function () {
            done(err);
        });
    };
    this._steps = [];
    driver.init(desired);
}

// options
// set the actual timeout
Browser.prototype.timeout = function (nb) {
    this._timeout = nb;

    return this;
};

// Queue implementation.
Browser.prototype.then = Browser.prototype.push = function (callback) {
    this._steps.push(callback);
    if (!_.isNumber(this._current)) {
        _start.call(this);
    }
    return this;
};
Browser.prototype.now = Browser.prototype.unshift = function (callback) {
    this._steps.splice(this._current || 0, 0, callback);
    if (!_.isNumber(this._current)) {
        _start.call(this);
    }
    return this;
};

function _start() {
    var self = this;
    this._current = 0;
    setImmediate(function () {
        _process.call(self);
    });
}

function _process() {
    try {
        var done = _afterTask.bind(this);
        var task = this._steps[this._current];
        task.call(this, done);
    } catch (err) {
        done(err);
    }
}

function _afterTask(err) {
    if (err || this._current >= this._steps.length - 1) {
        return _teardown.call(this, err);
    }
    // process next
    this._current++;
    _process.call(this);
}

function _teardown(err) {
    this._drain(err);
}

// wrap driver methods into safe methods
var commands = [
    'status',
    'session',
    'altSessionCapabilities',
    'sessionCapabilities',
    'setPageLoadTimeout',
    'setAsyncScriptTimeout',
    'setImplicitWaitTimeout',
    'windowHandle',
    'windowHandles',
    'url',
    'execute',
    'safeExecute',
    'eval',
    'safeEval',
    'executeAsync',
    'safeExecuteAsync',
    'frame',
    'window',
    'windowSize',
    'setWindowSize',
    'getWindowSize',
    'setWindowPosition',
    'getWindowPosition',
    'allCookies',
    'setCookie',
    'deleteAllCookies',
    'deleteCookie',
    'source',
    'title',
    // /session/:sessionId/element
//    'element',
//    'elementByClassName',
//    'elementByCssSelector',
//    'elementById',
//    'elementByName',
//    'elementByLinkText',
//    'elementByPartialLinkText',
//    'elementByTagName',
//    'elementByXPath',
//    'elementByCss',
//    // /session/:sessionId/elements
//    'elementsByClassName',
//    'elementsByCssSelector',
//    'elementsById',
//    'elementsByName',
//    'elementsByLinkText',
//    'elementsByPartialLinkText',
//    'elementsByTagName',
//    'elementsByXPath',
//    'elementsByCss',
//    'elementByClassNameOrNull',
//    'elementByClassNameOrNull',
//    'elementByCssSelectorOrNull',
//    'elementByIdOrNull',
//    'elementByNameOrNull',
//    'elementByLinkTextOrNull',
//    'elementByPartialLinkTextOrNull',
//    'elementByTagNameOrNull',
//    'elementByXPathOrNull',
//    'elementByCssOrNull',
//    'elementByClassNameIfExists',
//    'elementByClassNameIfExists',
//    'elementByCssSelectorIfExists',
//    'elementByIdIfExists',
//    'elementByNameIfExists',
//    'elementByLinkTextIfExists',
//    'elementByPartialLinkTextIfExists',
//    'elementByTagNameIfExists',
//    'elementByXPathIfExists',
//    'elementByCssIfExists',
//    'hasElementByClassName',
//    'hasElementByClassName',
//    'hasElementByCssSelector',
//    'hasElementById',
//    'hasElementByName',
//    'hasElementByLinkText',
//    'hasElementByPartialLinkText',
//    'hasElementByTagName',
//    'hasElementByXPath',
//    'hasElementByCss',
    'active',
    'maximize',
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
    'forward',
    'back',
    'refresh',
    'close',
    'takeScreenshot',
    'isVisible'
];
_.each(commands, function wrapCommandInvocation(command) {
    Browser.prototype[command] = function () {
        var args = _errorToException.apply(this, arguments);

        this._driver[command].apply(this._driver, args);

        return this;
    };
});
// extra methods
Browser.prototype.log = function (msg) {
    console.log(msg);

    return this;
};
Browser.prototype.element = function (selector, cb) {
    cb = _errorToException.call(this, cb)[0];
    this._driver.element(selectorStrategy(selector), selectorValue(selector), function () {
        console.log(arguments);
        cb.apply(this, arguments);
    });

    return this;
};
var eltCommands = {
    'click': 'click',
    'text': 'text',
    'sendKeys': 'type'
};
// element related
_.each(eltCommands, function (original, command) {
    Browser.prototype[command] = function (selector, callback) {
        callback = _errorToException.apply(this, [callback])[0];
        this.element(selector, function (err, el) {
                if (err) {
                    callback(err);
                }
                el[command].call(element, callback);
            });

        return this;
    };
});
// submit a form
Browser.prototype.submit = function (selector, values, callback) {
    var args = _errorToException.apply(this, [callback]);
    callback = args[0];
    this.element(selector, function (err, el) {
            if (err) {
                callback(err);
            }
            el.submit.call(element, callback);
        });

    return this;
};

// all the following methods are made accessible through `then[Method]`
// errors and exceptions interrupts command chain.
commands = commands.concat([
    'log',
    'submit'
]).concat(_.keys(eltCommands));
_.each(commands, function methodToQueue(command) {
    var thenCommand = ['then', command.charAt(0).toUpperCase(), command.slice(1)].join('');
    Browser.prototype[thenCommand] = function () {
        var args = arguments;

        this.then(function (next) {
            args = _argumentsToQueue.call(this, args, next);
            this[command].apply(this, args);
        });

        return this;
    };
});

// all the following commands enqueue steps.
commands = [
    'get',
    'init',
    'quit'
];
_.each(commands, function methodToQueue(command) {
    Browser.prototype[command] = function () {
        var args = arguments;

        this.then(function (next) {
            args = _errorToException.apply(this, args);
            args = _argumentsToQueue.call(this, args, next);
            this._driver[command].apply(this._driver, args);
        });

        return this;
    };
});

// any error is thrown as an exception.
// remaining arguments are given to callback.
function _errorToException() {
    var args = _.toArray(arguments);
    var cb;
    var browser = this;
    // if last argument is a callback, wrap it.
    if (_.isFunction(_.last(args))) {
        cb = args.pop();
    }
    args = (args||[]).concat([function (err) {
        if (err) throw new Error(err);
        if (cb) {
            cb.apply(browser, _.tail(arguments));
        }
    }]);

    return args;
}
// wraps execution into a try/catch block and
// manage queue next call.
function _argumentsToQueue(args, next) {
    args = _.toArray(args);
    var cb;
    var browser = this;
    // if last argument is a callback, wrap it.
    if (_.isFunction(_.last(args))) {
        cb = args.pop();
    }
    args = args.concat([function () {
        try {
            cb.apply(browser, arguments);
            next();
        } catch (e) {
            next(e);
        }
    }]);

    return args;
}


// check te selector contains or match matcher.
// ommitting `selector` makes a match on the whole document.
//
// ``` javascript
// b
//    .start('http://google.com')
//    .assertContains(/^Google$/i, 'head title')
//    .assertContains('Yahoo !');
// ```
Browser.prototype.assertContains = function (matcher, selector) {
    if (!selector) {
        selector = 'body';
    }
    this.getText(selector, function (text) {
        assert.ok(match(matcher, text));
    });

    return this;
};

// utils
function match(matcher, text) {
    if (!(matcher instanceof RegExp)) {
        matcher = new RegExp(text);
    }
    return matcher.test(text);
}

function selectorStrategy(selector) {
    if (typeof(selector) === "string") {
        return "css selector";
    }
    return selector.strategy;
}
function selectorValue(selector) {
    if (typeof(selector) === "string") {
        return selector;
    }
    return selector.value;
}
