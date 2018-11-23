"use strict";

const U = require("glace-utils");

const CONF = require("../config");

const beforeCb = ctx => async () => {
    if (CONF.webdriver.host) return;
    await $.installSeleniumDrivers();
    ctx.isStarted = await $.startSeleniumServer();
};

const afterCb = ctx => async () => {
    if (!ctx.isStarted) return;
    await $.stopSeleniumServer();
};

/**
 * Fixture to launch selenium server.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
module.exports = U.makeFixture({ before: beforeCb, after: afterCb });
