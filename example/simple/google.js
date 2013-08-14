
describe('Google', function () {

    it('should be accessible', function (browser) {
        browser
            .start('http://google.fr');
    });

    it('should have a search input', function(browser) {
        browser
            .title(function (title) {
                assert.equal(title, 'Google');
            });
    });
});

it('something', function (browser) {
});
