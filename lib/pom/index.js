"use strict";
/**
 * Page of browser.
 *
 * @class
 * @name Page
 * @arg {string} name - Name of page.
 * @arg {string} pageUrl - URL of page.
 * @arg {object} elements - Element names and selectors dictionary.
 */

var _ = require("lodash");

var Element = require("./element");

var Page = function (name, pageUrl, elements) {

    this.name = name;
    this.url = pageUrl;

    this._webdriver = null;

    this.addElements(elements || {});
};
/**
 * Sets webdriver for page.
 *
 * @method
 * @arg {object} webdriver - Webdriver instance.
 */
Page.prototype.setDriver = function (webdriver) {
    this._webdriver = webdriver;
};
/**
 * Gets webdriver.
 *
 * @method
 * @return {object} - Webdriver instance.
 * @throws {AssertionError} - If webdriver isn't set yet.
 */
Page.prototype.getDriver = function () {
    expect(this._webdriver,
        "Webdriver isn't set")
        .to.exist;
    return this._webdriver;
};
/**
 * Adds elements to page.
 *
 * @method
 * @arg {object} elements - Element names and selectors dictionary.
 */
Page.prototype.addElements = function (elements) {
    for (var name in elements) {
        var selector = elements[name];
        this._addElement(name, selector);
    };
};
/**
 * Adds element.
 *
 * @protected
 * @method
 * @arg {string} name - Element name.
 * @arg {string} selector - Element selector.
 */
Page.prototype._addElement = function (name, selector) {

    if (_.isFunction(selector)) {
        this._addElement(name, selector());
    } else if (_.isArray(selector)) {

        if (selector.length < 1) {
            throw new Error("selectors array should have at least 1 item");
        };

        for (var i = 0; i < selector.length; i++) {
            var n = name + "_" + (i + 1);
            var s = selector[i];
            this._addElement(n, s);
        };

    } else if (_.isString(selector)) {
        if (this[name]) {
            throw new Error(
                `Page '${this.name}' already contains property '${name}'`);
        };
        this[name] = new Element(name, selector, this);
    } else {
        throw new Error("selector should be string or array or function " +
                        `but not ${typeof selector}`);
    };
};
/**
 * Removes elements from page.
 *
 * @method
 * @arg {...string} elementNames - Sequence of element names.
 */
Page.prototype.removeElements = function () {
    for (var name of arguments) delete this[name];
};

module.exports = Page;
