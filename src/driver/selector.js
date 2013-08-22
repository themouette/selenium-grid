var _ = require('lodash');

var errorToExceptionCallback = require('./utils').errorToExceptionCallback;
var wrapArguments = require('./utils').wrapArguments;
var exposeThen = require('./utils').exposeThen;
var exposeThenNoAuto = require('./utils').exposeThenNoAuto;

module.exports = {
    // create a new xpath selector from xpath string.
    xpath: xpath,
    // register selector extension.
    register: registerSelector,
    // convert selector to corresponding wd strategy.
    selectorStrategy: selectorStrategy,
    // convert selector to corresponding wd selector value.
    selectorValue: selectorValue
};

function xpath(selector) {
    return new XPath(selector);
}
function XPath(selector) {
    this.strategy = "xpath";
    this.selector = selector;
}

function registerSelector(Browser) {
    // expose the xpath helper to Browser.
    Browser.prototype.xpath = xpath;
    var selectorCommands = ['element', 'waitForElement', 'waitForVisible'];
    var eltsCommands = {
        // click on selector
        'click': 'click',
        // read selector text
        'text': 'text',
        // send keys into selector
        'sendKeys': 'type',
        // press keys into selector
        'pressKeys': 'keys',
        // submit form identified by selector
        'submit': 'submit'
    };

    _.each(selectorCommands, _.partial(exposeSelector, Browser));
    _.each(selectorCommands, _.partial(exposeThen, Browser));
    _.each(eltsCommands, _.partial(exposeElement, Browser));
    _.each(_.keys(eltsCommands), _.partial(exposeThenNoAuto, Browser));
}

// retrieve the selector strategy for given selector.
function selectorStrategy(selector) {
    if (typeof(selector) === "string") {
        return "css selector";
    }
    return selector.strategy;
}
// retrieve the selector value for given selector.
function selectorValue(selector) {
    if (typeof(selector) === "string") {
        return selector;
    }
    return selector.value;
}

// replaces the first argument as a selenium 2 arguments selector.
function exposeSelector(Browser, exposed, command) {
    if (_.isNumber(command)) {
        command = exposed;
    }

    Browser.prototype[exposed] = function () {
        var args = wrapArguments.call(this, arguments, errorToExceptionCallback);
        var selector = args.shift();
        args.unshift(selectorValue(selector));
        args.unshift(selectorStrategy(selector));

        this._driver[command].apply(this._driver, args);

        return this;
    };
}

//
function exposeElement(Browser, exposed, command) {
    if (_.isNumber(command)) {
        command = exposed;
    }

    Browser.prototype[exposed] = function () {
        var args = wrapArguments.call(this, arguments, errorToExceptionCallback);
        var selector = args.shift();
        var cb = _.last(args);
        var onElementSelected = function onElementSelected(el) {
            if (err) {return cb(err);}
            try {
                el[command].apply(el, args);
            } catch (e) {
                cb(e);
            }
        };

        this.element(selectorStrategy(selector), selectorValue(selector), onElementSelected);

        return this;
    };
}
