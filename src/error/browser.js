var _ = require('lodash');
var CompositeError = require('./composite');

module.exports = BrowserError;

function BrowserError(message, errorsStack, browser) {
    var desired = _.clone(browser);
    CompositeError.prototype.constructor.call(this, message, errorsStack);
    this.__defineGetter__("browser", function () { return  desired; });
    this.name = 'BrowserError';
}

BrowserError.prototype = new CompositeError();
BrowserError.prototype.constructor = BrowserError;
