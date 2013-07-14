var grid = require('../src/index');
var GridError = require('../src/error/grid');
var ConsoleReporter = require('../src/reporter/console');

grid.run({
    browsers: [{
        browserName: "internet explorer",
        version: "8",
        platform: "XP"
    }, {
        browserName: "chrome",
        version: 'latest'
    }, {
        browserName: "firefox",
        version: 'latest'
    }],
    remoteCfg: {
        host: '192.168.1.25'
    },
    before: function (grid) {
        // register reporters
        reporter = new ConsoleReporter();
        reporter.register(grid);
    }
}, [
    require('./google'),
    require('./yahoo')
], function (err) {
    process.exit(err ? 1 : 0);
});
