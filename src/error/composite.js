var _ = require('lodash');

module.exports = CompositeError;

function CompositeError(message, errorsStack) {
    var  errors = _.clone(errorsStack || []);
    this.__defineGetter__("length", function () { return  errors.length; });
    this.__defineGetter__("errors", function () { return  errors; });

    this.message = message || 'unknown message';
    var ssf = arguments.callee;
    if (ssf && Error.captureStackTrace) {
        Error.captureStackTrace(this, ssf);
    }
}

CompositeError.prototype = Object.create(Error.prototype);
CompositeError.prototype.name = 'CompositeError';
CompositeError.prototype.constructor = CompositeError;
