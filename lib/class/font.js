var Base = require('./base.js')
var engine = require('../helper/engine')
var helper = require('../helper/helper')
var Glyph = require('./glyph')
var Fontface = require('./fontface')
var config = require('../config')
var easySvg = require('../svg/easy_svg.js')
var _ = require('lodash')


//生成一个glyph对象
var _generateGlyph = function(value){

  if (value instanceof Glyph) {
    //需要clone一个，不然会对上一个的产生影响
    //去掉偏移量，
    //先new一个默认的字形
    var g = new Glyph(value.options)
    g.__font = value.__font
    return g
  }

  if (_.isString(value) && /\<svg/.test(value)) {
    return new Glyph({
      svg:value
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
  //字体默认属性
  defaultOptions: {
    id: 'iconfont',
    horizAdvX: 1024,
    vertAdvY: 1024,
    horizOriginX: null,
    horizOriginY: null,
    vertOriginX: null,
    vertOriginY: null
  },
  init: function(options) {

    //options = this.options

    //初始化 存放所有的字形（glyphs）
    this.__glyphs = {}
    //存放fontface
    this.__fontFace = new Fontface()

    if (options && options.fontFace) {
      this.__fontFace = options.fontFace
      options.fontFace = null
      delete options['fontFace']
    }

    if (options && options.glyphs) {
      _.each(options.glyphs, function(glyph) {
        this.setGlyph(glyph)
      })
      options.glyphs = null
      delete options['glyphs']
    }
    this.setOptions(options)
  },
  /**
   * 获取一个或多个字形
   * @param  {string|array} keys 需要获取的字型的unicode,可以是数组也可以是单个
   *
   * @return {array} 返回拿到的字形对象数组
   */
  getGlyph:function(keys) {
    var that = this
    if (_.isString(keys)) {
      return that.__glyphs[keys]
    }

    if (_.isArray(keys)) {
      return _.map(keys,function(key){
        return that.__glyphs[key]
      })
    }

  },
  /**
   * 设置字形
   * @param {object} maps 字形hash,key是unicode,value是svg,
   * 或者是一个普通对象{glyphName:'xxxx',d:''}
   * 或者是一个glyph对象
   *
   * 支持key value
   * 支持对象hash
   *
   */
  setGlyph : function() {
    var that = this
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
    _.each(map,function(value,unicode){
      unicode = helper.toUnicode(unicode)
      glyph = _generateGlyph.call(that,value)

      if (glyph) {

        that.__glyphs[unicode] = glyph
        //重写unicode
        glyph.set('unicode',unicode)
        //设置字体进行转换
        glyph.setFont(that)

      }


    })

  },

  /**
   * 返回所有的字形对象
   * @return {array}       Glyph  array
   */
  allGlyph : function() {
    return this.__glyphs
  },

  /**
   * 生成当前字体的svg字体内容
   * @return {string}         svgfont
   */
  toString : function() {
    //渲染模板

    return _.template(config.FONT_TMPL)({
      font: this.options,
      fontface: this.__fontFace.options,
      glyphs: this.__glyphs
    })

  },


  /**
   * 清空当前字体
   *
   * @return {font}  清空后的字体
   */
  clean : function() {
    this.__glyphs = {}
    return this
  },

  /**
   * 字体瘦身
   *
   * @return {font}  瘦身后的字体
   */
  min : function(str) {
    var tmpGlyphs = this.__glyphs
    var unicodes = helper.toUnicode(str)
    this.__glyphs = _.find(tmpGlyphs,function(glyph,unicode){
      return _.indexOf(unicodes,unicode) !== -1
    })
    return this
  },

  /**
   * 导出字体
   * @param {string} dstpath 目标地址，如果没有后缀就会生成4份字体。
   * 可以不传，这样就会生成一个buffer对象，可以自己处置
   * @return {array} 字体buffer对象数组
   */
  output : function(dstpath) {
    var svgStr = this.toString()

    return engine.convert({
      input: svgStr,
      outputPath: dstpath
    })
  }

})

module.exports = Font