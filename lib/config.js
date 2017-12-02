"use strict";
/**
 * Configures `GlaceJS` before tests run.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");

var expect = require("chai").expect;
var fse = require("fs-extra");

var U = require("glace-utils");
var LOG = U.logger;

var config = U.config;
var args = config.args;

config.webdriver = U.defVal(config.webdriver, {});

config.web = U.defVal(config.web, {});
config.web.use = U.defVal(!!args.webUrl, false);
config.web.url = U.defVal(args.webUrl);
config.web.installDrivers = U.defVal(
    !args.dontInstallWebDrivers && !args.seleniumAddress, true);
config.web.platform = args.platform || "pc";
expect(["pc", "android", "ios"],
       "Invalid `--platform` value").include(config.platform);
config.web.browser = U.defVal(args.browser);

var desired = config.webdriver.desiredCapabilities = {};

if (args.seleniumAddress) {
    var [ host, port ] = args.seleniumAddress.split(':');
    if (host) config.webdriver.host = host;
    if (port) config.webdriver.port = port;
};

if (config.web.platform === "pc") {
    config.web.isDesktop = true;
    desired.browserName = args.browser || "chrome";
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
        };
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
        desired.browserName = args.browser || "chrome";
        desired.platformName = "Android";
    };
    if (config.web.platform === "ios") {
        config.web.isIos = true;
        desired.browserName = args.browser || "safari";
        desired.platformName = "iOS";
        desired.automationName = args.iosEngine || "XCUITest";
    };
};
