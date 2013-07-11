var _ = require('lodash');
var async = require('async');
var status = require('./status');
var RunError = require('./error/run');
var BrowserError = require('./error/browser');

module.exports  = function run(config, tests) {
    var startegyDone = config.after || function (err) {
                if (err) {throw err;}
            },
        afterEach = config.afterEach || function (err, desired, test) {
                if (err) {throw err;}
            },
        afterBrowser = config.afterBrowser || function (err, desired) {
                if (err) {throw err;}
            };
    // ensure configuration meets requirements
    config = _.merge({}, require("./config.json"), config);

    // check wich browsers are available
    checkBrowsersCapabilities(config, runTestsForBrowsers);

    function runTestsForBrowsers(err, browsers) {
        if (err) {
            return startegyDone(err);
        }

        var callback = _.partial(runTestsForBrowser,
            config, tests, afterEach, afterBrowser);

//        async.each(browsers, callback, startegyDone);
        var queue = async.queue(callback, browsers.length);
        var strategyErrors = [];
        queue.drain = function strategyIsOver() {
            var err;
            if (strategyErrors.length) {
                err = new RunError('Errors where catched for this run.', strategyErrors);
            }
            startegyDone(err);
        };

        browsers.forEach(function (browser) {
            queue.push(browser, function onBrowserReady(err) {
                if (err) {
                    strategyErrors.push(err);
                }
            });
        });
    }
};

function checkBrowsersCapabilities(configuration, callback) {
    var browsers = configuration.browsers;

    if (configuration.skipCapabilitiesCheck) {
        // invoke with the full browser stack
        return callback(null, browsers);
    }

    status.available(
        configuration.remoteCfg,
        function (err, availableBrowsers) {
            if (err !== null) {
                return callback(new Error([
                    'Could not connect to selenium grid, ',
                    'did you started it?'
                ].join('')));
            }

            var foundBrowsers = browsers.filter(function(desired) {
                return availableBrowsers.some(function(available) {
                    return available.browserName === desired.browserName && (
                            !desired.version ||
                            available.version === desired.version);
                });
            });

            if (foundBrowsers.length === 0) {
                return callback(new Error([
                    'No matching browsers found in the grid, ',
                    'did you started your VMs?'
                ].join('')));
            }

            callback(err, foundBrowsers);
    });
}


function runTestsForBrowser(config, tests, afterEach, afterBrowser, desired, doneCb) {
    var queue = async.queue(runTest, config.concurrency);
    var browserErrors = [];
    // when all tests are done for browser
    queue.drain = function () {
        var err;
        if (browserErrors.length) {
            err = new BrowserError('Errors where catched for this browser.', browserErrors, desired);
        }

        try {
            afterBrowser(err, desired);
            doneCb();
        } catch(e) {
            doneCb(e);
        }
    };

    tests.forEach(function (test) {
        var task = {
            remoteCfg: config.remoteCfg,
            desired: desired,
            test: test
        };
        queue.push(task, function onTestReady(err) {
            if (_.isFunction(test.after)) {
                try {
                    test.after(err, desired);
                } catch (e) {
                    // it is possible to modify error on after.
                    err = e;
                }
            }
            try {
                // error is trapped
                afterEach(err, desired, test);
            } catch (e) {
                // but can bubble
                enqueueError(e);
            }
        });
    });

    function enqueueError(err) {
        if (err) {
            browserErrors.push(err);
        }
    }
}

function runTest(task, doneCb) {
    var test = task.test;
    var run = _.isFunction(test.run) ? test.run : test;
    try {
        if (_.isFunction(test.before)) {
            test.before(task.desired);
        }
        run(task.remoteCfg, task.desired, doneCb);
    } catch (err) {
        doneCb(err);
    }
}
