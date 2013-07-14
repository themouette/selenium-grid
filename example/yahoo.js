var TestCase = require('../src/scenario/webdriver');
var wd = require('wd');
var chai = require('chai');
var assert = chai.assert;

var count = 0;
var Scenario = TestCase.extend({
    name: 'yahoo',
    doRun: function (browser) {
        browser
            .get('http://yahoo.fr')
            .title(function (title) {
                assert.equal(title, 'Yahoo! France');
            });
    }
});


module.exports = new Scenario();

