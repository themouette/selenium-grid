var chai = require('chai');
var lib = require('../src/index');
var assert = chai.assert;

describe('library', function () {
    it('should expose run', function () {
        assert.ok(lib.run);
    });
    it('should expose TestCase', function () {
        assert.ok(lib.TestCase);
    });
});
