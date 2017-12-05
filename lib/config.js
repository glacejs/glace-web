"use strict";
/**
 * Configures `GlaceJS` before tests run.
 *
 * @namespace GlaceConfig
 * @prop {object} web - Web options.
 * @prop {boolean} [web.use=false] - Flag to use web.
 * @prop {string} [web.url] - URL of web application.
 * @prop {boolean} [web.installDrivers=true] - Flag to install selenium drivers
 *  before start.
 * @prop {string} [web.platform=pc] - Platform type.
 * @prop {string} [web.browser] - Browser name.
 * @prop {object} webdriver - Webdriver options.
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
config.web.use = U.defVal(!!args.web, false);
config.web.url = U.defVal(args.webUrl);
config.web.installDrivers = U.defVal(
    !args.dontInstallWebDrivers && !args.seleniumAddress, true);
config.web.platform = args.platform || "pc";

config.chrome = U.defVal(config.chrome, {});
config.chrome.incognito = U.defVal(args.chromeIncognito, false);

expect(["pc", "android", "ios"],
       "Invalid `--platform` value").include(config.web.platform);
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

        if (config.chrome.incognito) {
            desired.chromeOptions.args.push("incognito");
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

module.exports = config;
