var _ = require('lodash');
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
    exposeThenNoAuto: exposeThenNoAuto,
    escapeString: escapeString,
    ucfirst: ucfirst
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
        if (err) throw new Error(err);
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
// * auto: automaticly call the next method on success ?
function chainCallback(cb, next, auto) {
    var browser = this;

    return function queueWrapped() {
        try {
            if (!cb || auto || (typeof(auto) === "undefined")) {
                if (cb) {cb.apply(browser, arguments);}
                next();
            } else {
                cb.apply(browser, Array.prototype.concat.call(arguments, [next]));
            }
        } catch (e) {
            next(e);
        }
    };
}

// assume the command is exposed on browser and handles error as exception.
function exposeThen(Browser, command) {
    var exposed = ['then', ucfirst(command)].join('');

    Browser.prototype[exposed] = function () {
        var args = arguments;

        this.then(function (next) {
            args = wrapArguments.call(this, args, chainCallback, next);
            this[command].apply(this, args);
        });

        return this;
    };
}
// assume the command is exposed on browser and handles error as exception.
function exposeThenNoAuto(Browser, command) {
    var exposed = ['then', ucfirst(command)].join('');

    Browser.prototype[exposed] = function () {
        var args = arguments;

        this.then(function (next) {
            args = wrapArguments.call(this, args, chainCallback, next, false);
            this[command].apply(this, args);
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
