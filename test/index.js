
//测试新建字体

var fontCarrier = require('../lib/lib.js')
var font = fontCarrier.create()
font.setGlyph('我','<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="10 10 1000 1000"><circle cx="500" cy="500" r="20"/><circle cx="500" cy="500" r="60"/></svg>')

console.log(font.toString())