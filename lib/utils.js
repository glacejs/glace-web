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

class OrderedCollection {

    constructor() {
        this.objs = {};
        this.keys = [];
    }

    pop(key) {
        if (key) {
            if (this.keys.includes(key)) {
                this.keys.splice(this.keys.indexOf(key), 1);
                return this.objs[key];
            } else {
                throw Error(`Key "${key}" isn't added yet`);
            }
        } else {
            key = this.keys.pop();
            return this.objs[key];
        }
    }

    push(obj, key) {
        if (!key) {
            for (const [k, o] of Object.entries(this.objs)) {
                if (o === obj) {
                    this.keys.push(k);
                    return;
                }
            }
            throw Error("Pushed object isn't assigned with any key");
        }
        if (key && this.keys.includes(key)) {
            throw Error(`Key "${key}" is used already`);
        } else {
            this.keys.push(key);
            this.objs[key] = obj;
        }
    }

    get(key) {
        if (key) {
            if (this.keys.includes(key)) {
                return this.objs[key];
            } else {
                return null;
            }
        } else {
            if (this.keys.length) {
                return this.objs[this.keys[0]];
            } else {
                return null;
            }
        }
    }

    getKey(obj) {
        for (const [k, o] of Object.entries(this.objs)) {
            if (obj === o && this.keys.includes(k)) {
                return k;
            }
        }
        return null;
    }

    top() {
        if (!this.keys.length) return null;
        return this.objs[this.keys[this.keys.length - 1]];
    }

    all() {
        const result = {};
        for (const key of this.keys) {
            result[key] = this.objs[key];
        }
        return result;
    }
};

module.exports.OrderedCollection = OrderedCollection;
