var _ = require('lodash');

module.exports = {
    register: registerChain
};

function registerChain(Browser) {
    var original = Browser.prototype.setupPlugins;
    Browser.prototype.setupPlugins = function () {
        _initChain.call(this);
        if (original) {
            original.apply(this, arguments);
        }
    };
    // Queue implementation.
    Browser.prototype.then = Browser.prototype.push = function (callback) {
        this._steps.push(callback);
        if (!_.isNumber(this._current)) {
            _start.call(this);
        }
        return this;
    };
    Browser.prototype.now = Browser.prototype.unshift = function (callback) {
        var position = _.isNumber(this._current) ? 1+this._current : 0;
        this._steps.splice(position, 0, callback);
        if (!_.isNumber(this._current)) {
            _start.call(this);
        }
        return this;
    };

    function _initChain() {
        this._current = null;
        this._steps = [];
    }

    function _start() {
        this._current = 0;
        this._driver.init(this._desired, _process.bind(this));
    }

    function _process(err) {
        if (err) {
            return _teardown.call(this, err);
        }
        try {
            var done = _afterTask.bind(this);
            var task = this._steps[this._current];
            task.call(this, done);
        } catch (e) {
            done(e);
        }
    }

    function _afterTask(err) {
        if (err || this._current >= this._steps.length - 1) {
            return _teardown.call(this, err);
        }
        // process next
        this._current++;
        _process.call(this);
    }

    function _teardown(err) {
        if (this._drain) {
            this._drain(err);
        }
    }
}
