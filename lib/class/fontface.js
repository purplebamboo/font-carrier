var Base = require('./base.js')

var Fontface = {
  //字体默认属性
  defaultOptions: {
    fontFamily : 'fontFamily',
    fontWeight : '400',
    fontStretch : 'normal',
    unitsPerEm : '1024',
    ascent : '-212',
    descent : '812'
  },
  constructor: function(options,font) {
    Fontface.$super.call(this,options)
    this.__font = font || null
  }
}

module.exports = Base.extend(Fontface)


