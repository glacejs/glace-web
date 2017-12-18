"use strict";
/**
 * Creates a new instance of `Element`.
 *
 * `Element` binds DOM control in browser context with virtual control in test.
 *
 * @class
 * @name Element
 * @arg {string} name - Control name.
 * @arg {object} selector - CSS selector of DOM element.
 * @arg {Page} page - Page with element.
 */

var weak = require("weak");
var U = require("glace-utils");

var PointerEvents = require("./event");

var Element = function (name, selector, page) {

    this.name = name;
    this.selector = selector;
    this._event = new PointerEvents(selector, page);

    this._page = weak(page);
    this._elCmd = `document.querySelector("${this.selector}")`;
    this._webdriver = null;
};
/**
 * Helper to get webdriver.
 *
 * @method
 * @return {object} webdriver instance
 */
Element.prototype._getDriver = function () {
    if (!this._webdriver) {
        this._webdriver = this._page.getDriver();
    };
    return this._webdriver;
};
/**
 * Gets webdriver element.
 *
 * @method
 * @return {object} Webdriver element.
 */
Element.prototype.getElement = function () {
    return this._getDriver().element(this.selector);
};
/**
 * Gets text content of DOM element.
 *
 * @async
 * @method
 * @return {Promise<string>} text value or null
 */
Element.prototype.getText = function () {
    return this._getDriver().getText(this.selector).then(value => {
        if (value) return value.trim();
        return this._getDriver().getAttribute(this.selector, "value");
    }).then(value => {
        if (value) return value.trim();
        return this._getDriver().getAttribute(this.selector, "innerHTML");
    }).then(value => {
        if (value) return value.trim();
        return null;
    });
};
/**
 * Sets text to DOM element.
 *
 * @async
 * @method
 * @arg {string} text - Text value to assign.
 * @return {Promise<void>}
 */
Element.prototype.setText = function (text) {
    return this._getDriver().setValue(this.selector, text);
};
/**
 * Gets DOM control location with attributes:
 *  `x`, `y`, `midX`, `midY`, `width`, `height`.
 *
 * @async
 * @method
 * @return {Promise<object>} Location of control.
 */
Element.prototype.location = function () {

    var cmd = ` \
        var ctrl = ${this._elCmd}; \
        var rect = ctrl.getBoundingClientRect(); \
        var location = {}; \
        location.x = Math.ceil(rect.left); \
        location.y = Math.ceil(rect.top); \
        location.width = Math.ceil(rect.width); \
        location.height = Math.ceil(rect.height); \
        location.midX = Math.ceil(location.x + location.width / 2); \
        location.midY = Math.ceil(location.y + location.height / 2); \
        return location;`;

    return this._getDriver().execute(cmd).then(result => result.value);
};
/**
 * Scrolls control into browser viewport.
 *
 * @async
 * @method
 * @return {Promise<void>}
 */
Element.prototype.scrollIntoView = function () {
    var cmd = "return " + this._elCmd + ".scrollIntoView();";
    return this._getDriver().execute(cmd);
};
/**
 * Clicks control in browser.
 *
 * @async
 * @method
 * @return {Promise<void>}
 */
Element.prototype.click = function () {
    return this.waitForVisible().then(() => {
        return this.scrollIntoView();
    }).then(() => {
        return this._getDriver().click(this.selector);
    });
};
/**
 * Clicks element in browser via pointer events.
 *
 * @async
 * @method
 * @return {Promise<void>}
 */
Element.prototype.pClick = function () {
    var x, y;
    return this.waitForVisible().then(() => {
        return this.location();
    }).then(loc => {
        x = loc.midX;
        y = loc.midY;
        return this._event.move(x, y);
    }).then(() => {
        return this._event.down(x, y);
    }).then(() => {
        return this._event.up(x, y);
    });
};
/**
 * Taps control in browser.
 *
 * @async
 * @method
 */
Element.prototype.tap = Element.prototype.click;
/**
 * Defines whether control is selected or no.
 *
 * @async
 * @method
 * @return {Promise<boolean>} `true` if control is selected, `false` otherwise.
 */
Element.prototype.isSelected = function () {
    return this._getDriver().isSelected(this.selector).then(result => {
        if (result) return true;

        return this._getDriver().getAttribute(this.selector, "class").then(result => {
            return result.includes("selected");
        });
    });
};
/**
 * Defines whether control is exist or no.
 *
 * @async
 * @method
 * @return {Promise<boolean>} `true` if control is exist, `false` otherwise.
 */
Element.prototype.isExist = function () {
    var cmd = "return !!" + this._elCmd + ";";
    return this._getDriver().execute(cmd).then(result => result.value);
};
/**
 * Waits for control is exist.
 *
 * @async
 * @method
 * @arg {number} [timeout] - Timeout to wait, ms.
 * @return {Promise<void>}
 * @throws {TimeoutError} If control doesn't exist after timeout.
 */
Element.prototype.waitForExist = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeouts.uiAction);
    var errMsg = this.name + " isn't exist after " + timeout + " ms";

    return this._getDriver().waitUntil(async () => {
        return await this.isExist();
    }, timeout, errMsg);
};
/**
 * Waits for control isn't exist.
 *
 * @async
 * @method
 * @arg {number} [timeout] - Timeout to wait, ms.
 * @return {Promise<void>}
 * @throws {TimeoutError} If control is still exist after timeout.
 */
Element.prototype.waitForNonExist = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeouts.uiAction);
    var errMsg = `${this.name} (${this.selector}) still exists after ${timeout} ms`;

    return this._getDriver().waitUntil(async () => {
        return !(await this.isExist());
    }, timeout, errMsg);
};
/**
 * Defines whether control is visible or no.
 *
 * @method
 * @return {Promise<boolean>} `true` if control is visible, `false` otherwise.
 */
Element.prototype.isVisible = function () {
    return this.isExist().then(result => {
        if (!result) return false;
        return this._getDriver().isVisible(this.selector);
    });
};
/**
 * Waits for control is visible.
 *
 * @async
 * @method
 * @arg {number} [timeout] - Timeout to wait, ms.
 * @return {Promise<void>}
 * @throws {TimeoutError} If control isn't visible after timeout.
 */
Element.prototype.waitForVisible = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeouts.uiAction);
    var errMsg = `${this.name} (${this.selector}) isn't visible ` +
                 `after ${timeout} ms`;

    return this._getDriver().waitUntil(async () => {
        return await this.isVisible();
    }, timeout, errMsg);
};
/**
 * Waits for control is invisible.
 *
 * @async
 * @method
 * @arg {number} [timeout] - timeout to wait, ms
 * @return {Promise<void>}
 * @throws {TimeoutError} If control is still visible after timeout.
 */
Element.prototype.waitForInvisible = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeouts.uiAction);
    var errMsg = this.name + " is still visible after " + timeout + " ms";

    return this._getDriver().waitUntil(async () => {
        return !(await this.isVisible());
    }, timeout, errMsg);
};

module.exports = Element;
