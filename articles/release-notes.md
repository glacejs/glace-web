### v1.0.9

- Renamed CLI option `--resolution` to `--web-resolution`. Added it to plugin help
and documentation.

### v1.0.8

- Added step to [set browser viewport size](BrowserSteps.html#setViewport__anchor).
Step may be called separately or inside step to launch browser if `config.web`
contains properties `width` and `height` (may be passed via CLI option
`--resolution <width>x<height>`) and platform is `pc`.
