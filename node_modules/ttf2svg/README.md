ttf2svg
=======

Font convertor, TTF to SVG, for node.js


Usage
-----

Install:

``` bash
npm install -g ttf2svg
```

Usage example:

``` bash
ttf2svg fontello.ttf fontello.svg
```

Or:

``` javascript
var ttf2svg = require('ttf2svg')
  , fs = require('fs')
;

fs.readFile('./fontello.ttf', function (err, buffer) {
    if (!!err) throw err;

    var svgContent = ttf2svg(buffer);
    fs.writeFileSync('./fontello.svg', svgContent);

});

```

Stats
-----

[![NPM](https://nodei.co/npm/ttf2svg.png?downloads=true&stars=true)](https://nodei.co/npm/ttf2svg/)
[![NPM](https://nodei.co/npm-dl/ttf2svg.png)](https://nodei.co/npm/ttf2svg/)



Reference
-----

[gulp-ttf2svg](https://github.com/morlay/gulp-ttf2svg/)