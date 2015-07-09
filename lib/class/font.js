var Base = require('./base.js')
var engine = require('../helper/engine')
var helper = require('../helper/helper')
var Glyph = require('./glyph')
var Fontface = require('./fontface')
var config = require('../config')
var easySvg = require('../svg/easy_svg.js')
var _ = require('lodash')


//生成一个glyph对象
var _generateGlyph = function(value) {
  if (value instanceof Glyph) {
    //需要clone一个，不然会对上一个的产生影响
    //先new一个默认的字形
    var g = new Glyph(value.options)
    g.__font = value.__font
    return g
  }
  if (_.isString(value) && /\<svg/.test(value)) {
    return new Glyph({
      svg: value
    })
  }

  if (_.isObject(value)) {
    //需要解析好d参数，对于svg直接转换
    var ops = _.clone(value);
    return new Glyph(ops)
  }

  return null
}

var Font = Base.extend({
  defaultOptions: config.DEFAULT_OPTIONS.font,
  init: function(options) {
    var self = this
    self.__glyphs = {}
    self.__fontface = new Fontface()
    self.setOptions(options)
  },
  /**
   * 获取当前字体的fontface
   * @return {Fontface} 当前字体的Fontface对象
   */
  getFontface: function() {
    return this.__fontface
  },
  /**
   * 设置当前字体的fontface
   * @param {obj} options Fontface对象或者是构造参数
   */
  setFontface: function(options) {
    if (options instanceof Fontface) return options
    options = options || {}
    this.__fontface = new Fontface(options)
  },

  /**
   * 获取一个或多个字形的svg
   * @param  {string|array} keys 需要获取的字型的unicode,可以是数组也可以是单个
   *
   * @return {array} 如果只有一个就返回单个字符串，否则返回一个hash 集合
   */
  getSvg: function(keys) {
    var glys = this.getGlyph(keys)
    if (!glys) return ''

    if (glys instanceof Glyph) {
      return glys.toSvg()
    }

    if (_.keys(glys).length > 0) {
      return _.map(glys, function(gly) {
        return (gly && gly instanceof Glyph) ? gly.toSvg() : ''
      })
    }

    return ''
  },
  /**
   * 设置unicode对应svg
   * @param {string} key 需要设置的unicode
   * @param {glyph|object} value 需要设置的值，一个svg字符串
   * 支持同时设置多个，这时参数是一个对象
   * @param {object} maps 字形hash,key,value同上
   */
  setSvg: function() {
    //调用setGlyph来完成
    this.setGlyph.apply(this, _.toArray(arguments))
  },
  /**
   * 获取一个或多个字形
   * @param  {string|array} keys 需要获取的字型的unicode,可以是数组也可以是单个
   *
   * @return {array} 返回拿到的字形对象数组
   */
  getGlyph: function(keys) {
    var self = this
    var result = {}

    if (!keys) {
      helper.showError('need keys.')
    }

    if (_.isString(keys)) {
      keys = helper.toUnicode(keys)
    }

    if (_.isArray(keys)) {
      keys = _.map(keys, function(key) {
        return helper.normalizeUnicode(key)
      })
    }

    //单个key，直接返回对应的字形对象
    if (keys.length === 1) {
      return self.__glyphs[keys[0]]
    }

    _.each(keys, function(key) {
      result[key] = self.__glyphs[key]
    })

    return result

  },
  /**
   * 设置字形
   * @param {string} key 需要设置的unicode
   * @param {glyph|object} value 需要设置的值，可以是一个glyph对象也可以是glyph的options
   * 支持同时设置多个，这时参数是一个对象
   * @param {object} maps 字形hash,key,value同上
   */
  setGlyph: function() {
    var self = this
    var map = null
    if (arguments.length == 2) {
      map = {}
      map[arguments[0]] = arguments[1]
    }

    if (arguments.length == 1 && _.isObject(arguments[0])) {
      map = arguments[0]
    }

    if (!map) return
    var glyph
    _.each(map, function(value, unicode) {
      unicode = helper.normalizeUnicode(unicode)
      glyph = _generateGlyph.call(self, value)

      if (glyph) {
          //重写unicode
        glyph.set('unicode', unicode)
          //如果发现没有设置name,就使用unicode
        if (!glyph.get('glyphName')) glyph.set('glyphName', 'uni' + unicode.replace(/(&#x)|(;)/g, ''))
          //设置对应的新字体，进行各种适配转换
        glyph.setFont(self)
      }
    })
  },

  /**
   * 返回所有的字形对象
   * @return {array}       glyph hash
   */
  allGlyph: function() {
    return this.__glyphs
  },

  /**
   * 生成当前字体的svg字体内容
   * @return {string}         svg font
   */
  toString: function() {
    //渲染模板
    return _.template(config.FONT_TMPL)({
      font: this.options,
      fontface: helper.key2underline(this.__fontface.options),
      glyphs: this.__glyphs
    })

  },


  /**
   * 清空当前字体
   *
   * @return {font}  清空后的字体
   */
  clean: function() {
    this.__glyphs = {}
    return this
  },

  /**
   * 字体瘦身
   * @param {string} input 参考的字符串，支持unicode,文字,可以重复
   *
   * @return {font}  瘦身后的字体
   */
  min: function(input) {
    var tmpGlyphs = this.__glyphs
    var unicodes = helper.toUnicode(input)

    this.__glyphs = _.filter(tmpGlyphs, function(glyph, unicode) {
      return _.indexOf(unicodes, unicode) !== -1
    })
    return this
  },

  /**
   * 导出字体
   * @param {object} options 导出参数
   * @param {string} options.path 目标地址，没有后缀。可以不传，这样就会生成一个buffer对象，可以自己处置。
   * @param {string} options.types 导出的字体格式，默认是 ['svg', 'ttf', 'eot', 'woff']
   *
   * @return {array} 字体buffer对象数组
   */
  output: function(options) {
    options = options || {}
    if (!options.input) {
      options.input = this.toString()
    }
    return engine.convert(options)
  }

})

module.exports = Font