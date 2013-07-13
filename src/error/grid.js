var _ = require('lodash');
var CompositeError = require('./composite');

module.exports = GridError;

function GridError(message, errorsStack) {
    CompositeError.call(this, message, errorsStack);
    this.name = 'GridError';
}

GridError.prototype = new CompositeError();
GridError.prototype.constructor = GridError;
