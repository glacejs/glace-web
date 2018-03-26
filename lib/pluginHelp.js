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
            "selenium-address <host:port>": {
                describe: d("Connect to launched selenium server with this address."),
                type: "string",
                group: "Selenium:",
            },
            "platform [type]": {
                describe: d("Specify platform type where tests will be executed.",
                    "Default is 'pc'."),
                type: "string",
                choices: [ "pc", "android", "ios" ],
                group: "Selenium:",
            },
            "browser [name]": {
                describe: d("Name of browser where web tests will be",
                    "executed. Default value is platform specific."),
                type: "string",
                group: "Selenium:",
            },
            /* appium */
            "device <name>": {
                describe: d("Mobile device name."),
                type: "string",
                group: "Appium:",
            },
            "os-version <value>": {
                describe: d("Mobile operating system version."),
                type: "string",
                group: "Appium:",
            },
            "ios-engine <name>": {
                describe: d("iOS automation engine name."),
                type: "string",
                group: "Appium:",
            },
            "udid <value>": {
                describe: d("Mobile device UDID."),
                type: "string",
                group: "Appium:",
            },
            /* chrome */
            "chrome-incognito": {
                describe: d("Launch chrome in incognito mode."),
                type: "boolean",
                group: "Chrome:",
            },
            "chrome-headless": {
                describe: d("Launch chrome in headless mode."),
                type: "boolean",
                group: "Chrome:",
            },
        });
};
