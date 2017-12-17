"use strict";

var Page = require("../../lib").Page;

scope("Page", () => {
    var page;

    beforeChunk(() => {
        page = new Page("my page", "/my/url");
    });

    test("instance", () => {
        chunk("has correct name", () => {
            expect(page.name).to.be.equal("my page");
        });
        chunk("has correct url", () => {
            expect(page.url).to.be.equal("/my/url");
        });
        chunk("doesn't have webdriver", () => {
            expect(page._webdriver).to.not.exist;
        });
    });

    test(".setDriver()", () => {
        chunk("sets webdriver", () => {
            page.setDriver("driver");
            expect(page._webdriver).to.be.equal("driver");
        });
    });

    test(".getDriver()", () => {

        chunk("throws error if no driver", () => {
            expect(() => page.getDriver()).to.throw("Webdriver isn't set");
        });

        chunk("gets driver", () => {
            page.setDriver("driver");
            expect(page.getDriver()).to.be.equal("driver");
        });
    });

    test(".addElements()", () => {

        chunk("adds elements", () => {
            expect(page.button).to.not.exist;
            page.addElements({ button: "#btn" });
            expect(page.button).to.exist;
            expect(page.button.selector).to.be.equal("#btn");
        });

        chunk("throws error if element already exists", () => {
            page.addElements({ button: "#btn" });
            expect(() => page.addElements({ button: "#btn" }))
                .to.throw("already contains property 'button'");
        });
    });

    test(".removeElements()", () => {

        chunk("removes elements", () => {
            expect(page.btn1).to.not.exist;
            expect(page.btn2).to.not.exist;
            page.addElements({ btn1: "#btn", btn2: "#btn" });
            expect(page.btn1).to.exist;
            expect(page.btn2).to.exist;
            page.removeElements("btn1", "btn2");
            expect(page.btn1).to.not.exist;
            expect(page.btn2).to.not.exist;
        });
    });
});
