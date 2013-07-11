var chai = require('chai');
var lib = require('../src/index');
var assert = chai.assert;

describe('library', function () {
    it('should expose runner', function () {
        assert.ok(lib.runner);
    });
    it('should expose TestCase', function () {
        assert.ok(lib.TestCase);
    });
});
