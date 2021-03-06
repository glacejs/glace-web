"use strict";
/**
 * Creates a new pointer events instance.
 *
 * @class
 * @name PointerEvents
 * @classdesc Contains browser pointer events.
 * @arg {string} selector - CSS selector of DOM element.
 * @arg {Page} page - Page with element.
 */

var weak = require("weak");

const utils = require("../utils");

var PointerEvents = function (selector, page) {
    this._selector = selector;
    this._page = weak(page);
    this._elCmd = utils.getElementCommand(selector);
    this._webdriver = null;
};
/**
 * Helper to get webdriver.
 *
 * @method
 * @return {object} webdriver instance
 */
PointerEvents.prototype._getDriver = function () {
    if (!this._webdriver) {
        this._webdriver = this._page.getDriver();
    };
    return this._webdriver;
};
/**
 * Moves pointer over element by selector.
 *
 * @async
 * @method
 * @arg {number} x - `x` coordinate.
 * @arg {number} y - `y` coordinate.
 * @return {Promise<void>}
 */
PointerEvents.prototype.over = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent("pointerover", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window, isPrimary: true }); \
        el.dispatchEvent(ev);`;

    return this._getDriver().execute(cmd);
};
/**
 * Enters pointer to element by selector.
 *
 * @async
 * @method
 * @arg {number} x - `x` coordinate.
 * @arg {number} y - `y` coordinate.
 * @return {Promise<void>}
 */
PointerEvents.prototype.enter = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent("pointerenter", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window, isPrimary: true }); \
        el.dispatchEvent(ev);`;

    return this._getDriver().execute(cmd);
};
/**
 * Presses pointer down on element by selector.
 *
 * @async
 * @method
 * @arg {number} x - `x` coordinate.
 * @arg {number} y - `y` coordinate.
 * @return {Promise<void>}
 */
PointerEvents.prototype.down = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent("pointerdown", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window, isPrimary: true }); \
        el.dispatchEvent(ev);`;

    return this._getDriver().execute(cmd);
};
/**
 * Unpresses pointer up on element by selector.
 *
 * @async
 * @method
 * @arg {number} x - `x` coordinate.
 * @arg {number} y - `y` coordinate.
 * @return {Promise<void>}
 */
PointerEvents.prototype.up = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent("pointerup", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window, isPrimary: true }); \
        el.dispatchEvent(ev);`;

    return this._getDriver().execute(cmd);
};
/**
 * Moves pointer to element by selector.
 *
 * @async
 * @method
 * @arg {number} x - `x` coordinate.
 * @arg {number} y - `y` coordinate.
 * @return {Promise<void>}
 */
PointerEvents.prototype.move = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent("pointermove", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window, isPrimary: true }); \
        el.dispatchEvent(ev);`;

    return this._getDriver().execute(cmd);
};
/**
 * Cancel pointer on element by selector.
 *
 * @async
 * @method
 * @arg {number} x - `x` coordinate.
 * @arg {number} y - `y` coordinate.
 * @return {Promise<void>}
 */
PointerEvents.prototype.cancel = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent('pointercancel', \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window, isPrimary: true }); \
        el.dispatchEvent(ev);`;

    return this._getDriver().execute(cmd);
};
/**
 * Moves out pointer from element by selector.
 *
 * @async
 * @method
 * @arg {number} x - `x` coordinate.
 * @arg {number} y - `y` coordinate.
 * @return {Promise<void>}
 */
PointerEvents.prototype.out = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent('pointerout', \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window, isPrimary: true }); \
        el.dispatchEvent(ev);`;

    return this._getDriver().execute(cmd);
};
/**
 * Leaves pointer from element by selector.
 *
 * @async
 * @method
 * @arg {number} x - `x` coordinate.
 * @arg {number} y - `y` coordinate.
 * @return {Promise<void>}
 */
PointerEvents.prototype.leave = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent('pointerleave', \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window, isPrimary: true }); \
        el.dispatchEvent(ev);`;

    return this._getDriver().execute(cmd);
};

module.exports = PointerEvents;
