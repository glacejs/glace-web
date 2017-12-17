"use strict";

var Element = require("../../lib/pom/element");

scope("UI element", () => {
    var el, page, wd;
    
    beforeChunk(() => {
        wd = {
            execute: sinon.spy(),
            element: sinon.stub().returns("element"),
            getText: sinon.spy(() => Promise.resolve(" text ")),
            getAttribute: sinon.spy(() => Promise.resolve(" attr ")),
            setValue: sinon.spy(),
            click: sinon.spy(),
        };
        page = { getDriver: sinon.stub().returns(wd) };
        el = new Element("elem", "#id", page);
    });

    test("instance", () => {
        chunk("has correct name", () => {
            expect(el.name).to.be.equal("elem");
        });

        chunk("has correct selector", () => {
            expect(el.selector).to.be.equal("#id");
        });

        chunk("has pointer events", () => {
            expect(el._event._selector).to.be.equal("#id");
        });

        chunk("has correct page", () => {
            expect(el._page.getDriver).to.be.equal(page.getDriver);
        });

        chunk("has correct element cmd", () => {
            expect(el._elCmd).to.include(el.selector);
        });

        chunk("doesn't have webdriver", () => {
            expect(el._webdriver).to.not.exist;
        });
    });

    test("._getDriver()", () => {
        chunk("gets webdriver", () => {
            expect(el._getDriver()).to.be.equal(wd);
            expect(el._webdriver).to.be.equal(wd);
            expect(el._getDriver()).to.be.equal(wd);
            expect(page.getDriver.calledOnce).to.be.true;
        });
    });

    test(".getElement()", () => {
        chunk("gets webdriver element", () => {
            expect(el.getElement()).to.be.equal("element");
            expect(wd.element.calledOnce).to.be.true;
            expect(wd.element.args[0][0]).to.be.equal(el.selector);
        });
    });

    test(".getText()", () => {

        chunk("gets element text", async () => {
            expect(await el.getText()).to.be.equal("text");
            expect(wd.getText.calledOnce).to.be.true;
            expect(wd.getText.args[0][0]).to.be.equal(el.selector);
        });

        chunk("gets value attribute", async () => {
            wd.getText = sinon.spy(() => Promise.resolve());
            wd.getAttribute = sinon.spy(() => Promise.resolve(" value "));

            expect(await el.getText()).to.be.equal("value");

            expect(wd.getText.calledOnce).to.be.true;
            expect(wd.getText.args[0][0]).to.be.equal(el.selector);
            expect(wd.getAttribute.calledOnce).to.be.true;
            expect(wd.getAttribute.args[0][0]).to.be.equal(el.selector);
            expect(wd.getAttribute.args[0][1]).to.be.equal("value");
        });

        chunk("gets innerHTML attribute", async () => {
            wd.getText = sinon.spy(() => Promise.resolve());
            var attrRes = null;
            wd.getAttribute = sinon.spy(() => {
                var p = Promise.resolve(attrRes);
                attrRes = " innerHTML ";
                return p;
            });

            expect(await el.getText()).to.be.equal("innerHTML");

            expect(wd.getText.calledOnce).to.be.true;
            expect(wd.getText.args[0][0]).to.be.equal(el.selector);
            expect(wd.getAttribute.calledTwice).to.be.true;
            expect(wd.getAttribute.args[0][0]).to.be.equal(el.selector);
            expect(wd.getAttribute.args[0][1]).to.be.equal("value");
            expect(wd.getAttribute.args[1][0]).to.be.equal(el.selector);
            expect(wd.getAttribute.args[1][1]).to.be.equal("innerHTML");
        });

        chunk("gets null", async () => {
            wd.getText = sinon.spy(() => Promise.resolve());
            wd.getAttribute = sinon.spy(() => Promise.resolve());

            expect(await el.getText()).to.be.null;

            expect(wd.getText.calledOnce).to.be.true;
            expect(wd.getText.args[0][0]).to.be.equal(el.selector);
            expect(wd.getAttribute.calledTwice).to.be.true;
            expect(wd.getAttribute.args[0][0]).to.be.equal(el.selector);
            expect(wd.getAttribute.args[0][1]).to.be.equal("value");
            expect(wd.getAttribute.args[1][0]).to.be.equal(el.selector);
            expect(wd.getAttribute.args[1][1]).to.be.equal("innerHTML");
        });
    });

    test(".setText()", () => {
        chunk("sets text", async () => {
            await el.setText("some text");
            expect(wd.setValue.calledOnce).to.be.true;
            expect(wd.setValue.args[0][0]).to.be.equal(el.selector);
            expect(wd.setValue.args[0][1]).to.be.equal("some text");
        });
    });

    test(".location()", () => {
        beforeChunk(() => {
            wd.execute = sinon.spy(() => Promise.resolve({ value: "location" }));
        });

        chunk("gets location", async () => {
            expect(await el.location()).to.be.equal("location");
            expect(wd.execute.calledOnce).to.be.true;
        });
    });

    test(".scrollIntoView()", () => {
        chunk("scrolls to view", async () => {
            await el.scrollIntoView();
            expect(wd.execute.calledOnce).to.be.true;
        });
    });

    test(".click()", () => {

        beforeChunk(() => {
            el.waitForVisible = sinon.spy(() => Promise.resolve());
            el.scrollIntoView = sinon.spy(() => Promise.resolve());
        });

        chunk("clicks", async () => {
            await el.click();
            expect(el.waitForVisible.calledOnce).to.be.true;
            expect(el.scrollIntoView.calledOnce).to.be.true;
            expect(wd.click.calledOnce).to.be.true;
            expect(wd.click.args[0][0]).to.be.equal(el.selector);
        });
    });

    test(".pClick()", () => {

        beforeChunk(() => {
            el.waitForVisible = sinon.spy(() => Promise.resolve());
            el.location = sinon.stub().returns({ midX: 1, midY: 1 });
            el._event = {
                move: sinon.spy(),
                down: sinon.spy(),
                up: sinon.spy(),
            };
        });

        chunk("clicks with pointer events", async () => {
            await el.pClick();
            expect(el.waitForVisible.calledOnce).to.be.true;
            expect(el.location.calledOnce).to.be.true;
            expect(el._event.move.calledOnce).to.be.true;
            expect(el._event.move.args[0]).to.have.members([1, 1]);
            expect(el._event.down.calledOnce).to.be.true;
            expect(el._event.down.args[0]).to.have.members([1, 1]);
            expect(el._event.up.calledOnce).to.be.true;
            expect(el._event.up.args[0]).to.have.members([1, 1]);
        });
    });

    test(".isSelected()", () => {
        chunk("by property", async () => {
            wd.isSelected = sinon.spy(() => Promise.resolve(true));
            expect(await el.isSelected()).to.be.true;
            expect(wd.isSelected.calledOnce).to.be.true;
        });

        chunk("by attribute", async () => {
            wd.isSelected = sinon.spy(() => Promise.resolve(false));
            wd.getAttribute = sinon.spy(() => Promise.resolve("selected"));
            expect(await el.isSelected()).to.be.true;
            expect(wd.isSelected.calledOnce).to.be.true;
            expect(wd.getAttribute.calledOnce).to.be.true;
            expect(wd.getAttribute.args[0]).to.have.members([el.selector, "class"]);
        });
    });

    test(".isExist()", () => {
        chunk("check if element exist", async () => {
            wd.execute = sinon.spy(() => Promise.resolve({ value: true }));
            expect(await el.isExist()).to.be.true;
            expect(wd.execute.calledOnce).to.be.true;
        });
    });

    test(".waitForExist()", () => {

        beforeChunk(() => {
            wd.waitUntil = sinon.spy(cb => cb());
            el.isExist = sinon.stub().returns(true);
        });

        chunk("waits for exist", async () => {
            expect(await el.waitForExist()).to.be.true;
            expect(wd.waitUntil.calledOnce).to.be.true;
            expect(el.isExist.calledOnce).to.be.true;
        });
    });

    test(".waitForNonExist()", () => {

        beforeChunk(() => {
            wd.waitUntil = sinon.spy(cb => cb());
            el.isExist = sinon.stub().returns(false);
        });

        chunk("waits for exist", async () => {
            expect(await el.waitForNonExist()).to.be.true;
            expect(wd.waitUntil.calledOnce).to.be.true;
            expect(el.isExist.calledOnce).to.be.true;
        });
    });

    test(".isVisible()", () => {

        beforeChunk(() => {
            el.isExist = sinon.spy(() => Promise.resolve(true));
            wd.isVisible = sinon.spy(() => Promise.resolve(true));
        });

        chunk("check if element visible", async () => {
            expect(await el.isVisible()).to.be.true;
            expect(wd.isVisible.calledOnce).to.be.true;
            expect(wd.isVisible.args[0][0]).to.be.equal(el.selector);
        });
    });

    test(".waitForVisible()", () => {

        beforeChunk(() => {
            wd.waitUntil = sinon.spy(cb => cb());
            el.isVisible = sinon.stub().returns(true);
        });

        chunk("waits for visible", async () => {
            expect(await el.waitForVisible()).to.be.true;
            expect(wd.waitUntil.calledOnce).to.be.true;
            expect(el.isVisible.calledOnce).to.be.true;
        });
    });

    test(".waitForInvisible()", () => {

        beforeChunk(() => {
            wd.waitUntil = sinon.spy(cb => cb());
            el.isVisible = sinon.stub().returns(false);
        });

        chunk("waits for visible", async () => {
            expect(await el.waitForInvisible()).to.be.true;
            expect(wd.waitUntil.calledOnce).to.be.true;
            expect(el.isVisible.calledOnce).to.be.true;
        });
    });
});
