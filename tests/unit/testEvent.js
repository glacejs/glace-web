"use strict";

var PointerEvents = require("../../lib/pom/event");

scope("Pointer Events", () => {
    var pe, page, exec;

    beforeChunk(() => {
        exec = sinon.spy();
        page = { getDriver: () => { return { execute: exec } } };
        pe = new PointerEvents("#id", page);
    });

    test("instance", () => {

        chunk("has correct selector", () => {
            expect(pe._selector).to.be.equal("#id");
        });

        chunk("has correct page", () => {
            expect(pe._page.getDriver).to.be.equal(page.getDriver);
        });

        chunk("has correct element cmd", () => {
            expect(pe._elCmd).to.include(pe._selector);
        });

        chunk("doesn't have webdriver", () => {
            expect(pe._webdriver).to.not.exist;
        });
    });

    test("._getDriver()", () => {
        chunk("gets webdriver", () => {
            expect(pe._getDriver().execute).to.be.equal(exec);
        });
    });

    ["over", "enter", "down", "up", "move", "cancel", "out", "leave"].forEach(event => {
        test(`.${event}()`, () => {
            chunk("to selector coords", async () => {
                await pe[event](111, 222);
                expect(exec.calledOnce).to.be.true;
                expect(exec.args[0][0]).to.include(pe._elCmd);
                expect(exec.args[0][0]).to.include(111);
                expect(exec.args[0][0]).to.include(222);
            });
        });
    });
});
