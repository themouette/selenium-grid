var _ = require('lodash');
var format = require('util').format;

module.exports = {
    // ensure callback as latest argument is present and wrapped using
    // given method.
    wrapArguments: wrapArguments,
    // transform a node type callback into a callback throwing an error
    // if no error occurs, ramaining arguments are given to callback.
    //
    // both will return the same:
    // method(function (err, arg1, arg2) {});
    // method(errorCallbackToException(function (arg1, arg2) {}));
    errorToExceptionCallback: errorToExceptionCallback,
    // execute `cb`, then call `next` method.
    // If error is caught, then it is passed to `next`.
    //
    // both will return the same:
    // method(function (arg1, arg2) {next();});
    // method(chainCallback(function (arg1, arg2) {}, next));
    // method(chainCallback(function (arg1, arg2) {}, next, /* don't call next on success */ false));
    chainCallback: chainCallback,
    // wrap callback in an error and add then callback after all the arguments.
    // if no callback is given, then next is used as defauult callback.
    chainAndErrorCallback: chainAndErrorCallback,
    // expose Browser method as promise method.
    // given Browser has a `foo` method, both will have the same result.
    //
    // exposeThen(Browser, 'foo');
    // Browser.prototype.thenFoo = function () {
    //   var args = arguments;
    //   this.then(function (next) {
    //      this.foo.apply(this, wrapArguments.call(this, args, chainCallback);
    //   })
    //   return this;
    // }
    exposeThen: exposeThen,
    // add a then wrapped method for native driver method.
    // if no callback is given, next is used, otherwise, next is append to callback arguments.
    exposeThenNative: exposeThenNative,
    escapeString: escapeString,
    ucfirst: ucfirst,
    // called in the browser context, it ensure the driver native's command exists.
    ensureDriverCommand: ensureDriverCommand
};

function wrapArguments(args, method) {
    var cb;
    args = _.toArray(args);
    // if last argument is a callback, wrap it.
    if (_.isFunction(_.last(args))) {
        cb = args.pop();
    }
    // extra params
    var extra = _.tail(arguments, 2);
    // wrap callback
    cb = method.apply(this, [cb].concat(extra));
    // put it back to arguments
    args.push(cb);

    return args;
}

// any error is thrown as an exception.
// remaining arguments are given to callback.
function errorToExceptionCallback(cb) {
    var browser = this;

    return function errorWrapped(err) {
        if (err) throw err;
        if (cb) {
            cb.apply(browser, _.tail(arguments));
        }
    };
}
// catch any error and passes it to next.
// Once callback is called, next is called.
//
// * cb: the callback to call
// * next: the next in chain method
function chainCallback(cb, next) {
    var browser = this;

    return function queueWrapped() {
        try {
            if (cb) {cb.apply(browser, arguments);}
            next();
        } catch (e) {
            next(e);
        }
    };
}
// chain and error trapping.
// If no callback is present, then next is used as callback,
// otherwise it is the callback responsability to call next (given as last argument)
function chainAndErrorCallback(cb, next) {
    var browser = this;

    return function wrapDefault() {
        if (cb) {
            try {
                cb = errorToExceptionCallback.call(browser, cb);
                cb.apply(browser, _.toArray(arguments).concat([next]));
            } catch (e) {
                next(e);
            }
        } else if (next) {
            next.apply(this, arguments);
        }
    };
}

// assume the command is exposed on browser and handles error as exception.
function exposeThen(Browser, command) {
    var exposed = ['then', ucfirst(command)].join('');

    Browser.prototype[exposed] = function () {
        var args = arguments;
        ensureDriverCommand.call(this, command, 'exposeThen');

        this.then(function (next) {
            args = wrapArguments.call(this, args, chainCallback, next);
            this[command].apply(this, args);
        });

        return this;
    };
}

// expose a native command to promise api.
// if a callback is given, next is not called automaticly.
function exposeThenNative(Browser, command) {
    var exposed = ['then', ucfirst(command)].join('');

    Browser.prototype[exposed] = function () {
        var args = arguments;
        ensureDriverCommand.call(this, command, 'exposeThenNative');

        this.then(function (next) {
            args = wrapArguments.call(this, args, chainAndErrorCallback, next);
            this._driver[command].apply(this._driver, args);
        });

        return this;
    };
}


function escapeString(str, quote) {
    return str;
}

function ucfirst(str) {
    return [str.charAt(0).toUpperCase(), str.slice(1)].join('');
}

function ensureDriverCommand(command, callingMethod) {
    if (this._driver[command]) {
        return ;
    }
    var msg = format('non existing native method "%s" (%s)', command, callingMethod);
    this.error(msg);
    throw new Error(msg);
}
