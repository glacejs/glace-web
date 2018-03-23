"use strict";

var pluginHelp = require("../../lib").pluginHelp;

test("plugin help contains option", () => {

    var opts = pluginHelp({ options: opts => opts }, d => d);

    chunk("dont-install-web-drivers", () => {
        expect(opts["dont-install-web-drivers"]).to.exist;
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
        expect(opts["selenium-address <host:port>"]).to.exist;
    });

    chunk("platform", () => {
        expect(opts["platform [type]"]).to.exist;
    });

    chunk("browser", () => {
        expect(opts["browser [name]"]).to.exist;
    });

    chunk("device", () => {
        expect(opts["device <name>"]).to.exist;
    });

    chunk("os-version", () => {
        expect(opts["os-version <value>"]).to.exist;
    });

    chunk("ios-engine", () => {
        expect(opts["ios-engine <name>"]).to.exist;
    });

    chunk("chrome-incognito", () => {
        expect(opts["chrome-incognito"]).to.exist;
    });
});
