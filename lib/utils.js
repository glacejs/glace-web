"use strict";

const _ = require("lodash");
const findStrategy = require("webdriverio/build/lib/helpers/findElementStrategy");

module.exports = {

    clearElementText: value => {
        if (!_.isArray(value)) return value.trim();
        return value.map(v => v.trim());
    },

    getElementCommand: selector => {
        if (findStrategy(selector).using === "xpath") {
            return `${xpathFunc(selector)}[0]`;
        } else {
            return `document.querySelector("${selector}")`;
        }
    },

    getElementsCommand: selector => {
        if (findStrategy(selector).using === "xpath") {
            return xpathFunc(selector);
        } else {
            return `document.querySelectorAll("${selector}")`;
        }
    },
};

const xpathFunc = selector => {
    return ` \
        ((() => {
            var xpathObj = document.evaluate("${selector}", \
                document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); \
            var result = []; \
            var count = xpathObj.snapshotLength; \
            for (var i = 0; i < count; i++) { \
                result.push(xpathObj.snapshotItem(i)); \
            } \
            return result; \
        })())`;
};
