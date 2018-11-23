"use strict";

const U = require("glace-utils");

const beforeCb = ctx => async () => {
    ctx.isStarted = await $.launchBrowser();
};

const afterCb = ctx => async () => {
    if (!ctx.isStarted) return;
    await $.closeBrowser();
};

/**
 * Fixture to launch browser.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
module.exports = U.makeFixture({ before: beforeCb, after: afterCb });
