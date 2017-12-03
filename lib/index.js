"use strict";
/**
 * `GlaceJS Web` plugin.
 *
 * @module
 */

var config, Page, pluginHelp, Steps;

Object.defineProperties(exports, {
    /**
     * @type {GlaceConfig}
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
     * @type {pluginHelp}
     */
    pluginHelp: {
        get: function () {
            pluginHelp = pluginHelp || require("./pluginHelp");
            return pluginHelp;
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
