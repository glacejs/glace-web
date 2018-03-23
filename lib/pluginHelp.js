"use strict";
/**
 * `Web` plugin help.
 *
 * @function
 */
module.exports = (args, d) => {
    return args
        .options({
            /* selenium */
            "dont-install-web-drivers": {
                describe: d("Flag to not install selenium drivers on tests run."),
                type: "boolean",
                group: "Selenium:",
            },
            "web": {
                describe: d("Flag to launch tests in browser."),
                type: "boolean",
                group: "Selenium:",
            },
            "web-url <URL>": {
                describe: d("Web URL which will be used for web tests."),
                type: "string",
                group: "Selenium:",
            },
            "web-resolution <widthxheight>": {
                describe: d("Browser viewport size ('pc' platform only)."),
                type: "string",
                group: "Selenium:",
            },
            "selenium-addr": {
                describe: d("Connect to launched selenium server with this address."),
                type: "string",
                group: "Selenium:",
            },
            "platform": {
                describe: d("Specify platform type where tests will be executed.",
                    "Default is 'pc'."),
                type: "string",
                choices: [ "pc", "android", "ios" ],
                group: "Selenium:",
            },
            "browser": {
                describe: d("Name of browser where web tests will be",
                    "executed. Default value is platform specific."),
                type: "string",
                group: "Selenium:",
            },
            /* appium */
            "device": {
                describe: d("Mobile device name."),
                type: "string",
                group: "Appium:",
            },
            "os-version": {
                describe: d("Mobile operating system version."),
                type: "string",
                group: "Appium:",
            },
            "ios-engine": {
                describe: d("iOS automation engine name."),
                type: "string",
                group: "Appium:",
            },
            /* chrome */
            "chrome-incognito": {
                describe: d("Launch chrome in incognito mode."),
                type: "boolean",
                group: "Chrome:",
            },
        });
};
