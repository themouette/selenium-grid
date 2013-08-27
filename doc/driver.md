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

| method | callback | description |
|--|--|--|
| `status(cb)` | cb(statusCode) | read current request status. Map the [JSONWireProtocol status](https://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/status) |

### Session

`session`, `altSessionCapabilities`, `sessionCapabilities`,
`setPageLoadTimeout`, `setAsyncScriptTimeout`, `setImplicitWaitTimeout` wraps
the native WD methods.

### Script evaluation

| method | callback | description |
|--|--|--|
| `execute(script[, args], cb)` | cb(result) | execute method and return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) |
|`safeExecute(script[, args], cb)`| cb(result) | execute method and always return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) |
| `eval(script, cb)`            | cb(result) | execute script and return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) |
| `safeEval(script, cb)`        | cb(result) | execute script and always return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) |
| `executeAsync(script, cb)`    | cb(result) | execute script and return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) |
| `safeExecuteAsync(script, cb)`| cb(result) | execute script and always return results. Map the [JSONWireProtocol execute](https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/execute) |

### Window manipulation

| method | callback | description |
|--|--|--|
| `frame(frameRef, cb)` | cb() | Set focus to another frame Map the [JSONWireProtocol frame](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/frame) |
| `window(name, cb)` | cb() | Set focus to another window. Map the [JSONWireProtocol window](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window) |
| `windowHandle(cb)` | cb(handle) | Retrieve the current window handle. |
| `windowHandles(cb)` | cb(arrayOfHandles) | Retrieve the list of all window handles available to the session. |
| `windowSize([handle, ]width, height, cb)` | cb() | Map the [JSONWireProtocol size](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/size) |
| `setWindowSize([handle,] cb)` | cb() | Map the [JSONWireProtocol size ](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/size) |
| `getWindowSize([handle,] cb)` | cb(size) | Map the [JSONWireProtocol size](http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/window/:windowHandle/size) |
| `setWindowPosition(x, y, [handle,] cb)` | cb() | Map the [JSONWireProtocol position](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/position) |
| `getWindowPosition([handle,] cb)` | cb(position) | Map the [JSONWireProtocol position](http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/window/:windowHandle/position) |
| `maximize([handle,] cb)` | cb() | Maximize specified window. Map the [JSONWireProtocol maximize](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/maximize) |
| `forward(cb)` | cb() | |
| `back(cb)` | cb() | |
| `refresh(cb)` | cb() | |
| `close(cb)` | cb() | close session |
| `moveTo(element[, offsetx, offsety], cb` | cb() | Move the mouse by an offset of the specificed element. Map the [JSONWireProtocol moveto](http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/moveto) |

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


