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
        if (CONF.web.installDrivers) {
            CONF.web.installDrivers = false;
            await SS.installSeleniumDrivers();
        };
        isStarted = await SS.startSeleniumServer();
    });

    func();

    after(async () => {
        if (!isStarted) return;
        await SS.stopSeleniumServer();
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
        isStarted = await SS.launchBrowser();
    });

    func();

    after(async () => {
        if (!isStarted) return;
        await SS.closeBrowser();
    });
};
/**
 * Fixture to set webdriver.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fxWebdriver = func => {
    before(() => SS.activateWeb());
    func();
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
