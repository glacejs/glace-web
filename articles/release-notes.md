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
