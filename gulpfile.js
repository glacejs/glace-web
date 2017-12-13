"use strict";
/**
 * Gulp tasks.
 *
 * @module
 */

var gulp = require("gulp");
var clean = require("gulp-clean");
var spawn = require("cross-spawn");

gulp.task("mk-docs", () => {
    spawn.sync("jsdoc", [ "-c", "jsdoc.json", "-d", "docs" ]);
});

gulp.task("rm-docs", () => {
    gulp.src("docs", { read: false }).pipe(clean());
});

gulp.task("test-unit", () => {
    spawn.sync("node",
               [
                   "tests/run",
                   "tests/unit",
               ],
               { stdio: "inherit" });
});

gulp.task("test-e2e", () => {
    spawn.sync("./tests/run",
               [
                   "tests/e2e",
               ],
               { stdio: "inherit" });
});
