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
const uuid = require("uuid/v4");
var U = require("glace-utils");
var LOG = U.logger;

var CONF = require("../config");
const utils = require("../utils");

var defChromeOpts;

var BrowserSteps = {
    /* imports */
    __wdio: wdio,

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

        opts = U.defVal(opts, {});
        opts.logger = LOG.debug.bind(LOG);
        opts = fp.merge(CONF.web.seleniumOpts, opts);

        const driversInfo = fp.merge({ [CONF.web.browser]: {} }, opts.drivers);
        if (this._checkInstalledDrivers(driversInfo)) {
            LOG.info("Selenium drivers are installed already");
            return;
        }

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
        opts = fp.merge(CONF.web.seleniumOpts, opts);

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

    getLaunchedBrowsers: function (opts={}) {
        /**
         * Step to get launched browsers.
         *
         * @async
         * @memberOf BrowserSteps
         * @method getLaunchedBrowsers
         * @instance
         * @arg {object} [opts] - Step options.
         * @arg {boolean} [opts.check=true] - Flag to check that there are launched
         * browsers.
         * @return {object} - Dictionary: `key` - browser uniq name,
         * `val` - webdriver instance.
         * @throws {Error} If no one browser is launched.
         */

        opts.check = U.defVal(opts.check, true);

        allure.step("Get launched browsers");
        LOG.info("Getting launched browsers...");

        const launchedBrowsers = this._webdrivers ? this._webdrivers.all() : {};
        if (opts.check) {
            expect(launchedBrowsers, "No one browser is launched").to.not.be.empty;
        }

        LOG.info("Got launched browsers");
        allure.pass();

        return launchedBrowsers;
    },

    getCurrentBrowser: function (opts={}) {
        /**
         * Step to get current browser (webdriver instance).
         *
         * @async
         * @memberOf BrowserSteps
         * @method getCurrentBrowser
         * @instance
         * @arg {object} [opts] - Step options.
         * @arg {boolean} [opts.check=true] - Flag to check that there is launched
         * browser.
         * @return {object} - Dictionary: `key` - browser uniq name,
         * `val` - webdriver instance.
         * @throws {Error} If no one browser is launched.
         */

        opts.check = U.defVal(opts.check, true);

        allure.step("Get current browser");
        LOG.info("Getting current browser...");

        let currBrowser = null;
        if (this.webdriver) {
            currBrowser = { [this._webdrivers.getKey(this.webdriver)]: this.webdriver };
        }
        if (opts.check) {
            expect(currBrowser, "No one browser is launched").to.exist;
        }

        LOG.info("Got current browser");
        allure.pass();

        return currBrowser;
    },

    launchBrowser: async function (opts) {
        /**
         * Step to launch browser.
         *
         * @async
         * @memberOf BrowserSteps
         * @method launchBrowser
         * @instance
         * @arg {object} [opts] - Step options.
         * @arg {string} [opts.name=random] - Browser name.
         * @arg {object} [opts.webdriver=CONF.webdriver] - Webdriver config.
         * @arg {boolean} [opts.tryExisting=false] - Try to launch existing browser.
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

        this._webdrivers = U.defVal(this._webdrivers, new utils.OrderedCollection());

        opts = U.defVal(opts, {});
        const check = U.defVal(opts.check, true);
        opts.tryExisting = U.defVal(opts.tryExisting, false);
        this.webUrl = U.defVal(this.webUrl, CONF.web.url);

        if (!opts.tryExisting || !this.webdriver) {
            const webdriverConf = U.defVal(opts.webdriver, CONF.webdriver);

            const name = U.defVal(
                opts.name, `${webdriverConf.desiredCapabilities.browserName}-${uuid()}`);
            expect(this._webdrivers.get(name),
                `Browser name "${name}" is used already. Choose another.`).to.not.exist;

            this.webdriver = this.__wdio.remote(webdriverConf);
            this._webdrivers.push(this.webdriver, name);
        }

        allure.step("Launch browser via selenium");
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
         * Step to close browser.
         *
         * @async
         * @memberOf BrowserSteps
         * @method closeBrowser
         * @instance
         * @arg {object} [opts] - Step options.
         * @arg {object} [opts.switchPrev=true] - Flag to switch browser to last launched.
         * @arg {boolean} [opts.check=true] - Flag to check that browser was closed.
         * @return {Promise<boolean>} `true` if step is executed, `false` if skipped.
         * @throws {AssertionError} If browser wasn't closed.
         */

        if (!this._webdrivers.top()) {
            LOG.debug("No one browser is launched yet");
            return false;
        };

        opts = U.defVal(opts, {});
        opts.switchPrev = U.defVal(opts.switchPrev, true);
        opts.check = U.defVal(opts.check, true);

        allure.step("Close browser");
        LOG.info("Closing browser...");

        await this.webdriver.end();
        await this.pause(1, "webdriver process will be stopped");

        if (opts.check) {
            expect(await this.webdriver.session(),
                "Browser wasn't closed").to.not.exist;
        };

        LOG.info("Browser is closed");
        allure.pass();

        if (opts.switchPrev) {
            expect(this._webdrivers.pop(),
                "Browsers collection is misordered.").to.be.equal(this.webdriver);
            this.webdriver = this._webdrivers.top();
        }
        return true;
    },

    restartBrowser: async function (opts={}) {
        /**
         * Step to restart browser.
         *
         * @async
         * @memberOf BrowserSteps
         * @method restartBrowser
         * @instance
         * @arg {object} [opts={}] - Step options.
         * @return {Promise<void>}
         */

        opts.switchPrev = false;
        opts.tryExisting = true;
        allure.step("Restart browser");
        await this.closeBrowser(opts);
        await this.launchBrowser(opts);
        allure.pass();
    },

    switchBrowser: function (name) {
        /**
         * Step to switch to browser by name.
         *
         * @memberOf BrowserSteps
         * @method switchBrowser
         * @instance
         * @arg {string} 
         * @arg {string} name - Browser uniq name.
         * @return {object} - Webdriver instance.
         */

        allure.step(`Switch browser to "${name}"`);
        LOG.info(`Switching browser to "${name}"...`);

        const webdriver = this._webdrivers.pop(name);
        this._webdrivers.push(webdriver);
        this.webdriver = webdriver;

        LOG.info("Browser is switched");
        allure.pass();

        return this.webdriver;
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
    _checkInstalledDrivers: function (driversInfo) {
        const driversDir = path.join(
            path.dirname(require.resolve("selenium-standalone")), ".selenium");
        if (!fs.existsSync(driversDir)) return false;

        const browserNames = Object.keys(driversInfo);
        const seleniumConf = require("selenium-standalone/lib/default-config");
        driversInfo = fp.merge(seleniumConf.drivers, driversInfo);

        let isDriversInstalled;
        for (const browserName of browserNames) {
            const driverName = `${browserName}driver`;

            const driverDir = path.join(driversDir, driverName);
            if (!fs.existsSync(driverDir)) return false;

            const driverVersion = driversInfo[browserName].version;
            expect(driverVersion).to.exist;

            isDriversInstalled = false;
            for (let driverFile of fs.readdirSync(driverDir)) {
                driverFile = path.parse(driverFile).name.toLowerCase();

                if (driverFile.startsWith(driverVersion)
                        && driverFile.includes(driverName)) {
                    isDriversInstalled = true;
                    break;
                }
            }
        }
        return isDriversInstalled;
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
