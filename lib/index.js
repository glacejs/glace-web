"use strict";
/**
 * `GlaceJS Web` package.
 *
 * @module
 */

var config, Steps;

Object.defineProperties(exports, {
    /**
     * `Web` config.
     */
    config: {
        get: function() {
            config = config || require("./config");
            return config;
        },
    },
    /**
     * @type {ImageSteps}
     */
    Steps: {
        get: function() {
            Steps = Steps || require("./steps");
            return Steps;
        },
    },
});
