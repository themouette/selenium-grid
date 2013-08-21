var TestCase = require('../src/scenario/driver');
var path = require('path');

var Scenario = TestCase.extend({
    name: 'driver',
    doRun: function (browser) {
        var t = 0;
        browser
            .get('http://google.fr')
            .thenSendKeys('input[name=q]', ['a','b','c'])
            .get('http://cl-gl46v4j.almerys.local/ebee-home/resources/html/formTest.html')
            .thenFill('form#contact-form', {
                'subject':    'I am watching you',
                'content':    'So be careful.',
                'civility':   'Mr',
                'name':       'Chuck Norris',
                'email':      'chuck@norris.com',
                'cc':         true,
                'bcc':         false,
                'attachment': path.join(__dirname, 'test.txt')
            })
            .wait(10000)
            .thenLog('Here we are :)')
            ;
    }
});


module.exports = new Scenario();
