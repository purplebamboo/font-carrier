#! /usr/bin/env node

/*

ttf2svg ./FZLTCXHJW.ttf ./

*/

var ttf2svg = require('../src/index')
  , fs = require('fs')
  , path = require('path')
;

var fontPath = process.argv[2];
var fontOutputPath = /*process.argv[3] || */'./';

if (!fontPath) {
	console.log(' eg: ttf2svg ./font.ttf');
	process.exit();
}

var basename = path.basename(fontPath, path.extname(fontPath));
var fontOutputFilePath = path.join(fontOutputPath, basename + '.svg');

fs.readFile(fontPath, function (err, buffer) {
    if (!!err) throw err;

    // return string
    var svgContent = ttf2svg(buffer);
    fs.writeFileSync(fontOutputFilePath, svgContent);

    console.log('complete : '+fontOutputFilePath+'!');
});