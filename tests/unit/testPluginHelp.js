"use strict";

var pluginHelp = require("../../lib").pluginHelp;

test("plugin help contains option", () => {

    var opts = pluginHelp({ options: opts => opts }, d => d);

    chunk("dont-install-drivers", () => {
        expect(opts["dont-install-drivers"]).to.exist;
    });

    chunk("web", () => {
        expect(opts["web"]).to.exist;
    });

    chunk("web-url <URL>", () => {
        expect(opts["web-url <URL>"]).to.exist;
    });

    chunk("web-resolution <widthxheight>", () => {
        expect(opts["web-resolution <widthxheight>"]).to.exist;
    });

    chunk("selenium-addr", () => {
        expect(opts["selenium-addr"]).to.exist;
    });

    chunk("platform", () => {
        expect(opts["platform"]).to.exist;
    });

    chunk("browser", () => {
        expect(opts["browser"]).to.exist;
    });

    chunk("device", () => {
        expect(opts["device"]).to.exist;
    });

    chunk("os-version", () => {
        expect(opts["os-version"]).to.exist;
    });

    chunk("ios-engine", () => {
        expect(opts["ios-engine"]).to.exist;
    });

    chunk("chrome-incognito", () => {
        expect(opts["chrome-incognito"]).to.exist;
    });
});
