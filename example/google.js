describe('Google search', function (browser, remote, desired) {
    var assert = require('chai').assert;
    browser
        .get('http://google.fr')
        .thenTitle(function (title, next) {
            assert.equal(title, 'Google');
            next();
        })
        .thenTakeScreenshot(function (image, next) {
            saveScreenshot('homepage', image, desired, next);
        })
        .thenFill('form', {'q': 'selenium'}, true)
        .wait()
        .thenClick('h3.r a')
        .wait()
        .thenTakeScreenshot(function (image, next) {
            saveScreenshot('first-link', image, desired, next);
        })
        ;


    function saveScreenshot(id, b64screen, desired, next) {
        var fs = require('fs');
        var file = filename(id, desired);
        fs.writeFile(file, b64screen, 'base64', function (err) {
            next(err);
        });
    }

    function filename(id, desired) {
        var path = require('path');
        return path.resolve(__dirname, '../screenshots', id+'_'+desired.browserName+'.png');
    }

});
