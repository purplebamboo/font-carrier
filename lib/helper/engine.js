/**
 * 字体转换，提供svg 到ttf，ttf到woff,eot,svg的转换
 * 提供字体的解析
 */

var path = require('path')
var fs = require('fs');
var _ = require('lodash')
var helper = require('./helper')
var Buffer = require('buffer')

var DOMParser = require('xmldom').DOMParser;


var svg2ttf = require('svg2ttf')
var ttf2svg = require('ttf2svg')
var ttf2eot = require('ttf2eot')
var ttf2woff = require('ttf2woff')

var fontEngine = {
  svg2svg: function(input,options){
    //todo  提供 options的扩展
    return new Buffer(input)
  },
  svg2ttf: function(input,options){
    return new Buffer(svg2ttf(input,options).buffer)
  },
  svg2eot: function(input,options){
    var ttfBuffer = this.svg2ttf(input,options)
    return this.ttf2eot(ttfBuffer,options);
  },
  svg2woff:function(input,options){
    var ttfBuffer = this.svg2ttf(input,options)
    return this.ttf2woff(ttfBuffer,options);
  },
  ttf2ttf: function(input,options){
    return new Buffer(input)
  },
  ttf2svg: function(input,options){
    return new Buffer(ttf2svg(input,options).buffer)
  },
  ttf2eot: function(input,options){
    return new Buffer(ttf2eot(input,options).buffer)
  },
  ttf2woff: function(input,options){
    return new Buffer(ttf2woff(input,options).buffer)
  }
}

var ALL_FONTS_TYPES = ['svg', 'ttf', 'eot', 'woff']

var _basename = function(p) {
  if (!p) return false;
  return path.basename(p)
}

var _normalize = function(input) {
  if (!input) return false
    //a buffer
  if (Buffer.isBuffer(input)) return input.toString()
    //a path
  if (_.isString(input) && fs.existsSync(input)) {
    return fs.readFileSync(input)
  }
  //a svg font string
  if (_.isString(input) && /font-face/.test(input)) {
    return new Buffer(input)
  }
  return false
}

//如果是ttf的请提前使用ttf2svg转换好
var _convert = function(svgFontBuffer,outputTypes) {
  var result = {}

  var preKey = 'svg'
  var input = svgFontBuffer
  var indexTTF = _.indexOf(outputTypes,'ttf')

  //有ttf的时候需要做个优化，就是先转ttf之后用ttf去转woff,eot 可以少一次中间转化
  if (indexTTF !== -1) {
    result['ttf'] = fontEngine.svg2ttf(input)
    preKey = 'ttf'
    input = result['ttf']
    outputTypes.splice(indexTTF,1)
  }

  _.each(outputTypes,function(type,k){
    result[type] = fontEngine[preKey+'2'+type](input)
  })

  return result
}

var _writeFile = function(output,outFonts) {
  _.each(outFonts, function(font, type) {
    fs.writeFile(output + '.' + type, font)
  })
}


/**
 * 一次性的生成其余几种字体,接受一个svg字体
 *
 * @param  {string|buffer|path} input 字体输入可以是路径，buffer对象，string对象
 * @param  {string} outputTypes 字体输出的类型，默认是所有四种
 * @param  {string} outputPath 字体的输出路径,不需要带后缀
 * @return {array}  outFonts    返回转换后的字体buffer数组
 */
fontEngine.convert = function(options) {

  var inputBuffer = _normalize(options.input)

  var outputPath = _basename(options.outputPath)
  var outputTypes = options.outputTypes || ALL_FONTS_TYPES

  if (!inputBuffer) {
    helper.showError('font convert input error，support path，buffer，string！')
    return
  }

  if (!/<svg/.test(inputBuffer.toString())) {
    inputBuffer = fontEngine.ttf2svg(inputBuffer)
  }

  var outFonts = _convert(inputBuffer,outputTypes)

  if (outputPath) {
    _writeFile(outputPath,outFonts)
  }
  return outFonts;

}

//参考  svg2ttf里面的解析代码
//https://github.com/fontello/svg2ttf

var _getGlyph = function(glyphElem) {
  var glyph = {};

  glyph.d = glyphElem.getAttribute('d').trim()
  glyph.unicode = helper.toUnicode(glyphElem.getAttribute('unicode'))
  glyph.name = glyphElem.getAttribute('glyph-name')

  if (glyphElem.getAttribute('horiz-adv-x')) {
    glyph.horizAdvX = parseInt(glyphElem.getAttribute('horiz-adv-x'), 10);
  }

  return glyph;
}

var _parse = function(svgBuffer){
  var svgStr = svgBuffer.toString()
  var doc = (new DOMParser()).parseFromString(svgStr, 'application/xml');
  var fontElem = doc.getElementsByTagName('font')[0]
  var fontFaceElem = fontElem.getElementsByTagName('font-face')[0];

  var font = {
    id:fontElem.getAttribute('id') || 'iconfont',
    fontFace:{
      fontFamily:fontFaceElem.getAttribute('font-family') || 'iconfont',
      fontStretch:fontFaceElem.getAttribute('font-stretch') || 'normal'
    },
    glyphs:[]
  }

  var attrs = {
    horizAdvX: 'horiz-adv-x',
    vertAdvY: 'vert-adv-y',
    horizOriginX: 'horiz-origin-x',
    horizOriginY: 'horiz-origin-y',
    vertOriginX: 'vert-origin-x',
    vertOriginY: 'vert-origin-y'
  }
  _.forEach(attrs, function(val, key) {
    if (fontElem.hasAttribute(val)) {
      font[key] = parseInt(fontElem.getAttribute(val), 10);
    }
  })

  // Get <font-face> numeric attributes
  attrs = {
    ascent:     'ascent',
    descent:    'descent',
    unitsPerEm: 'units-per-em',
    fontWeight: 'font-weight'
  }

  _.forEach(attrs, function(val, key) {
    if (fontFaceElem.hasAttribute(val)) {
      font.fontface[key] = parseInt(fontFaceElem.getAttribute(val), 10);
    }
  })

  _.forEach(fontElem.getElementsByTagName('glyph'), function (glyphElem) {
    var glyph = _getGlyph(glyphElem);
    font.glyphs.push(glyph);
  })

  return font
}


/**
 * 解析一个字体转换成js对象
 * @param  {[type]} input [description]
 * @return {[type]}         [description]
 */
fontEngine.parse = function(input) {
  var inputBuffer = _normalize(input)

  if (!inputBuffer) {
    helper.showError('font convert input error，support path，buffer，string！')
    return
  }

  if (!/<svg/.test(inputBuffer.toString())) {
    inputBuffer = fontEngine.ttf2svg(inputBuffer)
  }

  return _parse(inputBuffer)
}


module.exports = fontEngine