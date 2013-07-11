var chai = require('chai');
var TestCase = require('../src/testCase');
var assert = chai.assert;

describe('TestCase', function () {
    it('should be possible to extend', function(done) {
        var Case2 = TestCase.extend({
            foo: function () {
                done();
            }
        });

        var t = new Case2();
        assert.instanceOf(t, TestCase);
        t.foo();
    });
});
