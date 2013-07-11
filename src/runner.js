var _ = require('lodash');
var async = require('async');
var status = require('./status');

module.exports  = function run(config, tests) {
    var startegyDone = config.after || function (err) {},
        testDone = config.afterEach || function (err, desired, test) {},
        browserDone = config.afterBrowser || function (err, desired) {};
    // ensure configuration meets requirements
    config = _.merge({}, require("./config.json"), config);

    // check wich browsers are available
    checkBrowsersCapabilities(config, runTestsForBrowsers);

    function runTestsForBrowsers(err, browsers) {
        if (err) {
            return startegyDone(err);
        }

        var callback = _.partial(runTestsForBrowser,
            config, tests, testDone, browserDone);

        async.each(browsers, callback, startegyDone);
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


function runTestsForBrowser(config, tests, testDone, browserDone, desired, doneCb) {
    var queue = async.queue(runTest, config.concurrency);
    // when all tests are done for browser
    queue.drain = function (err) {
        browserDone(err, desired);
        doneCb();
    };

    tests.forEach(function (test) {
        var task = {
            remoteCfg: config.remoteCfg,
            desired: desired,
            test: test
        };
        queue.push(task, function (err) {
            if (test.after) {
                test.after(err, desired);
            }
            testDone(err, desired, test);
        });
    });
}

function runTest(task, doneCb) {
    var test = task.test;
    var run = _.isFunction(test.run) ? test.run : test;
    if (_.isFunction(test.before)) {
        test.before(task.desired);
    }
    run(task.remoteCfg, task.desired, doneCb);
}
