"use strict";
/**
 * Creates a new instance of `Element`.
 *
 * `Element` binds DOM element in browser context with virtual element in test.
 *
 * @class
 * @name Element
 * @arg {string} name - Element name.
 * @arg {object} selector - CSS selector of DOM element.
 * @arg {Page} page - Page with element.
 */

const _ = require("lodash");
var weak = require("weak");
var U = require("glace-utils");

var CONF = require("../config");
var PointerEvents = require("./event");
const utils = require("../utils");

var Element = function (name, selector, page) {

    this.name = name;
    this.selector = selector;
    this._event = new PointerEvents(selector, page);

    this._page = weak(page);
    this._elCmd = utils.getElementCommand(selector);
    this._elsCmd = utils.getElementsCommand(selector);
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
 * @async
 * @method
 * @return {Promise<object>} Webdriver element.
 */
Element.prototype.getElement = function () {
    return this._getDriver().element(this.selector);
};
/**
 * Gets webdriver elements.
 *
 * @async
 * @method
 * @return {Promise<array<object>>} Webdriver elements.
 */
Element.prototype.getElements = function () {
    return this._getDriver().elements(this.selector);
};
/**
 * Gets count of elements in browser.
 *
 * @async
 * @method
 * @return {Promise<integer>} Count of elements
 */
Element.prototype.getCount = async function () {
    const cmd = `return ${this._elsCmd}.length`;
    return this._getDriver().execute(cmd).then(result => result.value);
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
    if (!_.isEmpty(value)) return utils.clearElementText(value);

    value = await this._getDriver().getAttribute(this.selector, "value");
    if (!_.isEmpty(value)) return utils.clearElementText(value);

    value = await this._getDriver().getAttribute(this.selector, "innerHTML");
    if (!_.isEmpty(value)) return utils.clearElementText(value);

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
 * @arg {boolean} [opts.enter=false] - Send `Enter` after text.
 * @return {Promise}
 */
Element.prototype.setText = async function (text, opts) {

    opts = U.defVal(opts, {});
    var now = U.defVal(opts.now, false);
    var scroll = U.defVal(opts.scroll, true);
    const enter = U.defVal(opts.enter, false);

    if (scroll) {
        await this.scrollIntoView(opts);
    } else if (!now) {
        await this.waitForVisible(opts.timeout);
    };
    if (enter) text += "\n";

    await this._getDriver().setValue(this.selector, text);
};
/**
 * Gets DOM element location with attributes:
 *  `x`, `y`, `midX`, `midY`, `width`, `height`.
 *
 * @async
 * @method
 * @return {Promise<object>} Location of element.
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
 * Scrolls element into browser viewport.
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
 * Clicks element in browser.
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
 * Taps element in browser.
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
 * Defines whether element is selected or no.
 *
 * @async
 * @method
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.now=false] - Make it immediately.
 * @arg {?number} [opts.timeout] - Time to wait for element visibility, sec.
 * @return {Promise<boolean>} `true` if element is selected, `false` otherwise.
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
 * Defines whether element is exist or no.
 *
 * @async
 * @method
 * @return {Promise<boolean>} `true` if element is exist, `false` otherwise.
 */
Element.prototype.isExist = function () {
    var cmd = "return !!" + this._elCmd + ";";
    return this._getDriver().execute(cmd).then(result => result.value);
};
/**
 * Waits for element is exist.
 *
 * @async
 * @method
 * @arg {number} [timeout] - Timeout to wait, sec.
 * @return {Promise}
 * @throws {TimeoutError} If element doesn't exist after timeout.
 */
Element.prototype.waitForExist = function (timeout) {
    timeout = U.defVal(timeout, CONF.web.uiTimeout) * 1000;
    var errMsg = `${this.name} (${this.selector}) doesn't exist after ${timeout}s`;

    return this._getDriver().waitUntil(async () => {
        return await this.isExist();
    }, timeout, errMsg);
};
/**
 * Waits for element isn't exist.
 *
 * @async
 * @method
 * @arg {number} [timeout] - Timeout to wait, sec.
 * @return {Promise}
 * @throws {TimeoutError} If element is still exist after timeout.
 */
Element.prototype.waitForNonExist = function (timeout) {
    timeout = U.defVal(timeout, CONF.web.uiTimeout) * 1000;
    var errMsg = `${this.name} (${this.selector}) still exists after ${timeout}s`;

    return this._getDriver().waitUntil(async () => {
        return !(await this.isExist());
    }, timeout, errMsg);
};
/**
 * Defines whether element is visible or no.
 *
 * @method
 * @return {Promise<boolean>} `true` if element is visible, `false` otherwise.
 */
Element.prototype.isVisible = function () {
    return this.isExist().then(result => {
        if (!result) return false;
        return this._getDriver().isVisible(this.selector);
    });
};
/**
 * Waits for element is visible.
 *
 * @async
 * @method
 * @arg {number} [timeout] - Timeout to wait, sec.
 * @return {Promise}
 * @throws {TimeoutError} If element isn't visible after timeout.
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
 * Waits for element is invisible.
 *
 * @async
 * @method
 * @arg {number} [timeout] - Timeout to wait, sec.
 * @return {Promise}
 * @throws {TimeoutError} If element is still visible after timeout.
 */
Element.prototype.waitForInvisible = function (timeout) {
    timeout = U.defVal(timeout, CONF.web.uiTimeout) * 1000;
    var errMsg = `${this.name} (${this.selector}) is still visible after ${timeout}s`;

    return this._getDriver().waitUntil(async () => {
        return !(await this.isVisible());
    }, timeout, errMsg);
};
/**
 * Clones element with custom properties.
 *
 * @async
 * @method
 * @arg {object} [opts] - Clone options.
 * @arg {string} [opts.name] - Element name.
 * @arg {object} [opts.selector] - CSS selector of DOM element.
 * @arg {Page} [opts.page] - Page with element.
 * @return {Element} Cloned element.
 */
Element.prototype.clone = function (opts = {}) {
    const name = U.defVal(opts.name, this.name);
    const selector = U.defVal(opts.selector, this.selector);
    const page = U.defVal(opts.page, weak.get(this._page));
    return new this.constructor(name, selector, page);
};

module.exports = Element;
