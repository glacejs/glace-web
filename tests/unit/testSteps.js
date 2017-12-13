"use strict";

var CONF = require("../../lib/config");
var Steps = require("../../lib/steps");

scope("Steps", () => {
    var ctx;

    test(".setViewport()", () => {

        before(() => {
            ctx = {};
            ctx.setViewport = Steps.setViewport;
        });

        beforeChunk(() => {
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

        chunk("throws error if passed invalid height value", async () => {
            await expect(ctx.setViewport({ width: 100, height: null }))
                .to.be.rejectedWith("height");
        });

        chunk("throws error if passed invalid width value", async () => {
            await expect(ctx.setViewport({ width: null, height: 100 }))
                .to.be.rejectedWith("width");
        });
    });
});
