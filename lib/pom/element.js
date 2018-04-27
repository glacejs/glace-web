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

var CONF = require("../config");
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
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.now=false] - Make it immediately.
 * @arg {?number} [opts.timeout] - Time to wait for element visibility, sec.
 * @return {Promise<string>} Text value or null.
 */
Element.prototype.getText = async function (opts) {

    opts = U.defVal(opts, {});
    var now = U.defVal(opts.now, false);

    if (!now) {
        await this.waitForVisible(opts.timeout);
    };

    var value = await this._getDriver().getText(this.selector);
    if (value) return value.trim();

    value = await this._getDriver().getAttribute(this.selector, "value");
    if (value) return value.trim();

    value = await this._getDriver().getAttribute(this.selector, "innerHTML");
    if (value) return value.trim();

    return null;
};
/**
 * Sets text to DOM element.
 *
 * @async
 * @method
 * @arg {string} text - Text value to assign.
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.now=false] - Make it immediately.
 * @arg {?number} [opts.timeout] - Time to wait for element visibility, sec.
 * @arg {boolean} [opts.scroll=true] - Scroll to element.
 * @return {Promise}
 */
Element.prototype.setText = async function (text, opts) {

    opts = U.defVal(opts, {});
    var now = U.defVal(opts.now, false);
    var scroll = U.defVal(opts.scroll, true);

    if (scroll) {
        await this.scrollIntoView(opts);
    } else if (!now) {
        await this.waitForVisible(opts.timeout);
    };
    await this._getDriver().setValue(this.selector, text);
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
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.now=false] - Make it immediately.
 * @arg {?number} [opts.timeout] - Time to wait for element visibility, sec.
 * @return {Promise}
 */
Element.prototype.scrollIntoView = async function (opts) {

    opts = U.defVal(opts, {});
    var now = U.defVal(opts.now, false);

    if (!now) {
        await this.waitForVisible(opts.timeout);
    };

    var cmd = "return " + this._elCmd + ".scrollIntoView();";
    await this._getDriver().execute(cmd);
};
/**
 * Clicks control in browser.
 *
 * @async
 * @method
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.now=false] - Make it immediately.
 * @arg {?number} [opts.timeout] - Time to wait for element visibility, sec.
 * @arg {boolean} [opts.scroll=true] - Scroll to element.
 * @return {Promise}
 */
Element.prototype.click = async function (opts) {

    opts = U.defVal(opts, {});
    var now = U.defVal(opts.now, false);
    var scroll = U.defVal(opts.scroll, true);

    if (scroll) {
        await this.scrollIntoView(opts);
    } else if (!now) {
        await this.waitForVisible(opts.timeout);
    };
    await this._getDriver().click(this.selector);
};
/**
 * Clicks element in browser via pointer events.
 *
 * @async
 * @method
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.now=false] - Make it immediately.
 * @arg {?number} [opts.timeout] - Time to wait for element visibility, sec.
 * @arg {boolean} [opts.scroll=true] - Scroll to element.
 * @return {Promise}
 */
Element.prototype.pClick = async function (opts) {

    opts = U.defVal(opts, {});
    var now = U.defVal(opts.now, false);
    var scroll = U.defVal(opts.scroll, true);

    if (scroll) {
        await this.scrollIntoView(opts);
    } else if (!now) {
        await this.waitForVisible(opts.timeout);
    };

    var loc = await this.location();
    await this._event.move(loc.midX, loc.midY);
    await this._event.down(loc.midX, loc.midY);
    await this._event.up(loc.midX, loc.midY);
};
/**
 * Taps control in browser.
 *
 * @async
 * @method
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.now=false] - Make it immediately.
 * @arg {?number} [opts.timeout] - Time to wait for element visibility, sec.
 * @arg {boolean} [opts.scroll=true] - Scroll to element.
 * @return {Promise}
 */
Element.prototype.tap = Element.prototype.click;
/**
 * Defines whether control is selected or no.
 *
 * @async
 * @method
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.now=false] - Make it immediately.
 * @arg {?number} [opts.timeout] - Time to wait for element visibility, sec.
 * @return {Promise<boolean>} `true` if control is selected, `false` otherwise.
 */
Element.prototype.isSelected = async function (opts) {

    opts = U.defVal(opts, {});
    var now = U.defVal(opts.now, false);

    if (!now) {
        await this.waitForVisible(opts.timeout);
    };

    var result = await this._getDriver().isSelected(this.selector);
    if (result) return true;

    result = await this._getDriver().getAttribute(this.selector, "class");
    return result.includes("selected");
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
 * @arg {number} [timeout] - Timeout to wait, sec.
 * @return {Promise}
 * @throws {TimeoutError} If control doesn't exist after timeout.
 */
Element.prototype.waitForExist = function (timeout) {
    timeout = U.defVal(timeout, CONF.web.uiTimeout) * 1000;
    var errMsg = `${this.name} (${this.selector}) doesn't exist after ${timeout}s`;

    return this._getDriver().waitUntil(async () => {
        return await this.isExist();
    }, timeout, errMsg);
};
/**
 * Waits for control isn't exist.
 *
 * @async
 * @method
 * @arg {number} [timeout] - Timeout to wait, sec.
 * @return {Promise}
 * @throws {TimeoutError} If control is still exist after timeout.
 */
Element.prototype.waitForNonExist = function (timeout) {
    timeout = U.defVal(timeout, CONF.web.uiTimeout) * 1000;
    var errMsg = `${this.name} (${this.selector}) still exists after ${timeout}s`;

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
 * @arg {number} [timeout] - Timeout to wait, sec.
 * @return {Promise}
 * @throws {TimeoutError} If control isn't visible after timeout.
 */
Element.prototype.waitForVisible = function (timeout) {
    timeout = U.defVal(timeout, CONF.web.uiTimeout) * 1000;
    var errMsg = `${this.name} (${this.selector}) isn't visible ` +
                 `after ${timeout}s`;

    return this._getDriver().waitUntil(async () => {
        return await this.isVisible();
    }, timeout, errMsg);
};
/**
 * Waits for control is invisible.
 *
 * @async
 * @method
 * @arg {number} [timeout] - Timeout to wait, sec.
 * @return {Promise}
 * @throws {TimeoutError} If control is still visible after timeout.
 */
Element.prototype.waitForInvisible = function (timeout) {
    timeout = U.defVal(timeout, CONF.web.uiTimeout) * 1000;
    var errMsg = `${this.name} (${this.selector}) is still visible after ${timeout}s`;

    return this._getDriver().waitUntil(async () => {
        return !(await this.isVisible());
    }, timeout, errMsg);
};

module.exports = Element;
