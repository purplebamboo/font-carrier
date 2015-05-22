
var ttf2svg = require('../src/index.js');

var fs = require('fs');

fs.readFile(__dirname + '/fontello.ttf', function (err, buffer) {
    if (!!err) throw err;

    var svgContent = ttf2svg(buffer);
    var outputPath = __dirname + '/fontello2.svg';
    fs.writeFileSync(outputPath, svgContent);

    console.log('ok, ' + outputPath);
    console.log('open ./test/demo.html' + '\n');

});


