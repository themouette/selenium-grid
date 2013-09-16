var chai = require('chai');
var fs = require('fs');
var nock = require('nock');
var status = require('../src/status');
var assert = chai.assert;

describe("parse grid status HTML", function () {

    var server;
    var html = fs.readFileSync(__dirname + '/../fixtures/html/console.html');

    it("Should be possible to parse grid HTML", function (done) {
        var html = fs.readFileSync(__dirname + '/../fixtures/html/console.html');
        status.parseHtml(html, function (err, res) {
            assert.deepEqual(res, [{
                "platform": "XP",
                "seleniumProtocol": "WebDriver",
                "browserName": "chrome",
                "maxInstances": "2",
                "version": "latest"
            }, {
                "platform": "XP",
                "seleniumProtocol": "WebDriver",
                "browserName": "firefox",
                "maxInstances": "2",
                "version": "latest"
            }]);
            done();
        });
    });

    it('Should retrieve available browsers', function(done) {
        setupConsoleResponse(server);
        status.available({
            hostname: '127.0.0.1',
            port: 4444
        }, function (err, res) {
            assert.ok(!err);
            assert.deepEqual(res, [{
                "platform": "XP",
                "seleniumProtocol": "WebDriver",
                "browserName": "chrome",
                "maxInstances": "2",
                "version": "latest"
            }, {
                "platform": "XP",
                "seleniumProtocol": "WebDriver",
                "browserName": "firefox",
                "maxInstances": "2",
                "version": "latest"
            }]);
            done();
        });
    });

});

function setupConsoleResponse(server, statuscode) {
    var html = fs.readFileSync(__dirname + '/../fixtures/html/console.html');
    nock('http://127.0.0.1:4444')
        .get('/grid/console')
        .reply(statuscode || 200, html);
}
