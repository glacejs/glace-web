### v1.4.0

- Updated dependencies to fresh versions.

### v1.3.9

- [Used](https://github.com/glacejs/glace-web/commit/1d0c8b40b794c549d9d11ba1ea984b40dd84d3f9) fixtures factory.

### v1.3.8

- [Updated](https://github.com/glacejs/glace-web/commit/2d76d596accbc2d6b99a6475f99a74de4b37d675) log message format.

### v1.3.7

- [Skip](https://github.com/glacejs/glace-web/commit/79fdbd753933557daab7fc1b8354c0ee8565c32c) browser launch if it is already.
- [Wrap](https://github.com/glacejs/glace-web/commit/45ee76a3ca880088182f1f24a755c09e405c4db6) url to double quotes in log message.
- [Log](https://github.com/glacejs/glace-web/commit/671f3b66fe27ccf8ba93365e8cb691760391524c) browser name in steps to launch and close browser.

### v1.3.6

- [Fixed](https://github.com/glacejs/glace-web/commit/fd9421b0c84b463ea178cd2bf2c718d8cd5e33aa) logic to add webdriver to queue.

### v1.3.5

- [Support](https://github.com/glacejs/glace-web/commit/84b3b3c96f7b2ef246fb06fce1adbe7d08a582e7) multiple browsers launching in tests.

### v1.3.4

- [Improved](https://github.com/glacejs/glace-web/commit/52982520725d129dc9606aef12a226ba65cfff67) logic to install webdrivers on demand. Removed CLI option `--update-web-drivers`.

### v1.3.3

- Use `chromedriver v2.42` explicitly.

### v1.3.2

- Updated `selenium` dependencies.

### v1.3.1

- Updated `glace-core`.
- Started to use `$` only.

### v1.3.0

- [Started](https://github.com/glacejs/glace-web/commit/33052e3afd142575b3abb787d4ed95e564bef6e3) to support slaves mechanism.

### v1.2.9

- [Get](https://github.com/glacejs/glace-web/commit/6b27a8a152b28230221ba7f1251dd91ff3d2fb9e) global proxy port from proxy instance on browser start.

### v1.2.8

- [Extended](https://github.com/glacejs/glace-web/commit/8444e5043154ac8b4e6260890dbb695a85c1e68f) web element functionality.

### v1.2.7

- [Added](https://github.com/glacejs/glace-web/commit/1b205f9004944c63f65a6a63706b357f820c3bcf) ability to clone web element.

### v1.2.6

- [Added](https://github.com/glacejs/glace-web/commit/24c625896812ce252ad6325b9a82dfbec3c97d87) `Enter` sending after text in element optionally.

### v1.2.5

- [Fixed](https://github.com/glacejs/glace-web/commit/d4fbfc85193fc06d8c088e25b994458766b41dac) bug with incorrect URL in error message.

### v1.2.4

- Migrated to new `glace-core`.

### v1.2.3

- Update dependencies.

### v1.2.2

- [Added](https://github.com/glacejs/glace-web/commit/e7c1e98d034932b19bc5d43d0e3595e916c6b161) [allure](https://docs.qameta.io/allure/) steps.

### v1.2.1

- [Fixed](https://github.com/glacejs/glace-web/commit/ebab90c6c69bd4b4e70354c2ef28a0df582dfac8) registered pages default value.

### v1.2.0

- [Started](https://github.com/glacejs/glace-web/commit/b5fd3017a0385f91a1c98015407307444730285a) to wait for element visibility before action.

### v1.1.9

- [Decomposed](https://github.com/glacejs/glace-web/commit/36775babf7f39ef6703ed11958c30a647b48f855) chrome options.
- [Set](https://github.com/glacejs/glace-web/commit/4fc31b1b2943fcccb398a668fbc541ac4881028d) page load timeout.

### v1.1.8

- [Fixed](https://github.com/glacejs/glace-web/commit/584f8faa88429c0411a2b238068f2548de1bfc47) page load timeout default value.

### v1.1.7

- [Added](https://github.com/glacejs/glace-web/commit/de7991582d3121a2f985184f9e87f910a087736c) `CLI` option to launch chrome in headless mode.
- [Added](https://github.com/glacejs/glace-web/commit/a62aba0c73fdff28cf30b54a381d29d0d6e1be69) `CLI` option to provide chrome options.
- [Added](https://github.com/glacejs/glace-web/commit/f903d772866de14a7591c125af839bf465485257) `CLI` option to update selenium drivers.
- [Added](https://github.com/glacejs/glace-web/commit/78d93b05aa9c89738b86e1c206b09c4896a0a8c5) to provide custom [selenium-standalone](https://github.com/vvo/selenium-standalone) options.

### v1.1.6

- [Added](https://github.com/glacejs/glace-web/commit/3d3b6a55549ba147396d9a74a71351b6a978648d) project workflow commands.
- [Fixed](https://github.com/glacejs/glace-web/commit/112a3126cba4671ebb78b3a0438a12cc4054ed25) plugin help items.
- [Logged](https://github.com/glacejs/glace-web/commit/0f7a1e6f870892d528882538cee68986861862aa) steps.

### v1.1.5

- [Fixed](https://github.com/glacejs/glace-web/commit/089ae9d4d6a25d8f86e4153177b9de19f2c47011) absent timeout value in error message.
- Updated selenium version.

### v1.1.4

- [Used](https://github.com/glacejs/glace-web/commit/58f0f720062d5c8c72cf11b189544a8acda34f0d) docstring style in steps.

### v1.1.3

- [Used](https://github.com/glacejs/glace-web/commit/54b69fb528a2d954bed9467ce9a2e7fe6cfa0ff3) `isPrimary: true` for `PointerEvents`.

### v1.1.2

- [Fixed](https://github.com/glacejs/glace-web/commit/02a6368554ded6e2ab9603fefcdeac5629518a61) bug that `activateWeb` step overrides already set `webUrl` property.

### v1.1.1

- [Added](https://github.com/glacejs/glace-web/commit/0f3f458d9275066e53efa234c4ff65cd69c09c72) feature to generate page elements by template from selectors array or function.

### v1.1.0

- Actualized code of page object model, ready for production usage.

### v1.0.9

- Renamed CLI option `--resolution` to `--web-resolution`. Added it to plugin help
and documentation.

### v1.0.8

- Added step to [set browser viewport size](BrowserSteps.html#setViewport__anchor).
Step may be called separately or inside step to launch browser if `config.web`
contains properties `width` and `height` (may be passed via CLI option
`--resolution <width>x<height>`) and platform is `pc`.
