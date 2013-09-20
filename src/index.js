module.exports = {
    xpath: require('./driver/selector').xpath,
    error: {
        Browser: require('./error/browser'),
        Grid: require('./error/grid')
    },
    runner: {
        Grid: require('./runner/grid'),
        Browser: require('./runner/browser'),
        Scenario: require('./runner/scenario')
    },
    reporter: {
        Base: require('./reporter/base'),
        Console: require('./reporter/console')
    },
    scenario: {
        TestCase: require('./scenario/testCase'),
        Driver: require('./scenario/driver')
    },
    Driver: require('./driver')
};
