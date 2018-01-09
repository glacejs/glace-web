"use strict";

var CONF = require("../../lib/config");
var Steps = require("../../lib/steps");

scope("Steps", () => {
    var ctx;

    test(".activateWeb()", () => {

        beforeChunk(() => {
            ctx = {};
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

    test(".setViewport()", () => {

        beforeChunk(() => {
            ctx = {};
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
});
