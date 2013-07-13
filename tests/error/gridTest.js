var GridError = require('../../src/error/grid');
var chai = require('chai');
var nock = require('nock');
var assert = chai.assert;

describe('GridError', function (){
    it('should be an instance of error', function() {
        var err = new GridError('foo', []);
        assert.instanceOf(err, Error);
    });
});
