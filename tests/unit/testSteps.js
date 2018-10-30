"use strict";

var CONF = require("../../lib/config");
var Steps = rewire("../../lib/steps");
var BrowserSteps = rewire("../../lib/steps/browser");

suite("Steps", () => {
    var ctx;

    beforeChunk(() => {
        ctx = {};
    });

    afterChunk(() => {
        BrowserSteps.__reset__();
        Steps.__reset__();
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
            ctx.globalProxy = { isRunning: true, getPort: () => 8888 };
            ctx._setChromeOpts();
            expect(ctx.webdriver.desiredCapabilities.chromeOptions.args.join(" "))
                .to.include("ignore-certificate-errors")
                .and.to.include("proxy-server=")
                .and.to.include("proxy-bypass-list=");
        });
    });

    test("._pages()", () => {
        beforeChunk(() => {
            ctx._pages = Steps._pages;
        });

        chunk(() => {
            expect(ctx._pages()).to.be.eql({});
            ctx._pages()["a"] = 1;
            expect(ctx._pages().a).to.be.equal(1);
        });
    });
});
