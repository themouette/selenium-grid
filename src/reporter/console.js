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
    var browsers = grid.config.browsers;
    console.log('Will execute tests on following configurations:\n');
    browsers.forEach(function (b) {
        console.log('  -> %s', browserId(b));
    });
    logSeparation();
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
        console.log(
            color('bright fail', '  FAIL'),
            color('fail', scenarioRunner.getName()),
            'on',
            color('fail', browserId(browserCfg)));
        if (err instanceof CompositeError) {
            console.log(err.toString().replace(/^/gm, '    > '));
        } else if (err.inspect) {

            if (err.status) {
                console.log('Webdriver error:'.replace(/^/gm, '    > '), SeleniumError(err.status));
            } else {
                console.log('Webdriver error:'.replace(/^/gm, '    > '));
            }

            if (err.data && err.data.value && err.data.value.message) {
                console.log(err.data.value.message.replace(/^/gm, '    > '));
            } else if (err.cause && err.cause.value && err.cause.value.message) {
                console.log(err.cause.value.message.replace(/^/gm, '    > '));
            } else {
                console.log(err.inspect().replace(/^/gm, '    > '));
            }
        } else if (err.stack) {
            console.log(err.stack.replace(/^/gm, '    > '));
        } else {
            console.log(util.inspect(err).replace(/^/gm, '    > '));
        }
        return ;
    }
    console.log(
        color('bright pass', '  PASS'),
        color('pass', scenarioRunner.getName()),
        'on',
        color('pass', browserId(browserCfg)));
};
ConsoleReporter.prototype.onAfterBrowser = function (err, browserRunner, browserCfg) {
    this.browserStatus[browserId(browserCfg)] = err || false;
    if (err) {this.status = false;}
};
ConsoleReporter.prototype.onAfter = function (grid) {
    logSeparation();
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

function browserId(browser) {
    var desired  = _.extend({}, {
        browserName: 'any browser',
        platform: 'any platform',
        version: 'any version'
    }, browser);

    return util.format('%s (%s) on %s', desired.browserName, desired.version, desired.platform);
}

function SeleniumError(code) {
    switch(code) {
        case 0:
            return "The command executed successfully.";
        case 6:
            return "A session is either terminated or not started";
        case 7:
            return "An element could not be located on the page using the given search parameters.";
        case 8:
            return "A request to switch to a frame could not be satisfied because the frame could not be found.";
        case 9:
            return "The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource.";
        case 10:
            return "An element command failed because the referenced element is no longer attached to the DOM.";
        case 11:
            return "An element command could not be completed because the element is not visible on the page.";
        case 12:
            return "An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element).";
        case 13:
            return "An unknown server-side error occurred while processing the command.";
        case 15:
            return "An attempt was made to select an element that cannot be selected.";
        case 17:
            return "An error occurred while executing user supplied JavaScript.";
        case 19:
            return "An error occurred while searching for an element by XPath.";
        case 21:
            return "An operation did not complete before its timeout expired.";
        case 23:
            return "A request to switch to a different window could not be satisfied because the window could not be found.";
        case 24:
            return "An illegal attempt was made to set a cookie under a different domain than the current page.";
        case 25:
            return "A request to set a cookie's value could not be satisfied.";
        case 26:
            return "A modal dialog was open, blocking this operation";
        case 27:
            return "An attempt was made to operate on a modal dialog when one was not open.";
        case 28:
            return "A script did not complete before its timeout expired.";
        case 29:
            return "The coordinates provided to an interactions operation are invalid.";
        case 30:
            return "IME was not available.";
        case 31:
            return "An IME engine could not be started.";
        case 32:
            return "Argument was an invalid selector (e.g. XPath/CSS).";
        case 33:
            return "A new session could not be created.";
        case 34:
            return "Target provided for a move action is out of bounds.";
    }

    return "Unknown error.";
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

function logSeparation() {
    console.log("\n\n  =================================\n");
}
