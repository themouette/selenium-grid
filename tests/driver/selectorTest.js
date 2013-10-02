describe('Driver selector', function () {
    var _ = require('lodash');
    var chai = require('chai');
    var sinon = require('sinon');
    var assert = chai.assert;

    var chainExtension = require('../../src/driver/chain').register;
    var selectorExtension = require('../../src/driver/selector').register;

    this.timeout(50);

    describe('native selector related methods', function () {
        var methodName = 'element';
        var thenMethodName = 'thenElement';
        var browser;
        var message = "something";

        beforeEach(function () {
            function Browser () {
                this.setupPlugins();
                this._driver = {
                    init: function (cfg, next){next();}};
                this._driver[methodName] = function (selectorType, selector, cb) {
                    var args = _.head(arguments, 2);
                    cb.apply(this, [null].concat(args));
                };
            }

            chainExtension(Browser);
            selectorExtension(Browser);

            browser = new Browser();
        });

        describe('exposed as native', function () {
            it('should throw an error if native method does not exists', function() {
                browser.error = sinon.spy();
                browser._driver[methodName] = null;
                assert.throws(function () {
                    browser[methodName]('.foo', function cb() {
                        assert.ok(false, 'should not be called at all.');
                    });
                }, 'non existing native method "'+methodName+'" (exposeSelector)');
                assert.ok(browser.error.called, 'should call error');
            });
            it('should accept a css selector', function(done) {
                browser[methodName]('.foo', function cb(selectorType, selector) {
                    assert.equal(selectorType, 'css selector', 'should call callback with selector.');
                    assert.equal(selector, '.foo', 'should call callback with selector.');
                    done();
                });
            });
            it('should accept an xpath selector', function(done) {
                var x = require('../../src/driver/selector').xpath;

                browser[methodName](x('//div'), function cb(selectorType, selector) {
                    assert.equal(selectorType, 'xpath', 'should call callback with selector.');
                    assert.equal(selector, '//div', 'should call callback with selector.');
                    done();
                });
            });
            it('should accept an id selector', function(done) {
                var id = require('../../src/driver/selector').id;

                browser[methodName](id('foo'), function cb(selectorType, selector) {
                    assert.equal(selectorType, 'id', 'should call callback with selector.');
                    assert.equal(selector, 'foo', 'should call callback with selector.');
                    done();
                });
            });
            it('should throw an error if any occurs', function() {
                assert.throws(function () {
                    browser[methodName]('.foo', function cb() {
                        throw message;
                    });
                }, message);
            });
            it('should throw an exception if an error is given to callback', function() {
                browser._driver[methodName] = function (selectorType, selector, cb) {
                    cb(message);
                };
                assert.throws(function () {
                    browser[methodName]('.foo', function cb() {
                        assert.ok(false, 'should not be called at all.');
                    });
                }, message);
            });
        });

        describe('exposed as promise', function () {
            it('should throw an error if native method does not exists', function() {
                browser.error = sinon.spy();
                browser._driver[methodName] = null;
                assert.throws(function () {
                    browser[thenMethodName]('.foo', function cb() {
                        assert.ok(false, 'should not be called at all.');
                    });
                }, 'non existing native method "'+methodName+'" (exposeThenSelector)');
                assert.ok(browser.error.called, 'should call error');
            });
            it('should call then method', function() {
                browser.then = sinon.spy();
                browser[thenMethodName]('.foo', function () {});
                assert.ok(browser.then.calledOnce, 'should call then');
            });
            it('should accept a css selector', function(done) {
                var spy = sinon.spy();
                browser._drain = function drain(err) {
                    assert.notOk(err, 'should not be in error');
                    done();
                };
                browser[thenMethodName]('.foo', function cb(selectorType, selector, next) {
                    assert.equal(selectorType, 'css selector', 'should call callback with selector.');
                    assert.equal(selector, '.foo', 'should call callback with selector.');
                    next();
                });
            });
            it('should accept an xpath selector', function(done) {
                var x = require('../../src/driver/selector').xpath;
                var spy = sinon.spy();
                browser._drain = function drain(err) {
                    assert.notOk(err, 'should not be in error');
                    done();
                };
                browser[thenMethodName](x('//div'), function cb(selectorType, selector, next) {
                    assert.equal(selectorType, 'xpath', 'should call callback with selector.');
                    assert.equal(selector, '//div', 'should call callback with selector.');
                    next();
                });
            });
            it('should call next if no callback is given', function (done) {
                browser._drain = function drain(err) {
                    assert.notOk(err, 'should not be in error');
                    done();
                };
                browser[thenMethodName]('.foo');
            });
            it('should forward callback exception to _drain', function(done) {
                browser._drain = function drain(err) {
                    assert.equal(err, message, 'should be in error');
                    done();
                };
                browser[thenMethodName]('.foo', function () {
                    throw message;
                });
                browser.then(function () {
                    assert.ok(false, 'should not be called at all.');
                });
            });
            it('should forward native method error to _drain', function(done) {
                browser._driver[methodName] = function (selectorType, selector, cb) {
                    cb(message);
                };

                browser._drain = function drain(err) {
                    assert.equal(err, message, 'should be in error');
                    done();
                };

                browser[thenMethodName]('.foo');
                browser.then(function () {
                    assert.ok(false, 'should not be called at all.');
                });
            });
            it('should forward callback error argument to drain', function(done) {
                browser._driver[methodName] = function (selectorType, selector, cb) {
                    throw message;
                };

                browser._drain = function drain(err) {
                    assert.equal(err, message, 'should be in error');
                    done();
                };

                browser[thenMethodName]('.foo');
                browser.then(function () {
                    assert.ok(false, 'should not be called at all.');
                });
            });
        });
    });
    describe('native element methods', function () {
        var methodName = 'doubleClick';
        var thenMethodName = 'thenDoubleClick';
        var browser, element;
        var message = "something";

        beforeEach(function () {
            function Browser () {
                this.setupPlugins();
                this._driver = {
                    init: function (cfg, next){next();},
                    // a simple element method calling callback.
                    // please override this to set custom behavior
                    element: function (selectorType, selector, cb) {
                        cb(null, element);
                    }
                };
                this.error = sinon.spy();
            }

            chainExtension(Browser);
            selectorExtension(Browser);

            browser = new Browser();
            element = {};
            // a proxy element object
            // expose the method, calling callback as deferred.
            element[methodName] = function elementMethod(cb) {
                setImmediate(function elementMethodDone() {cb(null);});
            };
        });

        describe('exposed as native', function () {
            it('should throw an exception if element method is not defined', function() {
                element[methodName] = null;
                assert.throws(function () {
                    browser[methodName]('.foo');
                }, 'non existing native element method "'+methodName+'" (exposeElement)');
                assert.ok(browser.error.called, 'error should be notified');
            });
            it('should call the Element related method', function() {
                var spy = sinon.spy();
                element[methodName] = spy;
                browser[methodName]('.foo');
                assert.ok(spy.called, 'should call element method');
            });
            it('should accept a css selector', function() {
                var spy = sinon.spy();
                browser._driver.element = spy;
                browser[methodName]('.foo');

                assert.ok(spy.calledWith('css selector', '.foo'), 'should be called with expected');
            });
            it('should accept xpath selector', function() {
                var x = require('../../src/driver/selector').xpath;
                var spy = sinon.spy();
                browser._driver.element = spy;
                browser[methodName](x('//div'));

                assert.ok(spy.calledWith('xpath', '//div'), 'should be called with expected');
            });
            it('should accept id selector', function() {
                var x = require('../../src/driver/selector').id;
                var spy = sinon.spy();
                browser._driver.element = spy;
                browser[methodName](x('foo'));

                assert.ok(spy.calledWith('id', 'foo'), 'should be called with expected');
            });
            it('should call user callback', function(done) {
                var spy = sinon.spy();
                browser[methodName]('.foo', spy);
                setTimeout(function () {
                    assert.ok(spy.called, 'user callback should be called.');
                    done();
                }, 10);
            });
        });
        describe('exposed as promise', function () {
            it('should throw an exception if element method is not defined', function(done) {
                element[methodName] = null;
                // prepare the assertions
                browser._drain = function (err) {
                    assert.equal(err.message, 'non existing native element method "'+methodName+'" (exposeThenElement)');
                    assert.ok(browser.error.called, 'error should be notified');
                    done();
                };
                browser[thenMethodName]('.foo');
            });
            it('should call the Element related method', function() {
                var spy = sinon.spy();
                element[methodName] = spy;
                browser[thenMethodName]('.foo');

                assert.ok(spy.called, 'should call element method');
            });
            it('should accept a css selector', function() {
                var spy = sinon.spy();
                browser._driver.element = spy;
                browser[thenMethodName]('.foo');

                assert.ok(spy.calledWith('css selector', '.foo'), 'should be called with expected');
            });
            it('should accept xpath selector', function() {
                var x = require('../../src/driver/selector').xpath;
                var spy = sinon.spy();
                browser._driver.element = spy;
                browser[thenMethodName](x('//div'));

                assert.ok(spy.calledWith('xpath', '//div'), 'should be called with expected');
            });
            it('should accept id selector', function() {
                var x = require('../../src/driver/selector').id;
                var spy = sinon.spy();
                browser._driver.element = spy;
                browser[thenMethodName](x('foo'));

                assert.ok(spy.calledWith('id', 'foo'), 'should be called with expected');
            });
            it('should chain', function(done) {
                var spy = sinon.spy();
                browser._drain = function (err) {
                    assert.notOk(err, 'should not be in error');
                    assert.ok(spy.called, 'should execute the full chain.');
                    done();
                };

                browser[thenMethodName]('.foo');
                browser.then(function (next) {
                    spy();
                    next();
                });
            });
            it('should accept a user callback', function(done) {
                var spy = sinon.spy();
                browser._drain = function (err) {
                    assert.notOk(err, 'should not be in error');
                    assert.ok(spy.called, 'should execute the full chain.');
                    done();
                };

                browser[thenMethodName]('.foo', function (next) {
                    next();
                });
                browser.then(function (next) {
                    spy();
                    next();
                });
            });
            it('should require next call when using user callback', function(done) {
                browser._drain = function (err) {
                    assert.ok(false, 'execution should be blocked');
                };

                browser[thenMethodName]('.foo', function (next) {
                    setTimeout(done, 10);
                });
                browser.then(function (next) {
                    assert.ok(false, 'execution should be blocked');
                });
            });

            // ERROR HANDLING
            it('should forward error param in driver callback to _drain', function(done) {
                // replace the element driver method
                // to return an error
                browser._driver.element = function (selectorType, selector, cb) {
                    cb(message);
                };

                browser._drain = function (err) {
                    assert.equal(err, message, 'error should be the original one');
                    done();
                };
                browser[thenMethodName]('.foo');
                browser.then(function () {
                    assert.ok(false, 'should not be called at all.');
                });
            });
            it('should forward exception in driver callback to _drain', function(done) {
                // replace the element driver method
                // to throw an error
                browser._driver.element = function (selectorType, selector, cb) {
                    throw message;
                };

                browser._drain = function (err) {
                    assert.equal(err, message, 'error should be the original one');
                    done();
                };
                browser[thenMethodName]('.foo');
                browser.then(function () {
                    assert.ok(false, 'should not be called at all.');
                });
            });
            it('should forward exception in Element callback to _drain', function(done) {
                // replace the element driver method
                // to make it async
                browser._driver.element = function (selectorType, selector, cb) {
                    setImmediate(function () {cb(null, element);});
                };
                // replace the Element native method
                // to throw an error
                element[methodName] = function (cb) {
                    throw message;
                };

                browser._drain = function (err) {
                    assert.equal(err, message, 'error should be the original one');
                    done();
                };
                browser[thenMethodName]('.foo');
                browser.then(function () {
                    assert.ok(false, 'should not be called at all.');
                });
            });
            it('should forward error in Element callback to _drain', function(done) {
                // replace the element driver method
                // to make it async
                browser._driver.element = function (selectorType, selector, cb) {
                    setImmediate(function () {cb(null, element);});
                };
                // replace the Element native method
                // to throw an error
                element[methodName] = function elementMethodReplace(cb) {
                    setImmediate(function elementMethodDone() {
                        cb(message);
                    });
                };

                browser._drain = function (err) {
                    assert.equal(err, message, 'error should be the original one');
                    done();
                };
                browser[thenMethodName]('.foo');
                browser.then(function () {
                    assert.ok(false, 'should not be called at all.');
                });
            });
            it('should forward user callback exception', function(done) {
                browser._drain = function (err) {
                    assert.equal(err, message, 'error should be the original one');
                    done();
                };
                browser[thenMethodName]('.foo', function (next) {
                    throw message;
                });
                browser.then(function () {
                    assert.ok(false, 'should not be called at all.');
                });
            });
            it('should forward user callback error', function(done) {
                browser._drain = function (err) {
                    assert.equal(err, message, 'error should be the original one');
                    done();
                };
                browser[thenMethodName]('.foo', function (next) {
                    next(message);
                });
                browser.then(function () {
                    assert.ok(false, 'should not be called at all.');
                });
            });
        });
    });
    describe('method', function () {

        var browser, formElement, inputElement;
        var form = '#form';
        var message = 'something';
        function Browser() {
            this.setupPlugins();
            this._driver = {
                init: function (cfg, next){next();},
                // a simple element method calling callback.
                // please override this to set custom behavior
                element: function (selectorType, selector, cb) {
                    cb(null, formElement);
                }
            };
            this.error = sinon.spy();
        }
        chainExtension(Browser);
        selectorExtension(Browser);

        describe('thenFill', function () {
            testFormElementError();
            testInputElementError();
        });

        function testFormElementError() {
            describe('should forward error', function() {
                beforeEach(function () {
                    browser = new Browser();
                    inputElement = null;
                });

                it('for driver element method', function(done) {
                    // spy on element method
                    formElement = {
                        elementByCss: sinon.spy()
                    };
                    // override element to throw an error
                    browser._driver.element = function (selectorType, selector, cb) {
                        cb(message, formElement);
                    };
                    browser._drain = function (err) {
                        assert.notOk(formElement.elementByCss.called, 'should not call element method');
                        assert.equal(err, message, 'should receive raw error');
                        done();
                    };
                    browser.thenFill(form, {
                        'input[type=text]': 'foo'
                    });
                });
                it('for form selector method', function(done) {
                    formElement = {
                        elementByCss: function (selector, cb) {
                            // this should return the input element
                            cb(message);
                        }
                    };
                    // add a spy on element.elementByCss
                    browser._drain = function (err) {
                        assert.instanceOf(err, Error, 'An error is expected');
                        assert.equal(err.message, 'Unable to retrieve element "input[type=text]": ('+message+')', 'should receive verbose error');
                        done();
                    };
                    browser.thenFill(form, {
                        'input[type=text]': 'value'
                    });
                });
                it('when getTagname fails', function(done) {
                    formElement = {
                        // everything is fine
                        elementByCss: function (selector, cb) {
                            // this should return the input element
                            cb(null, inputElement);
                        }
                    };
                    inputElement = {
                        // error for getTagname
                        getTagName: function (cb) {
                            cb(message);
                        }
                    };

                    browser._drain = function (err) {
                        assert.instanceOf(err, Error, 'An error is expected');
                        assert.equal(err.message, 'Unable to retrieve element "elementSelector" tagname\'s: ('+message+')', 'should receive verbose error');
                        done();
                    };

                    browser.thenFill(form, {
                        'elementSelector': 'elementValue'
                    });
                });
                it('when input[type=*] and getAttribute fails', function(done) {
                    formElement = {
                        // everything is fine
                        elementByCss: function (selector, cb) {
                            // this should return the input element
                            cb(null, inputElement);
                        }
                    };
                    inputElement = {
                        // error for getTagname
                        getTagName: function (cb) {
                            cb(null, 'input');
                        },
                        getAttribute: function (name, cb) {
                            cb(message);
                        }
                    };

                    browser._drain = function (err) {
                        assert.instanceOf(err, Error, 'An error is expected');
                        assert.equal(err.message, 'Unable to retrieve element "elementSelector"\'s type: ('+message+')', 'should receive verbose error');
                        done();
                    };

                    browser.thenFill(form, {
                        'elementSelector': 'elementValue'
                    });
                });
            });
        }

        function testInputElementError() {
            describe('should forward error', function() {
                describe('for text input', function() {
                    testInput('text');
                });
                describe('for password input', function() {
                    testInput('password');
                });
                describe('for email input', function() {
                    testInput('email');
                });
                describe('for phone input', function() {
                    testInput('phone');
                });
                describe('for checkbox', function() {
                    testCheckbox();
                });
                describe('for radio', function() {
                    it('should be tested');
                });
                describe('for file', function() {
                    it('should be tested');
                });
                describe('for select (combobox)', function() {
                    it('should be tested');
                });
                describe('for textarea', function() {
                    it('should be tested');
                });

                function initBrowser() {
                    browser = new Browser();
                    formElement = {
                        elementByCss: function (selector, cb) {
                            // this should return the input element
                            cb(null, inputElement);
                        }
                    };
                    inputElement = {
                        getTagName: function (cb) {
                            cb(null, inputElement.tagname);
                        },
                        getAttribute: function (attrName, cb) {
                            return cb(null, inputElement['a'+attrName]);
                        },
                        clear: function (cb) {
                            cb(null);
                        },
                        type: function (chars, cb) {
                            cb(null);
                        }
                    };
                }
                function testInput(type) {
                    beforeEach(function () {
                        initBrowser();
                        inputElement.tagname = 'input';
                        inputElement.atype = type;
                    });

                    it('when no error', function(done) {
                        browser._drain = function (err) {
                            assert.notOk(err, 'should not be in error');
                            done();
                        };

                        browser.thenFill(form, {
                            'elementSelector': 'elementValue'
                        });
                    });
                    it('when clear fails', function (done) {
                        inputElement.clear = function (cb) {
                            cb(message);
                        };
                        browser._drain = function (err) {
                            assert.equal(err, message, 'should receive raw error');
                            done();
                        };

                        browser.thenFill(form, {
                            'elementSelector': 'elementValue'
                        });
                    });
                    it('when type fails', function (done) {
                        inputElement.type = function (chars, cb) {
                            cb(message);
                        };
                        browser._drain = function (err) {
                            assert.equal(err, message, 'should receive raw error');
                            done();
                        };

                        browser.thenFill(form, {
                            'elementSelector': 'elementValue'
                        });
                    });
                }
                function testCheckbox() {
                    var isSelected;
                    beforeEach(function () {
                        isSelected = false;
                        initBrowser();
                        inputElement.click = function (cb) {
                            inputElement.clickSpy();
                            cb(null);
                        };
                        inputElement.isSelected = function (cb) {
                            cb(null, isSelected);
                        };
                        inputElement.clickSpy = sinon.spy();
                        inputElement.tagname = 'input';
                        inputElement.atype = 'checkbox';
                    });

                    it('when already selected', function(done) {
                        isSelected = true;
                        browser._drain = function (err) {
                            assert.notOk(err, 'should not be in error');
                            assert.notOk(inputElement.clickSpy.called, 'should not call click');
                            done();
                        };

                        browser.thenFill(form, {
                            'elementSelector': true
                        });
                    });
                    it('when not selected and need toggle', function(done) {
                        isSelected = false;
                        browser._drain = function (err) {
                            assert.notOk(err, 'should not be in error');
                            assert.ok(inputElement.clickSpy.called, 'should not call click');
                            done();
                        };

                        browser.thenFill(form, {
                            'elementSelector': true
                        });
                    });
                    it('when already selected and need toggle', function(done) {
                        isSelected = true;
                        browser._drain = function (err) {
                            assert.notOk(err, 'should not be in error');
                            assert.ok(inputElement.clickSpy.called, 'should not call click');
                            done();
                        };

                        browser.thenFill(form, {
                            'elementSelector': false
                        });
                    });
                    it('when not selected and no toggle', function(done) {
                        isSelected = false;
                        browser._drain = function (err) {
                            assert.notOk(err, 'should not be in error');
                            assert.notOk(inputElement.clickSpy.called, 'should not call click');
                            done();
                        };

                        browser.thenFill(form, {
                            'elementSelector': false
                        });
                    });
                }
            });
        }
    });
});
