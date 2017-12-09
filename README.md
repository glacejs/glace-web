## GlaceJS Web plugin

Provides steps for [GlaceJS](https://glacejs.github.io/glace-core/) framework to launch web UI tests in browser.

## Features

- Launch standalone selenium server
- Connect to existing selenium or appium server
- Page Object Model with weak refs
- Browser Pointer Events

## Requirements:

- Installed `java` in order to launch `selenium` server.

## How to install

```
npm i glace-web
```

## How to use

```javascript
var glaceWeb = require("glace-web");
glaceWeb.Steps;
glaceWeb.config;
```

If plugin is used as a part of `GlaceJS` it will be loaded automatically.

## CLI options

`Selenium`
- `--dont-install-drivers` - Flag to not install selenium drivers on tests run.
- `--web` - Flag to launch tests in browser. Browser will be launched on session start and closed on session finish.
- `--web-url` - Application URL which will be used for web tests.
- `--selenium-addr` - Connect to launched selenium server with this address.
- `--platform` - Specify platform type where tests will be executed. Default is `pc`. Supported values are `pc`, `android`, `ios`.
- `--browser` - Name of browser where web tests will be executed. Default value is platform specific.

`Appium`
- `--device` - Mobile device name.
- `--os-version` - Mobile operating system version.
- `--ios-engine` - iOS automation engine name.

## API

- [config](GlaceConfig.html)
- [fixtures](global.html)
- [steps](WebSteps.html)
