"use strict";
/**
 * Steps for page.
 *
 * @mixin PageSteps
 */

var url = require("url");

var expect = require("chai").expect;
var U = require("glace-utils");
var LOG = U.logger;

var PageSteps = {
    /**
     * Helper to register pages.
     *
     * @method
     * @instance
     * @arg {...Page} pages - Sequence of pages.
     */
    registerPages: function () {
        for (var page of arguments) {
            if (this._pages()[page.name]) {
                LOG.debug(`Page ${page.name} is registered already`);
                continue;
            };
            page.setDriver(this.webdriver);
            this._pages()[page.name] = page;
        };
    },
    /**
     * Helper to remove pages.
     *
     * @method
     * @instance
     * @arg {...string} pageNames - Sequence of page names.
     */
    removePages: function () {
        for (var pageName of arguments) {
            if (!this._pages()[pageName]) {
                LOG.debug(`Page ${pageName} isn't registered`);
                continue;
            };
            this._pages()[pageName].setDriver(null);
            delete this._pages()[pageName];
        };
    },
    /**
     * Step to open page.
     *
     * @method
     * @instance
     * @async
     * @arg {string} pageName - Name of page to open.
     */
    openPage: async function (pageName) {
        expect(this.webUrl,
               "Web URL isn't defined").to.exist;
        var page = this._pages()[pageName];
        var webUrl = url.resolve(this.webUrl, page.url);
        await this.openUrl(webUrl);
    },
    /**
     * Step to get current page.
     *
     * @async
     * @method
     * @instance
     * @return {Promise<Page>} - Page which corresponds to current browser URL.
     * @throws {Error} - If no one of registered pages corresponds to
     *  current browser URL.
     */
    getCurrentPage: async function () {
        /* sort pages by descending page url length */
        var pages = Object.values(this._pages()).sort(
            (a, b) => a.url.length < b.url.length);

        var curUrl = url.parse(await this.webdriver.getUrl());

        for (var page of pages) {
            if (curUrl.pathname.startsWith(page.url)) return page;
        };
        throw new Error(
            "No one of registered pages corresponds URL '${curUrl}'");
    },
    /**
     * Step to get UI element.
     *
     * @async
     * @method
     * @instance
     * @arg {string} name - UI element name.
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check step result.
     * @return {Promise<object>} - UI element.
     * @throws {AssertionError} - If element wasn't found.
     */
    getElement: async function (name, opts) {
        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        var element = (await this.getCurrentPage())[name];

        if (check) {
            expect(element,
                `Undefined DOM element ${name}`).to.exist;
        };
        return element;
    },
    /**
     * Helper to initialize pages storage.
     *
     * @method
     * @instance
     * @protected
     */
    _pages: function () {
        if (!this.__pages) this.__pages = [];
        return this.__pages;
    },
};
module.exports = PageSteps;
