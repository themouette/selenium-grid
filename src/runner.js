var _ = require('lodash');
var status = require('./status');
var GridRunner = require('./runner/grid');

module.exports  = function run(config, scenarios, done) {
    // ensure configuration meets requirements
    config = _.merge({}, require("./config.json"), config);
    done || (done = function () {});

    // check wich browsers are available
    checkBrowsersCapabilities(config, runForBrowsers);

    function runForBrowsers(err, browsers) {
        var grid, reporter;
        if (err) {
            return done(err);
        }

        // override browser configuration
        config.browsers = browsers;

        grid = new GridRunner(config, scenarios);

        // run !
        grid.run(done);
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
