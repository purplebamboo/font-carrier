var Base = require('./base.js')

var _ = require('lodash')
var config = require('../config.js')
var easySvg = require('../svg/easy_svg.js')
var svgpath = require('svgpath');

var Glyph = Base.extend({
  //字体默认属性
  defaultOptions: {
    unicode: '',
    glyphName: 'unknown',
    d: '',
    horizAdvX: '',
    vertAdvY: ''
  },
  init: function(options) {

    this.setOptions(options)
    //给一个默认的没有偏移的字体，不需要偏移转换
    //这边直接用require是为了防止循环引用
    var Font = require('./font.js')
    var Fontface = require('./fontface.js')

    this.__font = new Font({
      id: 'iconfont',
      horizAdvX: this.get('horizAdvX'),
      vertAdvY: this.get('vertAdvY')
    })
    this.__font.__fontFace = new Fontface({
      descent: 0,
      ascent: -this.get('vertAdvY'),
      unitsPerEm: this.get('vertAdvY'),
      fontFamily: 'iconfont'
    })

    //没有d参数，但是有svg参数，就进行转换
    if (!this.get('d') && options.svg) {
      var path = easySvg.generatePath(options.svg, {
        targetHeight: this.__font.get('vertAdvY'),
        descent: this.__font.__fontFace.get('descent')
      })

      //翻转
      path = easySvg.reversal(path)

      this.set('d', path)
    }

    // if (font) {
    //   //设置字体，并且就会做出偏移转换
    //   this.setFont(font)
    // }

  },
  //设置对应的字体，针对新的字体做出转换
  setFont:function(font) {
    var descent = font.__fontFace.get('descent')
    var height = font.get('vertAdvY')
    var path = this.get('d')
    //先拿当前的字体的偏移，还有高宽，之后做出变换
    //当前有字体就需要做出转换
    if (this.__font) {
      descent = descent - this.__font.__fontFace.get('descent')
      scale = height / this.__font.get('vertAdvY')
      path = svgpath(path).translate(0, descent).scale(scale).toString()
      this.set('d', path)
    }

    this.__font = font

    return font
  },
  //获取当前字形的svg
  exportSvg:function(){
    //各种转换，主要是根据当前的高宽还有对应字体的信息 翻转转换。
    var data = this.options
    var descent = this.__font.__fontFace.get('descent')
    data.d = svgpath(this.data.d).scale(1,-1).translate(0,descent).toString()

    return _.template(config.SVG_TMPL)({
      glyph: data
    })
  }
})

module.exports = Glyph