"use strict";
/**
 * Steps to manage web application.
 * 
 * @mixin WebSteps
 * @mixes BrowserSteps
 * @mixes PageSteps
 * @prop {object} webdriver - Webdriver instance.
 * @prop {string} webUrl - Web application URL.
 */

var _ = require("lodash");

require("../fixtures");

var WebSteps = {};
_.extend(WebSteps,
         require("./browser"),
         require("./page"));

module.exports = WebSteps;
