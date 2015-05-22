var Base = require('./base.js')
var _ = require('lodash')
var config = require('../config.js')

var Glyph = {
  //字体默认属性
  defaultOptions: {
    unicode : '',
    glyphName : 'unknown',
    d : '',
    horizAdvX : '1024',
    vertAdvY : '1024'
  },
  constructor: function(options,font) {
    Glyph.$super.call(this,options)
    this.__font = font || null
  }
}


//获取当前字形的svg
Glyph.svg = function() {
  //各种转换，主要是根据当前的高宽还有对应字体的信息 翻转转换。
  return _.template(config.SVG_TMPL)({glyph:this.options})
}

module.exports = Base.extend(Glyph)
