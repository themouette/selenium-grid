var run = require('../src/runner');
var _ = require('lodash');
var chai = require('chai');
var nock = require('nock');
var fs = require('fs');
var assert = chai.assert;

describe('Runner process', function () {

    beforeEach(function () {
        nock.cleanAll();
    });

    it ('should be possible to filter browsers', function (done) {
        setupConsoleResponse();
        run({
            skipCapabilitiesCheck: false,
            browsers: [{
                browserName: "internet explorer",
                version: 9
            }, {
                browserName: "chrome",
                version: 'latest'
            }],
            after: done
        }, [{
            run: function (remote, desired, doneCb) {
                assert.deepEqual(desired, {
                    browserName: "chrome",
                    version: 'latest'
                });
                doneCb();
            }
        }]);
    });


    it('should be possible to bypass browser filtering', function(done) {
        done = _.after(3, done);
        var server = setupConsoleResponse();
        run({
            skipCapabilitiesCheck: true,
            browsers: [{
                browserName: "internet explorer",
                version: 9
            }, {
                browserName: "internet explorer",
                version: 8
            }],
            after: function (err) {
                assert.ok(!err);
                assert.ok(!server.isDone());
                done();
            }
        }, [{
            run: function (remote, desired, doneCb) {
                done();
                doneCb();
            }
        }]);
    });

    it('should throw an error if console is not available', function(done) {
        setupConsoleResponse(404);
        run({
            browsers: [{
                browserName: "internet explorer",
                version: 8
            }],
            after: function (err) {
                assert.ok(err.message);
                assert.match(err.message, /Could not connect/);
                done();
            }
        }, [{
            run: function (remote, desired, doneCb) {doneCb();}
        }]);
    });

    it('should throw an error if no requested browser is available', function(done) {
        setupConsoleResponse();
        run({
            browsers: [{
                browserName: "internet explorer",
                version: 9
            }],
            after: function (err) {
                assert.ok(err.message);
                assert.match(err.message, /No matching browsers/);
                done();
            }
        }, [{
            run: function (remote, desired, doneCb) {doneCb();}
        }]);
    });

});

function setupConsoleResponse(statuscode) {
    var html = fs.readFileSync(__dirname + '/../fixtures/html/console.html');
    return nock('http://127.0.0.1:4444')
        .get('/grid/console')
        .reply(statuscode || 200, html);
}
