var Base = require('./base.js')

var _ = require('lodash')
var helper = require('../helper/helper.js')
var config = require('../config.js')
var easySvg = require('../svg/easy_svg.js')
var svgpath = require('svgpath')
var _path = require('path')
var fs = require('fs')

var Glyph = Base.extend({
  defaultOptions: config.DEFAULT_OPTIONS.glyph,
  init: function(options) {
    this.setOptions(options)
      //这边直接用require是为了防止循环引用
    var Font = require('./font.js')
    var Fontface = require('./fontface.js')

    //给一个默认的没有偏移的字体，不需要偏移转换
    this.__font = new Font({
      id: config.FONT_FAMILY,
      horizAdvX: this.get('horizAdvX'),
      vertAdvY: this.get('vertAdvY')
    })
    this.__font.__fontface = new Fontface({
      ascent: 0,
      descent: -this.get('vertAdvY'),
      unitsPerEm: this.get('vertAdvY'),
      fontFamily: config.FONT_FAMILY
    })

    //没有d参数，但是有svg参数，就进行转换
    if (!this.get('d') && options.svg) {
      var pathObj = easySvg.normalizeSvg(options.svg, {
          targetHeight: this.__font.get('vertAdvY')
        })
        //翻转
      pathObj.path = easySvg.reversal(pathObj.path)
      this.set('d', pathObj.path)
      this.set('horizAdvX', pathObj.viewbox[2])
      this.set('vertAdvY', pathObj.viewbox[3])
    }

  },
  getFont:function(){
    return this.__font
  },
  /**
   * 设置对应的字体，针对新的字体做出转换
   * @param {Font} dstFont 对应的字体对象
   *
   * @return {Font} 返回对应的字体对象
   */
  setFont: function(dstFont) {
    var dstFontAscent = dstFont.__fontface.get('ascent')
    var curFontAscent = this.__font.__fontface.get('ascent')
    var path = this.get('d')
    var scale, ascent
    //当前有字体就需要做出转换
    if (this.__font) {
      //算出字体的比例，进行缩放还有参数变化
      scale = this.__font.get('vertAdvY') / dstFont.get('vertAdvY')
      ascent = dstFontAscent * scale - curFontAscent
      path = svgpath(path).scale(1 / scale).translate(0, ascent).round(config.PATH_DECIMAL).toString()

      this.set('d', path)
      this.set('horizAdvX', parseInt(this.get('horizAdvX') / scale))
      this.set('vertAdvY', parseInt(this.get('vertAdvY') / scale))



    }

    var unicode = this.get('unicode')
    //去掉老的引用
    //只有引用的是自己才需要移除，
    //因为存在一种情况就是这个glyph是使用当前的配置参数新建的
    //但是跟老的具有相同的字体引用，不能误删
    if (this.__font && this.__font.__glyphs[unicode] === this) {
      delete this.__font.__glyphs[unicode]
    }

    //设置新的引用
    dstFont.__glyphs[this.get('unicode')] = this

    this.__font = dstFont


    return dstFont
  },
  /**
   * 获取当前字形的svg
   * @param  {object} options 导入的选项
   * @param  {string} options.path    导出svg的路径，可以不传,不传就不会写文件
   * @param  {string} options.width   导出svg的宽度,默认100px
   * @param  {string} options.height  导出svg的高度,默认100px
   *
   * @return {string}  svg字符串
   */
  toSvg: function(path, options) {
      var data = _.clone(this.options)
      var ascent = this.__font.__fontface.get('ascent')
      var svgStr = ''

      data.d = svgpath(data.d).translate(0, -ascent).scale(1, -1).round(config.PATH_DECIMAL).toString()

      options = options || {}

      _.defaults(options, config.DEFAULT_EXPORT_OPTIONS)

      svgStr = _.template(config.SVG_TMPL)({
        glyph: data,
        options: options
      })
      if (options.path) {
        path = _path.resolve(process.cwd(), path)
        fs.writeFileSync(path, svgStr)
      }

      return svgStr
    }
    //todo toPng
})

module.exports = Glyph