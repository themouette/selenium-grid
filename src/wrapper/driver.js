var _ = require('lodash');
var async = require('async');
var assert = require('chai').assert;
var wd = require('wd');

module.exports = Browser;

function Browser (config, desired) {
    this.steps = [];
    this.driver = wd.remote(config).init(desired);
}

Browser.prototype.then = function (done, fail, always) {
    this.steps.then(done, fail, always);

    return this;
};

// navigation
// open browser to url
Browser.prototype.start = function (url) {
    this.then(Q.ninvoke(this.driver, "get", url));

    return this;
};
// open url in browser.
Browser.prototype.thenOpen = function (url) {
    this.then(Q.ninvoke(this.driver, "get", url));

    return this;
};
// wait for timeout
Browser.prototype.wait = function (timeout, cb) {
    var browser = this;
    this.then(function () {
        var d = Q.defer();
        setTimeout(function () {
            d.resolve(cb.call(browser));
        }, timeout);

        return d.promise();
    });

    return this;
};
// wait until the
Browser.prototype.waitWhile = function (callback, timeout) {
    var browser = this;
    this.then(function () {
        var d = Q.defer();
        setTimeout(function () {
            d.reject();
        }, timeout);

        return d.promise();
    });

    return this;
};
Browser.prototype.waitFor = function (callback, timeout) {
    this.waitWhile(function () {
        return !cb.apply(this, arguments);
    }, timeout);

    return this;
};
Browser.prototype.waitWhileSelector = function (selector) {

    return this;
};
Browser.prototype.waitForSelector = function (selector) {

    return this;
};

// injection
Browser.prototype.evaluate = function (code) {

    return this;
};

// selectors
Browser.prototype.click = function (selector) {

    return this;
};
Browser.prototype.count = function (selector, cb) {

    return this;
};

// rerieve information
Browser.prototype.getTitle = function (selector, cb) {

    return this;
};
Browser.prototype.getHTML = function (selector, cb) {

    return this;
};
Browser.prototype.getText = function (selector, cb) {

    return this;
};
Browser.prototype.getAttribute = function (selector, attribute, cb) {

    return this;
};

// assertions

// check title is as expected
//
// ``` javascript
// b
//    .start('http://google.com')
//    .assertTitle('Google')
//    .thenOpen('http://yahoo.com')
//    .assertTitle(/^Yahoo/);
// ```
Browser.prototype.assertTitle = function (matcher) {
    this.getTitle(selector, function (title) {
        assert.ok(match(matcher, title));
    });

    return this;
};

// check the selector appears exactly count times.
// ommitting `count` ensure selector appears at least once.
//
// ``` javascript
// b
//    .start('http://google.com')
//    .assertCount('.q', 1)
//    .assertCount('h3');
// ```
Browser.prototype.assertCount = function (selector, count) {
    this.count(selector, function (nb) {
        if (typeof(count) === "undefined") {
            assert.ok(nb);
        } else {
            assert.equal(nb, count);
        }
    });

    return this;
};

// check the selector appears exactly count times.
// ommitting `count` ensure selector appears at least once.
//
// ``` javascript
// b
//    .start('http://google.com')
//    .assertExists('h3');
// ```
Browser.prototype.assertExists = function (selector) {
    return this.assertCount(selector);
};

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

// check html content is valid.
Browser.prototype.assertValid = function () {
};

// utils
function match(matcher, text) {
    if (!(matcher instanceof RegExp)) {
        matcher = new RegExp(text);
    }
    return matcher.test(text);
}






// some wrapper
function decorateCatch(fn, next) {
    return function () {
        try {
            fn.apply(this, arguments);
        } catch(e) {
            next(e);
        }
    };
}

function decorateTimeout(delay, fn, next) {
    return function () {
        var timeout;
        var clear = function () {
            clearTimeout(timeout);
        };
        fn.apply(this, arguments);
        timeout = setTimeout(function () {
            next(new Error('Timeout'));
        }, delay);
    };
}


