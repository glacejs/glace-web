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
        await indexPage.searchField.setText("nodejs");
        await indexPage.searchButton.click();
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
        await indexPage.searchField.getElement().setValue("nodejs");
        await indexPage.searchButton.getElement().click();
        await this.pause(1, "wait for result");
    },
});

CONF.web.url = "https://yandex.ru";

scope("Web", null, [fxKillWebdriver, fxSelenium, fxWebdriver], () => {
    
    before(() => {
        SS.registerPages(indexPage);
    });

    test("Browser viewport is set", () => {
    
        afterChunk(async () => {
            CONF.web.width = null;
            CONF.web.height = null;
            await SS.closeBrowser();
        });
    
        chunk("explicitly", async () => {
            await SS.launchBrowser();
            await SS.setViewport({ width: 700, height: 500 });
        });

        chunk("via config", async () => {
            CONF.web.width = 800;
            CONF.web.height = 600;
            await SS.launchBrowser();
        });
    });

    test("Page Object", null, [fxBrowser], () => {

        chunk("manages UI elements via Glace POM", async () => {
            await SS.searchPom("nodejs");
        });

        chunk("manages UI elements via WebdriverIO", async () => {
            await SS.searchWdio("nodejs");
        });
    });
});
