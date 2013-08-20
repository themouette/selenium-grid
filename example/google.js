var TestCase = require('../src/scenario/webdriver');
var wd = require('wd');
var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');

var Scenario = TestCase.extend({
    name: 'google',
    doRun: function (browser, remote, desired) {
        browser
            .get('http://google.fr')
            .title(function (title) {
                assert.equal(title, 'Google');
            });
    }
});

function saveScreenshot(id, b64screen, desired, next) {
    var file = filename(id, desired);
    fs.writeFile(file, b64screen, 'base64', function (err) {
        next(err);
    });
}

function filename(id, desired) {
    return [__dirname, 'screenshots', id+'_'+desired.browserName+'.png'].join('/');
}


module.exports = new Scenario();
