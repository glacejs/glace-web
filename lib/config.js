"use strict";
/**
 * Configures `GlaceJS` before tests run.
 *
 * @namespace GlaceConfig
 * @prop {object} web - Web options.
 * @prop {boolean} [web.use=false] - Flag to use web.
 * @prop {string} [web.url] - URL of web application.
 * @prop {boolean} [web.updateDrivers=true] - Flag to update selenium drivers
 *  before start.
 * @prop {string} [web.platform=pc] - Platform type.
 * @prop {string} [web.browser] - Browser name.
 * @prop {object} webdriver - Webdriver options.
 */

var expect = require("chai").expect;
var logfmt = require("logfmt");
var U = require("glace-utils");

var config = U.config;
var args = config.args;

config.webdriver = U.defVal(config.webdriver, {});

config.web = U.defVal(config.web, {});
config.web.uiTimeout = 5;
config.web.pageTimeout = 60;
config.web.use = U.defVal(!!args.web, false);
config.web.url = U.defVal(args.webUrl);
config.web.updateDrivers = U.defVal(args.updateWebDrivers, false);
config.web.platform = U.defVal(args.platform, "pc");
[ config.web.width, config.web.height ] = U.defVal(args.webResolution, "").split("x");
config.web.width = config.web.width && parseInt(config.web.width);
config.web.height = config.web.height && parseInt(config.web.height);

config.web.seleniumOpts = {
    drivers: {
        chrome: {
            version: "2.39"
        }
    }
};

config.chrome = U.defVal(config.chrome, {});
config.chrome.incognito = U.defVal(args.chromeIncognito, false);
config.chrome.headless = U.defVal(args.chromeHeadless, false);

if (args.chromeOptions) {
    config.chrome.options = logfmt.parse(args.chromeOptions.replace(/'/g, "\""));
}

expect(["pc", "android", "ios"],
    "Invalid `--platform` value").include(config.web.platform);
config.web.browser = U.defVal(args.browser);

var desired = config.webdriver.desiredCapabilities = {};

if (args.seleniumAddress) {
    var [ host, port ] = args.seleniumAddress.split(":");
    if (host) config.webdriver.host = host;
    if (port) config.webdriver.port = port;
};

if (config.web.platform === "pc") {
    config.web.isDesktop = true;
    desired.browserName = U.defVal(args.browser, "chrome").toLowerCase();
    if (desired.browserName === "chrome") {
        desired.chromeOptions = {
            args: [ "test-type",
                "start-maximized",
                "disable-infobars",
                "enable-precise-memory-info" ],
            prefs: {
                "credentials_enable_service": false,
                "profile": {
                    "password_manager_enabled": false,
                },
            },
            excludeSwitches: [
                "enable-automation",
            ],
            useAutomationExtension: false,
        };

        if (config.chrome.incognito) {
            desired.chromeOptions.args.push("incognito");
        };

        if (config.chrome.headless) {
            desired.chromeOptions.args.push("headless");
        }

        if (config.chrome.options) {
            for (var [k, v] of Object.entries(config.chrome.options)) {
                if (v === true) {
                    desired.chromeOptions.args.push(k);
                } else {
                    desired.chromeOptions.args.push(k + "=" + v);
                }
            }
        }
    };
} else {
    config.web.isMobile = true;
    desired.deviceName = args.device;
    desired.platformVersion = String(args.osVersion);
    if (args.udid) {
        desired.udid = args.udid;
    };
    if (config.web.platform === "android") {
        config.web.isAndroid = true;
        desired.browserName = U.defVal(args.browser, "chrome").toLowerCase();
        desired.platformName = "Android";
    };
    if (config.web.platform === "ios") {
        config.web.isIos = true;
        desired.browserName = U.defVal(args.browser, "safari").toLowerCase();
        desired.platformName = "iOS";
        desired.automationName = args.iosEngine || "XCUITest";
    };
};

module.exports = config;
