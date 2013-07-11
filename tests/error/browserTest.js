var BrowserError = require('../../src/error/browser');
var chai = require('chai');
var nock = require('nock');
var assert = chai.assert;

describe('BrowserError', function (){
    it('should be an instance of error', function() {
        var err = new BrowserError('foo', [], {});
        assert.instanceOf(err, Error);
    });
});
