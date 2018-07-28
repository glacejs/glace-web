"use strict";

var Page = require("../../lib").Page;

suite("Page", () => {
    var page;

    beforeChunk(() => {
        page = new Page("my page", "/my/url");
    });

    test("page instance", () => {
        chunk("has correct name", () => {
            expect(page.name).to.be.equal("my page");
        });
        chunk("has correct url", () => {
            expect(page.url).to.be.equal("/my/url");
        });
        chunk("doesn't have webdriver", () => {
            expect(page._webdriver).to.not.exist;
        });

        chunk("has controls", () => {
            page = new Page("p", "/", { oneEl: "#oneEl", twoEl: "#twoEl" });

            expect(page.oneEl).to.exist;
            expect(page.oneEl.selector).to.be.equal("#oneEl");

            expect(page.twoEl).to.exist;
            expect(page.twoEl.selector).to.be.equal("#twoEl");
        });

        chunk("has controls generated from function", () => {
            page = new Page("p", "/", { el: () => ["#1"] });

            expect(page.el_1).to.exist;
            expect(page.el_1.selector).to.be.equal("#1");

            expect(page.el_0).to.not.exist;
            expect(page.el_2).to.not.exist;
        });

        chunk("has controls generated from array", () => {
            page = new Page("p", "/", { el: ["#1"] });

            expect(page.el_1).to.exist;
            expect(page.el_1.selector).to.be.equal("#1");
        });

        chunk("has controls generated from functions array", () => {
            page = new Page("p", "/", { el: () => [() => ["#1"]] });

            expect(page.el_1_1).to.exist;
            expect(page.el_1_1.selector).to.be.equal("#1");
        });

        chunk("throws error if selectors array is empty", () => {
            expect(() => new Page("p", "/", { el: [] }))
                .to.throw("should have at least 1 item");
        });

        chunk("throws error if selector has invalid type", () => {
            expect(() => new Page("p", "/", { el: 1 }))
                .to.throw("should be string or array or function");
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
