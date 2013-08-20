var _ = require('lodash');
var util = require('util');
var CompositeError = require('./composite');

module.exports = BrowserError;

function BrowserError(message, errorsStack, browser) {
    var desired = _.clone(browser);
    CompositeError.call(this, message, errorsStack);
    this.message = [message, ' (', browser.browserName, ')'].join('');
    this.__defineGetter__("browser", function () { return  desired; });
    this.name = 'BrowserError';
}
util.inherits(BrowserError, CompositeError);

