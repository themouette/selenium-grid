describe('compatibility utilities', function () {
    var assert = require('chai').assert;
    var filterBrowserList = require('../../src/utils/capabilities').filterBrowserList;

    describe('filterBrowserList', function() {
        it('should return available if extra capability is offered', function() {
            var available = {browserName: "chrome", version: "latest"};
            var desired = {browserName: "chrome"};

            var results = filterBrowserList([available], [desired]);
            assert.deepEqual(results, [desired], 'results should be as expected');
        });
        it('should return available if capability is unavailable', function() {
            var available = {browserName: "chrome"};
            var desired = {browserName: "chrome", version: "latest"};

            var results = filterBrowserList([available], [desired]);
            assert.deepEqual(results, [], 'results should be empty');
        });
        it('should return available if capability is different', function() {
            var available = {browserName: "chrome", version: "29"};
            var desired = {browserName: "chrome", version: "latest"};

            var results = filterBrowserList([available], [desired]);
            assert.deepEqual(results, [], 'results should be empty');
        });
        it('should keep only one even if available several time', function() {
            var available = [
                {browserName: "chrome", version: "29"},
                {browserName: "chrome", version: "29"},
                {browserName: "chrome", version: "29", platform: "XP"}];
            var desired = {browserName: "chrome", version: "29"};

            var results = filterBrowserList(available, [desired]);
            assert.equal(results.length, 1, 'should have only one');
        });
        it('should filter a list with several elements', function() {
            var available = [
                {browserName: "internet explorer", version: "8"},
                {browserName: "firefox", version: "latest"},
                {browserName: "chrome", version: "29", platform: "XP"}];
            var desired = [
                {browserName: "firefox", version: "latest"},
                {browserName: "chrome", version: "latest"},
                {browserName: "internet explorer", version: "8"}];

            var results = filterBrowserList(available, desired);
            assert.deepEqual(results, [
                {browserName: "firefox", version: "latest"},
                {browserName: "internet explorer", version: "8"}], 'results should be empty');
        });
    });
});
