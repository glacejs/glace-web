"use strict";

var CONF = require("../../lib/config");

test("config", () => {

    chunk("contains web section", () => {
        expect(CONF.web).to.exist;
    });

    scope("has installDrivers", () => {

        var reloadConfig = () => {
            delete CONF.args.updateWebDrivers;
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
            expect(CONF.web.updateDrivers).to.be.false;
        });

        chunk("false if CLI option set", () => {
            CONF.args.updateWebDrivers = true;
            CONF = require("../../lib/config");
            expect(CONF.web.updateDrivers).to.be.true;
        });
    });
});
