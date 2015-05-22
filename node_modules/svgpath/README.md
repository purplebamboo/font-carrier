svgpath
=======

[![Build Status](https://img.shields.io/travis/fontello/svgpath/master.svg?style=flat)](https://travis-ci.org/fontello/svgpath)
[![NPM version](https://img.shields.io/npm/v/svgpath.svg?style=flat)](https://www.npmjs.org/package/svgpath)
[![Coverage Status](https://img.shields.io/coveralls/fontello/svgpath/master.svg?style=flat)](https://coveralls.io/r/fontello/svgpath?branch=master)


Low level toolkit for svg paths transformations. Sometime you can't use
`transform` attributes and have to apply changes to svg paths directly.
Then this package is for you :) !

Note, this package works with `paths`, not with svg xml sources.


Install
-------

```bash
npm install svgpath
```


Example
-------

```js
var svgpath = require('svgpath');

var transformed = svgpath(__your_path__)
                    .scale(0.5)
                    .translate(100,200)
                    .rel()
                    .round(1)
                    .toString();
```


API
---

All methods are chainable (return self).


### new SvgPath(path) -> self

Constructor. Creates new `SvgPath` class instance with chainable methods.
`new` can be omited.


### .abs() -> self

Converts all path commands to absolute.


### .rel() -> self

Converts all path commands to relative. Useful to reduce output size.


### .scale(sx [, sy]) -> self

Rescale path (the same as SVG `scale` transformation). `sy` = `sx` by default.


### .translate(x [, y]) -> self

Rescale path (the same as SVG `translate` transformation). `y` = 0 by default.


### .rotate(angle [, rx, ry]) -> self

Rotate path to `angle` degree around (rx, ry) point. If rotation center not set,
(0, 0) used. The same as SVG `rotate` transformation.


### .matrix([ m1, m2, m3, m4, m5, m6 ]) -> self

Apply 2x3 affine transform matrix to path. Params - array. The same as SVG
`matrix` transformation.


### .transform(string) -> self

Any SVG transform or their combination. For example `rotate(90) scale(2,3)`.
The same format, as described in SVG standard for `transform` attribute.


### .unshort() -> self

Converts smooth curves `T`/`t`/`S`/`s` with "missed" control point to
generic curves (`Q`/`q`/`C`/`c`).


### .unarc() -> self

Replaces all arcs with bezier curves.


### .toString() -> string

Returns final path string.


### .round(precision) -> self

Round all coordinates to given decimal precision. By default round to integer.
Useful to reduce resulting output string size.


### .iterate(function(segment, index, x, y) [, keepLazyStack]) -> self

Apply iterator to all path segments.

- Each iterator receives `segment`, `index`, `x` and `y` params.
  Where (x, y) - absolute coordinates of segment start point.
- Iterator can modify current segment directly (return nothing in this case).
- Iterator can return array of new segments to replace current one (`[]` means
  that current segment should be delated).

If second param `keepLazyStack` set to `true`, then iterator will not evaluate
stacked transforms prior to run. That can be useful to optimize calculations.


Authors
-------

- Sergey Batishchev - [@snb2013](https://github.com/snb2013)
- Vitaly Puzrin - [@puzrin](https://github.com/puzrin)
- Alex Kocharin - [@rlidwka](https://github.com/rlidwka)


License
-------

[MIT](https://github.com/fontello/svgpath/blob/master/LICENSE)
