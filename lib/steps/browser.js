"use strict";
/**
 * Steps for web applications.
 *
 * @mixin BrowserSteps
 */

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var fp = require("lodash/fp");
const getPort = require("get-port");
var expect = require("chai").expect;
var selenium = require("selenium-standalone");
var wdio = require("webdriverio");
var U = require("glace-utils");
var LOG = U.logger;

var CONF = require("../config");

var defChromeOpts;

var BrowserSteps = {
    /* imports */
    __wdio: wdio,

    activateWeb: function () {
        /**
         * Helper to activate web application.
         *
         * @memberOf BrowserSteps
         * @method activateWeb
         * @instance
         */

        this.webdriver = this.__wdio.remote(CONF.webdriver);
        this.webUrl = U.defVal(this.webUrl, CONF.web.url);
        LOG.info("Web driver is activated");
    },

    installSeleniumDrivers: async function (opts) {
        /**
         * Step to install selenium drivers.
         *
         * @async
         * @memberOf BrowserSteps
         * @method installSeleniumDrivers
         * @instance
         * @arg {object} [opts] - [selenium-standalone](https://github.com/vvo/selenium-standalone) options.
         * @return {Promise<void>}
         * @throws {Error} If there was error during drivers installation.
         */

        if (!CONF.web.updateDrivers && this._checkInstalledDrivers()) {
            LOG.info("Selenium drivers are installed already");
            return;
        }

        opts = U.defVal(opts, {});
        opts.logger = LOG.debug.bind(LOG);
        opts = fp.merge(opts, CONF.web.seleniumOpts);

        allure.step("Install selenium drivers");
        LOG.info("Installing selenium drivers...");

        await new Promise((resolve, reject) => {

            selenium.install(opts, err => {
                if (err) return reject(err);
                resolve();
            });
        });

        LOG.info("Selenium drivers are installed");
        allure.pass();
    },

    startSeleniumServer: async function (opts) {
        /**
         * Step to start selenium server. Step recall will be skipped if
         *  selenium server wasn't stopped before.
         *
         * @async
         * @memberOf BrowserSteps
         * @method startSeleniumServer
         * @arg {object} [opts] - [selenium-standalone](https://github.com/vvo/selenium-standalone) options.
         * @instance
         * @return {Promise<boolean>} `true` if step is executed, `false` if skipped.
         * @throws {Error} If there was error on selenium start.
         */

        if (this._seleniumProc) {
            LOG.warn("Step to start selenium server was passed already");
            return false;
        };

        opts = U.defVal(opts, {});
        opts = fp.merge(opts, CONF.web.seleniumOpts);

        if (!CONF.webdriver.port) CONF.webdriver.port = await getPort();
        opts.seleniumArgs = ["-port", CONF.webdriver.port];

        allure.step(`Start selenium server on port ${CONF.webdriver.port}`);
        LOG.info(`Starting selenium server on port ${CONF.webdriver.port}...`);

        this._seleniumProc = await new Promise((resolve, reject) => {
            selenium.start(opts, (err, child) => {
                if (err) return reject(err);
                resolve(child);
            });
        });

        LOG.info(`Selenium server is started with PID ${this._seleniumProc.pid}`);
        allure.pass();

        return true;
    },

    stopSeleniumServer: async function () {
        /**
         * Step to stop selenium server. Step call will be skipped if selenium
         *  server wasn't started before.
         *
         * @async
         * @memberOf BrowserSteps
         * @method stopSeleniumServer
         * @instance
         * @return {Promise<boolean>} `true` if step is executed, `false` if skipped.
         * @throws {Error} If there was error on selenium stop.
         */

        if (!this._seleniumProc) {
            LOG.warn("Step to start selenium server wasn't passed yet");
            return false;
        };

        allure.step("Stop selenium server");
        LOG.info("Stopping selenium server...");

        await new Promise((resolve, reject) => {

            this._seleniumProc.on("exit", (code, signal) => {
                LOG.debug("Selenium server was stopped with",
                    `code ${code} and signal ${signal}`);
                delete this._seleniumProc;
                resolve();
            });
            this._seleniumProc.on("error", reject);
            var result = this._seleniumProc.kill("SIGINT");
            if (!result) reject("Oops! Can't kill selenium server");
        });

        LOG.info("Selenium server is stopped");
        allure.pass();

        return true;
    },

    launchBrowser: async function (opts) {
        /**
         * Step to launch browser. Step recall will be skipped if browser
         *  wasn't closed before.
         *
         * @async
         * @memberOf BrowserSteps
         * @method launchBrowser
         * @instance
         * @arg {object} [opts] - Step options.
         * @arg {boolean} [opts.check=true] - Flag to check that browser was
         *  launched.
         * @arg {string[]} [opts.chromeOpts=[]] - List of chrome options.
         * @return {Promise<boolean>} `true` if step is executed, `false` if skipped.
         * @throws {AssertionError} If browser wasn't launched.
         *
         * @example
         *
         * await $.launchBrowser();
         * await $.launchBrowser({ chromeOpts: ["headless", "user-data-dir=/path/to/dir"] });
         */

        if (this._isBrowserLaunched) {
            LOG.debug("Step to launch browser was passed already");
            return false;
        };

        allure.step("Launch browser via selenium");
        expect(this.webdriver, "Web driver is not activated").to.exist;

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        LOG.info("Launching browser via selenium...");

        if (CONF.web.platform === "pc" &&
            this.webdriver.desiredCapabilities.browserName === "chrome") {
            this._setChromeOpts(opts.chromeOpts);
        }

        await this.webdriver.init();
        await this._setTimeouts();

        if (check) {
            expect(await this.webdriver.session(),
                "Browser wasn't launched").to.exist;
        };

        this._isBrowserLaunched = true;
        LOG.info("Browser is launched");

        if (CONF.web.platform === "pc" && CONF.web.width && CONF.web.height) {
            await this.setViewport();
        };

        allure.pass();
        return true;
    },

    /**
     * Helper to webdriver timeouts.
     * @ignore
     */
    _setTimeouts: async function () {
        var pageLoad = CONF.web.pageTimeout * 1000;
        try {
            await this.webdriver.timeouts("page load", pageLoad);
        } catch (e) {
            LOG.error("Can't set webdriver timeouts", e);
            await this.webdriver.timeouts({ pageLoad: pageLoad });
        }
    },

    /**
     * Helper to set chrome options.
     *
     * It composes chrome options list in next order:
     * - user provided options
     * - proxy options if they are not present in list
     * - default config options if they are not present in list
     *
     * @method
     * @instance
     * @protected
     * @arg {array} [chromeOpts=[]] - List of chrome options.
     */
    _setChromeOpts: function (chromeOpts) {
        var opt;
        /* store origin chrome options, because then webdriver options will be overridden */
        defChromeOpts = U.defVal(defChromeOpts,
            this.webdriver.desiredCapabilities.chromeOptions.args, []);

        chromeOpts = _.clone(U.defVal(chromeOpts, []));

        if (this.globalProxy && this.globalProxy.isRunning) {
            var proxyOptions = [
                "ignore-certificate-errors",
                `proxy-server=${U.hostname}:${this.globalProxy.getPort()}`,
                `proxy-bypass-list=localhost,127.0.0.1,${U.hostname}`,
            ];
            for (opt of proxyOptions) {
                if (!isOptPresent(opt, chromeOpts)) chromeOpts.push(opt);
            };
        };

        for (opt of defChromeOpts) {
            if (!isOptPresent(opt, chromeOpts)) chromeOpts.push(opt);
        };

        this.webdriver.desiredCapabilities.chromeOptions.args = chromeOpts;
    },

    setViewport: async function (opts) {
        /**
         * Step to set browser viewport size.
         * 
         * @async
         * @memberOf BrowserSteps
         * @method setViewport
         * @instance
         * @arg {object} [opts] - Step options.
         * @arg {number} [opts.width] - Browser viewport width.
         * @arg {number} [opts.height] - Browser viewport height.
         * @arg {boolean} [opts.check=true] - Flag to check step result.
         * @return {boolean} `true` when step is executed.
         * @throws {AssertionError} If width or height values are not a number.
         * @throws {AssertionError} If viewport size wasn't changed correctly.
         */

        opts = U.defVal(opts, {});
        var width = U.defVal(opts.width, CONF.web.width);
        var height = U.defVal(opts.height, CONF.web.height);
        var check = U.defVal(opts.check, true);

        expect(width, "Invalid browser viewport width").to.be.a("number");
        expect(height, "Invalid browser viewport height").to.be.a("number");

        allure.step(`Set browser viewport to [width=${width}, height=${height}]`);
        LOG.info(`Setting browser viewport to [width=${width}, height=${height}]...`);

        await this
            .webdriver
            .setViewportSize({ width: width, height: height });
        
        if (check) {
            var viewport = await this.webdriver.getViewportSize();

            expect(viewport.width,
                "Invalid browser viewport width")
                .to.be.equal(width);
            expect(viewport.height,
                "Invalid browser viewport height")
                .to.be.equal(height);
        };

        LOG.info("Browser viewport size is set");
        allure.pass();

        return true;
    },

    closeBrowser: async function (opts) {
        /**
         * Step to close browser. Step will be skipped if browser wasn't launched
         *  before.
         *
         * @async
         * @memberOf BrowserSteps
         * @method closeBrowser
         * @instance
         * @arg {object} [opts] - Step options.
         * @arg {boolean} [opts.check=true] - Flag to check that browser was closed.
         * @return {Promise<boolean>} `true` if step is executed, `false` if skipped.
         * @throws {AssertionError} If browser wasn't closed.
         */

        if (!this._isBrowserLaunched) {
            LOG.debug("Step to launch browser wasn't passed yet");
            return false;
        };

        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        allure.step("Close browser");
        LOG.info("Closing browser...");

        await this.webdriver.end();
        await this.pause(1, "webdriver process will be stopped");

        if (opts.check) {
            expect(await this.webdriver.session(),
                "Browser wasn't closed").to.not.exist;
        };
        this._isBrowserLaunched = false;

        LOG.info("Browser is closed");
        allure.pass();

        return true;
    },

    restartBrowser: async function (opts) {
        /**
         * Step to restart browser.
         *
         * @async
         * @memberOf BrowserSteps
         * @method restartBrowser
         * @instance
         * @arg {object} [opts] - Step options.
         * @return {Promise<void>}
         */

        allure.step("Restart browser");
        await this.closeBrowser(opts);
        await this.launchBrowser(opts);
        allure.pass();
    },

    openUrl: async function (webUrl, opts) {
        /**
         * Step to open URL in browser.
         *
         * @async
         * @memberOf BrowserSteps
         * @method openUrl
         * @instance
         * @arg {string} webUrl - URL which should be opened in browser.
         * @arg {object} [opts] - Step options.
         * @arg {boolean} [opts.check=true] - Flag to check that URL is opened.
         * @arg {number} [opts.timeout] - Timeout to wait for URL will be opened
         *  in browser, sec. Default value is `CONF.web.pageTimeout`.
         * @return {Promise<void>}
         * @throws {Error} If URL wasn't opened after timeout.
         */

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);
        var timeout = U.defVal(opts.timeout, CONF.web.pageTimeout) * 1000;

        allure.step(`Open URL ${webUrl} in browser`);
        LOG.info(`Openning URL ${webUrl} in browser...`);

        await this.webdriver.url(webUrl);

        if (check) {
            var errMsg = `Browser didn't navigate to ${webUrl} ` +
                         `during ${timeout} ms`;

            await this.webdriver.waitUntil(async () => {
                var curUrl = await this.webdriver.getUrl();
                LOG.debug(`Compare current URL ${curUrl}`,
                    `with expected ${webUrl}`);
                return curUrl.startsWith(webUrl);
            }, timeout, errMsg);
        };

        LOG.info("URL is opened");
        allure.pass();
    },

    openApp: async function (opts) {
        /**
         * Step to open application URL in browser.
         *
         * @async
         * @memberOf BrowserSteps
         * @method openApp
         * @instance
         * @arg {object} [opts] - Step options.
         * @return {Promise<void>}
         * @throws {AssertionError} If application URL is not defined.
         */

        allure.step("Open web application");
        expect(this.webUrl,
            "Web URL isn't defined").to.exist;
        await this.openUrl(this.webUrl, opts);
        allure.pass();
    },

    /**
     * Helper to check whether selenium drivers are installed or no.
     *
     * @ignore
     */
    _checkInstalledDrivers: function () {

        var driversDir = path.join(
            path.dirname(require.resolve("selenium-standalone")),
            ".selenium");

        if (!fs.existsSync(driversDir)) return false;

        for (var dirName of fs.readdirSync(driversDir)) {
            if (dirName.includes("driver")) return true;
        }
        return false;
    },
};

module.exports = BrowserSteps;

/**
 * Helper to define whether chrome option is present in options list.
 *
 * @ignore
 * @function
 */
var isOptPresent = (opt, opts) => {
    var optStart = opt.split("=")[0];
    for (var o of opts) {
        if (o.split("=")[0] === optStart) return true;
    };
    return false;
};
