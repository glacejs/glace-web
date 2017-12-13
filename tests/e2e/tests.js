"use strict";

scope("Web", [fxKillWebdriver, fxSelenium, fxWebdriver], () => {

    test("Browser viewport is set", () => {
    
        afterChunk(async () => {
            CONF.web.width = null;
            CONF.web.height = null;
            await SS.closeBrowser();
        });
    
        chunk("explicitly", async () => {
            await SS.launchBrowser();
            await SS.setViewport({ width: 1024, height: 768 });
        });

        chunk("via config", async () => {
            CONF.web.width = 800;
            CONF.web.height = 600;
            await SS.launchBrowser();
        });
    });
});
