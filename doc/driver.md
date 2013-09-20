Driver
======

`Selenium-grid` has special needs and therefore a driver is required.
[Wd](https://github.com/admc/wd) being the most active webdriver library in
node.js, we decided to rely on it for low level driver.

Provided driver is promised style, so it is possible to enqueue actions and to
execute commands.

Commands
--------

Commands are run immediately against the current browser. It requires the grid
to be initialized. Usualy you want to use this in a `then` statement.

> If an error happens, an error is thrown.

### Information

<table>
<tr><th> method </th><th> callback </th><th> description </th></tr>
<tr><td> `status(cb)` </td><td> cb(statusCode) </td><td> read current request status. Map the [JSONWireProtocol status](https://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/status) </td></tr>
</table>

### Session

`session`, `altSessionCapabilities`, `sessionCapabilities`,
`setPageLoadTimeout`, `setAsyncScriptTimeout`, `setImplicitWaitTimeout` wraps
the native WD methods.

### Script evaluation

<table>
<tr><th> method </th><th> callback </th><th> description </th></tr>
<tr><td> `execute(script[, args], cb)` </td><td> cb(result) </td><td> execute method and return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) </td></tr>
<tr><td> `safeExecute(script[, args], cb)` </td><td> cb(result) </td><td> execute method and always return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) </td></tr>
<tr><td> `eval(script, cb)` </td><td> cb(result) </td><td> execute script and return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) </td></tr>
<tr><td> `safeEval(script, cb)` </td><td> cb(result) </td><td> execute script and always return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) </td></tr>
<tr><td> `executeAsync(script, cb)` </td><td> cb(result) </td><td> execute script and return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) </td></tr>
<tr><td> `safeExecuteAsync(script, cb)`| cb(result) </td><td> execute script and always return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) </td></tr> </table>
### Window manipulation

<table>
<tr><th> method </th><th> callback </th><th> description </th></tr>
<tr><td> `frame(frameRef, cb)` </td><td> cb() </td><td> Set focus to another frame Map the [JSONWireProtocol frame](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/frame) </td></tr>
<tr><td> `window(name, cb)` </td><td> cb() </td><td> Set focus to another window. Map the [JSONWireProtocol window](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window) </td></tr>
<tr><td> `windowHandle(cb)` </td><td> cb(handle) </td><td> Retrieve the current window handle.  </td></tr>
<tr><td> `windowHandles(cb)` </td><td> cb(arrayOfHandles) </td><td> Retrieve the list of all window handles available to the session.  </td></tr>
<tr><td> `windowSize([handle, ]width, height, cb)` </td><td> cb() </td><td> Map the [JSONWireProtocol size](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/size) </td></tr>
<tr><td> `setWindowSize([handle,] cb)` </td><td> cb() </td><td> Map the [JSONWireProtocol size ](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/size) </td></tr>
<tr><td> `getWindowSize([handle,] cb)` </td><td> cb(size) </td><td> Map the [JSONWireProtocol size](http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/window/:windowHandle/size) </td></tr>
<tr><td> `setWindowPosition(x, y, [handle,] cb)` </td><td> cb() </td><td> Map the [JSONWireProtocol position](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/position) </td></tr>
<tr><td> `getWindowPosition([handle,] cb)` </td><td> cb(position) </td><td> Map the [JSONWireProtocol position](http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/window/:windowHandle/position) </td></tr>
<tr><td> `maximize([handle,] cb)` </td><td> cb() </td><td> Maximize specified window. Map the [JSONWireProtocol maximize](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/maximize) </td></tr>
<tr><td> `forward(cb)` </td><td> cb() </td><td> </td></tr>
<tr><td> `back(cb)` </td><td> cb() </td><td> </td></tr>
<tr><td> `refresh(cb)` </td><td> cb() </td><td> </td></tr>
<tr><td> `close(cb)` </td><td> cb() </td><td> close session </td></tr>
<tr><td> `moveTo(element[, offsetx, offsety], cb` </td><td> cb() </td><td> Move the mouse by an offset of the specificed element. Map the [JSONWireProtocol moveto](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/moveto) </td></tr>
</table>

### To be documented

For now, please refer to the wd mapping documentation.

'allCookies', 'setCookie', 'deleteAllCookies', 'deleteCookie',
'source',
'url',
'title',
'active',
'keys',
'getOrientation',
'alertText',
'alertKeys',
'acceptAlert', 'dismissAlert',
'buttonDown', 'buttonUp',
'flick',
'setLocalStorageKey', 'clearLocalStorage', 'getLocalStorageKey', 'removeLocalStorageKey',
'newWindow', 'windowName',
'getPageIndex',
'uploadFile',
'takeScreenshot',
'waitForCondition', 'waitForConditionInBrowser'

