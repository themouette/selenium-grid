describe('Yahoo search', function (browser, remote, desired) {
    browser
        .get('http://yahoo.fr')
        .wait()
        .thenLog('Doing something !')
        ;

});
