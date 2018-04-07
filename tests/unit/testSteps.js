"use strict";

var CONF = require("../../lib/config");
var Steps = rewire("../../lib/steps");
var BrowserSteps = rewire("../../lib/steps/browser");

scope("Steps", () => {
    var ctx;

    beforeChunk(() => {
        ctx = {};
    });

    afterChunk(() => {
        BrowserSteps.__reset__();
        Steps.__reset__();
    });

    test(".activateWeb()", () => {

        beforeChunk(() => {
            ctx.activateWeb = Steps.activateWeb;
            ctx.__wdio = { remote: sinon.stub().returns("driver") };
            CONF.web.url = "https://my.domain.com";
        });

        chunk("sets webdriver and webUrl", () => {
            ctx.activateWeb();
            expect(ctx.__wdio.remote.calledOnce).to.be.true;
            expect(ctx.webdriver).to.be.equal("driver");
            expect(ctx.webUrl).to.be.equal(CONF.web.url);
        });

        chunk("sets webdriver only", () => {
            var url = ctx.webUrl = "https://other.domain.com";
            ctx.activateWeb();
            expect(ctx.__wdio.remote.calledOnce).to.be.true;
            expect(ctx.webdriver).to.be.equal("driver");
            expect(ctx.webUrl).to.be.equal(url);
        });
    });

    test(".launchBrowser()", () => {

        beforeChunk(() => {
            ctx.launchBrowser = Steps.launchBrowser;
            ctx._setChromeOpts = sinon.spy();
            ctx._setTimeouts = sinon.spy();
            ctx.setViewport = sinon.spy();
            ctx.webdriver = {
                desiredCapabilities: { browserName: "chrome" },
                init: sinon.spy(),
                session: sinon.stub().returns("session"),
            };
        });

        chunk("skipped if browser already launched", async () => {
            ctx._isBrowserLaunched = true;
            expect(await ctx.launchBrowser()).to.be.false;
            expect(ctx.webdriver.init).to.not.be.called;
        });

        chunk("throw error if web driver isn't activated", async () => {
            delete ctx.webdriver;
            await expect(ctx.launchBrowser()).to.be.rejectedWith("Web driver is not activated");
        });

        chunk("just launches browser", async () => {
            CONF.web.platform = "android";
            expect(await ctx.launchBrowser({ check: false })).to.be.true;
            expect(ctx.webdriver.init).to.be.calledOnce;
            expect(ctx._setTimeouts).to.be.calledOnce;
            expect(ctx._isBrowserLaunched).to.be.true;
        });

        chunk("sets chrome options if browser chrome", async () => {
            CONF.web.platform = "pc";
            expect(await ctx.launchBrowser({ check: false })).to.be.true;
            expect(ctx._setChromeOpts).to.be.calledOnce;
        });

        chunk("check that browser is launched", async () => {
            expect(await ctx.launchBrowser()).to.be.true;
        });

        chunk("throws error if browser isn't launched", async () => {
            ctx.webdriver.session.returns(null);
            await expect(ctx.launchBrowser()).to.be.rejectedWith("Browser wasn't launched");
        });

        chunk("sets viewport if size is configured", async () => {
            CONF.web.platform = "pc";
            CONF.web.width = 1024;
            CONF.web.height = 600;
            expect(await ctx.launchBrowser({ check: false })).to.be.true;
            expect(ctx.setViewport).to.be.calledOnce;
        });
    });

    test(".setViewport()", () => {

        beforeChunk(() => {
            ctx.setViewport = Steps.setViewport;
            ctx.webdriver = {
                setViewportSize: sinon.spy(),
                getViewportSize: sinon.stub(),
            };
        });

        chunk("sets browser viewport size from options", async () => {
            var size = { width: 100, height: 100 };
            ctx.webdriver.getViewportSize.returns(size);
            expect(await ctx.setViewport(size)).to.be.true;
            expect(ctx.webdriver.setViewportSize.calledOnce).to.be.true;
            expect(ctx.webdriver.getViewportSize.calledOnce).to.be.true;
        });

        chunk("sets browser viewport size from config", async () => {
            var size = { width: 200, height: 200 };
            CONF.web.width = size.width;
            CONF.web.height = size.height;
            ctx.webdriver.getViewportSize.returns(size);
            expect(await ctx.setViewport()).to.be.true;
            expect(ctx.webdriver.setViewportSize.calledOnce).to.be.true;
            expect(ctx.webdriver.getViewportSize.calledOnce).to.be.true;
        });

        chunk("doesn't check viewport size if check is disabled", async () => {
            expect(await ctx.setViewport({ width: 100,
                height: 100,
                check: false })).to.be.true;
            expect(ctx.webdriver.setViewportSize.calledOnce).to.be.true;
            expect(ctx.webdriver.getViewportSize.calledOnce).to.be.false;
        });

        chunk("throws error if viewport height wasn't updated", async () => {
            ctx.webdriver.getViewportSize.returns({ width: 100 });
            await expect(ctx.setViewport({ width: 100, height: 100 }))
                .to.be.rejectedWith("height");
        });

        chunk("throws error if viewport width wasn't updated", async () => {
            ctx.webdriver.getViewportSize.returns({ height: 100 });
            await expect(ctx.setViewport({ width: 100, height: 100 }))
                .to.be.rejectedWith("width");
        });

        chunk("throws error if invalid height value is passed", async () => {
            await expect(ctx.setViewport({ width: 100, height: null }))
                .to.be.rejectedWith("height");
        });

        chunk("throws error if invalid width value is passed", async () => {
            await expect(ctx.setViewport({ width: null, height: 100 }))
                .to.be.rejectedWith("width");
        });
    });

    test("._setChromeOpts()", () => {

        beforeChunk(() => {
            BrowserSteps.__set__("defChromeOpts", undefined);
            ctx._setChromeOpts = BrowserSteps._setChromeOpts;
            ctx.webdriver = {
                desiredCapabilities: {
                    chromeOptions: {
                        args: [],
                    },
                },
            };
        });

        chunk("sets user defined chrome options", () => {
            var opts = ["a", "b", "c=d"];
            ctx._setChromeOpts(opts);
            expect(ctx.webdriver.desiredCapabilities.chromeOptions.args).to.have.members(opts);
        });

        chunk("doesn't change default config chrome options", () => {
            var defOpts = ["a", "b", "c=d"];
            var opts = ["e", "f", "g=h"];
            ctx.webdriver.desiredCapabilities.chromeOptions.args = defOpts;
            ctx._setChromeOpts(opts);
            ctx._setChromeOpts(opts);
            expect(ctx.webdriver.desiredCapabilities.chromeOptions.args).to.have.members(defOpts.concat(opts));
            expect(BrowserSteps.__get__("defChromeOpts")).to.have.members(defOpts);
        });

        chunk("sets proxy chrome options", () => {
            CONF.proxy = { globalPort: 8888 };
            ctx.globalProxy = { isRunning: true };
            ctx._setChromeOpts();
            expect(ctx.webdriver.desiredCapabilities.chromeOptions.args.join(" "))
                .to.include("ignore-certificate-errors")
                .and.to.include("proxy-server=")
                .and.to.include("proxy-bypass-list=");
        });
    });
});
