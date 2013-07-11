var _ = require('lodash');
var CompositeError = require('./composite');

module.exports = RunError;

function RunError(message, errorsStack, browser) {
    var desired = _.clone(browser);
    CompositeError.prototype.constructor.call(this, message, errorsStack);
    this.name = 'RunError';
}

RunError.prototype = new CompositeError();
RunError.prototype.constructor = RunError;
