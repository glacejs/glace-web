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
