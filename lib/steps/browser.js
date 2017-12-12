"use strict";
/**
 * Steps for web applications.
 *
 * @mixin BrowserSteps
 */

var _ = require("lodash");
var selenium = require("selenium-standalone");
var wdio = require("webdriverio");
var U = require("glace-utils");
var LOG = U.logger;

var CONF = require("../config");

var defChromeOpts;

var BrowserSteps = {
    /**
     * Helper to activate web application.
     *
     * @method
     * @instance
     */
    activateWeb: function () {
        this.webdriver = wdio.remote(CONF.webdriver);
        this.webUrl = CONF.web.url;
    },
    /**
     * Step to install selenium drivers.
     *
     * @async
     * @method
     * @instance
     * @return {Promise<void>}
     * @throws {Error} If there was error during drivers installation.
     */
    installSeleniumDrivers: async function () {

        var opts = {
            logger: LOG.debug.bind(LOG),
        };
        await new Promise((resolve, reject) => {

            selenium.install(opts, err => {
                if (err) reject(err);
                LOG.debug("Selenium drivers are installed");
                resolve();
            });
        });
    },
    /**
     * Step to start selenium server. Step recall will be skipped if
     *  selenium server wasn't stopped before.
     *
     * @async
     * @method
     * @instance
     * @return {Promise<boolean>} `true` if step is executed, `false` if skipped.
     * @throws {Error} If there was error on selenium start.
     */
    startSeleniumServer: async function () {

        if (this._seleniumProc) {
            LOG.warn("Step to start selenium server was passed already");
            return false;
        };

        var opts = {};
        this._seleniumProc = await new Promise((resolve, reject) => {

            selenium.start(opts, (err, child) => {
                if (err) reject(err);
                LOG.debug(
                    `Selenium server starts with PID ${child.pid}`);
                resolve(child);
            })
        });
        return true;
    },
    /**
     * Step to stop selenium server. Step call will be skipped if selenium
     *  server wasn't started before.
     *
     * @async
     * @method
     * @instance
     * @return {Promise<boolean>} `true` if step is executed, `false` if skipped.
     * @throws {Error} If there was error on selenium stop.
     */
    stopSeleniumServer: async function () {

        if (!this._seleniumProc) {
            LOG.warn("Step to start selenium server wasn't passed yet");
            return false;
        };

        await new Promise((resolve, reject) => {

            this._seleniumProc.on("exit", (code, signal) => {
                LOG.debug(`Selenium server was stopped with`,
                          `code ${code} and signal ${signal}`);
                delete this._seleniumProc;
                resolve();
            });
            this._seleniumProc.on("error", reject);
            var result = this._seleniumProc.kill("SIGINT");
            if (!result) reject("Oops! Can't kill selenium server");
        });
        return true;
    },
    /**
     * Step to launch browser. Step recall will be skipped if browser
     *  wasn't closed before.
     *
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that browser was
     *  launched.
     * @arg {string[]} [opts.chromeOpts=[]] - List of chrome options.
     * @return {Promise<boolean>} `true` if step is executed, `false` if skipped.
     * @throws {AssertionError} If browser wasn't launched.
     */
    launchBrowser: async function (opts) {

        if (this._isBrowserLaunched) {
            LOG.debug("Step to launch browser was passed already");
            return false;
        };

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        if (CONF.web.platform === "pc" &&
                this.webdriver.desiredCapabilities.browserName === "chrome") {

            defChromeOpts = U.defVal(
                defChromeOpts,
                this.webdriver.desiredCapabilities.chromeOptions.args,
                []);

            var chromeOpts = _.clone(U.defVal(opts.chromeOpts, []));

            if (this.globalProxy && this.globalProxy.isRunning) {
                var proxyOptions = [
                    "ignore-certificate-errors",
                    `proxy-server=${U.hostname}:${CONF.proxy.globalPort}`,
                    `proxy-bypass-list=localhost,127.0.0.1,${U.hostname}`,
                ];
                for (var opt of proxyOptions) {
                    if (!isOptPresent(opt, chromeOpts)) chromeOpts.push(opt);
                };
            };

            for (var opt of defChromeOpts) {
                if (!isOptPresent(opt, chromeOpts)) chromeOpts.push(opt);
            };

            this.webdriver.desiredCapabilities.chromeOptions.args = chromeOpts;
        };

        await this.webdriver.init();

        if (check) {
            expect(await this.webdriver.session(),
                   "Browser wasn't launched").to.exist;
        };

        if (CONF.web.width && CONF.web.height && CONF.web.platform === "pc") {
            await this.setResolution();
        };

        this._isBrowserLaunched = true;
        return true;
    },
    /**
     * Step to set browser resolution.
     * 
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @arg {number} [opts.width] - Browser viewport width.
     * @arg {number} [opts.height] - Browser viewport height.
     * @arg {boolean} [opts.check=true] - Flag to check step result.
     * @return {boolean} `true` when step is executed.
     * @throws {AssertionError} If width or height values are not a number.
     * @throws {AssertionError} If viewport size wasn't changed correctly.
     */
    setResolution: async function (opts) {

        opts = U.defVal(opts, {});
        var width = U.defVal(opts.width, CONF.web.width);
        var height = U.defVal(opts.height, CONF.web.height);
        var check = U.defVal(opts.check, true);

        expect(width, "Invalid browser viewport width").to.be.a("number");
        expect(height, "Invalid browser viewport height").to.be.a("number");

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

        return true;
    },
    /**
     * Step to close browser. Step will be skipped if browser wasn't launched
     *  before.
     *
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that browser was closed.
     * @return {Promise<boolean>} `true` if step is executed, `false` if skipped.
     * @throws {AssertionError} If browser wasn't closed.
     */
    closeBrowser: async function (opts) {

        if (!this._isBrowserLaunched) {
            LOG.debug("Step to launch browser wasn't passed yet");
            return false;
        };

        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        await this.webdriver.end();
        await this.pause(1, "webdriver process will be stopped");

        if (opts.check) {
            expect(await this.webdriver.session(),
                   "Browser wasn't closed").to.not.exist;
        };
        this._isBrowserLaunched = false;
        return true;
    },
    /**
     * Step to restart browser.
     *
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @return {Promise<void>}
     */
    restartBrowser: async function (opts) {
        await this.closeBrowser(opts);
        await this.launchBrowser(opts);
    },
    /**
     * Step to open URL in browser.
     *
     * @async
     * @method
     * @instance
     * @arg {string} pageUrl - URL which should be opened in browser.
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that URL is opened.
     * @arg {number} [opts.timeout] - Timeout to wait for URL will be opened
     *  in browser, ms. Default value is `CONF.timeouts.pageLoad`.
     * @return {Promise<void>}
     * @throws {Error} If URL wasn't opened after timeout.
     */
    openUrl: async function (webUrl, opts) {

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);
        var timeout = U.defVal(opts.timeout, CONF.timeouts.pageLoad);

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
    },
    /**
     * Step to open application URL in browser.
     *
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @return {Promise<void>}
     * @throws {AssertionError} If application URL is not defined.
     */
    openApp: async function (opts) {
        expect(this.webUrl,
               "Web URL isn't defined").to.exist;
        await this.openUrl(this.webUrl, opts);
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
