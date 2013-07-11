var RunError = require('../../src/error/run');
var chai = require('chai');
var nock = require('nock');
var assert = chai.assert;

describe('RunError', function (){
    it('should be an instance of error', function() {
        var err = new RunError('foo', []);
        assert.instanceOf(err, Error);
    });
});
