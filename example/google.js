var TestCase = require('../src/scenario/webdriver');
var wd = require('wd');
var chai = require('chai');
var assert = chai.assert;

var Scenario = TestCase.extend({
    name: 'google',
    doRun: function (browser) {
        browser
            .get('http://google.fr')
            .title(function (title) {
                assert.equal(title, 'Google');
/*            })
            ._title()
            ._title(function (err, title, done) {
                console.log('Raw');
                done();
            })
            .title(function (title) {
                console.log('after');
*/            });
    }
});


module.exports = new Scenario();
