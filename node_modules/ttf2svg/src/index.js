
var TTF2SVG = require('./ttf2svg')
  , fs = require('fs')
  , path = require('path')
;

function ttf2svg(buffer) {

    var svg = new TTF2SVG(buffer);

    var tmplPath = path.join(__dirname, '../tmpls/font-svg.xml.ejs'),
        tmpl = fs.readFileSync(tmplPath);

    return svg.renderByTmpl(tmpl);
}

module.exports = ttf2svg;