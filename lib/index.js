"use strict";
/**
 * `GlaceJS Web` package.
 *
 * @module
 */

var config, Page, Steps;

Object.defineProperties(exports, {
    /**
     * `Web` config.
     */
    config: {
        get: function () {
            config = config || require("./config");
            return config;
        },
    },
    /**
     * @type {Page}
     */
    Page: {
        get: function () {
            Page = Page || require("./pom");
            return Page;
        },
    },
    /**
     * @type {WebSteps}
     */
    Steps: {
        get: function () {
            Steps = Steps || require("./steps");
            return Steps;
        },
    },
});
