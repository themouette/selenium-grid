var _ = require('lodash');
var exposeThen = require('./utils').exposeThen;
var errorToExceptionCallback = require('./utils').errorToExceptionCallback;
var wrapArguments = require('./utils').wrapArguments;

// every command is available in browser as immediate and promise methods.
var consoleCommands = ['log', 'warn', 'error'];

module.exports.register = function registerExtra(Browser) {

    // expose commands directly
    _.each(consoleCommands, _.partial(exposeConsole, Browser));
    // expose using then
    _.each(consoleCommands, _.partial(exposeThen, Browser));

    // wait ms before exexuting the rest of the chain
    Browser.prototype.wait = function (ms) {
        this.then(function (next) {
            setTimeout(next, ms || 1000);
        });

        return this;
    };
};

function exposeConsole(Browser, methodName) {
    Browser.prototype[methodName] = function () {
        // ensure array of arguments with final callback
        var args = wrapArguments.call(this, arguments, errorToExceptionCallback);
        // extract callback
        var cb = args.pop();
        var msg = args.length ? args.shift() : '';
        // prepend
        args = [
            '%s %s - %s: ' + msg,
            (new Date()).toLocaleTimeString(),
            methodName.toUpperCase(),
            this._desired.browserName].concat(args);

        console[methodName].apply(console, args);

        cb.call(this);

        return this;
    };
}