'clickHere', 'doubleClickHere', 'buttonUpHere', 'buttonDownHere'

Deferred commands
-----------------

Commands are also accessible as deferred methods, this means you can enqueue
scenario steps by prefixing the command with `then`.

If you don't provide any callback argument, scenario will continue as soon as
the commands is over, otherwise you have to call the `next` method to resume
scenario.

``` javascript
browser
    .get('http://google.com')
    .thenStatus(function (status, next) {
        if (200 === status) {
            this.log('Google is up');
        }
        // call next manualy
        next();
    })
    // next will be called automaticly
    .thenUploadFile('some/file')
    .thenLog('executed when upload is done.');
```

Scenarios API
-------------

### execute immediately

It is possible to interact with elements very simply using this methods:

<table>
<tr><th> method </th><th> callback </th><th> description </th></tr>
<tr><td> click(selector, [cb]) </td><td> cb() </td><td> click on element </td></tr>
<tr><td> doubleClick(selector, [cb]) </td><td> cb() </td><td> double click on element </td></tr>
<tr><td> sendKeys(selector, keys, [cb]) </td><td> cb() </td><td> Send a sequence of key strokes to element </td></tr>
<tr><td> submit(selector, [cb]) </td><td> cb() </td><td> submit form </td></tr>
<tr><td> clear(selector, [cb]) </td><td> cb() </td><td> clear input element </td></tr>
<tr><td> text(selector, keys, [cb]) </td><td> cb(text) </td><td> return element's text </td></tr>
<tr><td> isVisible(selector, [cb]) </td><td> cb(result) </td><td> is the element visible </td></tr>
<tr><td> isSelected(selector, [cb]) </td><td> cb(result) </td><td> is the element selected </td></tr>
<tr><td> isEnabled(selector, [cb]) </td><td> cb(result) </td><td> is the element enabled </td></tr>
<tr><td> isDisplayed(selector, [cb]) </td><td> cb(result) </td><td> is the element displayed </td></tr>
<tr><td> getAttribute(selector, attrName, [cb]) </td><td> cb(value) </td><td> retrieve an attribute for element </td></tr>
<tr><td> getLocation(selector, [cb]) </td><td> cb(location) </td><td> return location for element </td></tr>
<tr><td> getSize(selector, [cb]) </td><td> cb(size) </td><td> read element's size </td></tr>
<tr><td> getComputedCss(selector, [cb]) </td><td> cb(css) </td><td> returns css for element </td></tr>
<tr><td> waitForElement(selector, timeout, [cb]) </td><td> cb() </td><td> wait for an element to be in page </td></tr>
<tr><td> waitForVisible(selector, timeout, [cb]) </td><td> cb() </td><td> wait for an element to be visible </td></tr>
<tr><td> fill(selector, values[, validate] [, cb]) </td><td> cb() </td><td> fill the form with values </td></tr>
</table>

Example of form filling:

``` javascript

browser
    .fill('form', {
        'input[type=text]': 'some text',
        'textarea': 'some long text',
        'input[type=file]': '/home/themouette/some/file.txt',
        'input[type=radio]': 'Mr'
    });

// or, using fluid interface

browser.thenFill('selector', {'.name': 'selenium'});

```

### Scenario as deferred

You can chain commands using the deferred api, using following methods:

`thenClick`
`thenDoubleClick`
`thenText`
`thenSendKeys`
`thenPressKeys`
`thenSubmit`
`thenClear`
`thenIsVisible`
`thenIsSelected`
`thenIsEnabled`
`thenIsDisplayed`
`thenGetAttribute`
`thenGetLocation`
`thenGetSize`
`thenGetComputedCss`

`thenWaitForElement(selector, timeout, [cb])`
`thenWaitForVisible(selector, timeout, [cb])`

`thenFill(selector, values[, validate] [, cb])`

Omitting the callback will call next step directly, but if you provide one, you
**MUST** call the `next` method, provided as the last argument, whatever
happens.

``` javascript
browser
    .get('http://google.com')
    // will call next automaticly
    .thenClick('[name=q]')
    // will defer for 1 second
    .thenClick('[name=q]', function (next) {
        setTimeout(next, 1000);
    })
    // will block execution
    .thenClick('[name=q]', function (next) {})
```

### Note on selectors

A selector can either be a css selector or an xpath selector using the
`require('selenium-grid').xpath` method:

``` javascript
var x = require('selenium-grid').xpath;

browser
    .get('http://google.com')
    .thenClick(x('//input'))
    .thenGetSize(x('//input'), function (size, next) {
        next();
    });
```

Error Handling
--------------

Any error or exception occuring in the process quit the browser and is forwarded
to the reporter.
