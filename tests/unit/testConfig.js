"use strict";

var CONF = require("../../lib/config");

suite("config", () => {

    test("config", () => {

        chunk("contains web section", () => {
            expect(CONF.web).to.exist;
        });
    });
});
