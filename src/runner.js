var _ = require('lodash');
var status = require('status');

module.exports  = function run(configuration, tests) {
    var startegyDone = function (err) {},
        testDone = function (err, desired, test) {},
        browserDone = function (err, desired) {};
    // ensure configuration meets requirements
    configuration = _.merge({}, require("configuration.json"), configuration);

    // check wich browsers are available
    checkBrowsersCapabilities(configuration, runTestsForBrowsers);

    function runTestsForBrowsers(err, browsers) {
        if (err) {
            return startegyDone(err);
        }

        async.forEach(browsers, _.partial(runTestsForBrowser, configuration, tests, testDone, browserDone), startegyDone);
    }
};

function checkBrowsersCapabilities(configuration, callback) {
    var browsers = configuration.browsers;

    if (configuration.skipCapabilitiesCheck) {
        return callback(browsers);
    }

    status.available(configuration.remoteCfg, function (err, availableBrowsers) {
        if (err !== null) {
            return callback(new Error('Could not connect to selenium grid, did you started it?'));
        }

        var foundBrowsers = browsers.filter(function(desired) {
            return availableBrowsers.some(function(available) {
                return available.browserName === desired.browserName &&
                    available.version === desired.version;
            });
        });

        if (foundBrowsers.length === 0) {
            return callback(new Error('No browsers found in the grid, did you started your VMs?'));
        }

        callback(err, foundBrowsers);
    });
}


function runTestsForBrowser(configuration, tests, testDone, browserDone, desired) {
    var queue = async.queue(runTest, opt.concurrency);
    // when all tests are done for browser
    queue.drain = function () {
        browserDone(null, desired);
    };

    tests.forEach(function (test) {
        var task = {
            remoteCfg: configuration.remoteCfg,
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
    var test = tast.test;
    var run = _.isFunction(test.run) ? test.run : test;
    if (_.isFunction(test.before)) {
        test.before(task.desired);
    }
    run(task.remoteCfg, task.desired, doneCb);
}
