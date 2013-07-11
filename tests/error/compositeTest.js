var CompositeError = require('../../src/error/composite');
var chai = require('chai');
var nock = require('nock');
var assert = chai.assert;

describe('CompositeError', function (){
    it('should be an instance of error', function() {
        var err = new CompositeError('foo');
        assert.instanceOf(err, Error);
    });
});

