var _ = require('lodash');

module.exports = {
    filterBrowserList: filterBrowserList
};

function filterBrowserList(available, desired) {
    var foundBrowsers = desired.filter(function(desired) {
        return available.some(function(available) {
            var keys = _.keys(desired);
            for (var i in keys) {
                var key = keys[i];
                // is the key the same ?
                if (typeof(desired[key]) !== "undefined" && available[key] !== desired[key]) {
                    return false;
                }
            }
            // no diverging.
            return true;
        });
    });

    return foundBrowsers;
}
