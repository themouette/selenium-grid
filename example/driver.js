var TestCase = require('../src/scenario/driver');

var Scenario = TestCase.extend({
    name: 'driver',
    doRun: function (browser) {
        var t = 0;
        browser
            .get('http://google.fr')
            .thenSendKeys('input[name=q]', ['a','b','c'])
            .then(function (next) {
                setTimeout(next, 1000);
            })
            ;
    }
});


module.exports = new Scenario();
