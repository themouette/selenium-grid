var _ = require('lodash');

var errorToExceptionCallback = require('./utils').errorToExceptionCallback;
var chainCallback = require('./utils').chainCallback;
var wrapArguments = require('./utils').wrapArguments;
var exposeThen = require('./utils').exposeThen;
var exposeThenNative = require('./utils').exposeThenNative;
var ucfirst = require('./utils').ucfirst;

var nativeCommands = [
    'status',
    'session', 'altSessionCapabilities', 'sessionCapabilities', 'setPageLoadTimeout',
    'setAsyncScriptTimeout', 'setImplicitWaitTimeout',
    'execute', 'safeExecute', 'eval', 'safeEval', 'executeAsync', 'safeExecuteAsync',
    'frame', 'window', 'windowHandle', 'windowHandles',
    'windowSize', 'setWindowSize', 'getWindowSize', 'setWindowPosition', 'getWindowPosition',
    'maximize', 'moveTo',
    'allCookies', 'setCookie', 'deleteAllCookies', 'deleteCookie',
    'source',
    'url',
    'title',
    'active',
    'keys',
    'getOrientation',
    'alertText',
    'alertKeys',
    'acceptAlert', 'dismissAlert',
    'click', 'doubleclick',
    'buttonDown', 'buttonUp',
    'flick',
    'setLocalStorageKey', 'clearLocalStorage', 'getLocalStorageKey', 'removeLocalStorageKey',
    'newWindow', 'windowName',
    'forward', 'back', 'refresh', 'close',
    'getPageIndex',
    'uploadFile',
    'takeScreenshot',
    'waitForCondition', 'waitForConditionInBrowser'
];
var nativeThenCommands = [
    // open given url.
    //
    // `b.get('http://google.com')`
    'get',
    // end navigation.
    //
    // `b.quit()`
    //
    // this command is called automaticly at the end of each scenario.
    'quit'
];

module.exports.register = function registerNative(Browser) {
    // it is possible to register commands as an object
    // {'exposedMethod': 'nativeMethod'}
    _.each(nativeCommands, _.partial(exposeNative, Browser));
    // each of the previously exposed methods are accessible asynchronously
    // by calling the `thenMethod`.
    //
    // next is automaticly called when callback is executed.
    // chain is interrupted on first error.
    _.each(nativeCommands, _.partial(exposeThenNative, Browser));
    // it is possible to register commands as an object
    // {'exposedMethod': 'nativeMethod'}
    _.each(nativeThenCommands, _.partial(exposeNativeAsPromise, Browser));
};

// exposed methods handle errors as exceptions.
function exposeNative(Browser, command, exposed) {
    if (_.isNumber(exposed)) {
        exposed = command;
    }

    Browser.prototype[exposed] = function () {
        var args = wrapArguments.call(this, arguments, errorToExceptionCallback);
        if (!this._driver[command]) {this.error('non existing native method "%s" (%s)', command, 'exposeNative');}
        this._driver[command].apply(this._driver, args);

        return this;
    };
}


// assume the command is exposed on browser and handles error as exception.
function exposeNativeAsPromise(Browser, command, exposed) {
    if (_.isNumber(exposed)) {
        exposed = command;
    }

    Browser.prototype[exposed] = function () {
        var args = wrapArguments.call(this, arguments, errorToExceptionCallback);

        this.then(function (next) {
            args = wrapArguments.call(this, args, chainCallback, next);
            if (!this._driver[command]) {this.error('non existing native method "%s" (%s)', command, 'exposeNativeAsPromise');}
            this._driver[command].apply(this._driver, args);
        });

        return this;
    };
}
