"use strict";

var CONF = require("../../lib/config");

test("config", () => {

    chunk("contains web section", () => {
        expect(CONF.web).to.exist;
    });

    scope("has installDrivers", () => {

        var reloadConfig = () => {
            delete CONF.args.dontInstallWebDrivers;
            delete CONF.args.seleniumAddress;
            delete require.cache[require.resolve("../../lib/config")];
        };

        beforeChunk(() => {
            reloadConfig();
        });

        afterChunk(() => {
            reloadConfig();
            CONF = require("../../lib/config");
        });

        chunk("true by default", () => {
            expect(CONF.web.installDrivers).to.be.true;
        });
    
        chunk("false if CLI option set", () => {
            CONF.args.dontInstallWebDrivers = true;
            CONF = require("../../lib/config");
            expect(CONF.web.installDrivers).to.be.false;
        });
    
        chunk("false if CLI selenium address set", () => {
            CONF.args.seleniumAddress = "127.0.0.1";
            CONF = require("../../lib/config");
            expect(CONF.web.installDrivers).to.be.false;
        });
    });
});
