"use strict";
/**
 * Web steps.
 * 
 * @module
 */

var _ = require("lodash");
/**
 * @mixin
 */
var WebSteps = {};
_.extend(WebSteps,
         require("./browser"),
         require("./page"));

module.exports = WebSteps;
