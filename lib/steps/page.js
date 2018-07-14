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

    registerPages: function () {
        /**
         * Helper to register pages.
         *
         * @memberOf PageSteps
         * @method registerPages
         * @instance
         * @arg {...Page} pages - Sequence of pages.
         */

        for (var page of arguments) {
            if (this._pages()[page.name]) {
                LOG.debug(`Page ${page.name} is registered already`);
                continue;
            };

            allure.step(`Register web page ${page.name}`);
            LOG.info(`Register web page ${page.name}`);

            page.setDriver(this.webdriver);
            this._pages()[page.name] = page;

            allure.pass();
        };
    },

    removePages: function () {
        /**
         * Helper to remove pages.
         *
         * @memberOf PageSteps
         * @method removePages
         * @instance
         * @arg {...string} pageNames - Sequence of page names.
         */

        for (var pageName of arguments) {
            if (!this._pages()[pageName]) {
                LOG.debug(`Page ${pageName} isn't registered`);
                continue;
            };

            allure.step(`Remove page ${pageName}`);
            LOG.info(`Remove page ${pageName}`);

            this._pages()[pageName].setDriver(null);
            delete this._pages()[pageName];

            allure.pass();
        };
    },

    openPage: async function (pageName) {
        /**
         * Step to open page.
         *
         * @async
         * @memberOf PageSteps
         * @method openPage
         * @instance
         * @arg {string} pageName - Name of page to open.
         * @return {Promise}
         */

        allure.step(`Open web page ${pageName}`);
        expect(this.webUrl,
            "Web URL isn't defined").to.exist;

        LOG.info(`Openning page '${pageName}' in browser...`);

        var page = this._pages()[pageName];
        var webUrl = url.resolve(this.webUrl, page.url);
        await this.openUrl(webUrl);

        LOG.info("Page is opened");
        allure.pass();
    },

    getCurrentPage: async function () {
        /**
         * Step to get current page.
         *
         * @async
         * @memberOf PageSteps
         * @method getCurrentPage
         * @instance
         * @return {Promise<Page>} - Page which corresponds to current browser URL.
         * @throws {Error} - If no one of registered pages corresponds to
         *  current browser URL.
         */

        allure.step("Get current web page");
        LOG.info("Getting current web page...");

        /* sort pages by descending page url length */
        var pages = Object.values(this._pages()).sort(
            (a, b) => a.url.length < b.url.length);

        var curUrl = await this.webdriver.getUrl();
        var parsedUrl = url.parse(curUrl);

        for (var page of pages) {
            if (parsedUrl.pathname.startsWith(page.url)) {
                LOG.info("Current web page is found");
                allure.pass();
                return page;
            }
        };
        throw new Error(
            `No one of registered pages corresponds URL '${curUrl}'`);
    },

    getElement: async function (name, opts) {
        /**
         * Step to get UI element.
         *
         * @async
         * @memberOf PageSteps
         * @method getElement
         * @instance
         * @arg {string} name - UI element name.
         * @arg {object} [opts] - Step options.
         * @arg {boolean} [opts.check=true] - Flag to check step result.
         * @return {Promise<object>} - UI element.
         * @throws {AssertionError} - If element wasn't found.
         */

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        allure.step(`Get web element with name ${name}`);
        LOG.info(`Getting web element with name ${name}...`);

        var element = (await this.getCurrentPage())[name];

        if (check) {
            expect(element,
                `Undefined DOM element ${name}`).to.exist;
        };

        LOG.info("Web element is found");
        allure.pass();

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
        if (!this.__pages) this.__pages = {};
        return this.__pages;
    },
};
module.exports = PageSteps;
