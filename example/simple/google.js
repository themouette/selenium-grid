
timeout(10000);
describe('Google search', function (browser, remote, desired) {
    var assert = require('chai').assert;
    browser
        .get('http://google.fr')
        .title(function (title) {
            assert.equal(title, 'Google');
        })
        ._takeScreenshot(function (err, image, next) {
            if (err) {throw err;}
            saveScreenshot('homepage', image, desired, next);
        });
});

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
