var _ = require('lodash');
var util = require('util');
var BaseReporter = require('./base');
var CompositeError = require('../error/composite');

module.exports = ConsoleReporter;

function ConsoleReporter() {
    BaseReporter.call(this);
    this.matrix = {};
    this.status = null;
    this.browserStatus = {};
    // start timer, will be reset if grid was not started yet.
    this.start = new Date();
    this.count = 0;
}
util.inherits(ConsoleReporter, BaseReporter);

ConsoleReporter.prototype.onBefore = function (grid) {
    this.start = new Date();
};

ConsoleReporter.prototype.onBeforeBrowser = function (browserRunner, browserCfg) {
    this.browserStatus[browserId(browserCfg)] = null;
    this.matrix[browserId(browserCfg)] = {};
};
ConsoleReporter.prototype.onBeforeScenario = function (scenarioRunner, browserCfg) {
    var matrix = this.matrix[browserId(browserCfg)];
    if (typeof(matrix[scenarioRunner.getName()]) !== "undefined") {
        console.log(color('bright yellow', 'This test and browser combination has already been lanched.'));
    }
    matrix[scenarioRunner.getName()] = null;
};
ConsoleReporter.prototype.onAfterScenario = function (err, scenarioRunner, browserCfg) {
    this.count++;
    this.matrix[browserId(browserCfg)][scenarioRunner.getName()] = err || false;
    if (err) {
        this.status = false;
        console.log(color('fail', '  %s on %s'), scenarioRunner.getName(), browserCfg.browserName, color('bright fail', 'FAIL'));
        if (err instanceof CompositeError) {
            console.log(err.toString().replace(/^/gm, '    > '));
        } else if (err.inspect) {
            console.log('Webdriver error:'.replace(/^/gm, '    > '));
            console.log(err.inspect().replace(/^/gm, '    > '));
        } else {
            console.log(err.stack.replace(/^/gm, '    > '));
        }
        return ;
    }
    console.log(color('pass', '  %s on %s'), scenarioRunner.getName(), browserCfg.browserName, color('bright pass', 'PASS'));
};
ConsoleReporter.prototype.onAfterBrowser = function (err, browserRunner, browserCfg) {
    this.browserStatus[browserId(browserCfg)] = err || false;
    if (err) {this.status = false;}
};
ConsoleReporter.prototype.onAfter = function (grid) {
    console.log("\n\n  =================================\n");
    var end = new Date();
    var elapsed = (end.getTime() - this.start.getTime()) / 1000;
    var resultStr = "  %s jobs ran in %s s\n";
    if (this.status || this.status === null) {
        return console.log(color('bright pass', resultStr), this.count, elapsed);
    }

    console.log(color('bright fail', resultStr), this.count, elapsed);

    // there were errors
    var browsers = this.browserStatus;
    _.each(this.matrix, function (tests, browser) {
        if (!browsers[browser]) {
            // there were no error
            console.log('   ', browser, '-', color('bright pass','OK'));
            return;
        }
        console.log(color('fail', '    %s'), browser);
        _.each(tests, function (test, id) {
            if (test) {
                console.log(color('bright fail', '       %s %s - failed'), symbols.err, id);
            }
        });
    });
};

function browserId(browserCfg) {
    var name = [];
    if (browserCfg.browserName) { name.push(browserCfg.browserName); }
    if (browserCfg.version) { name.push(browserCfg.version); }
    if (browserCfg.platform) { name.push(browserCfg.platform); }
    return name.join('-');
}

// what comes next is taken from mocha reporters
// https://github.com/visionmedia/mocha/blob/master/lib/reporters/base.js

var tty = require('tty');
/**
 * Check if both stdio streams are associated with a tty.
 */

var isatty = tty.isatty(1) && tty.isatty(2);

/**
 * Enable coloring by default.
 */

var useColors = isatty;

/**
 * Default color map.
 */

var colors = {
    'pass': 90
  , 'fail': 31
  , 'bright pass': 92
  , 'bright fail': 91
  , 'bright yellow': 93
  , 'pending': 36
  , 'suite': 0
  , 'error title': 0
  , 'error message': 31
  , 'error stack': 90
  , 'checkmark': 32
  , 'fast': 90
  , 'medium': 33
  , 'slow': 31
  , 'green': 32
  , 'light': 90
  , 'diff gutter': 90
  , 'diff added': 42
  , 'diff removed': 41
};

/**
 * Default symbol map.
 */

var symbols = {
  ok: '✓',
  err: '✖',
  dot: '․'
};

// With node.js on Windows: use symbols available in terminal default fonts
if ('win32' == process.platform) {
  symbols.ok = '\u221A';
  symbols.err = '\u00D7';
  symbols.dot = '.';
}

/**
 * Color `str` with the given `type`,
 * allowing colors to be disabled,
 * as well as user-defined color
 * schemes.
 *
 * @param {String} type
 * @param {String} str
 * @return {String}
 * @api private
 */

var color = function(type, str) {
  if (!useColors) return str;
  return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m';
};
