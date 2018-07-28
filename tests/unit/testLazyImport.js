"use strict";

var _ = require("lodash");
var glaceWeb = require("../../lib");

suite("import", () => {

    test("Plugin lazy import", () => {

        chunk("empty by default", () => {
            expect(_.isEmpty(glaceWeb)).to.be.true;
        });
    
        chunk("has config", () => {
            expect(glaceWeb.config).to.exist;
        });
    
        chunk("has plugin help", () => {
            expect(glaceWeb.pluginHelp).to.exist;
        });
    
        chunk("has steps", () => {
            expect(glaceWeb.Steps).to.exist;
        });
    });
});