"use strict";
/**
 * Steps to manage web application.
 * 
 * @mixin WebSteps
 * @mixes BrowserSteps
 * @mixes PageSteps
 */

var _ = require("lodash");

require("../fixtures");

var WebSteps = {};
_.extend(WebSteps,
         require("./browser"),
         require("./page"));

module.exports = WebSteps;
