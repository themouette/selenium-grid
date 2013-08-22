var _ = require('lodash');

var ucfirst = require('./utils').ucfirst;
var errorToExceptionCallback = require('./utils').errorToExceptionCallback;
var chainAndErrorCallback = require('./utils').chainAndErrorCallback;
var wrapArguments = require('./utils').wrapArguments;
var exposeThen = require('./utils').exposeThen;
var exposeThenNative = require('./utils').exposeThenNative;
var escapeString = require('./utils').escapeString;

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
        // click on selector
        'doubleClick': 'doubleClick',
        // read selector text
        'text': 'text',
        // send keys into selector
        'sendKeys': 'type',
        // press keys into selector
        'pressKeys': 'keys',
        // submit form identified by selector
        'submit': 'submit',
        // is element visible
        'isVisible': 'isVisible',
        // clear input
        'clear': 'clear'
    };

    _.each(selectorCommands, _.partial(exposeSelector, Browser));
    _.each(selectorCommands, _.partial(exposeThenSelector, Browser));

    _.each(eltsCommands, _.partial(exposeElement, Browser));
    _.each(eltsCommands, _.partial(exposeThenElement, Browser));

    registerForm(Browser);
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
function exposeSelector(Browser, command, exposed) {
    if (_.isNumber(exposed)) {
        exposed = command;
    }

    Browser.prototype[exposed] = function () {
        var args = wrapArguments.call(this, arguments, errorToExceptionCallback);
        args = wrapSelectorArguments(args);
        if (!this._driver[command]) {this.error('non existing native method "%s" (%s)', command, 'exposeSelector');}
        this._driver[command].apply(this._driver, args);

        return this;
    };
}
// expose a native selector command to promise api.
// if a callback is given, next is not called automaticly.
function exposeThenSelector(Browser, command, exposed) {
    if (_.isNumber(exposed)) {
        exposed = command;
    }
    exposed = ['then', ucfirst(exposed)].join('');

    Browser.prototype[exposed] = function () {
        var args = arguments;

        this.then(function (next) {
            args = wrapArguments.call(this, args, chainAndErrorCallback, next);
            args = wrapSelectorArguments(args);
            if (!this._driver[command]) {this.error('non existing native method "%s" (%s)', command, 'exposeThenSelector');}
            this._driver[command].apply(this._driver, args);
        });

        return this;
    };
}

function exposeElement(Browser, command, exposed) {
    if (_.isNumber(exposed)) {
        exposed = command;
    }

    Browser.prototype[exposed] = function () {
        var args = wrapArguments.call(this, arguments, errorToExceptionCallback);
        var selector = args.shift();
        var onElementSelected = function onElementSelected(el) {
            el[command].apply(el, args);
        };

        this.element(selector, onElementSelected);

        return this;
    };
}

function exposeThenElement(Browser, command, exposed) {
    if (_.isNumber(exposed)) {
        exposed = ['then', ucfirst(command)].join('');
    }

    Browser.prototype[exposed] = function () {
        var args = arguments;

        this.then(function (next) {
            args = wrapArguments.call(this, args, chainAndErrorCallback, next);
            var selector = args.shift();
            var onElementSelected = function onElementSelected(err, el) {
                if (err) {return next(err);}
                try {
                    el[command].apply(el, args);
                } catch(e) {
                    next(e);
                }
            };

            this._driver.element(selector, onElementSelected);
        });

        return this;
    };
}

// replaces selector argument with selenium expected arguments
// (strategy and value)
function wrapSelectorArguments(args) {
    args = _.toArray(args);
    var selector = args.shift();
    args.unshift(selectorValue(selector));
    args.unshift(selectorStrategy(selector));

    return args;
}





function registerForm(Browser) {

    // fill the form
    Browser.prototype.fill = function (selector, values, validate, callback) {
        var args = wrapArguments.call(this, arguments, errorCallback);
        _fillForm.apply(this, args);

        return this;
    };
    // add to chain the form filling
    Browser.prototype.thenFill = function () {
        var args = arguments;
        this.then(function thenFill(next) {
            args = wrapArguments.call(this, args, chainAndErrorCallback, next);
            _fillForm.apply(this, args);
        });

        return this;
    };


    function _fillForm(selector, values, validate, cb) {
        if (typeof(validate) === "function") {
            cb = validate;
            validate = false;
        }
        if (typeof(cb) === "undefined") {
            cb = function () {};
        }
        var browser = this;

        this.element(selector, function (form) {
            // get an array of commands to fill form
            var cmds = _.map(values, function fillElement(value, name) {
                return function (next) {
                    form.elementByCss('[name="'+escapeString(name, "'")+'"]', function(err, el) {
                        el.getTagName(function (err, tagName) {
                            if (err) {
                                return next(new Error('Unable to retrieve element "'+name+'": ('+err+')'));
                            }
                            switch(tagName) {
                                case 'input':
                                    el.getAttribute('type', function (err, type) {
                                        if (err) {
                                            return next(new Error('Unable to retrieve element "'+name+'"\'s type: ('+err+')'));
                                        }
                                        switch(type) {
                                            case 'text':
                                            case 'email':
                                            case 'phone':
                                                _fillInputText.call(browser, el, value, next);
                                                break;
                                            case 'file':
                                                _fillInputFile.call(browser, el, value, next);
                                                break;
                                            case 'checkbox':
                                                _fillInputCheckbox.call(browser, el, value, next);
                                                break;
                                            case 'radio':
                                                _fillInputRadio.call(browser, name, value, next);
                                                break;
                                            default:
                                                next(new Error('unknown input type '+type+' for "'+name+'"'));
                                        }
                                    });
                                    break;
                                case 'select':
                                    _fillSelect.call(browser, el, value, next);
                                    break;
                                case 'textarea':
                                    _fillInputText.call(browser, el, value, next);
                                    break;
                                default:
                                    next(new Error('unknown tagname '+tagName+' for '+name));
                            }
                        });
                    });
                };
            });

            // execute the command as a cascade
            var position = -1;
            function nextStep(err) {
                if (err) {
                    cb(err);
                }
                try {
                    position++;
                    if (position >= cmds.length) {
                        if (validate) {
                            form.submit.call(form, cb);
                        } else {
                            cb(err);
                        }
                        return ;
                    }
                    cmds[position](nextStep);
                } catch (e) {
                    cb(e);
                }
            }
            nextStep();
        });
    }

    // fill an input text or a textarea
    function _fillInputText(element, value, next) {
        var onFilled = chainAndErrorCallback.call(this, null, next);
        var onClear = chainAndErrorCallback.call(this, function () {
            element.type(value, onFilled);
        }, onFilled);

        element.clear(onClear);
    }
    // upload a file to selenium slave and fill the input with reference.
    function _fillInputFile(element, value, next) {
        var onUploadDone = function (localPath) {
            element.type(localPath, next);
        };
        this.uploadFile(value, onUploadDone);
    }
    // check or uncheck given checkbox
    function _fillInputCheckbox(element, value, next) {
        var onIsSelected = chainAndErrorCallback.call(this, function (selected, next) {
            if (!value !== selected) {
                // nothing to do
                return next();
            }
            element.click(next);
        }, next);
        element.isSelected(onIsSelected);
    }
    // retrieve the radio button qith value and click on it
    function _fillInputRadio(name, value, next) {
        this.element({
            value: "//input[@name='"+escapeString(name, "'")+"' and @value='"+escapeString(value, "'")+"']",
            strategy: "xpath"
            }, function (el) {
                el.click(next);
            });
    }

}