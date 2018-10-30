"use strict";
/**
 * `Web` fixtures.
 *
 * @module
 */

var U = require("glace-utils");

var CONF = require("./config");
/**
 * Fixture to launch selenium server.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fxSelenium = func => {
    var isStarted;

    before(async () => {
        if (CONF.webdriver.host) return;
        await $.installSeleniumDrivers();
        isStarted = await $.startSeleniumServer();
    });

    func();

    after(async () => {
        if (!isStarted) return;
        await $.stopSeleniumServer();
    });
};
/**
 * Fixture to launch browser.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fxBrowser = func => {
    var isStarted;

    before(async () => {
        isStarted = await $.launchBrowser();
    });

    func();

    after(async () => {
        if (!isStarted) return;
        await $.closeBrowser();
    });
};
/**
 * Fixture to kill webdriver processes.
 *
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fxKillWebdriver = func => {

    var webdrivers = [
        "chromedriver",
    ];

    before(async () => {
        for (var procName of webdrivers) await U.killProcs(procName);
    });

    func();
};
