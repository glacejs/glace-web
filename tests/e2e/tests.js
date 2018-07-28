"use strict";

var Steps = require("glace-core").Steps;
var Page = require("../../lib").Page;

var indexPage = new Page(
    "index", "/",
    { searchField: "input#text",
        searchButton: "button.button_theme_websearch[type='submit']"});

Steps.register({
    /**
     * Step to search via Glace POM.
     *
     * @method
     * @instance
     * @arg {string} text - Searching text.
     */
    searchPom: async function (text) {
        await this.openPage(indexPage.name);
        await indexPage.searchField.setText(text, { enter: true });
        await this.pause(1, "wait for result");
    },
    /**
     * Step to search via WebdriverIO.
     *
     * @method
     * @instance
     * @arg {string} text - Searching text.
     */
    searchWdio: async function (text) {
        await this.openPage(indexPage.name);
        await indexPage.searchField.getElement().setValue(text);
        await indexPage.searchButton.getElement().click();
        await this.pause(1, "wait for result");
    },
});

suite("e2e web tests", null, [fxKillWebdriver, fxSelenium, fxWebdriver], () => {
    
    before(() => {
        $.registerPages(indexPage);
    });

    test("Browser viewport is set", () => {
    
        beforeChunk(() => {
            CONF.web.width = null;
            CONF.web.height = null;
        });

        afterChunk(async () => {
            await $.closeBrowser();
        });
    
        chunk("explicitly", async () => {
            await $.launchBrowser();
            await $.setViewport({ width: 700, height: 500 });
        });

        chunk("via config", async () => {
            CONF.web.width = 800;
            CONF.web.height = 600;
            await $.launchBrowser();
        });
    });

    test("Page Object", null, [fxBrowser], () => {

        before(() => {
            $.webUrl = "https://yandex.ru";
        });

        chunk("manages UI elements via Glace POM", async () => {
            await $.searchPom("nodejs");
        });

        chunk("manages UI elements via WebdriverIO", async () => {
            await $.searchWdio("nodejs");
        });
    });
});
