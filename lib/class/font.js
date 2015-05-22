var Base = require('./base.js')
var engine = require('./helper/engine')
var Glyph = require('./glyph')
var config = require('../config')
var Path = require('../svg/path.js')
var _ = require('lodash')

var Font = {
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
  constructor: function(options) {

    options = _.clone(options)
    options.fontFace = options.fontFace || {}

    this.__fontFace = new Fontface(options.fontFace)
    delete options['fontFace']

    //初始化 存放所有的字形（glyphs）
    this.__glyphs = {}

    if (options.glyphs) {
      _.each(options.glyphs, function(glyph) {
        this.setGlyph(glyph)
      })
      options.glyphs = null
      delete options['glyphs']
    }

    Font.$super.call(this, options)

  }
}


/**
 * 获取一个或多个字形
 * @param  {string|array} keys 需要获取的字型的unicode,可以是数组也可以是单个
 *
 * @return {array} 返回拿到的字形对象数组
 */
Font.getGlyph = function(keys) {
  var that = this
  if (_.isString(keys)) {
    return that.__glyphs[keys]
  }

  if (_.isArray(keys)) {
    return _.map(keys,function(key){
      return that.__glyphs[key]
    })
  }

}

//提供svg的转换，包括根据字体的信息 翻转  还有根据高宽进行拉伸压缩
//返回一个对象，包含当前基本的信息 包括d 高宽等等
var svgTransform = function(svgstr,font){

}

//生成一个glyph对象
var _generateGlyph = function(value){

  if (value instanceof Glyph) {
    //需要clone一个，不然会对上一个的产生影响
    return new Glyph(value.options,this)
  }

  if (_.isString(value) && /\<svg/.test(value)) {
    //svg的转换 根据当前字形的宽高 变成对应的大小的d 赋值给glyph
    //var result = _svgTransform(value,this)
    var result = Path.generateD(value,width,height)
    return new Glyph(result,this)
  }

  if (_.isObject(value)) {
    //需要解析好d参数，对于svg直接转换
    var ops = _.clone(value);
    if (ops.svg) {

    };

    return new Glyph(value,this)
  }

  return null
}

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
Font.setGlyph = function() {
  var that = this
  var map = null

  if (arguments.length == 2) {
    map = {
      arguments[0]:arguments[1]
    }
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
      //重写unicode
      glyph.set('unicode',unicode)
      that.__glyphs[unicode] = glyph
      //todo 根据新字体 重新转换宽高还有 d
    }


  })

}

/**
 * 返回所有的字形对象
 * @return {array}       Glyph  array
 */
Font.allGlyph = function() {
  return this.__glyphs
}

/**
 * 生成当前字体的svg字体内容
 * @return {string}         svgfont
 */
Font.toString = function() {
  //渲染模板
  return _.template(config.FONT_TMPL)({
    font: this.options,
    fontFace: this.__fontFace.options,
    glyphs: this.__glyphs
  })

}


/**
 * 清空当前字体
 *
 * @return {font}  清空后的字体
 */
Font.clean = function() {
  this.__glyphs = {}
  return this
}

/**
 * 字体瘦身
 *
 * @return {font}  瘦身后的字体
 */
Font.min = function(str) {
  var tmpGlyphs = this.__glyphs
  var unicodes = helper.toUnicode(str)
  this.__glyphs = _.find(tmpGlyphs,function(glyph,unicode){
    return _.indexOf(unicodes,unicode) !== -1
  })
  return this
}

/**
 * 导出字体
 * @param {string} dstpath 目标地址，如果没有后缀就会生成4份字体。
 * 可以不传，这样就会生成一个buffer对象，可以自己处置
 * @return {array} 字体buffer对象数组
 */
Font.output = function(dstpath) {
  var svgStr = this.toString()

  return engine.convert({
    input: svgStr,
    outputPath: dstpath
  })
}


module.exports = Base.extend(Font)