var Font = require('./font')
var Glyph = require('./glyph')
var engine = require('./helper/engine')
var Path = require('./svg/path.js')

var _ = require('./lodash')

var FontCarrier = {}

FontCarrier.Font = Font
FontCarrier.Glyph = Glyph
FontCarrier.engine = engine
FontCarrier.path = Path

/**
 * 生成一个新的空白字体
 * options 包括字体的各种配置
 *
 * @return {font} 字体对象
 */

FontCarrier.create = function(options) {
  return new Font(options)
}

/**
 * 装载一个字体，用于解析一个已有的字体，支持svg,ttf
 * 支持path支持buffer对象
 * @return {font} 字体对象
 */
FontCarrier.transfer = function(input,options){
  var parsedFontJson = engine.parse(input)
  _.extend(parsedFontJson,options)

  var font = new Font(parsedFontJson)
  return font
}



module.exports = FontCarrier