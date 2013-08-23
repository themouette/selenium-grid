var assert = require('chai').assert;
module.exports.register = function registerAssert(Browser) {
    registerAssertResources(Browser);
};

function registerAssertResources(Browser) {
    Browser.prototype.assertImagesLoaded = function () {
        this.thenExecute([
            "return (function () {",
                "var imgs = document.getElementsByTagName('img');",
                "var results = [];",
                "for (var i=0;i<imgs.length;i++) {",
                    "if (",
                        "!imgs[i].complete ||",
                        "(imgs[i].naturalWidth === 0 && imgs[i].naturalHeight === 0)",
                    ") {",
                        "results.push(imgs[i].src)",
                    "}",
                "}",
                "return results;",
            "})()"
        ].join(''), function (results, next) {
            assert.notOk(results.length, 'Unable to load resources '+results.join(', '));
            next();
        });

        return this;
    };
}
