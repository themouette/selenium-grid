var _ = require('lodash');

module.exports = CompositeError;

function CompositeError(message, errorsStack) {
    var  errors = _.clone(errorsStack || []);
    this.__defineGetter__("length", function () { return  errors.length; });
    this.__defineGetter__("errors", function () { return  errors; });

    this.name = 'CompositeError';
    this.message = message;
}

CompositeError.prototype = new Error();
CompositeError.prototype.constructor = CompositeError;
