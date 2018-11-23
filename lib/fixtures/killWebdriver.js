"use strict";

const U = require("glace-utils");

const webdrivers = [
    "chromedriver",
];

const beforeCb = () => async () => {
    for (const procName of webdrivers) {
        await U.killProcs(procName);
    }
};

/**
 * Fixture to kill webdriver processes.
 *
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
module.exports = U.makeFixture({ before: beforeCb });
