var chai = require('chai');
var TestCase = require('../../src/scenario/testCase');
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
    it('should be possible to override', function(done) {
        var Case2 = TestCase.extend({
            run: function () {
                done();
            }
        });

        var t = new Case2();
        assert.instanceOf(t, TestCase);
        t.run();
    });
});
